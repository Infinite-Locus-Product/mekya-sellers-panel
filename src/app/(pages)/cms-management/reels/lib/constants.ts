import type { ComponentType, SVGProps } from "react";
import type { ReelStatus } from "@/lib/data/cms";
import {
  EditReelStepIconCrop,
  EditReelStepIconTagProducts,
  EditReelStepIconThumbnail,
} from "../components/cms-reels-icons";

export const PAGE_SIZE = 10;

export const UPLOAD_MAX_BYTES = 500 * 1024 * 1024;

/** Single source of truth for the upload format allow-list — keep the file picker's `accept`
 *  and the runtime validation in ReelsLibraryClient.applyPickedVideo in sync with these. */
export const ALLOWED_VIDEO_EXTENSIONS = ["mp4", "mov", "avi"] as const;
export const ALLOWED_VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"] as const;
export const VIDEO_ACCEPT = [...ALLOWED_VIDEO_MIME_TYPES, ...ALLOWED_VIDEO_EXTENSIONS.map((e) => `.${e}`)].join(",");

export type StatusFilter = ReelStatus | "all";

export type ReelFeedbackVariant = "uploadComplete" | "draftSaved" | "scheduled" | "published";

export const REEL_FEEDBACK_TITLE: Record<ReelFeedbackVariant, string> = {
  uploadComplete: "Reel Uploaded Successfully",
  draftSaved: "Reel has been saved as draft successfully",
  scheduled: "Reel Scheduled Successfully!",
  published: "Reel Uploaded Successfully",
};

/** Reels can be scheduled at most this many days out (API caps it at 1 year). */
export const MAX_SCHEDULE_DAYS_OUT = 365;

export type EditFlowStepIcon = ComponentType<SVGProps<SVGSVGElement>>;

export const EDIT_FLOW_STEPS: ReadonlyArray<{
  label: string;
  Icon: EditFlowStepIcon;
}> = [
  { label: "Crop", Icon: EditReelStepIconCrop },
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

