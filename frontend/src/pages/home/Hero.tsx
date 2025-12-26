// Hero.tsx - Responsive version with proper CTA button layout
// import React from 'react';
import HeroImg from "../../assets/img/home8_img_figure_new.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-r">
      {/* Background Image - Responsive positioning */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/4 lg:w-7/12 h-full">
        {/* <div className="inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent z-10"></div> */}
          <img
            src={HeroImg}
            alt="Medical professional"
            className="h-full w-full object-cover object-left"
          />
        </div>
      </div>

      {/* Overlay for better text readability on mobile */}
      <div className="absolute inset-0 bg-white/30 md:bg-transparent lg:bg-transparent"></div>

      {/* Content Container - Responsive padding and alignment */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 relative z-10 h-full min-h-screen flex items-center">
        <div className="max-w-full md:max-w-2xl h-full flex flex-col justify-center pt-16 md:pt-20 lg:pt-32">
          {/* Welcome Text - Responsive font sizes */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2b2e32] mb-1 sm:mb-2">
            Welcome to
          </h2>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-blue-600 mb-1 sm:mb-2 leading-tight">
            Etha-Atlantic Memorial Hospital
          </h1>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-4 sm:mb-6">
            Ikorodu, Lagos
          </h3>

          {/* Description - Responsive text sizes and spacing */}
          <p className="text-base sm:text-lg md:text-lg text-gray-900 leading-relaxed mb-3 sm:mb-4 max-w-full md:max-w-xl">
            Etha-Atlantic Memorial Hospital Ikorodu stands as the premier private 
            hospital in Ikorodu, Lagos. Our foundation was laid with the singular 
            purpose of delivering world-class healthcare to the community of Lagos 
            and the broader Nigerian populace.
          </p>

          <p className="text-sm sm:text-base md:text-base text-gray-800 leading-relaxed mb-6 sm:mb-8 max-w-full md:max-w-xl">
            Established by a physician with medical training and experience practicing 
            in the US, along with access to expert consultation and up-to-date research. 
            Markedly, he has teamed up with bright and dedicated Nigerian physicians and other 
            allied health professionals with training home and abroad to provide excellent care.
          </p>

          {/* Call-to-Action Section - Updated to match screenshot layout */}
          <div className="space-y-4 sm:space-y-6">
            {/* FIND OUT MORE - Text link styled as a button */}
            <div className="mb-2 sm:mb-4">
              <a 
                href="#" 
                className="inline-block text-sm sm:text-base md:text-base bg-blue-600 font-semibold text-white hover:bg-blue-800 transition-colors px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-2.5 rounded-full shadow-md hover:shadow-lg"
              >
                FIND OUT MORE
              </a>
            </div>
            
            {/* Button row - ALWAYS horizontal on all screen sizes */}
            <div className="flex flex-row gap-2 sm:gap-2 md:gap-2">
              <button className="sm:flex-none bg-red-500 text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-red-600 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base md:text-base">
                OUR SERVICES
              </button>
              <button className=" sm:flex-none bg-white text-gray-800 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base md:text-base">
                OUR PACKAGES
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-specific adjustments */}
      {/* <div className="block md:hidden absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div> */}
    </section>
  );
};

export default Hero;