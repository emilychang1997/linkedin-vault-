import Link from "next/link";
import { AddFileIcon } from "@/components/icons/AddFileIcon";
import { EditIcon } from "@/components/icons/EditIcon";
import { getCategoryColor } from "@/lib/category-colors";
import { CardAttachments } from "@/components/CardAttachments";
import { AuthorLink } from "@/components/AuthorLink";
import { MeatballMenu } from "@/components/MeatballMenu";
import type { PostWithRelations } from "@/types";

interface PostCardProps {
  post: PostWithRelations;
}


/** Derive the creator's LinkedIn profile URL from stored data or from the post URL slug. */
function getAuthorLinkedInUrl(post: PostWithRelations): string | null {
  if (post.author?.linkedinUrl) return post.author.linkedinUrl;
  const url = post.linkedinUrl;
  if (!url) return null;
  // linkedin.com/posts/author-slug_... → linkedin.com/in/author-slug
  const postMatch = url.match(/linkedin\.com\/posts\/([a-z0-9-]+)_/i);
  if (postMatch) return `https://www.linkedin.com/in/${postMatch[1]}`;
  // Already a profile URL
  const inMatch = url.match(/(https?:\/\/(?:www\.)?linkedin\.com\/in\/[^/?#]+)/i);
  if (inMatch) return inMatch[1];
  return null;
}

export function PostCard({ post }: PostCardProps) {
  const title =
    post.ogTitle?.replace(/\s*\|.*$/, "") || post.content?.split("\n")[0] || "Untitled Post";
  const summary =
    post.summary ||
    post.ogDescription?.substring(0, 200) ||
    post.content?.substring(0, 200) ||
    "";

  return (
    <div
      className="group bg-white border border-[#DFDFDF] shadow-[0_2px_6px_0_rgba(0,0,0,0.03)] hover:bg-[#fafafa] hover:border-[#f2f2f2] hover:shadow-[0_2px_6px_0_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out"
      style={{
        position: "relative",
        width: "337px",
        paddingTop: "30px",
        paddingBottom: "26px",
        paddingLeft: "22px",
        paddingRight: "22px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Meatball menu — hidden by default, visible on card hover */}
      <MeatballMenu postId={post.id} linkedinUrl={post.linkedinUrl} />

      {/* Subject section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Title — hover: LinkedIn blue + underline, scoped to this link only */}
        <Link href={`/posts/${post.id}`} className="group/title">
          <p
            className="line-clamp-2 text-black group-hover/title:text-[#0b66c2] group-hover/title:underline"
            style={{
              fontFamily: "Source Sans 3, sans-serif",
              fontSize: "20px",
              fontWeight: 600,
              lineHeight: "normal",
            }}
          >
            {title}
          </p>
        </Link>

        {/* Characteristics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Icons row: author + action icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Author — links to LinkedIn profile if available */}
            {post.author && (
              <AuthorLink
                name={post.author.name}
                linkedinUrl={getAuthorLinkedInUrl(post)}
              />
            )}

            {/* Add Files icon button */}
            <Link href={`/posts/${post.id}/edit`}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px",
                  borderRadius: "8px",
                }}
                className="transition-colors hover:bg-[#F3F4F6] active:bg-[#DBEAFE] [&:active_svg_path]:stroke-[#0B66C2]"
              >
                <AddFileIcon color="#9C9C9C" />
              </div>
            </Link>

            {/* Edit icon button */}
            <Link href={`/posts/${post.id}/edit`}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px",
                  borderRadius: "8px",
                }}
                className="transition-colors hover:bg-[#F3F4F6] active:bg-[#DBEAFE] [&:active_svg_path]:stroke-[#0B66C2]"
              >
                <EditIcon color="#9C9C9C" />
              </div>
            </Link>
          </div>

          {/* Category chips */}
          {post.categories && post.categories.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {post.categories.map((cat) => {
                const colors = getCategoryColor(cat.slug);
                return (
                  <span
                    key={cat.id}
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderRadius: "360px", // token: radius-3xl (pill)
                      padding: "2px 10px",
                      fontFamily: "Source Sans 3, sans-serif",
                      fontSize: "13px",
                      fontWeight: 500,
                      lineHeight: "20px",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {cat.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary text — flex:1 so it fills remaining card height, keeping attachments at the bottom */}
      {summary && (
        <Link href={`/posts/${post.id}`} style={{ flex: 1 }}>
          <p
            className="line-clamp-4"
            style={{
              fontFamily: "Source Sans 3, sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              color: "#000",
              lineHeight: "22px",
              letterSpacing: "0.07px",
            }}
          >
            {summary}
          </p>
        </Link>
      )}

      {/* Attached files */}
      {post.attachments && post.attachments.length > 0 && (
        <CardAttachments attachments={post.attachments} />
      )}
    </div>
  );
}
