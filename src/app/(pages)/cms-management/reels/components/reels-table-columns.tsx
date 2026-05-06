"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { TableColumn } from "@/components/shared/DataTable";
import { ReelStatusBadge } from "@/components/cms/ReelStatusBadge";
import type { CmsReel } from "@/lib/data/cms";
import { REEL_THUMBNAIL_FRAME_SAMPLES } from "../lib/constants";
import { ReelEngagementIcons } from "./ReelEngagementIcons";

export interface ReelsTableColumnsOptions {
  onEdit: (reel: CmsReel) => void;
  onPreview: (reel: CmsReel) => void;
  onDelete: (reel: CmsReel) => void;
}

function thumbnailSrcForRow(row: CmsReel): string {
  const samples = [...REEL_THUMBNAIL_FRAME_SAMPLES];
  const idx =
    row.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % samples.length;
  return samples[idx] ?? samples[0];
}

export function useReelsTableColumns({
  onEdit,
  onPreview,
  onDelete,
}: ReelsTableColumnsOptions): TableColumn<CmsReel>[] {
  return useMemo(
    () => [
      {
        key: "thumbnail",
        header: "Thumbnail",
        className: "w-[88px]",
        cell: (row) => (
          <div className="relative flex h-[72px] w-[75px] shrink-0 overflow-hidden rounded-[6px] bg-[#2A2A2A] ring-1 ring-[#E8E9E8]">
            {/* eslint-disable-next-line @next/next/no-img-element -- static poster frames from /public */}
            <img
              src={thumbnailSrcForRow(row)}
              alt=""
              width={75}
              height={72}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        ),
      },
      {
        key: "title",
        header: "Title",
        className: "min-w-[140px] text-sm font-normal text-[#2A2A2A]",
      },
      {
        key: "duration",
        header: "Duration",
        className: "w-[72px] text-sm text-[#2A2A2A]",
      },
      {
        key: "status",
        header: "Status",
        className: "w-[120px]",
        cell: (row) => <ReelStatusBadge status={row.status} />,
      },
      {
        key: "uploadDate",
        header: "Upload date",
        sortable: true,
        className: "min-w-[160px] text-sm text-[#2A2A2A]",
      },
      {
        key: "views",
        header: "Views",
        sortable: true,
        className: "w-[72px]",
        cell: (row) => (
          <span className="tabular-nums text-sm text-[#2A2A2A]">
            {row.views == null ? "—" : row.views}
          </span>
        ),
      },
      {
        key: "engagement",
        header: "Engagement",
        className: "min-w-[160px]",
        cell: (row) => <ReelEngagementIcons reel={row} />,
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        className: "w-[152px]",
        cell: (row) => (
          <div className="flex items-center justify-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-md text-[#004C5E] hover:bg-[#004C5E]/10"
              aria-label={`Edit ${row.title}`}
              onClick={() => onEdit(row)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.475 5.40783L18.592 7.52483M17.836 3.54283L12.109 9.26983C11.8122 9.56467 11.6102 9.94144 11.529 10.3518L11 12.9998L13.648 12.4698C14.058 12.3878 14.434 12.1868 14.73 11.8908L20.457 6.16383C20.6291 5.99173 20.7656 5.78742 20.8588 5.56256C20.9519 5.33771 20.9998 5.09671 20.9998 4.85333C20.9998 4.60994 20.9519 4.36895 20.8588 4.14409C20.7656 3.91923 20.6291 3.71492 20.457 3.54283C20.2849 3.37073 20.0806 3.23421 19.8557 3.14108C19.6309 3.04794 19.3899 3 19.1465 3C18.9031 3 18.6621 3.04794 18.4373 3.14108C18.2124 3.23421 18.0081 3.37073 17.836 3.54283Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 15V18C19 18.5304 18.7893 19.0391 18.4142 19.4142C18.0391 19.7893 17.5304 20 17 20H6C5.46957 20 4.96086 19.7893 4.58579 19.4142C4.21071 19.0391 4 18.5304 4 18V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H9" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-md text-[#004C5E] hover:bg-[#004C5E]/10"
              aria-label={`Preview ${row.title}`}
              onClick={() => onPreview(row)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2.75" y="2.75" width="19.5" height="19.5" rx="1.25" stroke="black" strokeWidth="1.5" />
                <path d="M9.71973 16.9502V9.0498L16.5596 13L9.71973 16.9502Z" stroke="black" strokeWidth="1.44" />
              </svg>

            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-md text-[#004C5E] hover:bg-[#004C5E]/10"
              aria-label={`Delete ${row.title}`}
              onClick={() => onDelete(row)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.76953 5.48953H22.2295M9.90703 17.347V10.372M14.092 17.347V10.372M14.092 1.76953H9.90703C9.53705 1.76953 9.18223 1.9165 8.92062 2.17812C8.659 2.43973 8.51203 2.79455 8.51203 3.16453V5.48953H15.487V3.16453C15.487 2.79455 15.3401 2.43973 15.0784 2.17812C14.8168 1.9165 14.462 1.76953 14.092 1.76953ZM18.3793 20.9461C18.3535 21.2956 18.1961 21.6223 17.939 21.8605C17.6819 22.0986 17.3441 22.2305 16.9936 22.2295H7.00543C6.65498 22.2305 6.31718 22.0986 6.06006 21.8605C5.80294 21.6223 5.6456 21.2956 5.61973 20.9461L4.32703 5.48953H19.672L18.3793 20.9461Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

            </Button>
            <Link
              href="/cms-management/analytics"
              className="inline-flex size-8 items-center justify-center rounded-md text-[#004C5E] hover:bg-[#004C5E]/10"
              aria-label="Open CMS analytics"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18V16M12 18V15M17 18V13M2.5 12C2.5 7.522 2.5 5.282 3.891 3.891C5.282 2.5 7.521 2.5 12 2.5C16.478 2.5 18.718 2.5 20.109 3.891C21.5 5.282 21.5 7.521 21.5 12C21.5 16.478 21.5 18.718 20.109 20.109C18.718 21.5 16.479 21.5 12 21.5C7.522 21.5 5.282 21.5 3.891 20.109C2.5 18.718 2.5 16.479 2.5 12Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.99219 11.4874C8.14719 11.5594 13.0342 11.2344 15.8142 6.82244M13.9922 6.28944L15.8682 5.98744C16.0962 5.95844 16.4322 6.13944 16.5152 6.35444L17.0102 7.99244" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

            </Link>
          </div>
        ),
      },
    ],
    [onDelete, onEdit, onPreview]
  );
}
