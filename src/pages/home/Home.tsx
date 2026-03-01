// pages/home/Home.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import slugify from "slugify";

import Hero             from "./Hero";
import AboutCards       from "./AboutCards";
import Services         from "./ServiceCards";
import BookAppointment  from "./BookApointment";
import { apiService }   from "../../services/api";
import { normalizeMediaUrl } from "../../services/api";

interface HomeProps {
  onSelectPost?: (slug: string) => void;
}

// ── Animation variants (module-level — allocated once, not on every render) ──
const fadeInLeft: Variants = {
  hidden:  { opacity: 0, x: -50 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const zoomOut: Variants = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// ── Subheading helpers ────────────────────────────────────────────────────────
const normalizeSubheadings = (sub: any[]) =>
  sub.map((item: any, i: number) => ({
    id:          i + 1,
    title:       item.title,
    description: item.description,
    level:       item.level ?? 2,
    anchor:      slugify(item.title ?? "", { lower: true }),
  }));

const getFirstTwoSubheadings = (post: any): any[] | null => {
  if (post.first_two_subheadings?.length) return post.first_two_subheadings;
  if (post.subheadings?.length)           return post.subheadings.slice(0, 2);
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────

const Home: React.FC<HomeProps> = ({ onSelectPost }) => {
  const [latestPost,    setLatestPost]    = useState<any>(null);
  const [loadingBlogs,  setLoadingBlogs]  = useState(true);
  const [email,         setEmail]         = useState("");
  const navigate = useNavigate();

  // FIX: The original called getBlogPosts() which fetches the full paginated
  // list (up to 20 posts) just to use allPosts[0].
  // getLatestBlogPosts(1) calls /hospital/blog/latest/?limit=1 directly —
  // the backend returns exactly one post, pre-sorted, pre-cached in Redis.
  // This reduces data over the wire by ~95% for this component.
  const loadLatestPost = useCallback(async () => {
    try {
      setLoadingBlogs(true);
      const posts = await apiService.getLatestBlogPosts(1);
      if (posts.length > 0) {
        const post = { ...posts[0] };
        if (Array.isArray(post.subheadings))
          post.subheadings = normalizeSubheadings(post.subheadings);
        setLatestPost(post);
      } else {
        setLatestPost(null);
      }
    } catch {
      setLatestPost(null);
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  useEffect(() => {
    loadLatestPost();
  }, [loadLatestPost]);

  const handleBlogPostClick = (slug: string) => {
    onSelectPost ? onSelectPost(slug) : navigate(`/blog/${slug}`);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for subscribing!");
    setEmail("");
  };

  // FIX: Derived image URLs memoized — the original called normalizeMediaUrl
  // three times on every render even when latestPost hadn't changed.
  const { featuredImageUrl, image1Url, image2Url, firstTwoSubheadings } =
    useMemo(() => {
      if (!latestPost)
        return { featuredImageUrl: null, image1Url: null, image2Url: null, firstTwoSubheadings: null };
      return {
        featuredImageUrl:   normalizeMediaUrl(latestPost.featured_image),
        image1Url:          normalizeMediaUrl(latestPost.image_1),
        image2Url:          normalizeMediaUrl(latestPost.image_2),
        firstTwoSubheadings: getFirstTwoSubheadings(latestPost),
      };
    }, [latestPost]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
  };

  return (
    <>
      <Hero />
      <AboutCards />
      <Services />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto sm:px-6 md:px-8 lg:px-12 px-8">
          <h2 className="text-2xl font-light text-gray-700 mb-6">Post of the Week</h2>

          {loadingBlogs ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : latestPost ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* ── Main content ── */}
              <motion.div
                className="lg:col-span-2"
                variants={fadeInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <h1 className="text-5xl md:text-6xl font-light text-gray-900 leading-tight">
                  {latestPost.title}
                </h1>
                <h2 className="text-5xl md:text-6xl font-bold text-blue-600 mt-4">
                  Connecting the Dots
                </h2>
                <div className="w-20 h-[3px] bg-blue-600 my-3" />
                <p className="text-gray-600 text-base leading-relaxed max-w-3xl">
                  {latestPost.description}
                </p>

                {image2Url && (
                  <div className="mt-6">
                    <img
                      src={image2Url}
                      alt="Blog content visual"
                      className="w-full h-64 object-cover rounded-lg shadow-lg"
                      onError={handleImageError}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}

                {firstTwoSubheadings?.[0] && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        {firstTwoSubheadings[0].title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {firstTwoSubheadings[0].description}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      {featuredImageUrl && (
                        <img
                          src={featuredImageUrl}
                          alt={firstTwoSubheadings[0].title}
                          className="w-full h-52 object-cover rounded-lg shadow-lg"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            if (image1Url) e.currentTarget.src = image1Url;
                            else e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      {!featuredImageUrl && image1Url && (
                        <img
                          src={image1Url}
                          alt={firstTwoSubheadings[0].title}
                          className="w-full h-52 object-cover rounded-lg shadow-lg"
                          loading="lazy"
                          decoding="async"
                          onError={handleImageError}
                        />
                      )}
                    </div>
                  </div>
                )}

                {firstTwoSubheadings?.[1] && (
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

              {/* ── Sidebar ── */}
              <motion.div
                className="space-y-8 mt-4"
                variants={zoomOut}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <motion.div
                  className="bg-[#1378e5] text-white p-8 shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="text-3xl font-bold mb-4">We Have Some Good News</h3>
                  <div className="w-16 h-[3px] bg-white mb-6" />
                  <p className="text-white/90 leading-relaxed mb-8">
                    Don't hesitate – sign up for our newsletter now to stay
                    informed about our services, gain valuable healthcare
                    insights, and access exclusive offers from Etha-Atlantic
                    Memorial Hospital in Lagos, Nigeria.
                  </p>

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

                  <div className="mt-2 pt-2 border-t border-blue-500 border-opacity-30">
                    <h4 className="text-2xl font-bold mb-4 text-center">
                      We offer the Best Healthcare Plans
                    </h4>
                    <p className="text-white text-sm leading-relaxed mb-6 text-center">
                      Check out our different healthcare packages, ranging from
                      health checks, lifestyle plans, UTI checks to sexual health.
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
            <div className="text-center py-16 bg-gray-50 rounded-2xl shadow-inner">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Blog Posts Yet</h3>
                <p className="text-gray-500 mb-6">
                  We're working on creating valuable content for you. Check back soon!
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