
const AboutUs = () => {
  return (
    <div>
      <section className="relative bg-gradient-to-r from-blue-500 to-blue-600 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Medical background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-6xl font-bold text-white">About Us</h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                About Etta-Atlantic Memorial Hospital
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Etta-Atlantic Memorial Hospital Lekki Lagos was established with the goal of providing an international level of health care for all Nigerians.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Etta-Atlantic Memorial Hospital was established by physicians with training in the US, they have teamed up with bright and dedicated Nigerian physicians and other allied health professionals to provide excellent care.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                In a country with scarce resources, especially where physical and mental health are concerned, we have set out to be the exception. A sick patient is a vulnerable patient and the role of a physician or medical care personnel is to provide an appropriate, timely and effective diagnosis with a treatment plan while displaying compassion, empathy and humility.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8 bg-gray-50 p-8 rounded-lg">
            <div className="md:w-1/3">
              <img
                src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2"
                alt="Dr. Justin Ngene"
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <h3 className="text-2xl font-bold text-gray-900 mt-6">Dr. Justin Ngene</h3>
              <p className="text-lg text-gray-600 mt-2">Medical Director</p>
            </div>

            <div className="md:w-2/3">
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                <strong>Dr. Justin Ngene</strong> studied at the University of Bridgeport in Connecticut, USA. He then attended medical school at University of Illinois, College of Medicine where he fell in love with Internal Medicine with a focus in acutely ill patients in the hospital. Subsequently, Dr. Justin did his Internal Medicine residency at Rutgers University, the Medical School of New Jersey. He became board certificated in Internal Medicine and is, presently, a Diplomate of the American board of Internal Medicine. He has been practicing Internal Medicine/Acute Hospitalist Medicine since 2010.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
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
