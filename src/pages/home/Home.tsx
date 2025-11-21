// pages/home/Home.tsx - Fixed version
import Hero from "./Hero";
import AboutCards from "./AboutCards";
import Services from "./ServiceCards";
import BookAppointment from "./BookApointment";
import { useState, useEffect } from "react";
import { apiService } from "../../services/api";
import { useNavigate } from "react-router-dom";

interface HomeProps {
  onBlogPostClick?: (slug: string) => void;
}

const Home: React.FC<HomeProps> = ({ onBlogPostClick }) => {
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLatestPosts();
  }, []);

  const loadLatestPosts = async () => {
    try {
      setLoadingBlogs(true);
      const posts = await apiService.getLatestBlogPosts(3); // show 3 latest posts
      setLatestPosts(posts);
    } catch (error) {
      console.error("Failed to load latest blog posts:", error);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const handleBlogPostClick = (slug: string) => {
    if (onBlogPostClick) {
      onBlogPostClick(slug);
    } else {
      // Fallback: navigate directly
      navigate(`/blog/${slug}`);
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest From Our Blog</h2>
          <div className="w-20 h-1 bg-blue-500 mb-12"></div>

          {loadingBlogs ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleBlogPostClick(post.slug)}
                >
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-2xl">📝</span>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-500 mb-3 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {post.description}
                    </p>

                    <button className="text-blue-600 font-semibold hover:underline flex items-center">
                      Read More →
                    </button>
                  </div>
                </div>
              ))}
              
              {latestPosts.length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500 text-lg">No blog posts available yet.</p>
                  <p className="text-gray-400 text-sm">Check back later for updates!</p>
                </div>
              )}
            </div>
          )}
          
          {latestPosts.length > 0 && (
            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/blog')}
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                View All Blog Posts
              </button>
            </div>
          )}
        </div>
      </section>
      
      <BookAppointment />
    </>
  );
};

export default Home;