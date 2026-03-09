// app/blog/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import Navbar from "@/components/navbar";
import CreatorFooter from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  ClockIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "lucide-react";

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// ✅ Next.js 15 — params is a Promise, must be awaited
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | VidiFlow Blog`,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://vidiflow.com/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

// ✅ Next.js 15 — params is a Promise, must be awaited
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = allPosts[currentIndex + 1] || null;
  const nextPost = allPosts[currentIndex - 1] || null;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
        {/* BACK BUTTON */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 font-bold text-[11px] uppercase tracking-widest mb-10 transition-colors group"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
          All Articles
        </Link>

        {/* POST HEADER */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-red-50 text-red-600 border-none text-[10px] font-bold uppercase rounded-full px-3">
              {post.category}
            </Badge>
            <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" /> {post.date}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
              <ClockIcon className="h-3 w-3" /> {post.readTime} min read
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black uppercase italic text-zinc-900 leading-tight">
            {post.title}
            <span className="text-red-600">.</span>
          </h1>

          <p className="text-zinc-500 text-base leading-relaxed max-w-2xl">
            {post.description}
          </p>

          <div className="h-px bg-zinc-100" />
        </div>

        {/* POST CONTENT */}
        <article
          className="prose prose-zinc max-w-none
            prose-headings:font-black prose-headings:uppercase prose-headings:italic
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-zinc-600 prose-p:leading-relaxed prose-p:text-sm
            prose-li:text-zinc-600 prose-li:text-sm
            prose-strong:text-zinc-900 prose-strong:font-black
            prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
            prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:text-zinc-800 prose-code:font-mono
            prose-blockquote:border-l-red-500 prose-blockquote:bg-red-50 prose-blockquote:rounded-r-xl prose-blockquote:py-1
            prose-img:rounded-2xl prose-img:shadow-lg"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* TAGS */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-zinc-100">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-500 uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PREV / NEXT */}
        <div className="mt-12 pt-8 border-t border-zinc-100 grid grid-cols-2 gap-4">
          {prevPost ? (
            <Link href={`/blog/${prevPost.slug}`} className="group">
              <div className="bg-white rounded-2xl border border-zinc-100 p-5 hover:border-zinc-200 hover:shadow-md transition-all">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <ArrowLeftIcon className="h-3 w-3" /> Previous
                </p>
                <p className="text-xs font-black text-zinc-800 uppercase italic line-clamp-2 group-hover:text-red-600 transition-colors">
                  {prevPost.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`} className="group col-start-2">
              <div className="bg-white rounded-2xl border border-zinc-100 p-5 hover:border-zinc-200 hover:shadow-md transition-all text-right">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1 justify-end">
                  Next <ArrowRightIcon className="h-3 w-3" />
                </p>
                <p className="text-xs font-black text-zinc-800 uppercase italic line-clamp-2 group-hover:text-red-600 transition-colors">
                  {nextPost.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-zinc-900 rounded-[24px] p-8 text-center space-y-4">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
            Ready to try it?
          </p>
          <h3 className="text-2xl font-black text-white uppercase italic">
            Download Videos Free<span className="text-red-500">.</span>
          </h3>
          <p className="text-zinc-400 text-xs">
            Use VidiFlow to download from TikTok, YouTube, Instagram and more.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[11px] tracking-widest px-6 py-3 rounded-xl transition-colors"
          >
            Go to VidiFlow <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>
      <CreatorFooter />
    </div>
  );
}
