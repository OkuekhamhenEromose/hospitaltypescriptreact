// pages/blog/Blog.tsx
import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { apiService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";

const Blog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTOC, setExpandedTOC] = useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadBlogPosts();
  }, []);

  // Normalize media URLs
  const normalizeMediaUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/media")) return `http://localhost:8000${path}`;
    return `http://localhost:8000/media/blog_images/${path}`;
  };

  // Normalize subheadings
  const normalizeSubheadings = (sub: any[]) => {
    return sub.map((item: any, index: number) => ({
      id: index + 1,
      title: item.title,
      description: item.description || "",
      level: item.level || 2,
      anchor: slugify(item.title || "", { lower: true }),
    }));
  };

  // Normalize entire blog post
  const normalizeBlogPost = (post: any) => {
    const normalized = {
      ...post,
      id: post.id ?? null,
      featured_image: normalizeMediaUrl(post.featured_image),
      image_1: normalizeMediaUrl(post.image_1),
      image_2: normalizeMediaUrl(post.image_2),
      description:
        post.description || post.short_description || post.excerpt || post.content || "",
      subheadings:
        post.subheadings && post.subheadings.length > 0
          ? normalizeSubheadings(post.subheadings)
          : [],
      table_of_contents:
        post.table_of_contents && post.table_of_contents.length > 0
          ? post.table_of_contents.map((item: any, index: number) => ({
              id: item.id ?? index + 1,
              title: item.title,
              level: item.level || 2,
              anchor: slugify(item.title || "", { lower: true }),
            }))
          : [],
    };
    return normalized;
  };

  const loadBlogPosts = async () => {
    try {
      setIsLoading(true);
      const blogPosts = await apiService.getBlogPosts();
      const normalizedPosts = blogPosts.map((post: any) => normalizeBlogPost(post));
      setPosts(normalizedPosts);
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

  const toggleTOC = (postId: number) => {
    setExpandedTOC((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleShare = (platform: string, post: any) => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    const text = post.title;
    const shareUrls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
        text
      )}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    };
    if (shareUrls[platform]) window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {filteredPosts.map((post, index) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Blog Image */}
                {post.featured_image ? (
                  <img src={post.featured_image} alt={post.title} className="w-full h-80 object-cover" />
                ) : (
                  <div className="w-full h-80 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center relative">
                    <div className="text-center">
                      <span className="text-white text-6xl mb-4">📝</span>
                      <span className="block text-white text-lg mt-4 font-medium">General health</span>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg w-80">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Looking for..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors" aria-label="Search">
                            <Search className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="text-gray-700 font-semibold mt-3 text-sm">General health</h3>
                      </div>
                    )}
                  </div>
                )}

                {/* Blog Content */}
                <div className="p-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>

                  {/* TOC */}
                  {post.enable_toc && post.table_of_contents.length > 0 && (
                    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleTOC(post.id)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-semibold text-gray-800 text-lg">Table of Contents</span>
                        {expandedTOC[post.id] ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      {expandedTOC[post.id] && (
                        <div className="p-6 bg-white border-t border-gray-200">
                          <nav>
                            <ul className="space-y-3">
                              {post.table_of_contents.map((item: any) => (
                                <li key={item.id} style={{ marginLeft: `${(item.level - 1) * 20}px` }}>
                                  <a href={`#${item.anchor}`} className="text-gray-700 hover:text-blue-600 transition-colors">
                                    {item.id}. {item.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </nav>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subheadings */}
                  {post.subheadings.map((sub: any) => (
                    <div key={sub.id || sub.title} id={sub.anchor} className="mb-6">
                      {sub.level === 1 && <h1 className="text-3xl font-bold mb-2">{sub.title}</h1>}
                      {sub.level === 2 && <h2 className="text-2xl font-semibold mb-2">{sub.title}</h2>}
                      <p className="text-gray-700">{sub.description}</p>
                    </div>
                  ))}

                  {/* Description */}
                  <div className="prose prose-lg max-w-none mb-8">
                    <p className="text-gray-700 text-lg leading-relaxed">{post.description}</p>
                  </div>

                  {/* Continue Reading + Share */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/blog/${post.slug}`)}
                      className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg uppercase tracking-wide text-sm"
                    >
                      Continue Reading
                    </button>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600 font-medium">Share:</span>
                      <div className="flex space-x-2">
                        {["facebook", "twitter", "linkedin", "whatsapp"].map((platform) => (
                          <button
                            key={platform}
                            onClick={() => handleShare(platform, post)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                              platform === "facebook"
                                ? "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                                : platform === "twitter"
                                ? "border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                                : platform === "linkedin"
                                ? "border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white"
                                : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            } transition-all`}
                            title={`Share on ${platform}`}
                          >
                            <span className="text-sm font-bold">
                              {platform === "facebook"
                                ? "f"
                                : platform === "twitter"
                                ? "𝕏"
                                : platform === "linkedin"
                                ? "in"
                                : "ⓦ"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Post Meta */}
                  <div className="mt-6 pt-6 border-t border-gray-200 flex items-center text-sm text-gray-600">
                    <span className="font-medium">{post.author?.fullname || "Etta-Atlantic"}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredPosts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No posts found</h3>
                  <p className="text-gray-500 mb-6">We couldn't find any blog posts matching your search.</p>
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Search Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Search Blog</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Looking for health topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors" aria-label="Search">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-gray-700 font-semibold mt-3 text-sm">General health</h4>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {["General Health", "Mental Wellness", "Preventive Care", "Medical Updates", "Healthy Living"].map((category) => (
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
                <p className="text-blue-100 text-sm mb-4">Get the latest health insights and medical updates delivered to your inbox.</p>
                <div className="space-y-3">
                  <input type="email" placeholder="Your email address" className="w-full px-3 py-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white" />
                  <button className="w-full bg-white text-blue-600 font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">Subscribe</button>
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
