"use client";

import { useMemo, useRef, useState } from "react";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";

const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

export default function ResourcesPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sectionInputRef = useRef<HTMLInputElement | null>(null);

  const [folder, setFolder] = useState<string>("resources");
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

  const fileMeta = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      type: file.type,
      sizeMb: (file.size / (1024 * 1024)).toFixed(2),
    };
  }, [file]);

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
      setError("Please enter a section name.");
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
        imagelink: data.url,
      });

      // Fallback if the column is named `sectionname` instead of `section_name`
      if (
        error &&
        typeof error.message === "string" &&
        error.message.toLowerCase().includes('column "section_name"')
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

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Resources
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Upload site resource images (banners, hero images, marketing assets,
          etc.).
        </p>

        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">
                Section name
              </label>
              <input
                ref={sectionInputRef}
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g. homepage_hero, banner_summer, etc."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-rose-200"
              />
              <p className="text-xs text-gray-500">
                This text will be saved to Supabase as <span className="font-semibold">section_name</span>.
              </p>

              <label className="block text-sm font-semibold text-gray-800 mt-4">
                Folder (optional)
              </label>
              <input
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="e.g. resources/home"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-rose-200"
              />
              <p className="text-xs text-gray-500">
                This is passed to Cloudflare as the upload folder.
              </p>

              <label className="block text-sm font-semibold text-gray-800 mt-4">
                Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm"
              />
              <p className="text-xs text-gray-500">Max size: 8MB.</p>

              {fileMeta && (
                <div className="text-xs text-gray-600">
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
                  disabled={isUploading || !file}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  type="button"
                  onClick={resetSelection}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-50"
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

            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-800">Preview</div>
              <div className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden aspect-16/10 flex items-center justify-center">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-sm text-gray-500">
                    Select an image to preview
                  </div>
                )}
              </div>

              {uploadedUrl && (
                <div className="mt-4 border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="text-sm font-semibold text-gray-900">
                    Uploaded
                  </div>
                  <div className="mt-2 text-xs text-gray-600 break-all">
                    <span className="font-semibold">Section:</span>{" "}
                    {sectionName.trim()}
                  </div>
                  <div className="mt-2 text-xs text-gray-600 break-all">
                    <span className="font-semibold">URL:</span> {uploadedUrl}
                  </div>
                  {uploadedKey && (
                    <div className="mt-1 text-xs text-gray-600 break-all">
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
                      className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-50"
                    >
                      {copied ? "Copied!" : "Copy URL"}
                    </button>
                    <a
                      href={uploadedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-50"
                    >
                      Open
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}