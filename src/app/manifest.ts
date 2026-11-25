import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Due",
    short_name: "Due",
    description: "Assignment and form deadlines for your batch, with reminders.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2f2f7",
    theme_color: "#f2f2f7",
    icons: [
      { src: "/icons/due-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/due-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/due-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
