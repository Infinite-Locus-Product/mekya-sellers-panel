import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Button } from "@/components/ui/button";
import { cr } from "../lib/cms-reels-tokens";
import { CmsReelIconUpload } from "./cms-reels-icons";

export interface ReelsPageHeaderProps {
  onUploadClick: () => void;
}

export function ReelsPageHeader({ onUploadClick }: Readonly<ReelsPageHeaderProps>) {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Seller Dashboard", href: "/dashboard" },
          { label: "CMS Management", href: "/cms-management/reels" },
          { label: "Reels Approval" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={cr.title}>CMS - Reel Library</h1>
          <p className={cr.subtitle}>
            Manage your reels content with advanced editing tools
          </p>
        </div>
        <Button
          type="button"
          className="h-10 shrink-0 gap-2 rounded-lg bg-[#122130] px-4 text-sm font-medium text-white shadow-none hover:bg-[#004C5E]/90 min-[1920px]:h-11 min-[1920px]:px-5 min-[1920px]:text-base"
          onClick={onUploadClick}
        >
          <CmsReelIconUpload className="size-4 text-white" aria-hidden />
          Upload Reel
        </Button>
      </div>
    </>
  );
}
