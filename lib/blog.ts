// lib/blog.ts

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readTime: number;
  tags: string[];
  contentHtml: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readTime: number;
  tags: string[];
}

// ✅ Converts any date value (Date object or string) to a clean string
function formatDate(date: unknown): string {
  if (!date) return "";
  if (date instanceof Date) {
    return date.toISOString().split("T")[0]; // "2025-03-09"
  }
  return String(date);
}

// Get all posts sorted by date (newest first)
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));

  const posts = files.map((filename) => {
    const slug = filename.replace(".md", "");
    const filePath = path.join(BLOG_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);

    return {
      slug,
      title: data.title || "",
      description: data.description || "",
      date: formatDate(data.date), // ✅ always a string now
      category: data.category || "Guide",
      readTime: data.readTime || 5,
      tags: data.tags || [],
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

// Get a single post with full HTML content
export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const contentHtml = marked(content) as string;

  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    date: formatDate(data.date), // ✅ always a string now
    category: data.category || "Guide",
    readTime: data.readTime || 5,
    tags: data.tags || [],
    contentHtml,
  };
}
