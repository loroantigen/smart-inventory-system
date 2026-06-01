import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/dashboard`, lastModified: new Date() },
    { url: `${baseUrl}/inventory`, lastModified: new Date() },
    { url: `${baseUrl}/consumables`, lastModified: new Date() },
    { url: `${baseUrl}/requests`, lastModified: new Date() },
    { url: `${baseUrl}/login`, lastModified: new Date() },
  ];
}