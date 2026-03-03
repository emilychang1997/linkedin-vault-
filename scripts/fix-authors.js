const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../linkedin-repository.db');
const db = new Database(dbPath);

// Get all posts
const posts = db.prepare('SELECT id, og_title FROM posts').all();

for (const post of posts) {
  if (!post.og_title) continue;

  // Parse author from og_title
  // Format: "Title | Author Name posted on..." or "Title | Author Name | comments"
  const parts = post.og_title.split('|').map(p => p.trim());

  let authorName = null;

  // Try pattern 1: "Author Name posted on the topic"
  if (parts[1]?.includes('posted on')) {
    authorName = parts[1].replace(/posted on.*/, '').trim();
  }
  // Try pattern 2: "Author Name" (between first and last |)
  else if (parts[1] && !parts[1].includes('LinkedIn') && !parts[1].includes('comments')) {
    authorName = parts[1].trim();
  }

  if (authorName && authorName.length > 0 && authorName.length < 100) {
    console.log(`Post ${post.id}: "${authorName}"`);

    // Check if author exists
    let author = db.prepare('SELECT id FROM authors WHERE name = ?').get(authorName);

    // Create author if not exists
    if (!author) {
      const result = db.prepare('INSERT INTO authors (name) VALUES (?)').run(authorName);
      author = { id: result.lastInsertRowid };
      console.log(`  Created author: ${authorName} (ID: ${author.id})`);
    }

    // Update post with author
    db.prepare('UPDATE posts SET author_id = ? WHERE id = ?').run(author.id, post.id);
    console.log(`  Linked post ${post.id} to author ${author.id}`);
  }
}

console.log('Done!');
db.close();
