"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/DataTable";
import { usePagination } from "@/hooks";
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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
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

  const [editOpen, setEditOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<CmsReel | null>(null);
  const [editStep, setEditStep] = useState(0);
  const [cropRange, setCropRange] = useState<[number, number]>([0, 15]);
  const [captionDraft, setCaptionDraft] = useState(defaultCaptionDraft);
  const [reelDescription, setReelDescription] = useState("");
  const [selectedThumbnailFrameIndex, setSelectedThumbnailFrameIndex] = useState(0);
  const [reelFeedbackOpen, setReelFeedbackOpen] = useState(false);
  const [reelFeedbackReel, setReelFeedbackReel] = useState<CmsReel | null>(null);
  const [reelFeedbackVariant, setReelFeedbackVariant] =
    useState<ReelFeedbackVariant>("uploadComplete");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleTargetReel, setScheduleTargetReel] = useState<CmsReel | null>(null);
  const [scheduleDateIso, setScheduleDateIso] = useState(DEFAULT_SCHEDULE_DATE);
  const [scheduleTimeStr, setScheduleTimeStr] = useState(DEFAULT_SCHEDULE_TIME);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
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

  useEffect(() => {
    setReels(initialReels);
  }, [initialReels]);

  const openDeleteDialog = useCallback((reel: CmsReel) => {
    setPendingDelete(reel);
    setDeleteOpen(true);
  }, []);

  const openEditDialog = useCallback((reel: CmsReel) => {
    const totalSec = Math.max(1, parseDurationToSeconds(reel.duration));
    const end = Math.min(15, totalSec);
    setCropRange([0, end]);
    setEditStep(0);
    setCaptionDraft(defaultCaptionDraft());
    setReelDescription("");
    setSelectedThumbnailFrameIndex(0);
    setEditingReel(reel);
    setEditOpen(true);
  }, []);

  const handleEditDialogOpenChange = (open: boolean) => {
    setEditOpen(open);
    if (!open) {
      setEditingReel(null);
      setEditStep(0);
      setCaptionDraft(defaultCaptionDraft());
      setReelDescription("");
      setSelectedThumbnailFrameIndex(0);
    }
  };

  const showCaptionOnReelPreview =
    captionDraft.editorOpen &&
    captionDraft.text.trim().length > 0 &&
    editStep >= 1;

  const openPreviewDialog = useCallback((reel: CmsReel) => {
    setPreviewTitle(reel.title);
    setPreviewOpen(true);
  }, []);

  const handlePreviewDialogOpenChange = (open: boolean) => {
    setPreviewOpen(open);
    if (!open) setPreviewTitle("");
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
    if (!open) {
      setPendingDelete(null);
    }
  };

  const confirmDeleteReel = useCallback(() => {
    if (!pendingDelete) return;
    setReels((prev) => prev.filter((r) => r.id !== pendingDelete.id));
    toast.success("Reel deleted", { description: pendingDelete.title });
    setDeleteOpen(false);
    setPendingDelete(null);
  }, [pendingDelete]);

  const handleUploadDialogOpenChange = (open: boolean) => {
    setUploadOpen(open);
    if (!open) {
      setUploadFile(null);
      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }
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
    setUploadFile(file);
  }, []);

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

  const handleEditSaveDraft = () => {
    const reel = editingReel;
    if (!reel) return;
    setReelFeedbackReel(reel);
    setReelFeedbackVariant("draftSaved");
    handleEditDialogOpenChange(false);
    setReelFeedbackOpen(true);
  };

  const handleEditScheduleClick = () => {
    const reel = editingReel;
    if (!reel) return;
    setScheduleTargetReel(reel);
    setScheduleDateIso(DEFAULT_SCHEDULE_DATE);
    setScheduleTimeStr(DEFAULT_SCHEDULE_TIME);
    handleEditDialogOpenChange(false);
    setScheduleModalOpen(true);
  };

  const handleEditPublish = () => {
    const reel = editingReel;
    if (!reel) return;
    setReelFeedbackReel(reel);
    setReelFeedbackVariant("published");
    handleEditDialogOpenChange(false);
    setReelFeedbackOpen(true);
  };

  const handleConfirmSchedule = () => {
    const reel = scheduleTargetReel;
    if (!reel) return;
    setReelFeedbackReel(reel);
    setReelFeedbackVariant("scheduled");
    setScheduleModalOpen(false);
    setReelFeedbackOpen(true);
  };

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
        title={previewTitle}
        onOpenChange={handlePreviewDialogOpenChange}
      />

      <UploadReelDialog
        open={uploadOpen}
        onOpenChange={handleUploadDialogOpenChange}
        uploadInputRef={uploadInputRef}
        uploadFile={uploadFile}
        uploadPreviewUrl={uploadPreviewUrl}
        onPickFile={applyPickedVideo}
        onNext={() => {
          if (!uploadFile) return;
          const reel = syntheticCmsReelFromUploadedFile(uploadFile);
          handleUploadDialogOpenChange(false);
          openEditDialog(reel);
        }}
      />

      <EditReelDialog
        open={editOpen}
        onOpenChange={handleEditDialogOpenChange}
        reel={editingReel}
        editStep={editStep}
        cropRange={cropRange}
        onCropRangeChange={setCropRange}
        captionDraft={captionDraft}
        setCaptionDraft={setCaptionDraft}
        reelDescription={reelDescription}
        onReelDescriptionChange={setReelDescription}
        selectedThumbnailFrameIndex={selectedThumbnailFrameIndex}
        onSelectThumbnailFrame={setSelectedThumbnailFrameIndex}
        showCaptionOnReelPreview={showCaptionOnReelPreview}
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
      />
    </div>
  );
}
