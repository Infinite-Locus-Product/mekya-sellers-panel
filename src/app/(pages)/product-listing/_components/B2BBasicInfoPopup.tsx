"use client";

import type { RefObject } from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/shared/AppSelect";
import { ProductImageUploadCard } from "@/components/shared/ProductImageUploadCard";

type Option = {
  label: string;
  value: string;
};

type UploadedImage = {
  id: string;
  url: string;
};

interface B2BBasicInfoPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext: () => void;
  onSaveDraft: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFilesAdded: (files: FileList | File[]) => void;
  uploadedImages: UploadedImage[];
  onRemoveImage: (id: string) => void;
  isDraggingImage: boolean;
  setIsDraggingImage: (value: boolean) => void;
  productName: string;
  setProductName: (value: string) => void;
  articleNumber: string;
  setArticleNumber: (value: string) => void;
  category?: string;
  setCategory: (value: string) => void;
  inventoryType?: string;
  setInventoryType: (value: string) => void;
  categoryOptions: Option[];
  inventoryTypeOptions: Option[];
}

export function B2BBasicInfoPopup({
  open,
  onOpenChange,
  onNext,
  onSaveDraft,
  fileInputRef,
  onFilesAdded,
  uploadedImages,
  onRemoveImage,
  isDraggingImage,
  setIsDraggingImage,
  productName,
  setProductName,
  articleNumber,
  setArticleNumber,
  category,
  setCategory,
  inventoryType,
  setInventoryType,
  categoryOptions,
  inventoryTypeOptions,
}: Readonly<B2BBasicInfoPopupProps>) {
  const isNextDisabled =
    !productName.trim() ||
    !articleNumber.trim() ||
    !category ||
    !inventoryType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideDefaultClose
        className="h-[min(calc(100vh-2rem),60.185vh)] w-[min(calc(100vw-2rem),80.885vw)] max-h-[min(calc(100vh-2rem),60.185vh)] max-w-[min(calc(100vw-2rem),80.885vw)] rounded-[5px] border border-[#DADADA] bg-[#F9FAF9] p-0"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <h2 className="flex items-center gap-2 text-lg font-medium text-foreground">
              <Plus className="h-4 w-4" />
              Add New Product
            </h2>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
              aria-label="Close add new product popup"
              onClick={() => onOpenChange(false)}
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <ProductImageUploadCard
                fileInputRef={fileInputRef}
                onFilesAdded={onFilesAdded}
                uploadedImages={uploadedImages}
                onRemoveImage={onRemoveImage}
                isDragging={isDraggingImage}
                setIsDragging={setIsDraggingImage}
                maxFileSizeLabel="5 MB."
                cardClassName="rounded-[2px] border bg-white shadow-none"
                headerClassName="border-b px-4 py-3 pb-3"
                contentClassName="space-y-4 px-4 pt-4"
                uploadAreaClassName="w-full"
              />

              <Card className="rounded-[2px] border bg-white shadow-none">
                <CardHeader className="border-b px-4 py-3">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.21667 17.8583L7.5 18.3333L5 16.6667L2.5 18.3333V2.5H17.5V8.5C16.975 8.275 16.3667 8.275 15.8333 8.51667V4.16667H4.16667V15.2167L5 14.6667L7.5 16.3333L8.21667 15.8333V17.8583ZM9.88333 16.6333L15 11.525L16.6917 13.225L11.5833 18.3333H9.88333V16.6333ZM18.0917 11.825L17.275 12.6417L15.575 10.9417L16.3917 10.125L16.4 10.1167L16.4083 10.1083C16.55 9.975 16.7667 9.96667 16.925 10.075C16.95 10.0833 16.975 10.1083 16.9917 10.125L18.0917 11.225C18.2583 11.3917 18.2583 11.6667 18.0917 11.825ZM14.1667 7.5V5.83333H5.83333V7.5H14.1667ZM12.5 10.8333V9.16667H5.83333V10.8333H12.5Z" fill="black" />
                    </svg>

                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pt-4">
                  <div className="space-y-1">
                    <label htmlFor="b2b-product-name" className="text-sm font-medium text-foreground">
                      Product Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="b2b-product-name"
                      placeholder="Enter product name"
                      value={productName}
                      onChange={(event) => setProductName(event.target.value)}
                      className="h-10"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="b2b-article-number" className="text-sm font-medium text-foreground">
                      Article Number <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="b2b-article-number"
                      placeholder="Enter article number"
                      value={articleNumber}
                      onChange={(event) => setArticleNumber(event.target.value)}
                      className="h-10"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-foreground">
                      Category <span className="text-destructive">*</span>
                    </span>
                    <AppSelect
                      className="h-10 w-full min-w-0"
                      placeholder="Select category"
                      value={category}
                      onChange={(value) => setCategory(value)}
                      options={categoryOptions}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-foreground">
                      Inventory Type <span className="text-destructive">*</span>
                    </span>
                    <AppSelect
                      className="h-10 w-full min-w-0"
                      placeholder="Select inventory type"
                      value={inventoryType}
                      onChange={(value) => setInventoryType(value)}
                      options={inventoryTypeOptions}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center justify-end px-4 py-3">
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onSaveDraft}>
                Save as Draft
              </Button>
              <Button type="button" onClick={onNext} disabled={isNextDisabled}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
