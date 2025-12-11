// pages/blog/Blog.tsx
import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { apiService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import EttaLogo from "../../assets/img/etta-replace1-removebg-preview.png";

const Blog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTOC, setExpandedTOC] = useState<{ [key: string]: boolean }>(
    {}
  );
  const navigate = useNavigate();

  useEffect(() => {
    loadBlogPosts();
  }, []);

  // Generate a unique ID for posts that don't have proper IDs
  const generatePostId = (post: any, index: number) => {
    // Use slug as ID if available, otherwise use title + index
    return post.slug || `post-${slugify(post.title)}-${index}`;
  };

  // Normalize media URLs
  const normalizeMediaUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/media")) return `https://dhospitalback.onrender.com${path}`;
    return `https://dhospitalback.onrender.com/media/blog_images/${path}`;
  };

  // Enhanced normalize entire blog post with ID fix
  const normalizeBlogPost = (post: any, index: number) => {
    console.log("🔍 Raw post from API:", post);

    // Handle table_of_contents from various possible field names
    const rawTOC =
      post.table_of_contents ||
      post.toc ||
      post.toc_items ||
      post.contents ||
      [];

    // Normalize TOC items - ensure they have proper structure
    const normalizedTOC = Array.isArray(rawTOC)
      ? rawTOC
          .map((item: any, index: number) => {
            // Handle different TOC item structures
            const title =
              item.title || item.name || item.heading || `Section ${index + 1}`;
            const level = item.level || item.depth || 2;
            const id = item.id || index + 1;

            return {
              id: id,
              title: title,
              level: level,
              anchor: slugify(title, {
                lower: true,
                strict: true,
              }),
            };
          })
          .filter((item) => item.title) // Remove items without titles
      : [];

    console.log("📋 Normalized TOC:", normalizedTOC);

    // Generate a reliable ID for the post
    const postId = generatePostId(post, index);

    const normalized = {
      ...post,
      id: postId, // Use our generated ID instead of null
      featured_image: normalizeMediaUrl(post.featured_image),
      image_1: normalizeMediaUrl(post.image_1),
      image_2: normalizeMediaUrl(post.image_2),
      description:
        post.description ||
        post.short_description ||
        post.excerpt ||
        post.content ||
        "",
      subheadings:
        post.subheadings && post.subheadings.length > 0 ? post.subheadings : [],
      table_of_contents: normalizedTOC,
      // Ensure enable_toc is properly handled - default to true if TOC items exist
      enable_toc:
        post.enable_toc !== undefined
          ? post.enable_toc
          : post.enable_table_of_contents !== undefined
          ? post.enable_table_of_contents
          : normalizedTOC.length > 0, // Auto-enable if TOC items exist
    };

    console.log("✅ Final normalized post:", {
      id: normalized.id,
      title: normalized.title,
      enable_toc: normalized.enable_toc,
      toc_length: normalized.table_of_contents.length,
      toc_items: normalized.table_of_contents,
    });

    return normalized;
  };

  const loadBlogPosts = async () => {
    try {
      setIsLoading(true);
      const blogPosts = await apiService.getBlogPosts();
      console.log("📦 Raw blog posts from API:", blogPosts);

      const normalizedPosts = blogPosts.map((post: any, index: number) => {
        return normalizeBlogPost(post, index);
      });

      setPosts(normalizedPosts);

      // Initialize TOC state - open first post's TOC by default if it has TOC items
      if (normalizedPosts.length > 0) {
        const initialTOCState: { [key: string]: boolean } = {};
        normalizedPosts.forEach((post: any) => {
          // Only initialize if post has TOC enabled and has TOC items
          if (
            post.enable_toc &&
            post.table_of_contents &&
            post.table_of_contents.length > 0
          ) {
            initialTOCState[post.id] = false; // Open by default
            console.log(`🎯 Initializing TOC for post ${post.id} as OPEN`);
          }
        });
        setExpandedTOC(initialTOCState);
        console.log("📊 Initial TOC state:", initialTOCState);
      }
    } catch (error) {
      console.error("Error loading blog posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTOC = (postId: string) => {
    console.log(
      "🔄 Toggling TOC for post:",
      postId,
      "Current state:",
      expandedTOC[postId]
    );
    setExpandedTOC((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Enhanced TOC display condition
  const shouldShowTOC = (post: any) => {
    const hasTOC =
      post.enable_toc &&
      post.table_of_contents &&
      Array.isArray(post.table_of_contents) &&
      post.table_of_contents.length > 0;

    console.log(`🔍 TOC Check for post ${post.id}:`, {
      enable_toc: post.enable_toc,
      has_table_of_contents: !!post.table_of_contents,
      is_array: Array.isArray(post.table_of_contents),
      length: post.table_of_contents?.length,
      shouldShow: hasTOC,
    });

    return hasTOC;
  };

  const handleShare = (platform: string, post: any) => {
  const url = `${window.location.origin}/blog/${post.slug}`;
  const text = post.title;
  const shareUrls: { [key: string]: string } = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(text)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`,
    google: `https://plus.google.com/share?url=${encodeURIComponent(url)}`,
  };
  if (shareUrls[platform])
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-blue-700 py-12 overflow-hidden pt-12">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Medical background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <h1 className="text-6xl mt-4 md:text-5xl lg:text-6xl font-bold text-white">
            Our Blog
          </h1>
        </div>
      </section>
      <div className="min-h-screen bg-white px-12">
        <div className="container mx-auto px-4 py-24 max-w-7xl">
          {/* Main Layout with Image and Search Sidebar */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Blog Posts Content - Takes 2/3 of width on large screens */}
            <div className="lg:w-2/3">
              {filteredPosts.map((post) => (
                <div key={post.id} className="mb-16">
                  {/* Blog Header with Logo, Name, Date and Image */}
                  <div className="flex gap-6 mb-8">
                    {/* Left Side - Logo, Name, Date */}
                    <div className="flex flex-col items-center space-y-3 flex-shrink-0">
                      {/* Logo */}
                      <div className="w-16 h-16 overflow-hidden">
                        <img
                          src={EttaLogo}
                          alt="Etta-Atlantic Memorial Hospital"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Hospital Name with Icon */}
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <svg
                            className="w-4 h-4 text-blue-600 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-semibold text-gray-800">
                            Etha-Atlantic
                          </span>
                        </div>

                        {/* Date with Icon */}
                        <div className="flex items-center justify-center text-gray-500">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-xs">
                            {new Date(post.created_at).toLocaleDateString(
                              "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Blog Image */}
                    <div className="flex-1">
                      {post.featured_image ? (
                        <div className="relative w-full h-[400px] shadow-lg overflow-hidden">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="relative w-full h-[400px] bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-lg shadow-lg flex items-center justify-center overflow-hidden">
                          {/* Background Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div
                              className="absolute inset-0"
                              style={{
                                backgroundImage:
                                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                                backgroundSize: "40px 40px",
                              }}
                            ></div>
                          </div>

                          {/* Child Image */}
                          <div className="relative z-10 text-center">
                            <div className="mb-4">
                              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-8">
                                <svg
                                  className="w-32 h-32 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                </svg>
                              </div>
                            </div>
                            <span className="text-white text-2xl font-semibold block drop-shadow-lg">
                              General health
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Tag */}
                  <div className="flex items-center mb-6">
                    <span className="inline-flex items-center text-gray-600">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      General health
                    </span>
                  </div>

                  {/* Blog Content Container */}
                  <div className="max-w-4xl mx-auto">
                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-8 leading-tight">
                      {post.title}
                    </h1>
                    {shouldShowTOC(post) && (
                      <div className="mb-8 border w-[450px] border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden">
                        {/* TOC Header - Always Visible */}
                        <button
                          onClick={() => toggleTOC(post.id)}
                          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors rounded-lg"
                          aria-expanded={expandedTOC[post.id] || false}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 6h16M4 12h16M4 18h16"
                                />
                              </svg>
                            </div>
                            <div className="text-left">
                              <h3 className="text-lg font-medium text-gray-900">
                                Table of Contents
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {expandedTOC[post.id] ? (
                              <ChevronUp className="w-6 h-6 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                        </button>

                        {/* TOC Content - Expandable */}
                        {expandedTOC[post.id] && (
                          <div className="px-4">
                            {/* TOC Items */}
                            <nav>
                              <ul>
                                {post.table_of_contents.map(
                                  (item: any, index: number) => (
                                    <li
                                      key={item.id || index}
                                      className="group"
                                    >
                                      <a
                                        href={`#${item.anchor}`}
                                        className="flex items-start gap-1 px-3 rounded-lg"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const element =
                                            document.getElementById(
                                              item.anchor
                                            );
                                          if (element) {
                                            element.scrollIntoView({
                                              behavior: "smooth",
                                              block: "start",
                                            });
                                            // Close TOC after clicking on mobile
                                            if (window.innerWidth < 768) {
                                              setExpandedTOC((prev) => ({
                                                ...prev,
                                                [post.id]: false,
                                              }));
                                            }
                                          }
                                        }}
                                      >
                                        {/* Number Circle */}
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                                          <span className="font-semibold text-sm group-hover:text-blue-600">
                                            {item.id}
                                          </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                          <span className="text-gray-800 group-hover:text-blue-600 font-medium leading-normal block">
                                            {item.title}
                                          </span>

                                          {/* Sub-items (if any) - for nested structure */}
                                          {item.children &&
                                            item.children.length > 0 && (
                                              <ul className="mt-2 ml-4 space-y-2">
                                                {item.children.map(
                                                  (
                                                    child: any,
                                                    childIndex: number
                                                  ) => (
                                                    <li
                                                      key={childIndex}
                                                      className="flex items-start gap-3"
                                                    >
                                                      <span className="text-blue-400 text-sm mt-1">
                                                        •
                                                      </span>
                                                      <a
                                                        href={`#${child.anchor}`}
                                                        className="text-gray-600 hover:text-blue-500 text-sm leading-relaxed"
                                                        onClick={(e) => {
                                                          e.preventDefault();
                                                          const element =
                                                            document.getElementById(
                                                              child.anchor
                                                            );
                                                          if (element) {
                                                            element.scrollIntoView(
                                                              {
                                                                behavior:
                                                                  "smooth",
                                                                block: "start",
                                                              }
                                                            );
                                                          }
                                                        }}
                                                      >
                                                        {child.title}
                                                      </a>
                                                    </li>
                                                  )
                                                )}
                                              </ul>
                                            )}
                                        </div>

                                        {/* Arrow indicator */}
                                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <svg
                                            className="w-4 h-4 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                                            />
                                          </svg>
                                        </div>
                                      </a>
                                    </li>
                                  )
                                )}
                              </ul>
                            </nav>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Description */}
                    <div className="prose prose-lg max-w-none mb-8">
                      <p className="text-gray-700 font-light text-sm leading-relaxed">
                        {post.description}
                      </p>
                    </div>

                    <div className="border-t border-gray-300 my-6"></div>
                    {/* Continue Reading + Share Buttons */}
                    <div className="flex flex-col sm:flex-row items-center lg:items-start sm:items-center justify-between gap-6">
                      <button
                        onClick={() => navigate(`/blog/${post.slug}`)}
                        className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg uppercase tracking-wide text-sm"
                      >
                        CONTINUE READING
                      </button>
                      {/* <div className="border-t border-blue-700 my-2"></div> */}

                      {/* Share Icons */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 font-medium hidden sm:block">
                          Share:
                        </span>
                        <div className="flex space-x-2">
                          {["facebook", "twitter", "linkedin", "google"].map(
                            (platform) => (
                              <button
                                key={platform}
                                onClick={() => handleShare(platform, post)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all ${
                                  platform === "facebook"
                                    ? "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                                    : platform === "twitter"
                                    ? "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                                    : platform === "linkedin"
                                    ? "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                                    : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                                }`}
                                title={`Share on ${platform}`}
                              >
                                <span className="text-sm font-bold">
                                  {platform === "facebook"
                                    ? "f"
                                    : platform === "twitter"
                                    ? "𝕏"
                                    : platform === "linkedin"
                                    ? "in"
                                    : "G"}
                                </span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Author and Date */}
                    {/* <div className="flex items-center text-sm text-gray-600 pt-6 border-t border-gray-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {post.author?.fullname?.charAt(0) || "E"}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            {post.author?.fullname || "Etta-Atlantic"}
                          </span>
                          <span className="text-gray-500">
                            {new Date(post.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </div>
              ))}

              {/* No Posts Found */}
              {filteredPosts.length === 0 && (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">
                      No posts found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      We couldn't find any blog posts matching your search.
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search Sidebar - Takes 1/3 of width on large screens */}
            <div className="lg:w-1/3">
              <div className="space-y-6 lg:sticky lg:top-8">
                {/* Search Box */}
                <div className="bg-white">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Search
                  </h3>
                  <div className="w-12 h-0.5 bg-blue-500 mb-4"></div>

                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="Looking for..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-gray-700 placeholder-gray-400"
                    />
                    <button
                      className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg flex-shrink-0 ml-2"
                      aria-label="Search"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {[
                      "General Health",
                      "Mental Wellness",
                      "Preventive Care",
                      "Medical Updates",
                      "Healthy Living",
                    ].map((category) => (
                      <button
                        key={category}
                        className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Newsletter */}
                <div className="bg-blue-600 text-white rounded-lg p-6 shadow-md">
                  <h4 className="text-xl font-bold mb-3">Stay Updated</h4>
                  <p className="text-blue-100 text-sm mb-4">
                    Get the latest health insights and medical updates delivered
                    to your inbox.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full px-3 py-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                    />
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
