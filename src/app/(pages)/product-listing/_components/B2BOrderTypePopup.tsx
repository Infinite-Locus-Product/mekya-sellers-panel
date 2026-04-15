"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppSelect } from "@/components/shared/AppSelect";
import { COLOR_PALETTE, ColorSelect } from "@/components/shared/ColorSelect";
import { cn } from "@/lib/utils";

type OrderTypeOption = {
  value: string;
  label: string;
  description: string;
};

interface B2BOrderTypePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderTypeOptions: OrderTypeOption[];
  selectedOrderTypes: string[];
  onToggleOrderType: (value: string) => void;
  onBackToBasic: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const B2B_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "28", "30", "32", "34", "36", "38", "40", "42"];

export function B2BOrderTypePopup({
  open,
  onOpenChange,
  orderTypeOptions,
  selectedOrderTypes,
  onToggleOrderType,
  onBackToBasic,
  onNext,
  onSaveDraft,
}: Readonly<B2BOrderTypePopupProps>) {
  const [setPurchaseSizes, setSetPurchaseSizes] = useState<string[]>([]);
  const [setPurchaseColor, setSetPurchaseColor] = useState<string | undefined>(undefined);
  const [bundleSize, setBundleSize] = useState<string | undefined>(undefined);
  const [bundleActiveColorSelection, setBundleActiveColorSelection] = useState<string | undefined>(undefined);
  const [isBundleColorDropdownOpen, setIsBundleColorDropdownOpen] = useState(false);
  const [bundleColors, setBundleColors] = useState<string[]>([]);
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [customActiveColorSelection, setCustomActiveColorSelection] = useState<string | undefined>(undefined);
  const [isCustomColorDropdownOpen, setIsCustomColorDropdownOpen] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>([]);

  const toggleSize = (
    size: string,
    setSelectedSizes: Dispatch<SetStateAction<string[]>>
  ) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]
    );
  };

  const renderSizeCheckboxGrid = (
    name: string,
    selectedSizes: string[],
    setSelectedSizes: Dispatch<SetStateAction<string[]>>
  ) => (
    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
      {B2B_SIZES.map((size) => (
        <label key={`${name}-${size}`} className="inline-flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name={name}
            checked={selectedSizes.includes(size)}
            onChange={() => toggleSize(size, setSelectedSizes)}
            className="accent-black cursor-pointer"
          />
          {size}
        </label>
      ))}
    </div>
  );

  const handleSelectBundleColor = (value: string) => {
    setBundleColors((prev) => {
      if (prev.includes(value)) {
        toast.info("Color already selected");
        return prev;
      }
      return [...prev, value];
    });
    setIsBundleColorDropdownOpen(false);
    setBundleActiveColorSelection(undefined);
  };

  const handleSelectCustomColor = (value: string) => {
    setCustomColors((prev) => {
      if (prev.includes(value)) {
        toast.info("Color already selected");
        return prev;
      }
      return [...prev, value];
    });
    setIsCustomColorDropdownOpen(false);
    setCustomActiveColorSelection(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideDefaultClose
        className="w-[min(calc(100vw-2rem),80.885vw)] max-h-[min(calc(100vh-2rem),60.185vh)] max-w-[min(calc(100vw-2rem),80.885vw)] overflow-y-auto overflow-x-hidden rounded-[5px] border border-[#DADADA] bg-white p-0"
      >
        <div className="flex min-h-0 flex-col">
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

          <div className="p-4">
            <Card className="rounded-[2px] border bg-white shadow-none">
              <CardHeader className="border-b px-4 py-3">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.70489 15.9649V4.87341L0.0977069 1.46457C-0.0232635 1.21018 -0.0319043 0.951375 0.0717846 0.688165C0.175474 0.424955 0.356929 0.234331 0.616152 0.116293C0.875374 -0.00174442 1.13909 -0.0142943 1.4073 0.0786433C1.67551 0.171581 1.86975 0.345245 1.99003 0.599637L3.98604 4.82253H16.014L18.01 0.599637C18.1309 0.345245 18.3255 0.167171 18.5937 0.0654149C18.8619 -0.0363416 19.1253 -0.0193822 19.3838 0.116293C19.6431 0.235009 19.8245 0.425972 19.9282 0.689182C20.0319 0.952392 20.0233 1.21085 19.9023 1.46457L18.2951 4.87341V15.9649C18.2951 16.5245 18.0922 17.0038 17.6865 17.4027C17.2807 17.8016 16.7923 18.0007 16.2213 18H3.77866C3.20837 18 2.72035 17.8009 2.31458 17.4027C1.90881 17.0045 1.70558 16.5252 1.70489 15.9649ZM7.92622 10.877H12.0738C12.3676 10.877 12.614 10.7794 12.8131 10.584C13.0122 10.3886 13.1114 10.1471 13.1107 9.85948C13.11 9.57185 13.0104 9.33034 12.812 9.13497C12.6137 8.9396 12.3676 8.84191 12.0738 8.84191H7.92622C7.63244 8.84191 7.38635 8.9396 7.18796 9.13497C6.98956 9.33034 6.89002 9.57185 6.88933 9.85948C6.88864 10.1471 6.98818 10.389 7.18796 10.585C7.38773 10.7811 7.63382 10.8784 7.92622 10.877ZM3.77866 15.9649H16.2213V6.85766H3.77866V15.9649Z" fill="black" />
                  </svg>

                  Select Order Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 py-4">
                {orderTypeOptions.map((typeOption) => (
                  <div
                    key={typeOption.value}
                    className={cn(
                      "rounded-sm p-4 bg-[#F9FAF9]"
                    )}
                  >
                    <label
                      htmlFor={`b2b-order-type-${typeOption.value}`}
                      className="flex cursor-pointer gap-3"
                    >
                      <input
                        id={`b2b-order-type-${typeOption.value}`}
                        type="checkbox"
                        name="b2b-order-types"
                        value={typeOption.value}
                        checked={selectedOrderTypes.includes(typeOption.value)}
                        onChange={() => onToggleOrderType(typeOption.value)}
                        className="sr-only"
                      />
                      <span className="mt-0.5 shrink-0" aria-hidden>
                        {selectedOrderTypes.includes(typeOption.value) ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="7.25" fill="white" />
                            <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="7.25" stroke="black" strokeWidth="1.5" />
                            <rect x="3" y="3" width="10" height="10" rx="5" fill="black" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="7.25" fill="white" />
                            <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="7.25" stroke="black" strokeWidth="1.5" />
                          </svg>
                        )}
                      </span>
                      <span>
                        <p className="text-base font-medium text-foreground">{typeOption.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{typeOption.description}</p>
                      </span>
                    </label>

                    {selectedOrderTypes.includes(typeOption.value) && typeOption.value === "set_purchase" && (
                      <div className="mt-4 border-t pt-4">
                        <p className="text-sm font-medium text-foreground">Select Size for Set</p>
                        {renderSizeCheckboxGrid("set-purchase-sizes", setPurchaseSizes, setSetPurchaseSizes)}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {B2B_SIZES.filter((size) => setPurchaseSizes.includes(size)).map((size) => (
                              <span
                                key={size}
                                className="inline-flex h-6 min-w-10 items-center justify-center rounded-xs border border-[#DADADA] bg-[#F3F3F3] px-3 text-xs font-medium text-foreground"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                          <p className="whitespace-nowrap text-sm font-semibold text-foreground">
                            QTY - {setPurchaseSizes.length} items/set
                          </p>
                        </div>

                        <div className="mt-4">
                          <p className="mb-1.5 text-sm font-medium text-foreground">Choose Single color for Set</p>
                          <ColorSelect
                            className="h-10 w-full min-w-0 bg-white"
                            placeholder="Select color"
                            value={setPurchaseColor}
                            onChange={setSetPurchaseColor}
                          />
                        </div>
                      </div>
                    )}

                    {selectedOrderTypes.includes(typeOption.value) && typeOption.value === "single_size_bundle" && (
                      <div className="mt-4 border-t pt-4">
                        <div>
                          <p className="mb-1.5 text-sm font-medium text-foreground">Select Size for Bundle</p>
                          <AppSelect
                            className="h-10 w-full min-w-0 bg-white"
                            placeholder="Select Size"
                            value={bundleSize}
                            onChange={setBundleSize}
                            options={B2B_SIZES.map((size) => ({ label: size, value: size }))}
                          />
                        </div>

                        <div className="mt-4">
                          <div className="min-w-0 space-y-2">
                            <p className="text-sm font-medium text-foreground">Add Colors</p>
                            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3">
                              <ColorSelect
                                className="w-full min-w-0"
                                placeholder="Select Color"
                                value={bundleActiveColorSelection}
                                onChange={handleSelectBundleColor}
                                open={isBundleColorDropdownOpen}
                                onOpenChange={setIsBundleColorDropdownOpen}
                              />
                              <Button
                                type="button"
                                className="h-9 whitespace-nowrap bg-[#122130] px-3 text-xs hover:bg-[#0d1a28]"
                                onClick={() => setIsBundleColorDropdownOpen(true)}
                              >
                                <Plus className="h-4 w-4" />
                                Add new Color
                              </Button>
                            </div>
                            {bundleColors.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <p className="w-full text-xs text-muted-foreground">Selected Colors :</p>
                                {bundleColors.map((color) => {
                                  const palette = COLOR_PALETTE.find((entry) => entry.value === color);
                                  return (
                                    <span
                                      key={color}
                                      className="inline-flex items-center gap-2 rounded-xs bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                                    >
                                      <span
                                        className="size-3 rounded-full border border-black/10"
                                        style={{ backgroundColor: palette?.hex ?? "#9ca3af" }}
                                        aria-hidden
                                      />
                                      {color}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedOrderTypes.includes(typeOption.value) && typeOption.value === "custom_purchase" && (
                      <div className="mt-4 border-t pt-4">
                        <p className="text-sm font-medium text-foreground">Available Sizes</p>
                        {renderSizeCheckboxGrid("custom-purchase-sizes", customSizes, setCustomSizes)}

                        <div className="mt-4">
                          <div className="min-w-0 space-y-2">
                            <p className="text-sm font-medium text-foreground">Color</p>
                            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3">
                              <ColorSelect
                                className="w-full min-w-0"
                                placeholder="Select color."
                                value={customActiveColorSelection}
                                onChange={handleSelectCustomColor}
                                open={isCustomColorDropdownOpen}
                                onOpenChange={setIsCustomColorDropdownOpen}
                              />
                              <Button
                                type="button"
                                className="h-9 whitespace-nowrap bg-[#122130] px-3 text-xs hover:bg-[#0d1a28]"
                                onClick={() => setIsCustomColorDropdownOpen(true)}
                              >
                                <Plus className="h-4 w-4" />
                                Add more color
                              </Button>
                            </div>
                            {customColors.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <p className="w-full text-xs text-muted-foreground">Selected Colors :</p>
                                {customColors.map((color) => {
                                  const palette = COLOR_PALETTE.find((entry) => entry.value === color);
                                  return (
                                    <span
                                      key={color}
                                      className="inline-flex items-center gap-2 rounded-xs bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                                    >
                                      <span
                                        className="size-3 rounded-full border border-black/10"
                                        style={{ backgroundColor: palette?.hex ?? "#9ca3af" }}
                                        aria-hidden
                                      />
                                      {color}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="sticky bottom-0 flex items-center justify-between border-t bg-white px-4 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBackToBasic}
            >
              <ChevronLeft className="h-4 w-4" />
              Go Back
            </Button>

            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onSaveDraft}>
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={onNext}
                disabled={selectedOrderTypes.length === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
