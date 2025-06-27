export async function GET() {
  const baseUrl = "https://easy-pdf-murex.vercel.app";
  const routes = [
    "",
    "/merge",
    "/split",
    "/compress",
    "/jpg-to-pdf",
    "/pdf-to-jpg",
    "/protect",
    "/unlock",
    "/rotate",
    "/watermark",
    "/form-filler",
    "/reorder",
    "/delete-pages",
    "/organize",
    "/page-numbers",
    "/html-to-pdf",
    "/ocr",
    "/sign",
    "/word-to-pdf",
    "/pdf-to-word",
    "/legal-analyzer",
    "/medical-analyzer",
    "/about",
    "/security",
  ];

  const lastModified = new Date("2025-06-27").toISOString();

  const pages = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: lastModified,
    changeFrequency: "monthly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
  )
  .join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
