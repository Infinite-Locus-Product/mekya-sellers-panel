"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/DataTable";
import { usePagination } from "@/hooks";
import type { ReelAudience } from "@/lib/api/reels";
import type { TaggedProduct } from "./components/edit-reel/EditReelTagProductsStep";
import {
  addCaptions,
  createReel,
  deleteReel,
  getReelById,
  getSellerProducts,
  listReels,
  presignThumbnailUpload,
  presignVideoUpload,
  resubmitReel,
  saveReelAsDraft,
  scheduleReel,
  updateReel,
  uploadFileToS3,
} from "@/lib/api/reels";
import type { CmsReel } from "@/lib/data/cms";
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
  DEFAULT_SCHEDULE_DATE,
  DEFAULT_SCHEDULE_TIME,
  MIN_DURATION_SECONDS,
  PAGE_SIZE,
  type ReelFeedbackVariant,
  type StatusFilter,
  UPLOAD_MAX_BYTES,
} from "./lib/constants";
import {
  defaultCaptionDraft,
  isoToDdMmYyyy,
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
  const [captionDraft, setCaptionDraft] = useState(defaultCaptionDraft);

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
  const [scheduleDateIso, setScheduleDateIso] = useState(DEFAULT_SCHEDULE_DATE);
  const [scheduleTimeStr, setScheduleTimeStr] = useState(DEFAULT_SCHEDULE_TIME);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewReel, setPreviewReel] = useState<CmsReel | null>(null);

  // Filters
  const [appliedStatus, setAppliedStatus] = useState<StatusFilter>("all");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [draftStatus, setDraftStatus] = useState<StatusFilter>("all");
  const [draftDateFromStr, setDraftDateFromStr] = useState("");
  const [draftDateToStr, setDraftDateToStr] = useState("");

  // Load real reels on mount
  useEffect(() => {
    listReels()
      .then((data) => setReels(data))
      .catch(() => {});
  }, []);

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
    setCaptionDraft(defaultCaptionDraft());
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
    setCaptionDraft(defaultCaptionDraft());
  }, []);

  const handleEditDialogOpenChange = (open: boolean) => {
    setEditOpen(open);
    if (!open) {
      setEditingReel(null);
      resetEditFields();
    }
  };

  const audienceLocked =
    editingReel !== null &&
    editingReel.status !== "draft" &&
    editingReel.status !== "pending";

  const showCaptionOnReelPreview =
    captionDraft.editorOpen &&
    captionDraft.text.trim().length > 0 &&
    editStep >= 1;

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
    const extOk = ["mp4", "mov", "avi"].includes(ext);
    const mimeOk = file.type.startsWith("video/");
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

  // Builds the captions payload from current draft state
  const buildCaptionsPayload = () => {
    if (!captionDraft.editorOpen || !captionDraft.text.trim()) return null;
    return [
      {
        text: captionDraft.text,
        start_ms: cropRange[0] * 1000,
        end_ms: cropRange[1] * 1000,
        font_size: captionDraft.fontSize,
        color: captionDraft.color,
        pos_x: captionDraft.posX,
        pos_y: captionDraft.posY,
      },
    ];
  };

  const isNewUploadFlow = uploadS3Url !== null;

  const handleEditPublish = async () => {
    if (!editingReel) return;
    const title = reelTitle.trim() || editingReel.title;

    if (isNewUploadFlow) {
      if (!activeThumbnailUrl) {
        toast.error("Thumbnail required", {
          description: "Please upload a thumbnail before publishing.",
        });
        return;
      }
      const durationSec =
        videoDurationSeconds > 0
          ? videoDurationSeconds
          : parseDurationToSeconds(editingReel.duration);
      try {
        setIsSubmitting(true);
        const created = await createReel({
          title,
          description: reelDescription,
          s3_url: uploadS3Url,
          thumbnail_url: activeThumbnailUrl,
          duration_seconds: durationSec,
          audience: reelAudience,
          product_ids: taggedProducts.map((p) => p.id),
        });
        const captions = buildCaptionsPayload();
        if (captions) await addCaptions(created.reel_id, captions);
        const newReel: CmsReel = {
          ...editingReel,
          id: created.reel_id,
          title,
          status: "pending",
          audience: reelAudience,
          product_ids: taggedProducts.map((p) => p.id),
          thumbnail_url: activeThumbnailUrl,
          s3_url: uploadS3Url,
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
      // Edit existing reel
      const reelId = editingReel.id;
      try {
        setIsSubmitting(true);
        await updateReel(reelId, {
          title,
          description: reelDescription,
          ...(activeThumbnailUrl ? { thumbnail_url: activeThumbnailUrl } : {}),
          product_ids: taggedProducts.map((p) => p.id),
        });
        if (editingReel.status === "rejected") {
          await resubmitReel(reelId);
        }
        setReels((prev) =>
          prev.map((r) =>
            r.id === reelId
              ? { ...r, title, thumbnail_url: activeThumbnailUrl ?? r.thumbnail_url }
              : r
          )
        );
        setReelFeedbackReel({ ...editingReel, title });
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
      const durationSec =
        videoDurationSeconds > 0
          ? videoDurationSeconds
          : parseDurationToSeconds(editingReel.duration);
      try {
        setIsSubmitting(true);
        const created = await createReel({
          title,
          description: reelDescription,
          s3_url: uploadS3Url,
          thumbnail_url: activeThumbnailUrl ?? "",
          duration_seconds: durationSec,
          audience: reelAudience,
          product_ids: taggedProducts.map((p) => p.id),
        });
        await saveReelAsDraft(created.reel_id);
        const newReel: CmsReel = {
          ...editingReel,
          id: created.reel_id,
          title,
          status: "draft",
          audience: reelAudience,
          product_ids: taggedProducts.map((p) => p.id),
          thumbnail_url: activeThumbnailUrl ?? undefined,
          s3_url: uploadS3Url,
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
      // Update existing reel and mark as draft
      const reelId = editingReel.id;
      try {
        setIsSubmitting(true);
        await updateReel(reelId, {
          title,
          description: reelDescription,
          ...(activeThumbnailUrl ? { thumbnail_url: activeThumbnailUrl } : {}),
          product_ids: taggedProducts.map((p) => p.id),
        });
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

  const handleEditScheduleClick = () => {
    const reel = editingReel;
    if (!reel) return;
    if (isNewUploadFlow && !activeThumbnailUrl) {
      toast.error("Thumbnail required", {
        description: "Please upload a thumbnail before scheduling.",
      });
      return;
    }
    setScheduleTargetReel(reel);
    setScheduleDateIso(DEFAULT_SCHEDULE_DATE);
    setScheduleTimeStr(DEFAULT_SCHEDULE_TIME);
    handleEditDialogOpenChange(false);
    setScheduleModalOpen(true);
  };

  const handleConfirmSchedule = async () => {
    const reel = scheduleTargetReel;
    if (!reel) return;
    const title = reelTitle.trim() || reel.title;
    const scheduledAt = `${scheduleDateIso}T${scheduleTimeStr}:00`;

    try {
      setIsSubmitting(true);
      let reelId = reel.id;

      if (isNewUploadFlow && uploadS3Url) {
        const durationSec =
          videoDurationSeconds > 0 ? videoDurationSeconds : parseDurationToSeconds(reel.duration);
        const created = await createReel({
          title,
          description: reelDescription,
          s3_url: uploadS3Url,
          thumbnail_url: activeThumbnailUrl ?? "",
          duration_seconds: durationSec,
          audience: reelAudience,
          product_ids: taggedProducts.map((p) => p.id),
        });
        reelId = created.reel_id;
        const captions = buildCaptionsPayload();
        if (captions) await addCaptions(reelId, captions);
      }

      await scheduleReel(reelId, scheduledAt);

      const scheduledReel: CmsReel = {
        ...reel,
        id: reelId,
        title,
        status: "scheduled",
        audience: reelAudience,
        product_ids: taggedProducts.map((p) => p.id),
        thumbnail_url: activeThumbnailUrl ?? reel.thumbnail_url,
        s3_url: uploadS3Url ?? reel.s3_url,
      };

      if (isNewUploadFlow) {
        setReels((prev) => [scheduledReel, ...prev]);
      } else {
        setReels((prev) => prev.map((r) => (r.id === reel.id ? scheduledReel : r)));
      }

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reels.filter((r) => {
      if (appliedStatus !== "all" && r.status !== appliedStatus) return false;
      if (appliedDateFrom && r.uploadedAt < appliedDateFrom) return false;
      if (appliedDateTo && r.uploadedAt > appliedDateTo) return false;
      if (!q) return true;
      return r.title.toLowerCase().includes(q);
    });
  }, [reels, query, appliedStatus, appliedDateFrom, appliedDateTo]);

  const pagination = usePagination({
    totalCount: filtered.length,
    pageSize: PAGE_SIZE,
  });

  const pageRows = useMemo(
    () => filtered.slice(pagination.startIndex, pagination.endIndex),
    [filtered, pagination.startIndex, pagination.endIndex]
  );

  const columns = useReelsTableColumns({
    onEdit: openEditDialog,
    onPreview: openPreviewDialog,
    onDelete: openDeleteDialog,
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
        captionDraft={captionDraft}
        setCaptionDraft={setCaptionDraft}
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
        showCaptionOnReelPreview={showCaptionOnReelPreview}
        isSubmitting={isSubmitting}
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
    </div>
  );
}
