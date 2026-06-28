import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronDown, ChevronUp, ArrowLeft, Calendar, User, Tag,
  Facebook, Twitter, Linkedin, Link2, Loader2,
} from "lucide-react";
import {
  apiService,
  type NormalizedBlogPost,
} from "../../services/api";
import slugify from "slugify";
import EttaLogo from "../../assets/img/etta-replace1-removebg-preview.png";

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────

function addAnchors(post: NormalizedBlogPost): NormalizedBlogPost {
  const rawTOC = post.table_of_contents;
  if (!Array.isArray(rawTOC) || rawTOC.length === 0) return post;

  const toc = (rawTOC as any[]).map((item: any, i: number) => {
    const title = item.title ?? item.name ?? item.heading ?? `Section ${i + 1}`;
    return {
      id: item.id ?? i + 1,
      title,
      level: item.level ?? 2,
      anchor: item.anchor ?? slugify(title, { lower: true, strict: true }),
    };
  });

  return { ...post, table_of_contents: toc };
}

function formatDate(raw: string | undefined): string {
  if (!raw) return "";
  return new Date(raw).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// TOC SIDEBAR
// ──────────────────────────────────────────────────────────────────────────────

interface TocItem {
  id: number;
  title: string;
  level: number;
  anchor: string;
}

const TableOfContents: React.FC<{
  items: TocItem[];
  activeAnchor: string;
}> = ({ items, activeAnchor }) => {
  const scrollTo = (anchor: string) => {
    document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-900 text-sm">Table of Contents</h3>
      </div>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = activeAnchor === item.anchor;
          const indent = item.level === 3 ? "pl-4" : item.level === 4 ? "pl-7" : "";
          return (
            <li key={item.id} className={indent}>
              <button
                onClick={() => scrollTo(item.anchor)}
                className={`w-full text-left flex items-start gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {isActive && (
                  <span className="w-1 h-4 bg-blue-600 rounded-full flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{item.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// RELATED POSTS
// ──────────────────────────────────────────────────────────────────────────────

const RelatedPosts: React.FC<{
  posts: NormalizedBlogPost[];
  onNavigate: (slug: string) => void;
}> = ({ posts, onNavigate }) => {
  if (!posts.length) return null;
  return (
    <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-4 text-sm">Related Posts</h3>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={(p as any).id}>
            <button
              onClick={() => onNavigate((p as any).slug)}
              className="group w-full text-left flex gap-3 items-start"
            >
              {p.featured_image ? (
                <img
                  src={p.featured_image}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 leading-snug line-clamp-2 transition-colors">
                  {String((p as any).title ?? "")}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(String((p as any).created_at ?? ""))}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// SHARE BAR
// ──────────────────────────────────────────────────────────────────────────────

const ShareBar: React.FC<{ title: string; url: string }> = ({ title, url }) => {
  const [copied, setCopied] = useState(false);

  const open = (href: string) => window.open(href, "_blank", "width=600,height=400");

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-semibold text-gray-500">Share:</span>
      <button
        onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}
        className="w-9 h-9 rounded-full border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white flex items-center justify-center transition-all"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </button>
      <button
        onClick={() => open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`)}
        className="w-9 h-9 rounded-full border-2 border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-all"
        aria-label="Share on X (Twitter)"
      >
        <Twitter className="w-4 h-4" />
      </button>
      <button
        onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)}
        className="w-9 h-9 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </button>
      <button
        onClick={copyLink}
        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
          copied
            ? "border-green-500 bg-green-500 text-white"
            : "border-gray-400 text-gray-500 hover:bg-gray-100"
        }`}
        aria-label="Copy link"
        title={copied ? "Copied!" : "Copy link"}
      >
        <Link2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// MOBILE TOC ACCORDION
// ──────────────────────────────────────────────────────────────────────────────

const MobileTOC: React.FC<{ items: TocItem[] }> = ({ items }) => {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;

  return (
    <div className="lg:hidden mb-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="font-semibold text-gray-900 text-sm">Table of Contents</span>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2">
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
                <button
                  onClick={() => {
                    document.getElementById(item.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setOpen(false);
                  }}
                  className="w-full text-left text-sm text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

const BlogPostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost]           = useState<NormalizedBlogPost | null>(null);
  const [related, setRelated]     = useState<NormalizedBlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeAnchor, setActiveAnchor] = useState("");

  // ── Load post ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    window.scrollTo({ top: 0 });

    (async () => {
      try {
        const data = addAnchors(await apiService.getBlogPost(slug));
        setPost(data);

        // Load related posts from same category
        if (data.category?.slug) {
          const cats = await apiService.getBlogPosts(data.category.slug);
          setRelated(
            cats
              .filter((p) => (p as any).slug !== slug)
              .slice(0, 4)
          );
        } else {
          const latest = await apiService.getLatestBlogPosts(5);
          setRelated(latest.filter((p) => (p as any).slug !== slug).slice(0, 4));
        }
      } catch {
        setError("Post not found or failed to load.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [slug]);

  // ── Scroll spy ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!post) return;
    const toc = post.table_of_contents as TocItem[];
    if (!toc?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveAnchor(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    toc.forEach(({ anchor }) => {
      const el = document.getElementById(anchor);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [post]);

  const handleNavigate = useCallback(
    (targetSlug: string) => navigate(`/blog/${targetSlug}`),
    [navigate]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // STATES
  // ──────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 text-sm">Loading post…</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-6xl">📄</div>
        <h2 className="text-2xl font-bold text-gray-800">Post Not Found</h2>
        <p className="text-gray-500">{error ?? "This post may have been removed or moved."}</p>
        <button
          onClick={() => navigate("/blog")}
          className="mt-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
        >
          Back to Blog
        </button>
      </div>
    );
  }

  const tocItems = (post.table_of_contents as TocItem[]) ?? [];
  const hasTOC = (post as any).enable_toc !== false && tocItems.length > 0;
  const postUrl = `${window.location.origin}/blog/${(post as any).slug}`;
  const categoryName = post.category?.name ?? "General Health";

  // Inject heading IDs into content
  let processedContent = (post as any).content ?? "";
  if (hasTOC) {
    tocItems.forEach(({ title, anchor }) => {
      // Match h tags containing this title text (simplified)
      const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      processedContent = processedContent.replace(
        new RegExp(`(<h[1-6][^>]*?)>(${escaped})<\/h`, "i"),
        `$1 id="${anchor}">$2</h`
      );
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero / Featured image ────────────────────────────────────────── */}
      <div className="relative bg-blue-700 overflow-hidden">
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={String((post as any).title ?? "")}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-20">
          {/* Back link */}
          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </button>

          {/* Category badge */}
          {post.category ? (
            <Link
              to={`/blog?category=${post.category.slug}`}
              className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4 transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
              {categoryName}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
              <Tag className="w-3.5 h-3.5" />
              {categoryName}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 max-w-3xl">
            {String((post as any).title ?? "")}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-blue-200 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/20">
                <img src={EttaLogo} alt="Etha-Atlantic" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span className="font-medium text-white">
                  {(post as any).author_name ?? "Etha-Atlantic"}
                </span>
              </div>
            </div>
            {(post as any).created_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(String((post as any).created_at))}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

          {/* ── Article ───────────────────────────────────────────────── */}
          <article className="flex-1 min-w-0">

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed mb-8 border-l-4 border-blue-500 pl-5 italic">
              {post.description}
            </p>

            {/* Mobile TOC */}
            {hasTOC && <MobileTOC items={tocItems} />}

            {/* Content */}
            <div
              className="
                prose prose-base lg:prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900
                prose-ul:text-gray-700 prose-ol:text-gray-700
                prose-blockquote:border-blue-500 prose-blockquote:text-gray-600
                prose-img:rounded-xl prose-img:shadow-md
              "
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* Secondary images */}
            {(post.image_1 || post.image_2) && (
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {post.image_1 && (
                  <img
                    src={post.image_1}
                    alt="Article image 1"
                    className="w-full rounded-xl shadow-md object-cover h-56"
                  />
                )}
                {post.image_2 && (
                  <img
                    src={post.image_2}
                    alt="Article image 2"
                    className="w-full rounded-xl shadow-md object-cover h-56"
                  />
                )}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 my-10" />

            {/* Footer meta + share */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              {/* Category link footer */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500">Filed under:</span>
                {post.category ? (
                  <Link
                    to={`/blog?category=${post.category.slug}`}
                    className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {categoryName}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                    <Tag className="w-3.5 h-3.5" />
                    {categoryName}
                  </span>
                )}
              </div>

              <ShareBar title={String((post as any).title ?? "")} url={postUrl} />
            </div>

            {/* Mobile related posts */}
            {related.length > 0 && (
              <div className="lg:hidden mt-10">
                <RelatedPosts posts={related} onNavigate={handleNavigate} />
              </div>
            )}
          </article>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
            <div className="space-y-6">
              {/* TOC */}
              {hasTOC && (
                <TableOfContents items={tocItems} activeAnchor={activeAnchor} />
              )}

              {/* Author card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden mb-3 border-2 border-blue-100">
                  <img src={EttaLogo} alt="Etha-Atlantic Memorial Hospital" className="w-full h-full object-cover" />
                </div>
                <p className="font-bold text-gray-900 text-sm">Etha-Atlantic Memorial Hospital</p>
                <p className="text-xs text-blue-600 font-medium mt-0.5">
                  {(post as any).author_role ?? "Medical Team"}
                </p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Evidence-based health information from our team of medical professionals.
                </p>
              </div>

              {/* Related posts */}
              {related.length > 0 && (
                <RelatedPosts posts={related} onNavigate={handleNavigate} />
              )}

              {/* Back to category */}
              {post.category && (
                <Link
                  to={`/blog?category=${post.category.slug}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-50 text-blue-700 font-semibold text-sm rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <Tag className="w-4 h-4" />
                  More in {categoryName}
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;