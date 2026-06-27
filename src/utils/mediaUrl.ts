const S3_BASE_URL = "https://etha-hospital-clone-app.s3.eu-north-1.amazonaws.com/media/";

export const normalizeMediaUrl = (url: string | null | undefined): string | null => {
  if (!url || url.trim() === "") return null;
  
  // Already a full URL (S3, Google CDN for OAuth users, etc.) — return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  
  // Strip leading /media/ or media/ before building the S3 URL
  const withoutMedia = url.startsWith("/media/")
    ? url.slice(7)
    : url.startsWith("media/")
    ? url.slice(6)
    : url;

  return `${S3_BASE_URL}${withoutMedia}`;
};
