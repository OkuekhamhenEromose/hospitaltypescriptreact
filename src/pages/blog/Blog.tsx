import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Search, ChevronDown, ChevronUp, X, Loader } from "lucide-react";
import { apiService, type BlogCategory, type BlogSuggestion, type NormalizedBlogPost } from "../../services/api";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import EttaLogo from "../../assets/img/etta-replace1-removebg-preview.png";

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────

function addTocAnchors(post: NormalizedBlogPost): NormalizedBlogPost {
  const rawTOC = post.table_of_contents;
  if (!Array.isArray(rawTOC) || rawTOC.length === 0) return post;

  const normalizedTOC = (rawTOC as any[])
    .map((item: any, i: number) => {
      const title = item.title ?? item.name ?? item.heading ?? `Section ${i + 1}`;
      return {
        id: item.id ?? i + 1,
        title,
        level: item.level ?? item.depth ?? 2,
        anchor: slugify(title, { lower: true, strict: true }),
      };
    })
    .filter((item) => item.title);

  return {
    ...post,
    table_of_contents: normalizedTOC,
    enable_toc:
      (post as any).enable_toc ??
      (post as any).enable_table_of_contents ??
      normalizedTOC.length > 0,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────────────────────────────

const ALL_CATEGORY: BlogCategory = {
  id: 0,
  name: "All Posts",
  slug: "",
  post_count: 0,
};

const SUGGESTION_DEBOUNCE_MS = 280;

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

const Blog: React.FC = () => {
  const navigate = useNavigate();

  // ── Posts & categories ────────────────────────────────────────────────────
  const [posts, setPosts]               = useState<NormalizedBlogPost[]>([]);
  const [categories, setCategories]     = useState<BlogCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<BlogCategory>(ALL_CATEGORY);
  const [isLoading, setIsLoading]       = useState(true);
  const [isCatLoading, setIsCatLoading] = useState(false);

  // ── Table of contents ─────────────────────────────────────────────────────
  const [expandedTOC, setExpandedTOC]   = useState<Record<string, boolean>>({});

  // ── Search ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]   = useState("");
  const [suggestions, setSuggestions]   = useState<BlogSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSugLoading, setIsSugLoading] = useState(false);
  const searchRef                        = useRef<HTMLDivElement>(null);
  const debounceRef                      = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ──────────────────────────────────────────────────────────────────────────
  // DATA LOADING
  // ──────────────────────────────────────────────────────────────────────────

  const loadCategories = useCallback(async () => {
    try {
      const cats = await apiService.getBlogCategories();
      setCategories(cats);
    } catch {
      // silently fail — categories are non-critical
    }
  }, []);

  const loadPosts = useCallback(async (catSlug: string) => {
    try {
      setIsCatLoading(true);
      const raw = catSlug
        ? await apiService.getBlogPosts(catSlug)
        : await apiService.getBlogPosts();
      const normalized = raw.map(addTocAnchors);
      setPosts(normalized);

      const initialTOC: Record<string, boolean> = {};
      normalized.forEach((post) => {
        if ((post as any).enable_toc && post.table_of_contents?.length > 0) {
          initialTOC[String(post.id)] = false;
        }
      });
      setExpandedTOC(initialTOC);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
      setIsCatLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadPosts("");
  }, [loadCategories, loadPosts]);

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY SELECTION
  // ──────────────────────────────────────────────────────────────────────────

  const handleCategorySelect = useCallback(
    (cat: BlogCategory) => {
      if (cat.slug === activeCategory.slug) return;
      setActiveCategory(cat);
      setSearchQuery("");
      setSuggestions([]);
      loadPosts(cat.slug);
    },
    [activeCategory.slug, loadPosts]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SEARCH & SUGGESTIONS
  // ──────────────────────────────────────────────────────────────────────────

  /** Fetch suggestions debounced as the user types */
  const fetchSuggestions = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!q.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        try {
          setIsSugLoading(true);
          const results = await apiService.getBlogSuggestions(
            q,
            activeCategory.slug || undefined
          );
          setSuggestions(results);
          setShowSuggestions(true);
        } catch {
          setSuggestions([]);
        } finally {
          setIsSugLoading(false);
        }
      }, SUGGESTION_DEBOUNCE_MS);
    },
    [activeCategory.slug]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchSuggestions(val);
  };

  const handleSuggestionClick = (suggestion: BlogSuggestion) => {
    setShowSuggestions(false);
    setSearchQuery("");
    navigate(`/blog/${suggestion.slug}`);
  };

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    try {
      setIsCatLoading(true);
      const results = await apiService.searchBlogPosts(
        searchQuery,
        activeCategory.slug || undefined
      );
      setPosts(results.map(addTocAnchors));
    } catch {
      // silently fail
    } finally {
      setIsCatLoading(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearchSubmit();
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    loadPosts(activeCategory.slug);
  };

  // Close suggestion dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // LOCAL FILTER (when user hasn't submitted a search but is typing)
  // ──────────────────────────────────────────────────────────────────────────
const filteredPosts = useMemo(() => {
  if (!searchQuery.trim()) return posts;
  const q = searchQuery.toLowerCase();
  return posts.filter(
    (p) =>
      String(p.title ?? "").toLowerCase().includes(q) ||
      String(p.description ?? "").toLowerCase().includes(q)
  );
}, [posts, searchQuery]);
  

  // ──────────────────────────────────────────────────────────────────────────
  // TOC TOGGLE
  // ──────────────────────────────────────────────────────────────────────────

  const toggleTOC = (postId: string | number) =>
    setExpandedTOC((prev) => ({ ...prev, [String(postId)]: !prev[String(postId)] }));

  const shouldShowTOC = (post: NormalizedBlogPost) =>
    (post as any).enable_toc &&
    Array.isArray(post.table_of_contents) &&
    post.table_of_contents.length > 0;

  // ──────────────────────────────────────────────────────────────────────────
  // SHARE
  // ──────────────────────────────────────────────────────────────────────────

  const handleShare = (platform: string, post: NormalizedBlogPost) => {
    const url = `${window.location.origin}/blog/${(post as any).slug}`;
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(String(post.title ?? ""))}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      google: `https://plus.google.com/share?url=${encodeURIComponent(url)}`,
    };
    if (shareUrls[platform])
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  /** Category display name: uses category from post or fallback */
  const getCategoryLabel = (post: NormalizedBlogPost) =>
    post.category?.name ?? "General Health";

  // ──────────────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ──────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SHARED SEARCH BOX (used in sidebar + mobile — extracted for DRY)
  // ──────────────────────────────────────────────────────────────────────────

  const SearchBox = () => (
    <div ref={searchRef} className="relative">
      <div className="flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={
              activeCategory.slug
                ? `Search in ${activeCategory.name}…`
                : "Search all posts…"
            }
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="w-full px-3 py-3 pr-8 bg-gray-100 border-0 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-gray-700 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearchSubmit}
          className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-r-full hover:bg-blue-700 transition-colors shadow-lg flex-shrink-0"
          aria-label="Search"
        >
          {isSugLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500 font-medium">
              {activeCategory.slug
                ? `Suggestions in "${activeCategory.name}"`
                : "Suggestions"}
            </p>
          </div>
          <ul>
            {suggestions.map((sug) => (
              <li key={sug.id}>
                <button
                  onMouseDown={() => handleSuggestionClick(sug)}
                  className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group"
                >
                  <Search className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 truncate">
                      {sug.title}
                    </p>
                    {sug.category_name && (
                      <p className="text-xs text-gray-400 mt-0.5">{sug.category_name}</p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY TABS
  // ──────────────────────────────────────────────────────────────────────────

  const CategoryTabs = ({ className = "" }: { className?: string }) => {
    const allCats = [ALL_CATEGORY, ...categories];
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {allCats.map((cat) => {
          const isActive = cat.slug === activeCategory.slug;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {cat.name}
              {cat.id !== 0 && (
                <span className={`ml-1.5 text-xs ${isActive ? "text-blue-200" : "text-gray-400"}`}>
                  ({cat.post_count})
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-blue-700 py-8 md:py-12 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Medical background"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mt-8 md:mt-4">
            Our Blog
          </h1>
          {/* Category tabs in hero on mobile */}
          {categories.length > 0 && (
            <div className="mt-4 lg:hidden overflow-x-auto pb-1">
              <CategoryTabs />
            </div>
          )}
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-12 lg:py-16 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* ── Blog Posts ──────────────────────────────────────────────── */}
            <div className="w-full lg:w-2/3">
              {/* Category active indicator */}
              {activeCategory.id !== 0 && (
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <span className="text-sm text-gray-500">Showing posts in:</span>
                  <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {activeCategory.name}
                    <button onClick={() => handleCategorySelect(ALL_CATEGORY)} aria-label="Clear category">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                </div>
              )}

              {/* Category-switching spinner */}
              {isCatLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                </div>
              )}

              {!isCatLoading && filteredPosts.map((post) => (
                <div key={(post as any).id} className="mb-12 md:mb-16">

                  {/* ── MOBILE & TABLET LAYOUT ─────────────────────────── */}
                  <div className="lg:hidden">
                    <div className="relative w-full mb-4">
                      {post.featured_image ? (
                        <div className="relative w-full h-[400px] md:h-[450px] overflow-hidden">
                          <img
                            src={post.featured_image}
                            alt={String(post.title ?? "")}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                <img src={EttaLogo} alt="Etha-Atlantic Memorial Hospital" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                  <span className="text-sm font-semibold text-white">Etha-Atlantic</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-white/90">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  <span className="text-xs">
                                    {new Date(String((post as any).created_at)).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full h-[400px] md:h-[450px] bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center overflow-hidden">
                          <div className="relative z-10 text-center">
                            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-8">
                              <svg className="w-24 h-24 md:w-32 md:h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
                            </div>
                            <span className="text-white text-xl md:text-2xl font-semibold block drop-shadow-lg mt-2">{getCategoryLabel(post)}</span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                <img src={EttaLogo} alt="Etha-Atlantic" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-white block">Etha-Atlantic</span>
                                <span className="text-xs text-white/90">
                                  {new Date(String((post as any).created_at)).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="px-4 md:px-6 mb-4">
                      {/* Category badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="inline-flex items-center text-gray-600">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                          <span className="text-sm font-medium">{getCategoryLabel(post)}</span>
                        </div>
                        {post.category && (
                          <button
                            onClick={() => {
                              const cat = categories.find((c) => c.id === post.category!.id);
                              if (cat) handleCategorySelect(cat);
                            }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View all →
                          </button>
                        )}
                      </div>
                      <div className="w-16 h-0.5 bg-red-500" />
                    </div>

                    <div className="px-4 md:px-6">
                      <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-6 leading-tight">{String(post.title ?? "")}</h1>

                      {shouldShowTOC(post) && (
                        <div className="mb-6 border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden">
                          <button
                            onClick={() => toggleTOC((post as any).id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                              <h3 className="text-base font-medium text-gray-900">Table of Contents</h3>
                            </div>
                            {expandedTOC[String((post as any).id)] ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                          </button>
                          {expandedTOC[String((post as any).id)] && (
                            <div className="px-4 pb-4">
                              <ul className="space-y-2">
                                {(post.table_of_contents as any[]).map((item: any, index: number) => (
                                  <li key={item.id || index}>
                                    <a href={`#${item.anchor}`} className="flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 group"
                                      onClick={(e) => { e.preventDefault(); document.getElementById(item.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" }); setExpandedTOC((p) => ({ ...p, [String((post as any).id)]: false })); }}>
                                      <span className="text-gray-800 group-hover:text-blue-600 font-medium text-sm">{item.title}</span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="prose prose-sm md:prose-base max-w-none mb-6">
                        <p className="text-gray-700 leading-relaxed">{post.description}</p>
                      </div>

                      <div className="border-t border-gray-300 my-6" />

                      <div className="flex flex-col items-center gap-6 mb-8">
                        <button onClick={() => navigate(`/blog/${(post as any).slug}`)}
                          className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg uppercase tracking-wide text-sm">
                          CONTINUE READING
                        </button>
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-0.5 bg-blue-500" />
                          <div className="flex space-x-3">
                            {["facebook", "twitter", "linkedin", "google"].map((platform) => (
                              <button key={platform} onClick={() => handleShare(platform, post)}
                                className="w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                                <span className="text-sm font-bold">{platform === "facebook" ? "f" : platform === "twitter" ? "𝕏" : platform === "linkedin" ? "in" : "G"}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── DESKTOP LAYOUT ─────────────────────────────────── */}
                  <div className="hidden lg:block">
                    <div className="flex gap-6 mb-8">
                      <div className="flex flex-col items-center space-y-3 flex-shrink-0">
                        <div className="w-16 h-16 overflow-hidden">
                          <img src={EttaLogo} alt="Etha-Atlantic Memorial Hospital" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <svg className="w-4 h-4 text-blue-600 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            <span className="text-sm font-semibold text-gray-800">Etha-Atlantic</span>
                          </div>
                          <div className="flex items-center justify-center text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-xs">
                              {new Date(String((post as any).created_at)).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        {post.featured_image ? (
                          <div className="relative w-full h-[400px] shadow-lg overflow-hidden">
                            <img src={post.featured_image} alt={String(post.title ?? "")} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                          </div>
                        ) : (
                          <div className="relative w-full h-[400px] bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-lg shadow-lg flex items-center justify-center overflow-hidden">
                            <div className="relative z-10 text-center">
                              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-8">
                                <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
                              </div>
                              <span className="text-white text-2xl font-semibold block drop-shadow-lg mt-2">{getCategoryLabel(post)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category badge desktop */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="inline-flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        {getCategoryLabel(post)}
                      </span>
                      {post.category && (
                        <button
                          onClick={() => { const cat = categories.find((c) => c.id === post.category!.id); if (cat) handleCategorySelect(cat); }}
                          className="text-xs text-blue-600 hover:underline font-medium">
                          View all in {post.category.name} →
                        </button>
                      )}
                    </div>

                    <div>
                      <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-8 leading-tight">{String(post.title ?? "")}</h1>

                      {shouldShowTOC(post) && (
                        <div className="mb-8 border w-full max-w-md border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden">
                          <button onClick={() => toggleTOC((post as any).id)}
                            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                              </div>
                              <h3 className="text-lg font-medium text-gray-900">Table of Contents</h3>
                            </div>
                            {expandedTOC[String((post as any).id)] ? <ChevronUp className="w-6 h-6 text-gray-600" /> : <ChevronDown className="w-6 h-6 text-gray-600" />}
                          </button>
                          {expandedTOC[String((post as any).id)] && (
                            <div className="px-4 pb-4">
                              <ul>
                                {(post.table_of_contents as any[]).map((item: any, index: number) => (
                                  <li key={item.id || index} className="group">
                                    <a href={`#${item.anchor}`}
                                      className="flex items-start gap-1 px-3 py-2 rounded-lg"
                                      onClick={(e) => { e.preventDefault(); document.getElementById(item.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
                                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                                        <span className="font-semibold text-sm group-hover:text-blue-600">{item.id}</span>
                                      </div>
                                      <span className="text-gray-800 group-hover:text-blue-600 font-medium leading-normal block">{item.title}</span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="prose prose-lg max-w-none mb-8">
                        <p className="text-gray-700 font-light text-sm leading-relaxed">{post.description}</p>
                      </div>

                      <div className="border-t border-gray-300 my-6" />

                      <div className="flex flex-col sm:flex-row items-center lg:items-start sm:items-center justify-between gap-6">
                        <button onClick={() => navigate(`/blog/${(post as any).slug}`)}
                          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg uppercase tracking-wide text-sm">
                          CONTINUE READING
                        </button>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600 font-medium hidden sm:block">Share:</span>
                          <div className="flex space-x-2">
                            {["facebook", "twitter", "linkedin", "google"].map((platform) => (
                              <button key={platform} onClick={() => handleShare(platform, post)}
                                className="w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                                <span className="text-sm font-bold">{platform === "facebook" ? "f" : platform === "twitter" ? "𝕏" : platform === "linkedin" ? "in" : "G"}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!isCatLoading && filteredPosts.length === 0 && (
                <div className="text-center py-16 px-4">
                  <div className="max-w-md mx-auto">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">No posts found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchQuery
                        ? `No posts match "${searchQuery}"${activeCategory.id !== 0 ? ` in ${activeCategory.name}` : ""}.`
                        : activeCategory.id !== 0
                        ? `No posts yet in ${activeCategory.name}.`
                        : "No blog posts available yet."}
                    </p>
                    <button onClick={clearSearch}
                      className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all">
                      {searchQuery ? "Clear Search" : "View All Posts"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <div className="hidden lg:block lg:w-1/3">
              <div className="space-y-6 lg:sticky lg:top-8">
                {/* Search */}
                <div className="bg-white">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Search</h3>
                  <div className="w-12 h-0.5 bg-blue-500 mb-4" />
                  <SearchBox />
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>
                    <div className="space-y-1">
                      {categories.map((cat) => {
                        const isActive = cat.slug === activeCategory.slug;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat)}
                            className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm ${
                              isActive
                                ? "bg-blue-600 text-white font-semibold"
                                : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                            }`}
                          >
                            <span>{cat.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                              {cat.post_count}
                            </span>
                          </button>
                        );
                      })}
                      {activeCategory.id !== 0 && (
                        <button onClick={() => handleCategorySelect(ALL_CATEGORY)}
                          className="w-full text-center text-xs text-blue-600 hover:underline mt-2 py-1">
                          Show all posts
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Newsletter */}
                <div className="bg-blue-600 text-white rounded-lg p-6 shadow-md">
                  <h4 className="text-xl font-bold mb-3">Stay Updated</h4>
                  <p className="text-blue-100 text-sm mb-4">
                    Get the latest health insights and medical updates delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <input type="email" placeholder="Your email address"
                      className="w-full px-3 py-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white" />
                    <button className="w-full bg-white text-blue-600 font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;