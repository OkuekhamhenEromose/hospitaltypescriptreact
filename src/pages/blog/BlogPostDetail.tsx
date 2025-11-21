// pages/blog/BlogPostDetail.tsx - Fetch individual post from API
import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { useParams } from 'react-router-dom';

const BlogPostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const loadBlogPost = async () => {
    try {
      setLoading(true);
      const blogPost = await apiService.getBlogPost(slug!);
      setPost(blogPost);
    } catch (err) {
      console.error('Error loading blog post:', err);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
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
              onClick={() => window.location.href = '/blog'}
              className="text-blue-600 hover:text-blue-700"
            >
              Return to Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderTableOfContents = () => {
    if (!post.enable_toc || !post.table_of_contents || post.table_of_contents.length === 0) {
      return null;
    }

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Table of Contents</h3>
        </div>
        <ul className="space-y-2">
          {post.table_of_contents.map((item: any, index: number) => (
            <li key={index} style={{ marginLeft: `${(item.level - 1) * 16}px` }}>
              <a 
                href={`#${item.anchor}`} 
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                {item.id}. {item.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-blue-500 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="w-24 h-1 bg-red-500 mb-6"></div>
            <div className="flex items-center text-white text-sm">
              <span className="mr-4">
                {new Date(post.published_date || post.created_at).toLocaleDateString()}
              </span>
              <span className="mr-1">/</span>
              <span className="ml-4">by {post.author?.fullname || 'Etta-Atlantic'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-12"
            />
          )}

          {/* Table of Contents */}
          {renderTableOfContents()}

          {/* Description */}
          {post.description && (
            <div className="text-gray-700 text-lg leading-relaxed mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              {post.description}
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Social Share Buttons */}
          <div className="flex items-center justify-end gap-4 mt-12 pt-8 border-t border-gray-200">
            <span className="text-gray-600 font-medium mr-4">Share this post:</span>
            <button
              className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              aria-label="Share on Facebook"
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
            >
              <Facebook className="w-5 h-5" />
            </button>
            <button
              className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-400 hover:bg-blue-500 text-white transition-colors"
              aria-label="Share on Twitter"
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${post.title}`, '_blank')}
            >
              <Twitter className="w-5 h-5" />
            </button>
            <button
              className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-700 hover:bg-blue-800 text-white transition-colors"
              aria-label="Share on LinkedIn"
              onClick={() => window.open(`https://www.linkedin.com/shareArticle?url=${window.location.href}&title=${post.title}`, '_blank')}
            >
              <Linkedin className="w-5 h-5" />
            </button>
            <button
              className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
              aria-label="Share"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    text: post.description,
                    url: window.location.href,
                  });
                }
              }}
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <button
              onClick={() => window.location.href = '/blog'}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all"
            >
              ← Back to Blog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;