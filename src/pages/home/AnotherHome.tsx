import React, { useEffect, useState } from "react";
import { apiService } from "../../services/api";

interface HomeProps {
  onSelectPost: (slug: string) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectPost }) => {
  const [latestPost, setLatestPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const loadLatestPost = async () => {
    try {
      setLoading(true);
      const posts = await apiService.getLatestBlogPosts(1);
      setLatestPost(posts[0] || null);
    } catch (error) {
      console.error("Error loading latest blog post:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatestPost();
  }, []);

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return `http://localhost:8000${path}`;
    return `http://localhost:8000/media/blog_images/${path}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-600">Loading latest post...</p>
      </div>
    );
  }

  if (!latestPost) return null;

  const { title, slug, description, content, image_1, image_2, subheadings } =
    latestPost;

  const image1Url = getImageUrl(image_1);
  const image2Url = getImageUrl(image_2);

  const firstTwo = subheadings ? subheadings.slice(0, 2) : [];

  const openDetails = () => {
    onSelectPost(slug);
  };

  return (
    <div className="px-4 md:px-12 lg:px-20">

      {/* Header */}
      <section className="bg-white text-center py-6 md:py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight uppercase">
          Dr Mark Hamlings
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Working towards bridging the gap between the patients and the doctor’s management
        </p>
      </section>

      {/* Main Grid */}
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left Column */}
          <div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-6 md:p-8 border border-gray-200">

            <h2 className="text-xl uppercase font-bold text-gray-900 tracking-widest mb-2">
              Post of the Week
            </h2>

            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {title}
            </h3>

            <p className="text-lg text-gray-600 mb-6 italic">
              Connecting the Dots
            </p>

            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              {description}
            </p>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {content}
            </p>

            {/* BIG Banner Image */}
            {image2Url && (
              <img
                src={image2Url}
                alt="Main visual"
                className="w-full h-64 object-cover rounded-lg shadow-md mb-12"
              />
            )}

            {/* FIRST SUBHEADING */}
            {firstTwo[0] && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-12">
                <div className="md:col-span-2">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {firstTwo[0].title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {firstTwo[0].description}
                  </p>
                </div>

                {image1Url && (
                  <img
                    src={image1Url}
                    alt="Subheading visual"
                    className="w-full h-52 object-cover rounded-lg shadow-md"
                  />
                )}
              </div>
            )}

            {/* SECOND SUBHEADING */}
            {firstTwo[1] && (
              <div className="mb-12">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {firstTwo[1].title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {firstTwo[1].description}
                </p>
              </div>
            )}

            <button
              onClick={openDetails}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300"
            >
              Get More Details!
            </button>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book an Appointment</h3>
              <button
                onClick={() => (window.location.href = "/packages")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-md font-semibold"
              >
                Explore Services
              </button>
            </div>

            <div className="bg-blue-600 text-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-2">Newsletter</h3>
              <p className="text-sm text-blue-100 mb-4">
                Get updates on new health tips and blog posts.
              </p>

              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewsletterForm = () => {
  const [email, setEmail] = useState("");

  const submit = () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email");
      return;
    }
    alert("Thank you for subscribing!");
    setEmail("");
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 rounded-md text-black mb-3 outline-none"
      />
      <button
        onClick={submit}
        className="w-full bg-white text-blue-600 font-bold p-3 rounded-md"
      >
        Subscribe
      </button>
    </div>
  );
};

export default Home;
