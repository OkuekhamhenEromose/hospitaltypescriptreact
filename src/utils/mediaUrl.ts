// utils/mediaUrl.ts
export const normalizeMediaUrl = (url: string | null | undefined): string | null => {
  if (!url || url.trim() === "") return null;

  // Already a full URL — return exactly as-is, no modifications
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // Relative S3 path like "profile/davidguetta_profile.png"
  const S3_BASE = "https://etha-hospital-clone-app.s3.eu-north-1.amazonaws.com/media/";
  const cleanPath = url.startsWith("media/") ? url.slice(6) : url;
  return `${S3_BASE}${cleanPath}`;
};