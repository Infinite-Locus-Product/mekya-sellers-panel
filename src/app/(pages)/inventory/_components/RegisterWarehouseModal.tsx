"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppSelect } from "@/components/shared/AppSelect";
import { registerWarehouse, type WarehouseFulfillmentModel } from "@/lib/api/warehouses";

const FULFILLMENT_MODEL_OPTIONS = [
    { label: "Self-fulfilled", value: "self_fulfilled" },
    { label: "Marketplace-fulfilled", value: "marketplace_fulfilled" },
];

export interface RegisterWarehouseModalProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onRegistered?: () => void;
}

function FieldLabel({ children, required }: Readonly<{ children: ReactNode; required?: boolean }>) {
    return (
        <label className="text-xs font-medium text-foreground">
            {children}
            {required ? <span className="text-red-500"> *</span> : null}
        </label>
    );
}

function FieldError({ message }: Readonly<{ message?: string }>) {
    if (!message) return null;
    return <p className="text-[11px] text-red-600">{message}</p>;
}

function isValidPhone(value: string): boolean {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 13;
}

function isValidPostalCode(value: string): boolean {
    return /^[0-9]{4,10}$/.test(value.trim());
}

function isValidCountryCode(value: string): boolean {
    return /^[A-Z]{2}$/.test(value.trim());
}

