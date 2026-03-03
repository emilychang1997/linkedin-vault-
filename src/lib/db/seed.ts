import { db } from "./index";
import { categories } from "./schema";

const defaultCategories = [
  {
    name: "Interview Tips",
    slug: "interview-tips",
    description: "Advice and strategies for job interviews",
  },
  {
    name: "Networking",
    slug: "networking",
    description: "Building professional connections and relationships",
  },
  {
    name: "Vibe Coding Tips",
    slug: "vibe-coding-tips",
    description: "Coding practices and technical advice",
  },
  {
    name: "Portfolio",
    slug: "portfolio",
    description: "Building and showcasing your work portfolio",
  },
  {
    name: "Resume",
    slug: "resume",
    description: "Resume writing and optimization tips",
  },
  {
    name: "General Philosophy",
    slug: "general-philosophy",
    description: "Career mindset and professional development philosophy",
  },
];

async function seed() {
  console.log("Seeding default categories...");

  for (const category of defaultCategories) {
    await db.insert(categories).values(category).onConflictDoNothing();
  }

  console.log("Seeding complete!");
}

seed();
