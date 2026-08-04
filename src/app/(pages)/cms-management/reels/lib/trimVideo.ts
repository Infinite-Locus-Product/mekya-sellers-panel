import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Loaded from a CDN at runtime rather than bundled — the core is a ~25MB wasm binary, so it's
// fetched once (lazily, only when a trim is actually requested) and cached in-memory for the
// rest of the session. Self-host under /public if the CDN dependency becomes a problem.
const FFMPEG_CORE_BASE_URL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

let ffmpegSingleton: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

async function getFfmpeg(): Promise<FFmpeg> {
  if (ffmpegSingleton) return ffmpegSingleton;
  loadPromise ??= (async () => {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpegSingleton = ffmpeg;
    return ffmpeg;
  })();
  return loadPromise;
}

/**
 * Trims `file` to [startSec, endSec) entirely in the browser and returns the trimmed clip as a
 * new File in the same container. Uses stream copy (no re-encode) — fast and battery-friendly,
 * at the cost of snapping cut points to the nearest keyframe rather than the exact frame, which
 * is the right tradeoff for a reel-length crop rather than frame-accurate editing.
 */
export async function trimVideoFile(file: File, startSec: number, endSec: number): Promise<File> {
  const ffmpeg = await getFfmpeg();
  const ext = file.name.includes(".") ? (file.name.split(".").pop()?.toLowerCase() ?? "mp4") : "mp4";
  const inputName = `input.${ext}`;
  const outputName = `output.${ext}`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  try {
    // exec() resolves with an exit code rather than rejecting on failure — a nonzero code
    // (or a stream-copy that produced no valid frames) leaves a corrupt/empty output file that
    // would otherwise upload silently and only surface as the backend's format-validation error.
    const exitCode = await ffmpeg.exec([
      "-ss", String(startSec), "-to", String(endSec), "-i", inputName, "-c", "copy", outputName,
    ]);
    if (exitCode !== 0) {
      throw new Error(`Video trim failed (ffmpeg exit code ${exitCode}).`);
    }
    const data = await ffmpeg.readFile(outputName);
    const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
    if (bytes.byteLength === 0) {
      throw new Error("Video trim produced an empty file.");
    }
    const blob = new Blob([bytes], { type: file.type || "video/mp4" });
    return new File([blob], file.name, { type: file.type || "video/mp4" });
  } finally {
    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});
  }
}
