import Hero from './Hero';
import AboutCards from './AboutCards';
import Services from './ServiceCards';
import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const Home = () => {
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    loadLatestPosts();
  }, []);

  const loadLatestPosts = async () => {
    try {
      const posts = await apiService.getLatestBlogPosts(3);
      setLatestPosts(posts);
    } catch (error) {
      console.error('Error loading latest posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  return (
    <>
      <Hero />
      <AboutCards />
      <Services />
      
      {/* Blog Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest from Our Blog</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay informed with the latest health insights and medical updates from our experts.
            </p>
          </div>

          {loadingPosts ? (
            <div className="text-center">Loading blog posts...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>By {post.author?.fullname}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={() => window.location.href = `/blog/${post.slug}`}
                      className="mt-4 text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200"
                    >
                      Read More →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <button
              onClick={() => window.location.href = '/blog'}
              className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors duration-200"
            >
              View All Blog Posts
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;