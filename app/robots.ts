import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/seller/",
          "/buyer/",
          "/messages/",
          "/checkout/",
          "/auth/pending-approval",
          "/auth/verify-email",
        ],
      },
    ],
    sitemap: "https://aliexpressexpress.com/sitemap.xml",
  };
}
