"use client";

import { AlignJustify, ChevronLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface B2BDescriptionPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

export function B2BDescriptionPopup({
  open,
  onOpenChange,
  onBack,
  onNext,
  onSaveDraft,
}: Readonly<B2BDescriptionPopupProps>) {
  const [description, setDescription] = useState("...");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideDefaultClose
        className="h-[min(calc(100vh-2rem),60.185vh)] w-[min(calc(100vw-2rem),80.885vw)] max-h-[min(calc(100vh-2rem),60.185vh)] max-w-[min(calc(100vw-2rem),80.885vw)] rounded-[5px] border border-[#DADADA] bg-white p-0"
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
            <Card className="rounded-[2px] border bg-white shadow-none">
              <CardHeader className="border-b px-4 py-3">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <AlignJustify className="h-4 w-4" />
                  Product Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pt-4">
                <label htmlFor="b2b-description" className="text-sm font-medium text-foreground">
                  Write Description About Your Product
                </label>
                <textarea
                  id="b2b-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={13}
                  className="w-full resize-none rounded-sm border border-[#DADADA] bg-[#F9FAF9] p-3 text-sm outline-none"
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between border-t px-4 py-3">
            <Button type="button" variant="outline" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" />
              Go Back
            </Button>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onSaveDraft}>
                Save as Draft
              </Button>
              <Button type="button" onClick={onNext}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
