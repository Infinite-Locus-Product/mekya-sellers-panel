"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/DataTable";
import { usePagination } from "@/hooks";
import type { ReelAudience } from "@/lib/api/reels";
import type { TaggedProduct } from "./components/edit-reel/EditReelTagProductsStep";
import { trimVideoFile } from "./lib/trimVideo";
import {
  cancelReelSchedule,
  createReel,
  deleteReel,
  getReelById,
  getReelSchedule,
  getSellerProducts,
  listReels,
  presignThumbnailUpload,
  presignVideoUpload,
  publishReel,
  resubmitReel,
  saveReelAsDraft,
  scheduleReel,
  submitReel,
  unpublishReel,
  updateReel,
  uploadFileToS3,
} from "@/lib/api/reels";
import { LOCKED_REEL_STATUSES, type CmsReel, type Schedule } from "@/lib/data/cms";
import { CancelScheduleDialog } from "./components/CancelScheduleDialog";
import { DeleteReelDialog } from "./components/DeleteReelDialog";
import { EditReelDialog } from "./components/edit-reel/EditReelDialog";
import { ReelFeedbackDialog } from "./components/ReelFeedbackDialog";
import { ReelPreviewDialog } from "./components/ReelPreviewDialog";
import { ReelsPageHeader } from "./components/ReelsPageHeader";
import { ReelsSearchAndFilters } from "./components/ReelsSearchAndFilters";
import { useReelsTableColumns } from "./components/reels-table-columns";
import { ScheduleReelDialog } from "./components/ScheduleReelDialog";
import { UploadReelDialog } from "./components/UploadReelDialog";
import {
  ALLOWED_VIDEO_EXTENSIONS,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_SCHEDULE_DAYS_OUT,
  MIN_DURATION_SECONDS,
  PAGE_SIZE,
  type ReelFeedbackVariant,
  type StatusFilter,
  UPLOAD_MAX_BYTES,
} from "./lib/constants";
import {
  defaultScheduleDateTime,
  isoToDdMmYyyy,
  localDateTimeToUtcIso,
  parseDdMmYyyyToIso,
  parseDurationToSeconds,
  syntheticCmsReelFromUploadedFile,
} from "./lib/utils";

export interface ReelsLibraryClientProps {
  initialReels: CmsReel[];
}

