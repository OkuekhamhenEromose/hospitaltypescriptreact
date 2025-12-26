import medicalIllustration from "../../assets/img/consult-doctor-540x360.webp";

const BookAppointment = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
          {/* Left Column - Illustration */}
          <div className="flex justify-center mb-24">
            <img
              src={medicalIllustration}
              alt="Medical consultation"
              className="w-[320px] max-w-md"
            />
          </div>

          {/* Middle Column - Main Content */}
          <div className="lg:col-span-1">
            <h1 className="text-lg text-[#2b2e32] lg:text-xl font-semibold text-foreground mb-2">
              Are you in need of one of the best private hospitals in Lagos?
            </h1>
            <p className="text-lg text-[#2b2e32] text-foreground mb-6">
              Search no more! You are at the right place.
            </p>
            <div className="border border-gray-200 p-6">
              <p className="text-foreground text-[#2b2e32] leading-relaxed font-mono text-sm">
                Etha-Atlantic Memorial Hospital Ikorodu Lagos has the best
                medical specialists on ground with impeccable track records. We
                pay attention to standards and follow best practices.
              </p>
            </div>
          </div>

          {/* Right Column - CTA */}
          <div className="max-w-sm flex flex-col items-start mb-24">
            <h2 className="text-2xl text-[#2b2e32] font-semibold text-foreground mb-4">
              Speak to a Doctor
            </h2>
            <div className="w-24 h-1 bg-blue-600 mb-6"></div>
            <p className="text-foreground text-[#2b2e32] mb-8 text-left leading-relaxed">
              Book an appointment to see a medical doctor for all your health
              concerns.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-xs hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 sm:w-auto">
              BOOK AN APPOINTMENT
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookAppointment;
