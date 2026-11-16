export const monthYear = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Present";

/** Cloudinary on-the-fly resize + auto format/quality. */
export const cld = (url: string, w: number) =>
  url.includes("res.cloudinary.com") && url.includes("/upload/")
    ? url.replace("/upload/", `/upload/c_limit,w_${w},q_auto,f_auto/`)
    : url;
