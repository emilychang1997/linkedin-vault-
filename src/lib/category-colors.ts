// Category color mapping — values sourced from Figma Primitives tokens
// Each entry: bg = light palette, text = dark palette (same palette family)
export const categoryColors: Record<string, { bg: string; text: string }> = {
  "interview-tips":     { bg: "#DEEFFF", text: "#0B66C2" }, // alice / ocean
  "networking":         { bg: "#FEF1D8", text: "#A9721C" }, // papaya / cider
  "vibe-coding-tips":   { bg: "#FEECFF", text: "#BB50E0" }, // blossom / orchid
  "portfolio":          { bg: "#EBF6EE", text: "#095922" }, // mint / forest
  "resume":             { bg: "#E0F5F2", text: "#3E6861" }, // cyan / icepine
  "general-philosophy": { bg: "#E8E0F5", text: "#6B466D" }, // lavender / plum
};

export function getCategoryColor(slug: string) {
  return categoryColors[slug] || { bg: "#FAFAFA", text: "#6E6E6E" };
}

// Function to clean LinkedIn OG titles
export function cleanLinkedInTitle(ogTitle: string | null, content: string | null): string {
  if (!ogTitle && !content) return "Untitled Post";

  let title = ogTitle || "";

  // Remove common LinkedIn title patterns
  // Pattern: "Title | Author Name posted on the topic | LinkedIn"
  title = title.replace(/\s*\|\s*[\w\s]+\s+posted\s+on\s+the\s+topic\s*\|\s*LinkedIn\s*$/i, "");

  // Pattern: "Title | LinkedIn"
  title = title.replace(/\s*\|\s*LinkedIn\s*$/i, "");

  // Pattern: "Author Name posted on the topic | Title"
  title = title.replace(/^[\w\s]+\s+posted\s+on\s+the\s+topic\s*\|\s*/i, "");

  // If title is now empty or still has weird formatting, try to get from content
  if (!title.trim() && content) {
    const firstLine = content.split("\n")[0].trim();
    return firstLine.substring(0, 100); // Limit length
  }

  return title.trim() || "Untitled Post";
}
