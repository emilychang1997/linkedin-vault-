import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { attachments } from "@/lib/db/schema";

// POST /api/upload - Upload a file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const postId = formData.get("postId") as string | null;
    const authorId = formData.get("authorId") as string | null;
    const description = formData.get("description") as string | null;
    const source = formData.get("source") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = path.join(process.cwd(), "public/uploads", fileName);

    // Write file to disk
    await writeFile(filePath, buffer);

    // Save file metadata to database
    const [attachment] = await db
      .insert(attachments)
      .values({
        postId: postId ? parseInt(postId) : null,
        authorId: authorId ? parseInt(authorId) : null,
        fileName: file.name,
        filePath: `/uploads/${fileName}`,
        fileType: file.type,
        fileSize: file.size,
        description: description || null,
        source: source || null,
      })
      .returning();

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