/** New warehouses go to "pending_approval" until an admin approves them — see POST /seller/warehouses. */
export function RegisterWarehouseModal({
    open,
    onOpenChange,
    onRegistered,
}: Readonly<RegisterWarehouseModalProps>) {
    const [name, setName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [streetAddress1, setStreetAddress1] = useState("");
    const [streetAddress2, setStreetAddress2] = useState("");
    const [city, setCity] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [countryArea, setCountryArea] = useState("");
    const [countryCode, setCountryCode] = useState("IN");
    const [fulfillmentModel, setFulfillmentModel] = useState<WarehouseFulfillmentModel>("self_fulfilled");
    const [gstinApobRef, setGstinApobRef] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const reset = () => {
        setName("");
        setContactNumber("");
        setStreetAddress1("");
        setStreetAddress2("");
        setCity("");
        setPostalCode("");
        setCountryArea("");
        setCountryCode("IN");
        setFulfillmentModel("self_fulfilled");
        setGstinApobRef("");
        setSubmitted(false);
    };

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Warehouse name is required";
    if (!contactNumber.trim()) {
        errors.contactNumber = "Contact number is required";
    } else if (!isValidPhone(contactNumber)) {
        errors.contactNumber = "Enter a valid phone number";
    }
    if (!streetAddress1.trim()) errors.streetAddress1 = "Address line 1 is required";
    if (!city.trim()) errors.city = "City is required";
    if (!postalCode.trim()) {
        errors.postalCode = "Postal code is required";
    } else if (!isValidPostalCode(postalCode)) {
        errors.postalCode = "Enter a valid postal code";
    }
    if (!countryArea.trim()) errors.countryArea = "State is required";
    if (!countryCode.trim()) {
        errors.countryCode = "Country code is required";
    } else if (!isValidCountryCode(countryCode)) {
        errors.countryCode = "Use a 2-letter country code (e.g. IN)";
    }
    if (gstinApobRef.trim() && gstinApobRef.trim().length < 4) {
        errors.gstinApobRef = "Enter a valid GSTIN / APOB reference";
    }
    const hasErrors = Object.keys(errors).length > 0;

    const submit = async () => {
        setSubmitted(true);
        if (hasErrors) {
            toast.error("Please fix the highlighted fields");
            return;
        }
        setIsSubmitting(true);
        try {
            await registerWarehouse({
                name: name.trim(),
                address: {
                    street_address_1: streetAddress1.trim(),
                    street_address_2: streetAddress2.trim() || null,
                    city: city.trim(),
                    postal_code: postalCode.trim(),
                    country_area: countryArea.trim(),
                    country_code: countryCode.trim(),
                },
                fulfillment_model: fulfillmentModel,
                gstin_apob_ref: gstinApobRef.trim() || null,
                contact_number: contactNumber.trim(),
            });
            toast.success("Warehouse registered — awaiting admin approval");
            reset();
            onOpenChange(false);
            onRegistered?.();
        } catch (err) {
            toast.error("Could not register warehouse", {
                description: err instanceof Error ? err.message : "Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const errClass = (field: string) =>
        submitted && errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                onOpenChange(next);
                if (!next) reset();
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">Register warehouse</DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                    <div className="space-y-1.5">
                        <FieldLabel required>Warehouse name</FieldLabel>
                        <Input
                            placeholder="e.g. Mumbai Central Warehouse"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`h-9 text-sm ${errClass("name")}`}
                        />
                        {submitted ? <FieldError message={errors.name} /> : null}
                    </div>
                    <div className="space-y-1.5">
                        <FieldLabel required>Contact number</FieldLabel>
                        <Input
                            type="tel"
                            placeholder="10-digit mobile number"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            className={`h-9 text-sm ${errClass("contactNumber")}`}
                        />
                        {submitted ? <FieldError message={errors.contactNumber} /> : null}
                    </div>
                    <div className="space-y-1.5">
                        <FieldLabel required>Address line 1</FieldLabel>
                        <Input
                            placeholder="Street address"
                            value={streetAddress1}
                            onChange={(e) => setStreetAddress1(e.target.value)}
                            className={`h-9 text-sm ${errClass("streetAddress1")}`}
                        />
                        {submitted ? <FieldError message={errors.streetAddress1} /> : null}
                    </div>
                    <div className="space-y-1.5">
                        <FieldLabel>Address line 2</FieldLabel>
                        <Input
                            placeholder="Apartment, suite, etc."
                            value={streetAddress2}
                            onChange={(e) => setStreetAddress2(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <FieldLabel required>City</FieldLabel>
                            <Input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className={`h-9 text-sm ${errClass("city")}`}
                            />
                            {submitted ? <FieldError message={errors.city} /> : null}
                        </div>
                        <div className="space-y-1.5">
                            <FieldLabel required>Postal code</FieldLabel>
                            <Input
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                className={`h-9 text-sm ${errClass("postalCode")}`}
                            />
                            {submitted ? <FieldError message={errors.postalCode} /> : null}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <FieldLabel required>State</FieldLabel>
                            <Input
                                placeholder="e.g. Maharashtra"
                                value={countryArea}
                                onChange={(e) => setCountryArea(e.target.value)}
                                className={`h-9 text-sm ${errClass("countryArea")}`}
                            />
                            {submitted ? <FieldError message={errors.countryArea} /> : null}
                        </div>
                        <div className="space-y-1.5">
                            <FieldLabel required>Country code</FieldLabel>
                            <Input
                                placeholder="IN"
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                                className={`h-9 text-sm ${errClass("countryCode")}`}
                            />
                            {submitted ? <FieldError message={errors.countryCode} /> : null}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <FieldLabel>Fulfillment model</FieldLabel>
                        <AppSelect
                            options={FULFILLMENT_MODEL_OPTIONS}
                            value={fulfillmentModel}
                            placeholder="Select fulfillment model"
                            onChange={(value) => setFulfillmentModel(value as WarehouseFulfillmentModel)}
                            className="w-full min-[1920px]:w-full"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <FieldLabel>GSTIN / APOB reference</FieldLabel>
                        <Input
                            value={gstinApobRef}
                            onChange={(e) => setGstinApobRef(e.target.value)}
                            className={`h-9 text-sm ${errClass("gstinApobRef")}`}
                        />
                        {submitted ? <FieldError message={errors.gstinApobRef} /> : null}
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="button" size="sm" disabled={isSubmitting} onClick={submit}>
                        {isSubmitting ? "Registering…" : "Register warehouse"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
