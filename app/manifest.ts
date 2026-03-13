import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MarketHub Express — Global Marketplace",
    short_name: "MarketHub",
    description:
      "Shop millions of products from 50,000+ verified sellers in 190+ countries.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F6FA",
    theme_color: "#E53935",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
