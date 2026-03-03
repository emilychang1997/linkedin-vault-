import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attachments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const postAttachments = await db
      .select()
      .from(attachments)
      .where(eq(attachments.postId, postId));

    // Map to camelCase for frontend
    const formattedAttachments = postAttachments.map((att) => ({
      id: att.id,
      fileName: att.fileName,
      filePath: att.filePath,
      fileType: att.fileType,
      fileSize: att.fileSize,
    }));

    return NextResponse.json(formattedAttachments);
  } catch (error) {
    console.error("Failed to fetch attachments:", error);
    return NextResponse.json(
      { error: "Failed to fetch attachments" },
      { status: 500 }
    );
  }
}
