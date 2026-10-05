import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Project Finance Manager",
    short_name: "Project Finance",
    description: "Collaborative project finances",
    start_url: "/app",
    display: "standalone",
    background_color: "#f8f9fb",
    theme_color: "#285cdb",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
