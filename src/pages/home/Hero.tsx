
const Hero = () => {
  return (
    <section className="relative h-[600px] bg-gradient-to-r from-gray-100 to-gray-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/2">
          <img
            src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Medical professional"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 h-full">
        <div className="max-w-2xl pt-24">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to
          </h2>
          <h1 className="text-5xl font-bold text-blue-600 mb-4 leading-tight">
            Etta-Atlantic Memorial Hospital
          </h1>
          <h3 className="text-4xl font-bold text-blue-600 mb-6">
            Ikate Lekki Lagos
          </h3>

          <p className="text-lg text-gray-700 leading-relaxed mb-8 max-w-xl">
            Etta-Atlantic Memorial Hospital Lekki stands as the premier private hospital in Lekki, Lagos. Our foundation was laid with the singular purpose of delivering world-class healthcare to the community of Lagos and the broader Nigerian populace.
          </p>

          <p className="text-base text-gray-700 leading-relaxed mb-8 max-w-xl">
            Established by a physician with medical training and experience practicing in the US, along with access to expert consultation and up-to-date research. Markedly, he has teamed up with bright and
          </p>

          <div className="flex space-x-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-lg">
              Learn More
            </button>
            <button className="bg-gray-800 text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-900 transition-colors shadow-lg">
              Our Services
            </button>
            <button className="bg-red-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-red-600 transition-colors shadow-lg">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
