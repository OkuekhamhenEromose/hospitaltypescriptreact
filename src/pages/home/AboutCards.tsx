
const AboutCards = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-blue-600 text-white py-8 px-8 rounded-t-lg text-center">
          <p className="text-xl leading-relaxed max-w-4xl mx-auto">
            Etta-Atlantic Memorial Hospital Lekki Lagos is the best hospital in Lagos, Nigeria. Our standards are in line with the World Health Organization and principled on evidence-based medicine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          <div className="bg-blue-600 text-white p-8">
            <h3 className="text-2xl font-bold mb-4 border-b-2 border-white pb-2 inline-block">
              Professional Team
            </h3>
            <p className="text-base leading-relaxed">
              We have teamed up with highly qualified physicians and health professionals to provide excellent care to all our patients. Additionally, we pride ourselves on providing quality and effective medical treatment for everyone. Our Medical Services are tailored to provide the best health care for you and your loved ones.
            </p>
          </div>

          <div className="bg-blue-500 text-white p-8">
            <h3 className="text-2xl font-bold mb-4 border-b-2 border-white pb-2 inline-block">
              Advanced Technology
            </h3>
            <p className="text-base leading-relaxed">
              We are using advanced electronic medical records systems for better services and fast delivery of good healthcare services in Lagos. Telemedicine gives us access to the best medical professionals all over the world. We also partner with hospitals and healthcare centres in Lagos, Nigeria and across the globe.
            </p>
          </div>

          <div className="bg-blue-500 text-white p-8">
            <h3 className="text-2xl font-bold mb-4 border-b-2 border-white pb-2 inline-block">
              Great Facilities
            </h3>
            <p className="text-base leading-relaxed">
              We use standard medical and imaging equipment including BiPAP ventilators, CTG, defibrillators, ultrasound scan machines, ECG, cardiac monitors, infusion pumps etc. Also, our hospital in Ikate Lekki includes world-class hospital furniture and a well-equipped medical laboratory to cater to all your health needs.
            </p>
          </div>

          <div className="bg-red-500 text-white p-8">
            <h3 className="text-2xl font-bold mb-4 border-b-2 border-white pb-2 inline-block">
              Speak to a Doctor
            </h3>
            <p className="text-base leading-relaxed mb-6">
              Book an appointment to see a Medical Doctor for all your health concerns.
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-lg w-full">
              BOOK NOW
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCards;
