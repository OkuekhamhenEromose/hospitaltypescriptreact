// pages/blog/Blog.tsx - Updated to fetch from API
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { apiService } from '../../services/api';
import { useNavigate } from "react-router-dom"


const Blog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const blogPosts = await apiService.getBlogPosts();
      setPosts(blogPosts);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-blue-500 py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-white">Our Blog</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mb-16">
          <div className="relative">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Search</h2>
            <div className="w-20 h-1 bg-blue-500 mb-8"></div>
            <div className="relative">
              <input
                type="text"
                placeholder="Looking for..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
                aria-label="Search"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {filteredPosts.map((post) => (
            <div key={post.id} className="flex flex-col lg:flex-row gap-8 pb-12 border-b border-gray-200 last:border-0">
              <div className="lg:w-1/3">
                {post.featured_image ? (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <span className="mr-4">{post.author?.fullname || 'Etta-Atlantic'}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="lg:w-2/3">
                <h2 className="text-3xl font-bold text-blue-500 mb-4 leading-tight">
                  {post.title}
                </h2>

                <div className="w-16 h-1 bg-red-500 mb-6"></div>

                <p className="text-gray-700 text-base leading-relaxed mb-6">
                  {post.description}
                </p>

                <button 
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors font-medium"
                >
                  CONTINUE READING
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blog posts found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;