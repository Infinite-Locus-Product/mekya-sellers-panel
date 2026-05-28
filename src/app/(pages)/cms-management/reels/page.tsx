import { getCmsReels } from "@/lib/data/cms";
import { ReelsLibraryClient } from "./ReelsLibraryClient";

export default function CmsReelsPage() {
  const reels = getCmsReels();
  return <ReelsLibraryClient initialReels={reels} />;
}
