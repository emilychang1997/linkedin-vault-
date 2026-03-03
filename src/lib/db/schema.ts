import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Authors table
export const authors = sqliteTable("authors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  linkedinUrl: text("linkedin_url"),
  headline: text("headline"),
  avatarUrl: text("avatar_url"),
  role: text("role"),
});

// Posts table
export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  linkedinUrl: text("linkedin_url").notNull(),
  content: text("content"),
  summary: text("summary"),
  preview: text("preview"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImageUrl: text("og_image_url"),
  hasDocumentsCta: integer("has_documents_cta", { mode: "boolean" }).default(false),
  authorId: integer("author_id").references(() => authors.id),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Categories table
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

// Post-Category junction table
export const postCategories = sqliteTable("post_categories", {
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
});

// File categories table
export const fileCategories = sqliteTable("file_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

// Attachments table
export const attachments = sqliteTable("attachments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }),
  authorId: integer("author_id").references(() => authors.id),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  description: text("description"),
  source: text("source"),
});

// Attachment-FileCategory junction table
export const attachmentFileCategories = sqliteTable("attachment_file_categories", {
  attachmentId: integer("attachment_id")
    .notNull()
    .references(() => attachments.id, { onDelete: "cascade" }),
  fileCategoryId: integer("file_category_id")
    .notNull()
    .references(() => fileCategories.id, { onDelete: "cascade" }),
});

// Opinion groups table
export const opinionGroups = sqliteTable("opinion_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  summary: text("summary").notNull(),
});

// Opinion group posts junction table
export const opinionGroupPosts = sqliteTable("opinion_group_posts", {
  opinionGroupId: integer("opinion_group_id")
    .notNull()
    .references(() => opinionGroups.id, { onDelete: "cascade" }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  stance: text("stance").notNull(), // 'agrees' or 'contradicts'
});

// Relations
export const authorsRelations = relations(authors, ({ many }) => ({
  posts: many(posts),
  attachments: many(attachments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(authors, {
    fields: [posts.authorId],
    references: [authors.id],
  }),
  postCategories: many(postCategories),
  attachments: many(attachments),
  opinionGroupPosts: many(opinionGroupPosts),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  postCategories: many(postCategories),
  opinionGroups: many(opinionGroups),
}));

export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postCategories.postId],
    references: [posts.id],
  }),
  category: one(categories, {
    fields: [postCategories.categoryId],
    references: [categories.id],
  }),
}));

export const fileCategoriesRelations = relations(fileCategories, ({ many }) => ({
  attachmentFileCategories: many(attachmentFileCategories),
}));

export const attachmentsRelations = relations(attachments, ({ one, many }) => ({
  post: one(posts, {
    fields: [attachments.postId],
    references: [posts.id],
  }),
  author: one(authors, {
    fields: [attachments.authorId],
    references: [authors.id],
  }),
  attachmentFileCategories: many(attachmentFileCategories),
}));

export const attachmentFileCategoriesRelations = relations(
  attachmentFileCategories,
  ({ one }) => ({
    attachment: one(attachments, {
      fields: [attachmentFileCategories.attachmentId],
      references: [attachments.id],
    }),
    fileCategory: one(fileCategories, {
      fields: [attachmentFileCategories.fileCategoryId],
      references: [fileCategories.id],
    }),
  })
);

export const opinionGroupsRelations = relations(opinionGroups, ({ one, many }) => ({
  category: one(categories, {
    fields: [opinionGroups.categoryId],
    references: [categories.id],
  }),
  opinionGroupPosts: many(opinionGroupPosts),
}));

export const opinionGroupPostsRelations = relations(opinionGroupPosts, ({ one }) => ({
  opinionGroup: one(opinionGroups, {
    fields: [opinionGroupPosts.opinionGroupId],
    references: [opinionGroups.id],
  }),
  post: one(posts, {
    fields: [opinionGroupPosts.postId],
    references: [posts.id],
  }),
}));
