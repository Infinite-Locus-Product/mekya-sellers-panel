import type { ComponentType, SVGProps } from "react";
import type { ReelStatus } from "@/lib/data/cms";
import {
  EditReelStepIconCaptions,
  EditReelStepIconCrop,
  EditReelStepIconTagProducts,
  EditReelStepIconThumbnail,
} from "../components/cms-reels-icons";

export const PAGE_SIZE = 10;

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
  { label: "Tag Products", Icon: EditReelStepIconTagProducts },
  { label: "Thumbnail", Icon: EditReelStepIconThumbnail },
];

export const DESCRIPTION_MAX_CHARS = 1000;

export const MIN_DURATION_SECONDS = 15;
export const MAX_TAGGED_PRODUCTS = 5;

export const AUDIENCE_OPTIONS = [
  { label: "B2C (Consumers)", value: "b2c" as const },
  { label: "B2B (Businesses)", value: "b2b" as const },
  { label: "Both", value: "both" as const },
] as const;

export const CAPTION_COLOR_OPTIONS = [
  { label: "Black", value: "#000000" },
  { label: "White", value: "#FFFFFF" },
  { label: "Red", value: "#EF4444" },
  { label: "Green", value: "#22C55E" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Yellow", value: "#EAB308" },
] as const;
