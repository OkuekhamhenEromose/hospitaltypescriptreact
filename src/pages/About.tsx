import ethadoc from "../assets/img/etha-doctor2.webp"

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="relative bg-blue-600 py-14 overflow-hidden pt-32">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Medical background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 md:px-8 pt-12 py-4 lg:px-12 relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            About Us
          </h1>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* About Hospital Column */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                About Etha-Atlantic Memorial Hospital
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-6">
                Etha-Atlantic Memorial Hospital Ikorodu Lagos was established with the goal of providing an international level of health care for all Nigerians.
              </p>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                Etha-Atlantic Memorial Hospital was established by physicians with training in the US, they have teamed up with bright and dedicated Nigerian physicians and other allied health professionals to provide excellent care based on standards set by the World Health Organization
              </p>
            </div>

            {/* Mission Column */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                In a country with scarce resources, especially where physical and mental health are concerned, we have set out to be the exception. A sick patient is a vulnerable patient and the role of a physician or medical care personnel is to provide an appropriate, timely and effective diagnosis with a treatment plan while displaying compassion, empathy and humility. We will work tirelessly to be that Hospital for you and your loved ones
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Doctor Image and Info */}
            <div className="w-full lg:w-auto flex-shrink-0">
              <img
                src={ethadoc}
                alt="Dr. Justin Ngene"
                className="w-full lg:w-[380px] h-auto object-cover"
              />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-6">
                Dr. John Doe
              </h3>
              <p className="text-base md:text-lg text-gray-500 mt-2">
                Medical Director
              </p>
            </div>

            {/* Doctor Bio */}
            <div className="flex-1">
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-6">
                <strong className="text-gray-900">Dr. John Doe</strong> studied at the University of Bridgeport in Connecticut, USA. He then attended medical school at University of Illinois, College of Medicine where he fell in love with Internal Medicine with a focus in acutely ill patients in the hospital. Subsequently, Dr. Justin did his Internal Medicine residency at Rutgers University, the Medical School of New Jersey. He became board certificated in Internal Medicine and is, presently, a Diplomate of the American board of Internal Medicine. He has been practicing Internal Medicine/Acute Hospitalist Medicine since 2010.
              </p>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                In 2018, he committed to making a contribution to the health sector in the best way. The goal being 'reverse MEDICAL tourism' affordable for everyone. His vision is to provide quality medical care in line with the World Health Organization standards and principled on evidence-based medicine.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
