import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

// Helper function to load Google Fonts correctly for @vercel/og
async function loadGoogleFont(fontFamily, weight = 400) {
  // Construct the URL to fetch the CSS for the specified font and weight
  const fontCssUrl = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@${weight}&display=swap`;

  // Fetch the CSS content
  const cssResponse = await fetch(fontCssUrl);
  if (!cssResponse.ok) {
    throw new Error(
      `Failed to fetch font CSS for ${fontFamily}: ${cssResponse.statusText}`
    );
  }
  const css = await cssResponse.text();

  // Extract the direct font file URL from the CSS
  const fontUrlMatch = css.match(/src: url\((.+)\) format\(['"]truetype['"]\)/);
  if (!fontUrlMatch || !fontUrlMatch[1]) {
    throw new Error(
      `Failed to parse font URL from CSS for ${fontFamily}. CSS: ${css}`
    );
  }
  const fontUrl = fontUrlMatch[1];

  // Fetch the actual font file data
  const fontFileResponse = await fetch(fontUrl);
  if (!fontFileResponse.ok) {
    throw new Error(
      `Failed to fetch font file from URL ${fontUrl}: ${fontFileResponse.statusText}`
    );
  }
  const fontData = await fontFileResponse.arrayBuffer();

  return fontData;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "easy-pdf";
  const subtitle = searchParams.get("subtitle") || "";

  let interFontData;
  try {
    // Attempt to load Inter SemiBold (weight 600)
    interFontData = await loadGoogleFont("Inter", 600);
  } catch (error) {
    console.error("Error loading Inter font for OG image:", error);
    // If font loading fails, return an error image or fallback to a generic font
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "1200px",
            height: "630px",
            background: "#f00", // Red background to clearly show error
            color: "white",
            fontSize: 48,
            fontFamily: "sans-serif",
            textAlign: "center",
          }}
        >
          <span>Error generating image:</span>
          <span>Failed to load custom font.</span>
          <span>Please try again later.</span>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(90deg, #1e40af 0%, #9333ea 100%)",
          color: "white",
          fontSize: 64,
          fontWeight: "bold",
          fontFamily: "Inter, sans-serif", // Ensure Inter is used
          letterSpacing: "-1px",
          position: "relative",
          padding: "0 50px", // Add some padding to prevent content from touching edges
          boxSizing: "border-box", // Include padding in width/height
        }}
      >
        <img
          src="https://easy-pdf-murex.vercel.app/icon.png"
          width={120}
          height={120}
          style={{
            borderRadius: 32,
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)", // Stronger shadow for better pop
          }}
          alt="easy-pdf logo"
        />
        {/* Only display "easy-pdf" brand if the title is not the default "easy-pdf" (case-insensitive) to avoid repetition */}
        {title.toLowerCase() !== "easy-pdf" && (
          <span
            style={{
              fontSize: 48,
              marginBottom: 16,
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)", // Stronger shadow
            }}
          >
            easy-pdf
          </span>
        )}
        <span
          style={{
            fontSize: title.length > 30 ? 36 : 40, // Adjust font size for longer titles
            maxWidth: 1000,
            textAlign: "center",
            lineHeight: 1.2,
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)", // Stronger shadow
            marginTop: title.toLowerCase() !== "easy-pdf" ? 0 : 16, // Adjust margin if brand is not shown
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            style={{
              fontSize: subtitle.length > 80 ? 24 : 28, // Adjust font size for longer subtitles
              marginTop: 24,
              color: "#e0e7ff",
              textAlign: "center",
              maxWidth: 900,
              textShadow: "0 1px 4px rgba(0, 0, 0, 0.3)", // Subtle shadow for subtitle
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: interFontData,
          style: "normal",
          weight: 600, // SemiBold
        },
      ],
    }
  );
}
