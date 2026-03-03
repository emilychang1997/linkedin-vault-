# LinkedIn Post Vault

A local-first Next.js application for vaulting, categorizing, summarizing, and cross-referencing LinkedIn posts — tailored for job seekers.

## Features

### Core Features
- **Add Posts** — Paste LinkedIn URLs and full post text. App attempts OG metadata extraction as a convenience
- **Category System** — Predefined job-seeker categories (Interview Tips, Networking, Vibe Coding Tips, Portfolio, Resume, General Philosophy) plus custom categories
- **AI Summaries** — Generate quick summaries for saved posts using Claude AI
- **Opinion Grouping** — AI groups similar opinions across posts and highlights contradicting viewpoints
- **File Attachments** — Upload and manage files (PDFs, images, slides) per post
- **Linked Accounts** — Track content creators and browse all their posts
- **Search & Filter** — Full-text search and filtering by category, author, date
- **File Library** — Browse, categorize, and manage all uploaded files

### Smart Features
- **Smart CTAs** — Post cards display contextual prompts for missing information
- **Document Detection** — AI detects when posts reference downloadable files
- **Auto-categorization** — AI suggests relevant categories based on content

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite via `better-sqlite3`
- **ORM**: Drizzle ORM
- **AI**: Anthropic Claude API
- **OG Extraction**: `open-graph-scraper`
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key (get one at https://console.anthropic.com/)

### Installation

1. Navigate to the project directory:
```bash
cd linkedin-repository
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Edit .env.local and add your API key
# Replace 'your_api_key_here' with your actual Anthropic API key
```

4. The database is already migrated and seeded. If you need to reset it:
```bash
npm run db:migrate
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Scripts

- `npm run db:generate` — Generate new migration from schema changes
- `npm run db:migrate` — Run pending migrations
- `npm run db:seed` — Seed database with default categories

## Project Structure

```
linkedin-repository/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/                # API routes
│   │   ├── posts/              # Posts pages
│   │   ├── categories/         # Categories pages
│   │   ├── authors/            # Authors pages
│   │   ├── files/              # File library
│   │   └── opinions/           # Opinion analysis
│   ├── components/             # React components
│   ├── lib/                    # Utilities and database
│   │   ├── db/                 # Database configuration
│   │   ├── ai.ts               # Claude AI integration
│   │   └── og.ts               # OG metadata extraction
│   └── types/                  # TypeScript types
├── drizzle/                    # Database migrations
├── public/
│   └── uploads/                # Uploaded files
└── linkedin-repository.db      # SQLite database file
```

## Usage Guide

### Adding a Post

1. Click "Add Post" from the dashboard or posts page
2. Paste the LinkedIn URL
3. Click "Extract Metadata" to pull OG tags (title, description, image)
4. Paste the full post content (recommended for AI features)
5. Select or create an author
6. Choose categories (or use "Suggest" for AI recommendations)
7. Upload any related files (PDFs, images, etc.)
8. Click "Create Post"

### Generating Summaries

1. Navigate to a post with content
2. Click "Generate Summary" button
3. AI will create a 2-3 sentence summary focusing on actionable advice

### Managing Files

- Files can be attached to posts during creation
- Files can also be uploaded independently in the File Library
- Each file can be linked to an author and categorized
- Download files directly from post detail or file library

### Opinion Analysis

1. Navigate to the Opinions page
2. Select a category with 2+ posts
3. The system will analyze posts and group similar opinions
4. View which posts agree and which contradict on specific topics

## Database Schema

The app uses SQLite with the following main tables:

- `posts` — LinkedIn posts with content and metadata
- `authors` — Content creators
- `categories` — Post categories
- `post_categories` — Many-to-many relationship
- `attachments` — Uploaded files
- `file_categories` — File categorization
- `opinion_groups` — AI-generated opinion groupings

## AI Features

The app uses Claude Sonnet 4.5 for:

- **Summarization** — Concise 2-3 sentence summaries
- **Auto-categorization** — Suggests relevant categories
- **Document Detection** — Identifies posts with downloadable files
- **Opinion Analysis** — Groups similar/contradicting viewpoints

## Development

### Building for Production

```bash
npm run build
npm start
```

### Type Checking

TypeScript is automatically checked during builds. The app uses strict type checking with Drizzle ORM for type-safe database queries.

## License

MIT

## Author

Built with Claude Code
