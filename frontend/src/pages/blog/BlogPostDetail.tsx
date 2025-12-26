// pages/blog/BlogPostDetail.tsx - Redesigned to match screenshot
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const [expandedTOC, setExpandedTOC] = useState(false);

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const loadBlogPost = async () => {
    try {
      setLoading(true);
      const blogPost = await apiService.getBlogPost(slug!);
      console.log("Blog post data:", blogPost);
      setPost(blogPost);
      // Auto-expand TOC if it exists
      if (blogPost.enable_toc && blogPost.table_of_contents?.length > 0) {
        setExpandedTOC(false);
      }
    } catch (err) {
      console.error('Error loading blog post:', err);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const toggleTOC = () => {
    setExpandedTOC(!expandedTOC);
  };

  const scrollToHeading = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderTableOfContents = () => {
    if (!post.enable_toc || !post.table_of_contents || post.table_of_contents.length === 0) {
      return null;
    }

    return (
      <div className="mb-8 border w-full max-w-[450px] border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden">
        {/* TOC Header */}
        <button
          onClick={toggleTOC}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          aria-expanded={expandedTOC}
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
            <h3 className="text-lg font-bold text-gray-900">
              Table of Contents
            </h3>
          </div>
          {expandedTOC ? (
            <ChevronUp className="w-6 h-6 text-gray-600" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {/* TOC Content */}
        {expandedTOC && (
          <div className="px-4 pb-4">
            <nav>
              <ul className="space-y-1">
                {post.table_of_contents.map((item: any, index: number) => (
                  <li key={item.id || index}>
                    <button
                      onClick={() => scrollToHeading(item.anchor)}
                      className="flex items-start gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <span className="font-semibold text-sm text-gray-700 group-hover:text-blue-600 min-w-[24px]">
                        {item.id}.
                      </span>
                      <span className="text-gray-800 group-hover:text-blue-600 font-medium text-base leading-relaxed">
                        {item.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (!post.subheadings || post.subheadings.length === 0) {
      return (
        <div 
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      );
    }

    return (
      <div className="space-y-12">
        {post.subheadings.map((subheading: any, index: number) => (
          <div key={index} id={slugify(subheading.title)} className="scroll-mt-24">
            {/* Subheading Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {subheading.title}
            </h2>
            
            {/* Subheading Content */}
            <div 
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-6"
              dangerouslySetInnerHTML={{ __html: subheading.full_content }}
            />
            
            {/* Display additional images between subheadings */}
            {index === 0 && post.image_1 && (
              <div className="my-8">
                <img
                  src={post.image_1}
                  alt={`${subheading.title} illustration`}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}
            {index === 2 && post.image_2 && (
              <div className="my-8">
                <img
                  src={post.image_2}
                  alt={`${subheading.title} illustration`}
                  className="w-full h-auto rounded-lg shadow-md"
                />
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
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Return to Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Category Tag */}
        <div className="flex items-center mb-6">
          <span className="inline-flex items-center text-gray-600">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            General health
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Red underline */}
        <div className="w-24 h-1 bg-red-500 mb-6"></div>

        {/* Meta Information */}
        <div className="flex items-center text-gray-600 text-sm mb-8 space-x-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {new Date(post.published_date || post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <span>/</span>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
            <span>by {post.author?.fullname || 'Etha-Atlantic'}</span>
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Table of Contents */}
        {renderTableOfContents()}

        {/* Description/Introduction */}
        {post.description && (
          <div className="mb-8 text-gray-700 text-lg leading-relaxed">
            <p>{post.description}</p>
          </div>
        )}

        {/* Main Content with Subheadings */}
        <div className="prose prose-lg max-w-none">
          {renderContent()}
        </div>

        {/* Back to Blog Button */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <button
            onClick={() => navigate('/blog')}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            ← Back to Blog
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;