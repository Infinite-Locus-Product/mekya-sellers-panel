"use client";

import { ChevronLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface B2BPricingPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

function QuantityStepper({
  label,
  value,
  onChange,
}: Readonly<{ label: string; value: number; onChange: (value: number) => void }>) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChange(Math.max(0, value - 1))}>
          -
        </Button>
        <span className="min-w-6 text-center text-sm bg-[#F9FAF9]">{value}</span>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChange(value + 1)}>
          +
        </Button>
      </div>
    </div>
  );
}

export function B2BPricingPopup({
  open,
  onOpenChange,
  onBack,
  onNext,
  onSaveDraft,
}: Readonly<B2BPricingPopupProps>) {
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [minQty, setMinQty] = useState(0);
  const [maxQty, setMaxQty] = useState(0);
  const [wholeSalePricePerUnit, setWholeSalePricePerUnit] = useState("");
  const [wholeSalePricePerSet, setWholeSalePricePerSet] = useState("");

  const isNextDisabled = !wholeSalePricePerUnit.trim() || !wholeSalePricePerSet.trim();

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) return;
    setTags((prev) => [...prev, value]);
    setTagInput("");
  };

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
              <Card className="rounded-[2px] border bg-white shadow-none">
                <CardHeader className="border-b px-4 py-3">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_4311_75764)">
                        <path d="M10.0013 18.3346C14.6037 18.3346 18.3346 14.6037 18.3346 10.0013C18.3346 5.39893 14.6037 1.66797 10.0013 1.66797C5.39893 1.66797 1.66797 5.39893 1.66797 10.0013C1.66797 14.6037 5.39893 18.3346 10.0013 18.3346Z" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7.5 9.16927H12.9167M12.9167 5.83594H7.5C8.38405 5.83594 9.2319 6.18713 9.85702 6.81225C10.4821 7.43737 10.8333 8.28522 10.8333 9.16927C10.8333 10.0533 10.4821 10.9012 9.85702 11.5263C9.2319 12.1514 8.38405 12.5026 7.5 12.5026L10 15.0026" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                      <defs>
                        <clipPath id="clip0_4311_75764">
                          <rect width="20" height="20" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>

                    Pricing &amp; Quantity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label htmlFor="b2b-price-unit" className="text-sm font-medium">
                        Whole Sale Price per Unit*
                      </label>
                      <Input
                        id="b2b-price-unit"
                        placeholder="Enter WSP per unit"
                        value={wholeSalePricePerUnit}
                        onChange={(event) => setWholeSalePricePerUnit(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="b2b-price-set" className="text-sm font-medium">
                        Whole Sale Price per Set*
                      </label>
                      <Input
                        id="b2b-price-set"
                        placeholder="Enter WSP per Set"
                        value={wholeSalePricePerSet}
                        onChange={(event) => setWholeSalePricePerSet(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="b2b-available-qty" className="text-sm font-medium">
                      Available Quantity
                    </label>
                    <Input id="b2b-available-qty" placeholder="Enter available quantity" />
                  </div>
                  <QuantityStepper label="Minimum Quantity" value={minQty} onChange={setMinQty} />
                  <QuantityStepper label="Maximum Quantity" value={maxQty} onChange={setMaxQty} />
                </CardContent>
              </Card>

              <Card className="rounded-[2px] border bg-white shadow-none">
                <CardHeader className="border-b px-4 py-3">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 6.66667V10.1433C2.50009 10.5853 2.67575 11.0092 2.98833 11.3217L7.74667 16.08C8.12329 16.4566 8.63408 16.6681 9.16667 16.6681C9.69926 16.6681 10.21 16.4566 10.5867 16.08L13.58 13.0867C13.9566 12.71 14.1681 12.1993 14.1681 11.6667C14.1681 11.1341 13.9566 10.6233 13.58 10.2467L8.82167 5.48833C8.50918 5.17575 8.08532 5.00009 7.64333 5H4.16667C3.72464 5 3.30072 5.17559 2.98816 5.48816C2.67559 5.80072 2.5 6.22464 2.5 6.66667Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14.9992 15.8333L16.3259 14.5067C17.079 13.7534 17.5021 12.7318 17.5021 11.6667C17.5021 10.6015 17.079 9.57992 16.3259 8.82667L12.4992 5M5.83255 8.33333H5.82422" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Product Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pt-4">
                  <div className="space-y-1">
                    <label htmlFor="b2b-tag-input" className="text-sm font-medium">
                      Add a Tag
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="b2b-tag-input"
                        value={tagInput}
                        onChange={(event) => setTagInput(event.target.value)}
                        placeholder="Example : White Shirt"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addTag}>
                        Add
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Tags :</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs"
                        >
                          {tag}
                          <button
                            type="button"
                            className="text-muted-foreground"
                            onClick={() => setTags((prev) => prev.filter((item) => item !== tag))}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-[#F9FAF9]">
            <Button type="button" variant="outline" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" />
              Go Back
            </Button>
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
