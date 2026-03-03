import ogs from "open-graph-scraper";
import type { OGMetadata } from "@/types";

/** Extract author name + post slug from a LinkedIn URL without any network request. */
function extractFromLinkedInUrl(url: string): Pick<OGMetadata, "author"> {
  // Profile posts: linkedin.com/posts/<slug>_...
  const postMatch = url.match(/linkedin\.com\/posts\/([a-z0-9-]+)_/i);
  if (postMatch) {
    const author = postMatch[1]
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return { author };
  }
  // Profile pages: linkedin.com/in/<slug>
  const inMatch = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  if (inMatch) {
    const author = inMatch[1]
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return { author };
  }
  return {};
}

export async function extractOGMetadata(url: string): Promise<OGMetadata & { fetchError?: string }> {
  // Always extract what we can from the URL itself first
  const fromUrl = url.includes("linkedin.com") ? extractFromLinkedInUrl(url) : {};

  try {
    const { result } = await ogs({
      url,
      fetchOptions: {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      },
      timeout: 8000,
    });

    const author = result.ogSiteName || result.twitterCreator || fromUrl.author;

    return {
      title: result.ogTitle,
      description: result.ogDescription,
      image: result.ogImage?.[0]?.url,
      author,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("OG fetch failed:", msg);

    // Return whatever we could extract from the URL, plus the error for the UI
    return {
      ...fromUrl,
      fetchError: msg,
    };
  }
}