export function ReelsLibraryClient({ initialReels }: Readonly<ReelsLibraryClientProps>) {
  const [reels, setReels] = useState(initialReels);
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CmsReel | null>(null);
  const [isDeletingReel, setIsDeletingReel] = useState(false);

  // Upload flow
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [videoDurationSeconds, setVideoDurationSeconds] = useState(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadS3Url, setUploadS3Url] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const uploadPreviewUrl = useMemo(
    () => (uploadFile ? URL.createObjectURL(uploadFile) : null),
    [uploadFile]
  );

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<CmsReel | null>(null);
  const [editStep, setEditStep] = useState(0);
  const [cropRange, setCropRange] = useState<[number, number]>([0, 15]);

  // Tag Products step state
  const [reelTitle, setReelTitle] = useState("");
  const [reelDescription, setReelDescription] = useState("");
  const [reelAudience, setReelAudience] = useState<ReelAudience>("b2c");
  const [taggedProducts, setTaggedProducts] = useState<TaggedProduct[]>([]);

  // Thumbnail step state
  const [activeThumbnailUrl, setActiveThumbnailUrl] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback / schedule / preview dialogs
  const [reelFeedbackOpen, setReelFeedbackOpen] = useState(false);
  const [reelFeedbackReel, setReelFeedbackReel] = useState<CmsReel | null>(null);
  const [reelFeedbackVariant, setReelFeedbackVariant] =
    useState<ReelFeedbackVariant>("uploadComplete");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleTargetReel, setScheduleTargetReel] = useState<CmsReel | null>(null);
  const [scheduleDateIso, setScheduleDateIso] = useState(() => defaultScheduleDateTime().date);
  const [scheduleTimeStr, setScheduleTimeStr] = useState(() => defaultScheduleDateTime().time);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewReel, setPreviewReel] = useState<CmsReel | null>(null);

  // Cancel-schedule flow
  const [cancelScheduleOpen, setCancelScheduleOpen] = useState(false);
  const [cancelScheduleTarget, setCancelScheduleTarget] = useState<CmsReel | null>(null);
  const [cancelScheduleInfo, setCancelScheduleInfo] = useState<Schedule | null>(null);
  const [isCancellingSchedule, setIsCancellingSchedule] = useState(false);

  // Filters
  const [appliedStatus, setAppliedStatus] = useState<StatusFilter>("all");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [draftStatus, setDraftStatus] = useState<StatusFilter>("all");
  const [draftDateFromStr, setDraftDateFromStr] = useState("");
  const [draftDateToStr, setDraftDateToStr] = useState("");


  const hasActiveFilters =
    appliedStatus !== "all" || appliedDateFrom !== "" || appliedDateTo !== "";

  const handleFilterOpenChange = (open: boolean) => {
    setFilterOpen(open);
    if (open) {
      setDraftStatus(appliedStatus);
      setDraftDateFromStr(isoToDdMmYyyy(appliedDateFrom));
      setDraftDateToStr(isoToDdMmYyyy(appliedDateTo));
    }
  };

  const resetDraftOnly = () => {
    setDraftStatus("all");
    setDraftDateFromStr("");
    setDraftDateToStr("");
  };

  const applyFilters = () => {
    const fromParsed = parseDdMmYyyyToIso(draftDateFromStr);
    const toParsed = parseDdMmYyyyToIso(draftDateToStr);
    if (!fromParsed.ok || !toParsed.ok) {
      toast.error("Invalid date", {
        description: "Use dd/mm/yyyy (e.g. 14/06/2025).",
      });
      return;
    }
    if (fromParsed.iso && toParsed.iso && fromParsed.iso > toParsed.iso) {
      toast.error("Invalid range", { description: "From date must be before To date." });
      return;
    }
    setAppliedStatus(draftStatus);
    setAppliedDateFrom(fromParsed.iso);
    setAppliedDateTo(toParsed.iso);
    setFilterOpen(false);
  };

  const clearAllFilters = () => {
    setAppliedStatus("all");
    setAppliedDateFrom("");
    setAppliedDateTo("");
    setDraftStatus("all");
    setDraftDateFromStr("");
    setDraftDateToStr("");
    setFilterOpen(false);
  };

  const openDeleteDialog = useCallback((reel: CmsReel) => {
    setPendingDelete(reel);
    setDeleteOpen(true);
  }, []);

  const openEditDialog = useCallback((reel: CmsReel, initialDescription = "") => {
    const totalSec = Math.max(1, parseDurationToSeconds(reel.duration));
    const end = Math.min(15, totalSec);
    setCropRange([0, end]);
    setEditStep(0);
    setReelTitle(reel.title);
    setReelDescription(initialDescription || (reel.description ?? ""));
    setReelAudience(reel.audience ?? "b2c");
    setTaggedProducts([]);
    setActiveThumbnailUrl(reel.thumbnail_url ?? null);
    setEditingReel(reel);
    setEditOpen(true);

    // New uploads don't exist in the backend yet — skip detail fetch
    if (reel.id.startsWith("local-upload-")) return;

    // Fetch full detail to populate description, audience, and tagged products
    getReelById(reel.id)
      .then((detail) => {
        setReelDescription(detail.description ?? "");
        setReelAudience(detail.audience ?? "b2c");
        setEditingReel(detail);

        const ids = detail.product_ids ?? [];
        if (ids.length === 0) return;

        getSellerProducts({ limit: 200 })
          .then(({ products }) => {
            const idSet = new Set(ids);
            setTaggedProducts(
              products
                .filter((p) => idSet.has(p.product_id))
                .map((p) => ({
                  id: p.product_id,
                  name: p.name,
                  sku: p.sku,
                  imageUrl: p.thumbnail_url ?? "",
                })),
            );
          })
          .catch(() => {});
      })
      .catch(() => {
        // Dialog already open with list data — silently ignore
      });
  }, []);

  const resetEditFields = useCallback(() => {
    setReelTitle("");
    setReelDescription("");
    setReelAudience("b2c");
    setTaggedProducts([]);
    setActiveThumbnailUrl(null);
    setUploadS3Url(null);
    setVideoDurationSeconds(0);
    setIsSubmitting(false);
    setEditStep(0);
  }, []);

  const handleEditDialogOpenChange = (open: boolean) => {
    setEditOpen(open);
    if (!open) {
      setEditingReel(null);
      resetEditFields();
    }
  };

  // Audience is only changeable before/around review — draft (not yet submitted) or rejected
  // (bounced back, being fixed up). Everything else (pending, resubmitted, and the locked
  // statuses) keeps audience fixed.
  const audienceLocked =
    editingReel !== null &&
    editingReel.status !== "draft" &&
    editingReel.status !== "rejected";

  const openPreviewDialog = useCallback((reel: CmsReel) => {
    setPreviewReel(reel);
    setPreviewOpen(true);
  }, []);

  const handlePreviewDialogOpenChange = (open: boolean) => {
    setPreviewOpen(open);
    if (!open) setPreviewReel(null);
  };

  const handleReelFeedbackOpenChange = (open: boolean) => {
    setReelFeedbackOpen(open);
    if (!open) setReelFeedbackReel(null);
  };

  const handleScheduleModalOpenChange = (open: boolean) => {
    setScheduleModalOpen(open);
    if (!open) setScheduleTargetReel(null);
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteOpen(open);
    if (!open) setPendingDelete(null);
  };

  const openCancelScheduleDialog = useCallback((reel: CmsReel) => {
    setCancelScheduleTarget(reel);
    setCancelScheduleInfo(null);
    setCancelScheduleOpen(true);
    getReelSchedule(reel.id)
      .then(setCancelScheduleInfo)
      .catch(() => {});
  }, []);

  const handleCancelScheduleDialogOpenChange = (open: boolean) => {
    setCancelScheduleOpen(open);
    if (!open) {
      setCancelScheduleTarget(null);
      setCancelScheduleInfo(null);
    }
  };

  const confirmCancelSchedule = useCallback(async () => {
    if (!cancelScheduleTarget) return;
    setIsCancellingSchedule(true);
    try {
      await cancelReelSchedule(cancelScheduleTarget.id);
      setReels((prev) =>
        prev.map((r) =>
          r.id === cancelScheduleTarget.id
            ? { ...r, status: "approved" as const, schedule: null }
            : r
        )
      );
      toast.success("Schedule cancelled", { description: cancelScheduleTarget.title });
      setCancelScheduleOpen(false);
      setCancelScheduleTarget(null);
      setCancelScheduleInfo(null);
    } catch (err) {
      toast.error("Cancel failed", {
        description: err instanceof Error ? err.message : "Could not cancel schedule.",
      });
    } finally {
      setIsCancellingSchedule(false);
    }
  }, [cancelScheduleTarget]);

  const handlePublishReel = useCallback(async (reel: CmsReel) => {
    try {
      await publishReel(reel.id);
      setReels((prev) => prev.map((r) => (r.id === reel.id ? { ...r, status: "published" as const } : r)));
      toast.success("Reel published", { description: reel.title });
    } catch (err) {
      toast.error("Publish failed", {
        description: err instanceof Error ? err.message : "Could not publish reel.",
      });
    }
  }, []);

  const handleUnpublishReel = useCallback(async (reel: CmsReel) => {
    if (!window.confirm(`Take "${reel.title}" down from the live feed?`)) return;
    try {
      await unpublishReel(reel.id);
      setReels((prev) => prev.map((r) => (r.id === reel.id ? { ...r, status: "unpublished" as const } : r)));
      toast.success("Reel unpublished", { description: reel.title });
    } catch (err) {
      toast.error("Unpublish failed", {
        description: err instanceof Error ? err.message : "Could not unpublish reel.",
      });
    }
  }, []);

  const confirmDeleteReel = useCallback(async () => {
    if (!pendingDelete) return;
    const isLocalReel = pendingDelete.id.startsWith("local-");
    if (!isLocalReel) {
      setIsDeletingReel(true);
      try {
        await deleteReel(pendingDelete.id);
      } catch (err) {
        toast.error("Delete failed", {
          description: err instanceof Error ? err.message : "Could not delete reel.",
        });
        setIsDeletingReel(false);
        return;
      }
      setIsDeletingReel(false);
    }
    setReels((prev) => prev.filter((r) => r.id !== pendingDelete.id));
    toast.success("Reel deleted", { description: pendingDelete.title });
    setDeleteOpen(false);
    setPendingDelete(null);
  }, [pendingDelete]);

  const handleUploadDialogOpenChange = (open: boolean) => {
    setUploadOpen(open);
    if (!open) {
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      // Do NOT reset videoDurationSeconds here — handleUploadNext needs it
      // after this close. resetEditFields resets it when the edit dialog closes.
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  };

  const applyPickedVideo = useCallback((file: File | undefined) => {
    if (!file) return;
    const ext = file.name.includes(".") ? (file.name.split(".").pop()?.toLowerCase() ?? "") : "";
    // Exact allow-list on both sides — a loose "video/*" mime prefix check let unsupported
    // formats (e.g. .webm, .mkv) slip past this into an upload the backend then rejects.
    const extOk = (ALLOWED_VIDEO_EXTENSIONS as readonly string[]).includes(ext);
    const mimeOk = (ALLOWED_VIDEO_MIME_TYPES as readonly string[]).includes(file.type);
    if (!extOk && !mimeOk) {
      toast.error("Unsupported format", { description: "Use MP4, MOV, or AVI." });
      return;
    }
    if (file.size > UPLOAD_MAX_BYTES) {
      toast.error("File too large", { description: "Maximum file size is 500MB." });
      return;
    }
    setVideoDurationSeconds(0);
    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, "").trim() || "");
  }, []);

  const handleUploadNext = useCallback(async () => {
    if (!uploadFile) return;
    if (videoDurationSeconds > 0 && videoDurationSeconds < MIN_DURATION_SECONDS) {
      toast.error("Video too short", {
        description: `Minimum duration is ${MIN_DURATION_SECONDS} seconds.`,
      });
      return;
    }
    setIsUploadingVideo(true);
    let s3Url = "local-pending";
    try {
      const presign = await presignVideoUpload(
        uploadFile.name,
        uploadFile.type || "video/mp4",
        uploadFile.size,
      );
      await uploadFileToS3(presign.upload_url, uploadFile);
      s3Url = presign.s3_url;
    } catch {
      // API not yet live — continue in local-only mode
    }
    setUploadS3Url(s3Url);
    const reel = syntheticCmsReelFromUploadedFile(uploadFile);
    reel.title = uploadTitle.trim() || reel.title;
    if (videoDurationSeconds > 0) {
      const m = Math.floor(videoDurationSeconds / 60);
      const s = videoDurationSeconds % 60;
      reel.duration = `${m}:${s.toString().padStart(2, "0")}`;
    }
    const desc = uploadDescription.trim();
    handleUploadDialogOpenChange(false);
    openEditDialog(reel, desc);
    setIsUploadingVideo(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadFile, uploadTitle, uploadDescription, videoDurationSeconds, openEditDialog]);

  const handleThumbnailFileSelected = useCallback(async (file: File) => {
    setIsUploadingThumbnail(true);
    try {
      const presign = await presignThumbnailUpload(file.name, file.type || "image/jpeg");
      await uploadFileToS3(presign.upload_url, file);
      setActiveThumbnailUrl(presign.thumbnail_url);
    } catch {
      // API not yet live — use a local object URL as preview
      setActiveThumbnailUrl(URL.createObjectURL(file));
    } finally {
      setIsUploadingThumbnail(false);
      toast.success("Thumbnail selected");
    }
  }, []);

  const isNewUploadFlow = uploadS3Url !== null;

  /**
   * If the seller narrowed the crop range below the full clip, trims the raw file client-side
   * and re-uploads the trimmed clip, returning ITS s3_url + the crop-derived duration. If the
   * crop still covers the whole clip, reuses the already-uploaded raw file untouched.
   */
  const resolveUploadForSubmit = async (): Promise<{ s3Url: string; durationSec: number }> => {
    const fullDuration =
      videoDurationSeconds > 0 ? videoDurationSeconds : parseDurationToSeconds(editingReel?.duration ?? "0:00");
    const [start, end] = cropRange;
    const isRealCrop = uploadFile && uploadS3Url && end > start && (start > 0 || end < fullDuration);

    if (!isRealCrop) {
      return { s3Url: uploadS3Url ?? "", durationSec: fullDuration };
    }

    const trimmed = await trimVideoFile(uploadFile, start, end);
    const presign = await presignVideoUpload(trimmed.name, trimmed.type || "video/mp4", trimmed.size);
    await uploadFileToS3(presign.upload_url, trimmed);
    return { s3Url: presign.s3_url, durationSec: end - start };
  };

  const handleEditPublish = async () => {
    if (!editingReel) return;
    const title = reelTitle.trim() || editingReel.title;

    if (isNewUploadFlow) {
      if (!activeThumbnailUrl) {
        toast.error("Thumbnail required", {
          description: "Please upload a thumbnail before submitting for approval.",
        });
        return;
      }
      try {
        setIsSubmitting(true);
        const { s3Url, durationSec } = await resolveUploadForSubmit();
        const created = await createReel({
          title,
          description: reelDescription,
          s3_url: s3Url,
          thumbnail_url: activeThumbnailUrl,
          duration_seconds: durationSec,
          audience: reelAudience,
          product_ids: taggedProducts.map((p) => p.id),
        });
        // createReel starts the reel as "draft" — submit is what actually sends it for review.
        await submitReel(created.reel_id);
        const newReel: CmsReel = {
          ...editingReel,
          id: created.reel_id,
          title,
          status: "pending",
          audience: reelAudience,
          product_ids: taggedProducts.map((p) => p.id),
          thumbnail_url: activeThumbnailUrl,
          s3_url: s3Url,
        };
        setReels((prev) => [newReel, ...prev]);
        setReelFeedbackReel(newReel);
        setReelFeedbackVariant("uploadComplete");
        handleEditDialogOpenChange(false);
        setReelFeedbackOpen(true);
      } catch (err) {
        toast.error("Submit failed", {
          description: err instanceof Error ? err.message : "Could not create reel.",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Edit existing reel. Locked statuses (approved/published/unpublished/scheduled) require
      // force_resubmit — confirm first since that sends it back to admin review.
      const reelId = editingReel.id;
      const status = editingReel.status;
      const locked = LOCKED_REEL_STATUSES.includes(status);
      if (locked) {
        const confirmed = window.confirm(
          "This reel has already been approved. Saving changes will send it back for admin review. Continue?",
        );
        if (!confirmed) return;
      }
      if (status === "draft" && !activeThumbnailUrl) {
        toast.error("Thumbnail required", {
          description: "Please upload a thumbnail before submitting for approval.",
        });
        return;
      }
      try {
        setIsSubmitting(true);
        await updateReel(reelId, {
          title,
          description: reelDescription,
          ...(activeThumbnailUrl ? { thumbnail_url: activeThumbnailUrl } : {}),
          product_ids: taggedProducts.map((p) => p.id),
          ...(locked ? { force_resubmit: true } : {}),
        });
        let newStatus = status;
        if (status === "draft") {
          await submitReel(reelId);
          newStatus = "pending";
        } else if (status === "rejected") {
          await resubmitReel(reelId);
          newStatus = "resubmitted";
        } else if (locked) {
          newStatus = "resubmitted";
        }
        // pending/resubmitted: already in review, plain save with no status change.
        setReels((prev) =>
          prev.map((r) =>
            r.id === reelId
              ? { ...r, title, status: newStatus, thumbnail_url: activeThumbnailUrl ?? r.thumbnail_url }
              : r
          )
        );
        setReelFeedbackReel({ ...editingReel, title, status: newStatus });
        setReelFeedbackVariant("published");
        handleEditDialogOpenChange(false);
        setReelFeedbackOpen(true);
      } catch (err) {
        toast.error("Update failed", {
          description: err instanceof Error ? err.message : "Could not update reel.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditSaveDraft = async () => {
    if (!editingReel) return;
    const title = reelTitle.trim() || editingReel.title;

    if (isNewUploadFlow) {
      try {
        setIsSubmitting(true);
        const { s3Url, durationSec } = await resolveUploadForSubmit();
        const created = await createReel({
          title,
          description: reelDescription,
          s3_url: s3Url,
          ...(activeThumbnailUrl ? { thumbnail_url: activeThumbnailUrl } : {}),
          duration_seconds: durationSec,
          audience: reelAudience,
          product_ids: taggedProducts.map((p) => p.id),
        });
        // createReel already starts the reel as "draft" — no separate draft call needed.
        const newReel: CmsReel = {
          ...editingReel,
          id: created.reel_id,
          title,
          status: "draft",
          audience: reelAudience,
          product_ids: taggedProducts.map((p) => p.id),
          thumbnail_url: activeThumbnailUrl ?? undefined,
          s3_url: s3Url,
        };
        setReels((prev) => [newReel, ...prev]);
        setReelFeedbackReel(newReel);
        setReelFeedbackVariant("draftSaved");
        handleEditDialogOpenChange(false);
        setReelFeedbackOpen(true);
      } catch (err) {
        toast.error("Save failed", {
          description: err instanceof Error ? err.message : "Could not save draft.",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Not offered in the UI for locked-status reels (see EditReelDialogFooter's
      // canSaveDraft) — guard here too in case this is ever reached another way.
      if (LOCKED_REEL_STATUSES.includes(editingReel.status)) {
        toast.error("Can't save as draft", {
          description: "This reel has already been approved and can't be reverted to a draft.",
        });
        return;
      }
      const reelId = editingReel.id;
      try {
        setIsSubmitting(true);
        await updateReel(reelId, {
          title,
          description: reelDescription,
          ...(activeThumbnailUrl ? { thumbnail_url: activeThumbnailUrl } : {}),
          product_ids: taggedProducts.map((p) => p.id),
        });
        await saveReelAsDraft(reelId);
        setReels((prev) =>
          prev.map((r) => (r.id === reelId ? { ...r, title, status: "draft" as const } : r))
        );
        setReelFeedbackReel({ ...editingReel, title });
        setReelFeedbackVariant("draftSaved");
        handleEditDialogOpenChange(false);
        setReelFeedbackOpen(true);
      } catch (err) {
        toast.error("Save failed", {
          description: err instanceof Error ? err.message : "Could not save draft.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Schedule for Later is only ever offered when editing an existing, approved reel (see
  // EditReelDialogFooter's canSchedule) — scheduling a brand-new upload isn't possible since
  // it can't be "approved" until admin review happens after submit.
  const handleEditScheduleClick = () => {
    const reel = editingReel;
    if (!reel) return;
    setScheduleTargetReel(reel);
    const defaults = defaultScheduleDateTime();
    setScheduleDateIso(defaults.date);
    setScheduleTimeStr(defaults.time);
    handleEditDialogOpenChange(false);
    setScheduleModalOpen(true);
  };

  const handleConfirmSchedule = async () => {
    const reel = scheduleTargetReel;
    if (!reel) return;
    const title = reelTitle.trim() || reel.title;
    const scheduledAt = localDateTimeToUtcIso(scheduleDateIso, scheduleTimeStr);

    if (new Date(scheduledAt).getTime() <= Date.now()) {
      toast.error("Invalid schedule time", {
        description: "Publish date/time must be in the future.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const reelId = reel.id;

      if (reel.status === "scheduled") {
        // Re-scheduling an already-scheduled reel requires cancelling the active
        // schedule first — the API rejects a second schedule() with 409/422.
        await cancelReelSchedule(reelId).catch(() => {});
      }

      const { schedule } = await scheduleReel(reelId, scheduledAt);

      const scheduledReel: CmsReel = {
        ...reel,
        title,
        status: "scheduled",
        audience: reelAudience,
        product_ids: taggedProducts.map((p) => p.id),
        thumbnail_url: activeThumbnailUrl ?? reel.thumbnail_url,
        schedule,
      };

      setReels((prev) => prev.map((r) => (r.id === reel.id ? scheduledReel : r)));

      setReelFeedbackReel(scheduledReel);
      setReelFeedbackVariant("scheduled");
      setScheduleModalOpen(false);
      setReelFeedbackOpen(true);
      resetEditFields();
    } catch (err) {
      toast.error("Schedule failed", {
        description: err instanceof Error ? err.message : "Could not schedule reel.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Title search is applied server-side (see effect below). Status is ALSO sent server-side to
  // shrink the payload, but is re-applied here too — the list endpoint doesn't reliably filter by
  // status on its own, so relying on it alone silently no-ops the Status filter. Date range isn't
  // a query param the endpoint takes at all, so it's always client-side.
  const filtered = useMemo(() => {
    return reels.filter((r) => {
      if (appliedStatus !== "all" && r.status !== appliedStatus) return false;
      if (appliedDateFrom && r.uploadedAt < appliedDateFrom) return false;
      if (appliedDateTo && r.uploadedAt > appliedDateTo) return false;
      return true;
    });
  }, [reels, appliedStatus, appliedDateFrom, appliedDateTo]);

  const scheduleBounds = useMemo(() => {
    const toIso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const now = new Date();
    const max = new Date(now);
    max.setDate(max.getDate() + MAX_SCHEDULE_DAYS_OUT);
    return { min: toIso(now), max: toIso(max) };
  }, []);

  const pagination = usePagination({
    totalCount: filtered.length,
    pageSize: PAGE_SIZE,
  });

  // Server-side title search + status + date range, debounced so keystrokes don't fire a
  // request each. Status/date are also re-applied client-side in `filtered` above regardless —
  // this call is an optimization (smaller payload) when the backend does honor these params.
  useEffect(() => {
    const handle = setTimeout(() => {
      listReels({
        search: query.trim() || undefined,
        status: appliedStatus !== "all" ? appliedStatus : undefined,
        date_from: appliedDateFrom ? `${appliedDateFrom}T00:00:00.000Z` : undefined,
        date_to: appliedDateTo ? `${appliedDateTo}T23:59:59.999Z` : undefined,
      })
        .then((data) => {
          setReels(data);
          pagination.setPage(1);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(handle);
    // `pagination` is intentionally excluded — it's a new object every render,
    // and only `.setPage` is used here (to reset to page 1 on a new search/filter).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, appliedStatus, appliedDateFrom, appliedDateTo]);

  const pageRows = useMemo(
    () => filtered.slice(pagination.startIndex, pagination.endIndex),
    [filtered, pagination.startIndex, pagination.endIndex]
  );

  const columns = useReelsTableColumns({
    onEdit: openEditDialog,
    onPreview: openPreviewDialog,
    onDelete: openDeleteDialog,
    onCancelSchedule: openCancelScheduleDialog,
    onPublish: handlePublishReel,
    onUnpublish: handleUnpublishReel,
  });

  return (
    <div className="flex min-w-0 flex-col gap-4 min-[1920px]:gap-6">
      <ReelsPageHeader onUploadClick={() => handleUploadDialogOpenChange(true)} />

      <ReelsSearchAndFilters
        query={query}
        onQueryChange={setQuery}
        filterOpen={filterOpen}
        onFilterOpenChange={handleFilterOpenChange}
        hasActiveFilters={hasActiveFilters}
        onClearAllFilters={clearAllFilters}
        draftStatus={draftStatus}
        onDraftStatusChange={setDraftStatus}
        draftDateFromStr={draftDateFromStr}
        onDraftDateFromStrChange={setDraftDateFromStr}
        draftDateToStr={draftDateToStr}
        onDraftDateToStrChange={setDraftDateToStr}
        onResetDraftOnly={resetDraftOnly}
        onApplyFilters={applyFilters}
      />

      <div className="overflow-hidden rounded-lg border border-[#e8e9e8] bg-[#f9faf9]">
        <DataTable
          columns={columns}
          data={pageRows}
          emptyMessage="No reels match your filters."
          striped
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            onPageChange: pagination.setPage,
            pageSize: pagination.pageSize,
            onPageSizeChange: pagination.setPageSize,
            totalRowCount: filtered.length,
          }}
        />
      </div>

      <ReelPreviewDialog
        open={previewOpen}
        title={previewReel?.title ?? ""}
        videoSrc={previewReel?.s3_url}
        onOpenChange={handlePreviewDialogOpenChange}
      />

      <UploadReelDialog
        open={uploadOpen}
        onOpenChange={handleUploadDialogOpenChange}
        uploadInputRef={uploadInputRef}
        uploadFile={uploadFile}
        uploadPreviewUrl={uploadPreviewUrl}
        onPickFile={applyPickedVideo}
        onNext={handleUploadNext}
        onDurationDetected={setVideoDurationSeconds}
        isUploading={isUploadingVideo}
        reelTitle={uploadTitle}
        onReelTitleChange={setUploadTitle}
        reelDescription={uploadDescription}
        onReelDescriptionChange={setUploadDescription}
      />

      <EditReelDialog
        open={editOpen}
        onOpenChange={handleEditDialogOpenChange}
        reel={editingReel}
        editStep={editStep}
        onStepClick={setEditStep}
        cropRange={cropRange}
        onCropRangeChange={setCropRange}
        reelTitle={reelTitle}
        onReelTitleChange={setReelTitle}
        reelDescription={reelDescription}
        onReelDescriptionChange={setReelDescription}
        reelAudience={reelAudience}
        onReelAudienceChange={setReelAudience}
        audienceLocked={audienceLocked}
        taggedProducts={taggedProducts}
        onTaggedProductsChange={setTaggedProducts}
        activeThumbnailUrl={activeThumbnailUrl}
        isUploadingThumbnail={isUploadingThumbnail}
        onThumbnailFileSelected={handleThumbnailFileSelected}
        videoSrc={uploadS3Url ?? editingReel?.s3_url}
        isSubmitting={isSubmitting}
        isNewUploadFlow={isNewUploadFlow}
        onSaveDraft={handleEditSaveDraft}
        onScheduleClick={handleEditScheduleClick}
        onPublish={handleEditPublish}
        onNextStep={() => setEditStep((s) => s + 1)}
      />

      <ScheduleReelDialog
        open={scheduleModalOpen}
        onOpenChange={handleScheduleModalOpenChange}
        scheduleDateIso={scheduleDateIso}
        onScheduleDateIsoChange={setScheduleDateIso}
        scheduleTimeStr={scheduleTimeStr}
        onScheduleTimeStrChange={setScheduleTimeStr}
        onConfirmSchedule={handleConfirmSchedule}
        isSubmitting={isSubmitting}
        minDateIso={scheduleBounds.min}
        maxDateIso={scheduleBounds.max}
      />

      <ReelFeedbackDialog
        open={reelFeedbackOpen}
        onOpenChange={handleReelFeedbackOpenChange}
        variant={reelFeedbackVariant}
        onPreview={() => {
          const reel = reelFeedbackReel;
          handleReelFeedbackOpenChange(false);
          if (reel) openPreviewDialog(reel);
        }}
      />

      <DeleteReelDialog
        open={deleteOpen}
        onOpenChange={handleDeleteDialogOpenChange}
        onConfirm={confirmDeleteReel}
        isDeleting={isDeletingReel}
      />

      <CancelScheduleDialog
        open={cancelScheduleOpen}
        onOpenChange={handleCancelScheduleDialogOpenChange}
        onConfirm={confirmCancelSchedule}
        isCancelling={isCancellingSchedule}
        schedule={cancelScheduleInfo}
      />
    </div>
  );
}
