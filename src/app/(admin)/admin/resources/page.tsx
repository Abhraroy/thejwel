"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import {
  createCoupon,
  getAllCoupons,
  updateCouponState,
} from "@/app/(admin)/admin/actions/coupons";
import type { Coupon, CouponDiscountType } from "@/types/TypeInterface";

const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

type CouponFormData = {
  coupon_code: string;
  description: string;
  discount_type: CouponDiscountType;
  discount_value: string;
  min_purchase_amount: string;
  max_discount_amount: string;
  usage_limit: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
};

function pad2(value: number) {
  return value.toString().padStart(2, "0");
}

function toDateTimeLocalValue(value: Date) {
  const year = value.getFullYear();
  const month = pad2(value.getMonth() + 1);
  const day = pad2(value.getDate());
  const hours = pad2(value.getHours());
  const minutes = pad2(value.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function buildInitialCouponForm(): CouponFormData {
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    coupon_code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_purchase_amount: "0",
    max_discount_amount: "",
    usage_limit: "",
    valid_from: toDateTimeLocalValue(now),
    valid_until: toDateTimeLocalValue(weekLater),
    is_active: true,
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function getCouponStatus(coupon: Coupon) {
  const now = new Date();
  const startsAt = new Date(coupon.valid_from);
  const endsAt = new Date(coupon.valid_until);

  if (!coupon.is_active) {
    return { label: "Inactive", tone: "bg-gray-100 text-gray-700" };
  }
  if (!Number.isNaN(startsAt.getTime()) && now < startsAt) {
    return { label: "Scheduled", tone: "bg-indigo-100 text-indigo-700" };
  }
  if (!Number.isNaN(endsAt.getTime()) && now > endsAt) {
    return { label: "Expired", tone: "bg-amber-100 text-amber-700" };
  }
  return { label: "Live", tone: "bg-emerald-100 text-emerald-700" };
}

export default function ResourcesPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sectionInputRef = useRef<HTMLSelectElement | null>(null);

  const [folder, setFolder] = useState<string>("resources");
  const sectionNameOptions = [
    { value: "", label: "Select section" },
    { value: "homepage_hero", label: "Homepage Hero (carousel)" },
    { value: "banner_summer", label: "Banner Summer" },
    { value: "banner_festival", label: "Banner Festival" },
    { value: "banner_seasonal", label: "Banner Seasonal" },
    { value: "marketing_assets", label: "Marketing Assets" },
  ];
  const [sectionName, setSectionName] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | "saved" | "not_saved">(
    null
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState<CouponFormData>(
    buildInitialCouponForm()
  );
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isCouponSaving, setIsCouponSaving] = useState(false);
  const [couponList, setCouponList] = useState<Coupon[]>([]);
  const [isCouponLoading, setIsCouponLoading] = useState(true);
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);

  const fileMeta = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      type: file.type,
      sizeMb: (file.size / (1024 * 1024)).toFixed(2),
    };
  }, [file]);

  const refreshCoupons = async () => {
    setIsCouponLoading(true);
    setCouponError(null);
    const result = await getAllCoupons();
    if (!result.success) {
      setCouponError(result.error || "Unable to load coupons");
      setCouponList([]);
      setIsCouponLoading(false);
      return;
    }
    setCouponList(result.data ?? []);
    setIsCouponLoading(false);
  };

  useEffect(() => {
    refreshCoupons();
  }, []);

  const resetSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setCopied(false);
    setSaveStatus(null);
    setSaveError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadedUrl(null);
    setUploadedKey(null);
    setCopied(false);
    setSaveStatus(null);
    setSaveError(null);

    const nextFile = e.target.files?.[0] ?? null;
    if (!nextFile) {
      resetSelection();
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      resetSelection();
      setError("Please select an image file.");
      return;
    }

    if (nextFile.size > MAX_IMAGE_UPLOAD_BYTES) {
      resetSelection();
      setError("Image is too large. Please upload a file under 8MB.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextPreview = URL.createObjectURL(nextFile);
    setFile(nextFile);
    setPreviewUrl(nextPreview);
  };

  const uploadResourceImage = async () => {
    if (!file) {
      // If user clicks Upload without selecting a file, open the file picker.
      fileInputRef.current?.click();
      return;
    }

    if (!sectionName.trim()) {
      setError("Please select a section.");
      sectionInputRef.current?.focus();
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadedUrl(null);
    setUploadedKey(null);
    setCopied(false);
    setSaveStatus(null);
    setSaveError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (folder.trim()) formData.append("folder", folder.trim());
      formData.append("sectionName", sectionName.trim());

      const res = await fetch("/admin/api/uploadImage", {
        method: "POST",
        body: formData,
      });

      const data: any = await res.json();
      if (!res.ok || !data?.success || !data?.url) {
        throw new Error(data?.error || "Upload failed");
      }

      setUploadedUrl(data.url);
      setUploadedKey(data.key ?? null);

      // Save mapping in Supabase from the client side
      const supabase = createSupabaseClient();
      let { error } = await supabase.from("image_resources").insert({
        section_name: sectionName.trim(),
        image_link: data.url,
      });

      // Fallback for older naming in legacy environments.
      if (
        error &&
        typeof error.message === "string" &&
        (error.message.toLowerCase().includes('column "image_link"') ||
          error.message.toLowerCase().includes('column "section_name"'))
      ) {
        const retry = await supabase.from("image_resources").insert({
          sectionname: sectionName.trim(),
          imagelink: data.url,
        } as any);
        error = retry.error;
      }

      if (error) {
        setSaveStatus("not_saved");
        setSaveError(error.message);
      } else {
        setSaveStatus("saved");
      }
    } catch (err) {
      console.error("Resource upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const copyUrl = async () => {
    if (!uploadedUrl) return;
    try {
      await navigator.clipboard.writeText(uploadedUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleCouponInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setCouponForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setCouponForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetCouponForm = () => {
    setCouponForm(buildInitialCouponForm());
  };

  const handleCreateCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    if (!couponForm.coupon_code.trim()) {
      setCouponError("Coupon code is required");
      return;
    }

    setIsCouponSaving(true);
    const result = await createCoupon({
      coupon_code: couponForm.coupon_code,
      description: couponForm.description || undefined,
      discount_type: couponForm.discount_type,
      discount_value: Number(couponForm.discount_value || 0),
      min_purchase_amount: Number(couponForm.min_purchase_amount || 0),
      max_discount_amount:
        couponForm.max_discount_amount === ""
          ? null
          : Number(couponForm.max_discount_amount),
      usage_limit:
        couponForm.usage_limit === "" ? null : Number(couponForm.usage_limit),
      valid_from: new Date(couponForm.valid_from).toISOString(),
      valid_until: new Date(couponForm.valid_until).toISOString(),
      is_active: couponForm.is_active,
    });

    if (!result.success) {
      setCouponError(result.error || "Failed to create coupon");
      setIsCouponSaving(false);
      return;
    }

    setCouponSuccess("Coupon created successfully.");
    resetCouponForm();
    await refreshCoupons();
    setIsCouponSaving(false);
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    setCouponError(null);
    setCouponSuccess(null);
    setToggleLoadingId(coupon.coupon_id);
    const result = await updateCouponState(coupon.coupon_id, !coupon.is_active);
    if (!result.success) {
      setCouponError(result.error || "Failed to update coupon state");
      setToggleLoadingId(null);
      return;
    }
    setCouponSuccess(
      `Coupon ${coupon.coupon_code} is now ${
        coupon.is_active ? "inactive" : "active"
      }.`
    );
    await refreshCoupons();
    setToggleLoadingId(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-linear-to-b from-slate-50 to-white min-h-full">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm p-5 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Resources
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage media resources and coupons from a single advanced admin
            layout.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                Upload Resource Image
              </h2>
              <span className="rounded-full bg-rose-50 text-rose-700 text-xs px-3 py-1 font-medium">
                Media
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-800">
                Section name
              </label>
              <select
                ref={sectionInputRef}
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-rose-200 bg-white"
              >
                {sectionNameOptions.map((opt) => (
                  <option key={opt.value || "empty"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Saved in Supabase under `section_name`.
              </p>

              <label className="block text-sm font-semibold text-slate-800 mt-4">
                Folder (optional)
              </label>
              <input
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="e.g. resources/home"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-rose-200"
              />

              <label className="block text-sm font-semibold text-slate-800 mt-4">
                Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm"
              />
              <p className="text-xs text-slate-500">Max size: 8MB.</p>

              {fileMeta && (
                <div className="text-xs text-slate-600 rounded-lg bg-slate-50 border border-slate-200 p-3">
                  <div>
                    <span className="font-semibold">Selected:</span>{" "}
                    {fileMeta.name}
                  </div>
                  <div>
                    <span className="font-semibold">Type:</span> {fileMeta.type}
                  </div>
                  <div>
                    <span className="font-semibold">Size:</span> {fileMeta.sizeMb}
                    MB
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={uploadResourceImage}
                  disabled={isUploading || !file || !sectionName.trim()}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  type="button"
                  onClick={resetSelection}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm font-semibold hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>

              {error && (
                <div className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </div>
              )}
            </div>

            <div className="space-y-3 mt-5">
              <div className="text-sm font-semibold text-slate-800">Preview</div>
              <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden aspect-16/10 flex items-center justify-center">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-sm text-slate-500">
                    Select an image to preview
                  </div>
                )}
              </div>

              {uploadedUrl && (
                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="text-sm font-semibold text-slate-900">
                    Uploaded
                  </div>
                  <div className="mt-2 text-xs text-slate-600 break-all">
                    <span className="font-semibold">Section:</span>{" "}
                    {sectionName.trim()}
                  </div>
                  <div className="mt-2 text-xs text-slate-600 break-all">
                    <span className="font-semibold">URL:</span> {uploadedUrl}
                  </div>
                  {uploadedKey && (
                    <div className="mt-1 text-xs text-slate-600 break-all">
                      <span className="font-semibold">Key:</span> {uploadedKey}
                    </div>
                  )}

                  {saveStatus && (
                    <div
                      className={[
                        "mt-3 text-sm rounded-lg p-3 border",
                        saveStatus === "saved"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : "bg-amber-50 text-amber-900 border-amber-200",
                      ].join(" ")}
                    >
                      {saveStatus === "saved" ? (
                        <>Saved to Supabase (`image_resources`).</>
                      ) : (
                        <>
                          Uploaded to Cloudflare, but not saved to Supabase.
                          {saveError ? (
                            <div className="mt-1 text-xs break-all">
                              <span className="font-semibold">Reason:</span>{" "}
                              {saveError}
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={copyUrl}
                      className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-800 text-sm font-semibold hover:bg-slate-50"
                    >
                      {copied ? "Copied!" : "Copy URL"}
                    </button>
                    <a
                      href={uploadedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-800 text-sm font-semibold hover:bg-slate-50"
                    >
                      Open
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="xl:col-span-7 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                Coupon Management
              </h2>
              <span className="rounded-full bg-indigo-50 text-indigo-700 text-xs px-3 py-1 font-medium">
                Coupons
              </span>
            </div>

            <form onSubmit={handleCreateCoupon} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Coupon code
                  </label>
                  <input
                    name="coupon_code"
                    value={couponForm.coupon_code}
                    onChange={handleCouponInput}
                    placeholder="e.g. FESTIVE10"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Discount type
                  </label>
                  <select
                    name="discount_type"
                    value={couponForm.discount_type}
                    onChange={handleCouponInput}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Discount value
                  </label>
                  <input
                    name="discount_value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={couponForm.discount_value}
                    onChange={handleCouponInput}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Min purchase amount
                  </label>
                  <input
                    name="min_purchase_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={couponForm.min_purchase_amount}
                    onChange={handleCouponInput}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Max discount amount (optional)
                  </label>
                  <input
                    name="max_discount_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={couponForm.max_discount_amount}
                    onChange={handleCouponInput}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Usage limit (optional)
                  </label>
                  <input
                    name="usage_limit"
                    type="number"
                    min="0"
                    step="1"
                    value={couponForm.usage_limit}
                    onChange={handleCouponInput}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Valid from
                  </label>
                  <input
                    name="valid_from"
                    type="datetime-local"
                    value={couponForm.valid_from}
                    onChange={handleCouponInput}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Valid until
                  </label>
                  <input
                    name="valid_until"
                    type="datetime-local"
                    value={couponForm.valid_until}
                    onChange={handleCouponInput}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={couponForm.description}
                  onChange={handleCouponInput}
                  placeholder="Optional coupon description"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={couponForm.is_active}
                  onChange={handleCouponInput}
                  className="h-4 w-4 accent-indigo-600"
                />
                Active after creation
              </label>

              {couponError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  {couponError}
                </div>
              )}
              {couponSuccess && (
                <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  {couponSuccess}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={isCouponSaving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCouponSaving ? "Creating..." : "Create Coupon"}
                </button>
                <button
                  type="button"
                  onClick={resetCouponForm}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900">
                  Existing Coupons
                </h3>
                <button
                  type="button"
                  onClick={refreshCoupons}
                  className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Refresh
                </button>
              </div>

              {isCouponLoading ? (
                <div className="mt-3 text-sm text-slate-500">Loading coupons...</div>
              ) : couponList.length === 0 ? (
                <div className="mt-3 text-sm text-slate-500">
                  No coupons available yet.
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-3 max-h-130 overflow-auto pr-1">
                  {couponList.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <article
                        key={coupon.coupon_id}
                        className="border border-slate-200 rounded-xl p-4 bg-slate-50/60"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm sm:text-base font-semibold text-slate-900">
                                {coupon.coupon_code}
                              </h4>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${status.tone}`}
                              >
                                {status.label}
                              </span>
                            </div>
                            {coupon.description ? (
                              <p className="text-xs text-slate-600 mt-1">
                                {coupon.description}
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleCoupon(coupon)}
                            disabled={toggleLoadingId === coupon.coupon_id}
                            className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {toggleLoadingId === coupon.coupon_id
                              ? "Updating..."
                              : coupon.is_active
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-700">
                          <div>
                            <span className="font-semibold">Discount:</span>{" "}
                            {coupon.discount_value}{" "}
                            {coupon.discount_type === "percentage" ? "%" : "fixed"}
                          </div>
                          <div>
                            <span className="font-semibold">Min purchase:</span>{" "}
                            {coupon.min_purchase_amount ?? 0}
                          </div>
                          <div>
                            <span className="font-semibold">Max discount:</span>{" "}
                            {coupon.max_discount_amount ?? "N/A"}
                          </div>
                          <div>
                            <span className="font-semibold">Usage:</span>{" "}
                            {coupon.usage_count ?? 0}
                            {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                          </div>
                          <div>
                            <span className="font-semibold">From:</span>{" "}
                            {formatDate(coupon.valid_from)}
                          </div>
                          <div>
                            <span className="font-semibold">Until:</span>{" "}
                            {formatDate(coupon.valid_until)}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}