import type { ComponentType, SVGProps } from "react";
import type { ReelStatus } from "@/lib/data/cms";
import {
  EditReelStepIconCaptions,
  EditReelStepIconCrop,
  EditReelStepIconDescription,
  EditReelStepIconThumbnail,
} from "../components/cms-reels-icons";

export const PAGE_SIZE = 10;

/** Dummy reel video from `public/reel/reel.mp4` until CMS media API exists */
export const CMS_DUMMY_REEL_VIDEO_SRC = "/reel/reel.mp4";

/** Sample frames for thumbnail picker (`public/images/…`) until CMS returns poster URLs */
export const REEL_THUMBNAIL_FRAME_SAMPLES = [
  "/images/cms1.jpg",
  "/images/cms2.jpg",
  "/images/cms3.jpg",
  "/images/cms4.jpg",
  "/images/cms5.jpg",
] as const;

export const UPLOAD_MAX_BYTES = 500 * 1024 * 1024;
export const VIDEO_ACCEPT = "video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi";

export type StatusFilter = ReelStatus | "all";

export type ReelFeedbackVariant = "uploadComplete" | "draftSaved" | "scheduled" | "published";

export const REEL_FEEDBACK_TITLE: Record<ReelFeedbackVariant, string> = {
  uploadComplete: "Reel Uploaded Successfully",
  draftSaved: "Reel has been saved as draft successfully",
  scheduled: "Reel Scheduled Successfully!",
  published: "Reel Uploaded Successfully",
};

export const DEFAULT_SCHEDULE_DATE = "2025-10-21";
export const DEFAULT_SCHEDULE_TIME = "00:00";

export type EditFlowStepIcon = ComponentType<SVGProps<SVGSVGElement>>;

export const EDIT_FLOW_STEPS: ReadonlyArray<{
  label: string;
  Icon: EditFlowStepIcon;
}> = [
  { label: "Crop", Icon: EditReelStepIconCrop },
  { label: "Captions", Icon: EditReelStepIconCaptions },
  { label: "Description", Icon: EditReelStepIconDescription },
  { label: "Thumbnail", Icon: EditReelStepIconThumbnail },
];

export const DESCRIPTION_MAX_CHARS = 1000;

export const CAPTION_COLOR_OPTIONS = [
  { label: "Black", value: "#000000" },
  { label: "White", value: "#FFFFFF" },
  { label: "Red", value: "#EF4444" },
  { label: "Green", value: "#22C55E" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Yellow", value: "#EAB308" },
] as const;
