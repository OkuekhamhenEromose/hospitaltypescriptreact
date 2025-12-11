// pages/home/Home.tsx - With specific Framer Motion animations
import Hero from "./Hero";
import AboutCards from "./AboutCards";
import Services from "./ServiceCards";
import BookAppointment from "./BookApointment";
import slugify from "slugify";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

import { useState, useEffect } from "react";
import { apiService } from "../../services/api";
import { useNavigate } from "react-router-dom";

interface HomeProps {
  onSelectPost?: (slug: string) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectPost }) => {
  const [latestPost, setLatestPost] = useState<any>(null);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadLatestPost();
  }, []);

  // Animation variants
  const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const zoomOut: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const loadLatestPost = async () => {
    try {
      setLoadingBlogs(true);
      const posts = await apiService.getLatestBlogPosts(1);

      if (posts && posts.length > 0) {
        const post = posts[0];
        if (post.subheadings) {
          post.subheadings = normalizeSubheadings(post.subheadings);
        }
        if (post.first_two_subheadings) {
          post.first_two_subheadings = normalizeSubheadings(
            post.first_two_subheadings
          );
        }

        console.log("=== BLOG POST DEBUG ===");
        console.log("Post data:", post);
        console.log("Subheadings:", post.subheadings);
        console.log("First two subheadings:", post.first_two_subheadings);
        console.log("Featured image:", post.featured_image);
        console.log("Image 1:", post.image_1);
        console.log("Image 2:", post.image_2);

        setLatestPost(post);
      } else {
        setLatestPost(null);
      }
    } catch (error) {
      console.error("Failed to load latest blog posts:", error);
      setLatestPost(null);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const handleBlogPostClick = (slug: string) => {
    if (onSelectPost) {
      onSelectPost(slug);
    } else {
      navigate(`/blog/${slug}`);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing email:", email);
    alert("Thank you for subscribing!");
    setEmail("");
  };

  // Universal image URL resolver
  const getImageUrl = (path: string | null) => {
    if (!path) return null;

    // FULL url already
    if (path.startsWith("http")) return path;

    // Django returns absolute media paths like "/media/blog_images/xxx.jpg"
    if (path.startsWith("/media")) return `https://dhospitalback.onrender.com${path}`;

    // Django returns only filename "xx.jpg"
    return `https://dhospitalback.onrender.com/media/blog_images/${path}`;
  };

  const normalizeSubheadings = (sub: any[]) => {
    return sub.map((item: any, index: number) => ({
      id: index + 1,
      title: item.title,
      description: item.description,
      level: item.level || 2,
      anchor: slugify(item.title || "", { lower: true }),
    }));
  };

  // Extract first two subheadings with fallbacks
  const getFirstTwoSubheadings = (post: any) => {
    // Try multiple possible field names
    if (post.first_two_subheadings && post.first_two_subheadings.length > 0) {
      return post.first_two_subheadings;
    }

    if (post.subheadings && post.subheadings.length > 0) {
      return post.subheadings.slice(0, 2);
    }

    return null;
  };

  const firstTwoSubheadings = latestPost
    ? getFirstTwoSubheadings(latestPost)
    : null;
  const featuredImageUrl = latestPost
    ? getImageUrl(latestPost.featured_image)
    : null;
  const image1Url = latestPost ? getImageUrl(latestPost.image_1) : null;
  const image2Url = latestPost ? getImageUrl(latestPost.image_2) : null;

  return (
    <>
      <Hero />
      <AboutCards />
      <Services />

      {/* BLOG SECTION - Enhanced with proper blog post display */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto  sm:px-6 md:px-8 lg:px-12 px-8">
          {/* SECTION TITLE */}
          <h2 className="text-2xl font-light text-gray-700 mb-6">
            Post of the Week
          </h2>

          {loadingBlogs ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : latestPost ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* MAIN CONTENT - Enhanced blog post display with fadeInLeft */}
              <motion.div 
                className="lg:col-span-2"
                variants={fadeInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {/* Blog Post Title */}
                <h1 className="text-5xl md:text-6xl font-light text-gray-900 leading-tight">
                  {latestPost.title}
                </h1>

                {/* Blog Post Subtitle */}
                <h2 className="text-5xl md:text-6xl font-bold text-blue-600 mt-4">
                  Connecting the Dots
                </h2>

                <div className="w-20 h-[3px] bg-blue-600 my-3"></div>

                {/* Blog Post Description */}
                <p className="text-gray-600 text-base leading-relaxed max-w-3xl">
                  {latestPost.description}
                </p>

                {/* Additional Content Image if available */}
                {image2Url && (
                  <div className="mt-6">
                    <img
                      src={image2Url}
                      alt="Blog content visual"
                      className="w-full h-64 object-cover rounded-lg shadow-lg"
                      onError={(e) => {
                        console.error("Image 2 failed to load:", image2Url);
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* FIRST SUBHEADING WITH IMAGE - Enhanced display */}
                {firstTwoSubheadings && firstTwoSubheadings[0] && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Text Content */}
                    <div className="md:col-span-2">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        {firstTwoSubheadings[0].title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {firstTwoSubheadings[0].description}
                      </p>
                    </div>

                    {/* Image - Try multiple image sources */}
                    <div className="flex justify-center">
                      {featuredImageUrl && (
                        <img
                          src={featuredImageUrl}
                          alt={firstTwoSubheadings[0].title}
                          className="w-full h-52 object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            console.error(
                              "Featured image failed to load:",
                              featuredImageUrl
                            );
                            // Try fallback to image1
                            if (image1Url) {
                              e.currentTarget.src = image1Url;
                            } else {
                              e.currentTarget.style.display = "none";
                            }
                          }}
                        />
                      )}
                      {!featuredImageUrl && image1Url && (
                        <img
                          src={image1Url}
                          alt={firstTwoSubheadings[0].title}
                          className="w-full h-52 object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            console.error("Image 1 failed to load:", image1Url);
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* SECOND SUBHEADING */}
                {firstTwoSubheadings && firstTwoSubheadings[1] && (
                  <div className="mt-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {firstTwoSubheadings[1].title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed max-w-3xl text-sm">
                      {firstTwoSubheadings[1].description}
                    </p>

                    <motion.button
                      onClick={() => handleBlogPostClick(latestPost.slug)}
                      className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg uppercase tracking-wide"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      GET MORE DETAILS!
                    </motion.button>
                  </div>
                )}

                {/* FALLBACK - If no subheadings are available */}
                {(!firstTwoSubheadings || firstTwoSubheadings.length === 0) && (
                  <div className="mt-16 bg-gray-50 p-8 rounded-lg border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Explore More Content
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      This blog post contains valuable insights and detailed
                      information about healthcare topics. Click below to read
                      the full article and discover comprehensive guidance.
                    </p>
                    <motion.button
                      onClick={() => handleBlogPostClick(latestPost.slug)}
                      className="bg-blue-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg uppercase tracking-wide"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      READ FULL ARTICLE
                    </motion.button>
                  </div>
                )}
              </motion.div>

              {/* SIDEBAR - Enhanced newsletter section with zoom out */}
              <motion.div 
                className="space-y-8 mt-4"
                variants={zoomOut}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {/* Newsletter Card */}
                <motion.div 
  className="bg-[#1378e5] text-white p-8 shadow-xl"
  whileHover={{ scale: 1.02 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  <h3 className="text-3xl font-bold mb-4">
    We Have Some Good News
  </h3>
  <div className="w-16 h-[3px] bg-white mb-6"></div>

  <p className="text-white/90 leading-relaxed mb-8">
    Don't hesitate – sign up for our newsletter now to stay
    informed about our services, gain valuable healthcare
    insights, and access exclusive offers from Etha-Atlantic
    Memorial Hospital in Lagos, Nigeria.
  </p>

  {/* Newsletter Form */}
  <form onSubmit={handleSubscribe} className="space-y-4">
    <motion.input
      type="email"
      required
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Type in your email address"
      className="w-full bg-[#177fed] px-4 py-3 rounded-full text-white placeholder:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
      whileFocus={{ scale: 1.02 }}
    />

    {/* Center the Subscribe button */}
    <div className="flex justify-center">
      <motion.button
        type="submit"
        className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-all uppercase tracking-wide"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Subscribe
      </motion.button>
    </div>
  </form>

  {/* Healthcare Plans Section */}
  <div className="mt-2 pt-2 border-t border-blue-500 border-opacity-30 ">
    <h4 className="text-2xl font-bold mb-4 text-center">
      We offer the Best Healthcare Plans
    </h4>
    <p className="text-white text-sm leading-relaxed mb-6 text-center">
      Check out our different healthcare packages, ranging from
      health checks, lifestyle plans, UTI checks to sexual
      health.
    </p>
    <div className="flex justify-center">
    <motion.button
      onClick={() => navigate("/packages")}
      className="bg-red-600 text-sm text-white py-4 px-10 rounded-full font-bold hover:bg-red-700 transition-all uppercase tracking-wide flex items-center justify-center shadow-md hover:shadow-lg mb-4 sm:mb-8 md:mb-32"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Our Packages <span className="ml-2">»</span>
    </motion.button>
    </div>
  </div>
</motion.div>
              </motion.div>
            </div>
          ) : (
            /* No Posts Available State */
            <div className="text-center py-16 bg-gray-50 rounded-2xl shadow-inner">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No Blog Posts Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  We're working on creating valuable content for you. Check back
                  soon for updates!
                </p>
                <button
                  onClick={() => navigate("/blog")}
                  className="bg-gray-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-700 transition-all"
                >
                  Visit Blog
                </button>
              </div>
            </div>
          )}

          {/* View All Blog Posts Button */}
          <div className="text-center mt-12">
            <motion.button
              onClick={() => navigate("/blog")}
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg text-lg uppercase tracking-wide"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All Blog Posts
            </motion.button>
          </div>
        </div>
      </section>

      <BookAppointment />
    </>
  );
};

export default Home;