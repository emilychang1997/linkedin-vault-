import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function summarizePost(postContent: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Summarize this LinkedIn post in 2-3 concise sentences, focusing on the actionable advice or key insight:\n\n${postContent}`,
      },
    ],
  });

  const textContent = message.content.find((block) => block.type === "text");
  return textContent && textContent.type === "text" ? textContent.text : "";
}

export async function generatePreview(postContent: string, ogDescription?: string): Promise<string> {
  // If we have actual content, use AI to generate a preview
  if (postContent && postContent.length > 50) {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Generate a brief, engaging preview (2-3 sentences, max 150 words) for this LinkedIn post. Focus on what the reader will learn or gain from reading it:\n\n${postContent.substring(0, 1000)}`,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === "text");
    return textContent && textContent.type === "text" ? textContent.text : ogDescription?.substring(0, 200) || "";
  }

  // Fallback to OG description if no content
  return ogDescription?.substring(0, 200) || "";
}

export async function suggestCategories(
  postContent: string,
  availableCategories: string[]
): Promise<string[]> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Given these categories: ${availableCategories.join(", ")}, which categories best fit this post? Return as a JSON array of category names.\n\nPost:\n${postContent}`,
      },
    ],
  });

  const textContent = message.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") return [];

  try {
    const suggestions = JSON.parse(textContent.text);
    return Array.isArray(suggestions) ? suggestions : [];
  } catch {
    return [];
  }
}

export async function detectDocuments(
  postContent: string
): Promise<{ hasDocuments: boolean; reason: string }> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Does this LinkedIn post reference downloadable documents, PDFs, templates, carousel slides, or other files that the reader would need to visit the original post to access? Answer with JSON: {hasDocuments: boolean, reason: string}\n\nPost:\n${postContent}`,
      },
    ],
  });

  const textContent = message.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    return { hasDocuments: false, reason: "" };
  }

  try {
    return JSON.parse(textContent.text);
  } catch {
    return { hasDocuments: false, reason: "" };
  }
}

interface OpinionGroup {
  topic: string;
  summary: string;
  agreeing_posts: number[];
  contradicting_posts: number[];
}

export async function analyzeOpinions(
  posts: Array<{ id: number; content: string }>
): Promise<OpinionGroup[]> {
  const postsText = posts
    .map((p) => `Post ${p.id}: ${p.content}`)
    .join("\n\n---\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Analyze these LinkedIn posts and group them by the opinions/advice they express. For each topic, identify which posts agree and which contradict. Return structured JSON with this format:
[
  {
    "topic": "string",
    "summary": "string describing the consensus or disagreement",
    "agreeing_posts": [post IDs],
    "contradicting_posts": [post IDs]
  }
]

Posts:\n${postsText}`,
      },
    ],
  });

  const textContent = message.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") return [];

  try {
    const groups = JSON.parse(textContent.text);
    return Array.isArray(groups) ? groups : [];
  } catch {
    return [];
  }
}
