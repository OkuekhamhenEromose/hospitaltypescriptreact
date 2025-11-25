// pages/blog/BlogPostDetail.tsx - Fixed version with proper image handling
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

// Helper function to create slugs from text
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

const BlogPostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTocItem, setActiveTocItem] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const loadBlogPost = async () => {
    try {
      setLoading(true);
      const blogPost = await apiService.getBlogPost(slug!);
      console.log("Blog post data:", blogPost); // Debug log
      console.log("Blog post images:", {
        featured: blogPost.featured_image,
        image1: blogPost.image_1,
        image2: blogPost.image_2
      }); // Debug log
      console.log("Blog post subheadings:", blogPost.subheadings); // Debug log
      setPost(blogPost);
    } catch (err) {
      console.error('Error loading blog post:', err);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  // Smooth scroll for TOC items
  const scrollToHeading = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveTocItem(anchor);
    }
  };

  const renderTableOfContents = () => {
    if (!post.enable_toc || !post.table_of_contents || post.table_of_contents.length === 0) {
      return null;
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Table of Contents</h3>
          <div className="w-8 h-1 bg-blue-500"></div>
        </div>
        <nav>
          <ul className="space-y-2">
            {post.table_of_contents.map((item: any, index: number) => (
              <li key={index} style={{ marginLeft: `${(item.level - 1) * 16}px` }}>
                <button
                  onClick={() => scrollToHeading(item.anchor)}
                  className={`text-left w-full px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                    activeTocItem === item.anchor
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.id}. {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  };

  const renderSubheadings = () => {
    if (!post.subheadings || post.subheadings.length === 0) {
      // Fallback: render the full content if no subheadings are extracted
      return (
        <div 
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      );
    }

    return (
      <div className="space-y-8">
        {post.subheadings.map((subheading: any, index: number) => (
          <div key={index} id={slugify(subheading.title)} className="scroll-mt-20">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-2 h-12 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {subheading.title}
                </h2>
                <div 
                  className="prose prose-lg text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: subheading.full_content }}
                />
              </div>
            </div>
            
            {/* Display additional images between subheadings */}
            {index === 0 && post.image_1 && (
              <div className="my-8">
                <img
                  src={post.image_1}
                  alt={`${subheading.title} illustration`}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
                <p className="text-sm text-gray-500 text-center mt-2">Illustration for {subheading.title}</p>
              </div>
            )}
            {index === 2 && post.image_2 && (
              <div className="my-8">
                <img
                  src={post.image_2}
                  alt={`${subheading.title} illustration`}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
                <p className="text-sm text-gray-500 text-center mt-2">Illustration for {subheading.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <p className="text-center text-gray-500">Blog post not found.</p>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/blog')}
              className="text-blue-600 hover:text-blue-700"
            >
              Return to Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="w-24 h-1 bg-red-500 mx-auto mb-6"></div>
            <div className="flex items-center justify-center text-white text-sm space-x-4">
              <span>{new Date(post.published_date || post.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>by {post.author?.fullname || 'Etta-Atlantic'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with TOC */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {renderTableOfContents()}
                
                {/* Social Share */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Share this post</h4>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Facebook
                    </button>
                    <button 
                      onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${post.title}`, '_blank')}
                      className="flex-1 bg-blue-400 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
                    >
                      Twitter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Featured Image */}
                {post.featured_image && (
                  <div className="relative">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                      <p className="text-white text-sm text-center">Featured Image</p>
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Description */}
                  {post.description && (
                    <div className="text-gray-700 text-lg leading-relaxed mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      {post.description}
                    </div>
                  )}

                  {/* Subheadings Content */}
                  {renderSubheadings()}

                  {/* Display any remaining images that weren't placed between subheadings */}
                  {post.image_1 && !post.subheadings?.[0] && (
                    <div className="my-8">
                      <img
                        src={post.image_1}
                        alt="Additional content image 1"
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  {post.image_2 && !post.subheadings?.[2] && (
                    <div className="my-8">
                      <img
                        src={post.image_2}
                        alt="Additional content image 2"
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}

                  {/* Back to Blog */}
                  <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                    <button
                      onClick={() => navigate('/blog')}
                      className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                      ← Back to Blog
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

export default BlogPostDetail;