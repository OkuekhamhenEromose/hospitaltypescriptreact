// Hero.tsx - Fixed to work with overlaying fixed header
// import React from 'react';
import HeroImg from "../../assets/img/home8_img_figure_new.png";

const Hero = () => {
  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden bg-gradient-to-r from-white to-blue-50">
      {/* Background Image - Right Side */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 bottom-0 w-7/12 h-full">
          <img
            src={HeroImg}
            alt="Medical professional"
            className="h-full w-full object-cover object-left"
          />
        </div>
      </div>

      {/* Content Container - Added padding-top to account for fixed header */}
      <div className="container mx-auto px-16 relative z-10 h-full">
        <div className="max-w-2xl h-full flex flex-col justify-center pt-32">
          {/* Welcome Text */}
          <h2 className="text-4xl font-bold text-[#2b2e32] mb-2">
            Welcome to
          </h2>
          <h1 className="text-5xl font-bold text-blue-600 mb-2 leading-tight">
            Etha-Atlantic Memorial Hospital
          </h1>
          <h3 className="text-4xl font-bold text-blue-600 mb-6">
            Ikorodu, Lagos
          </h3>

          {/* Description */}
          <p className="text-lg text-gray-900 leading-relaxed mb-4 max-w-xl">
            Etha-Atlantic Memorial Hospital Ikorodu stands as the premier private 
            hospital in Ikorodu, Lagos. Our foundation was laid with the singular 
            purpose of delivering world-class healthcare to the community of Lagos 
            and the broader Nigerian populace.
          </p>

          <p className="text-base text-gray-800 leading-relaxed mb-8 max-w-xl">
            Established by a physician with medical training and experience practicing 
            in the US, along with access to expert consultation and up-to-date research. 
            Markedly, he has teamed up with bright and experienced healthcare professionals.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex space-x-4">
            <button className="bg-[#177fed] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#145dbf] transition-colors shadow-lg">
              Find Out More
            </button>
            <button className="bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors shadow-lg">
              Our Services
            </button>
            <button className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              Our Packages
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;