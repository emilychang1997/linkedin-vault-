import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/authors - List all authors
export async function GET() {
  try {
    const allAuthors = await db.select().from(authors);
    return NextResponse.json(allAuthors);
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 });
  }
}

// POST /api/authors - Create a new author
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, linkedinUrl, headline, avatarUrl, role } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [newAuthor] = await db
      .insert(authors)
      .values({
        name,
        linkedinUrl: linkedinUrl || null,
        headline: headline || null,
        avatarUrl: avatarUrl || null,
        role: role || null,
      })
      .returning();

    return NextResponse.json(newAuthor, { status: 201 });
  } catch (error) {
    console.error("Error creating author:", error);
    return NextResponse.json({ error: "Failed to create author" }, { status: 500 });
  }
}
