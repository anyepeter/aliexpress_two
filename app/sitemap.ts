import type { MetadataRoute } from "next";

const BASE_URL = "https://markethubexpress.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${BASE_URL}/shop`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE_URL}/stores`, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/how-to-buy`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/returns`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/buyer-protection`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/help`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/seller-guidelines`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/seller-academy`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/advertise`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE_URL}/auth/login`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/auth/register`, changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  return staticPages.map((page) => ({
    ...page,
    lastModified: new Date(),
  }));
}
