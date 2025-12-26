
const AboutCards = () => {
  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 md:px-8">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 ">
        {/* Top Banner Section - Responsive */}
        <div className="bg-[#177fed] text-white p-12 sm:p-14 px-4 sm:px-6 md:px-8 lg:px-16 text-center">
          <p className="text-base sm:text-normal md:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto pb-2">
            Etta-Atlantic Memorial Hospital Lekki Lagos is the best hospital in Lagos, Nigeria. Our standards are in line with the World Health Organization and principled on evidence-based medicine.
          </p>
        </div>

        {/* Cards Grid - Responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Card 1: Professional Team */}
          <div className="bg-[#1378e5] text-white p-6 sm:p-8 md:p-10 px-4 sm:px-6 md:px-8 lg:px-12">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 pb-2 border-b border-white/30 inline-block">
              Professional Team
            </h3>
            <p className="text-sm sm:text-sm md:text-sm leading-relaxed">
              We have teamed up with highly qualified physicians and health professionals to provide excellent care to all our patients. Additionally, we pride ourselves on providing quality and effective medical treatment for everyone. Our Medical Services are tailored to provide the best health care for you and your loved ones.
            </p>
          </div>

          {/* Card 2: Advanced Technology */}
          <div className="bg-[#177fed] text-white p-6 sm:p-8 md:p-10 px-4 sm:px-6 md:px-8 lg:px-12">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 pb-2 border-b border-white/30 inline-block">
              Advanced Technology
            </h3>
            <p className="text-sm sm:text-sm md:text-sm leading-relaxed">
              We are using advanced electronic medical records systems for better services and fast delivery of good healthcare services in Lagos. Telemedicine gives us access to the best medical professionals all over the world. We also partner with hospitals and healthcare centres in Lagos, Nigeria and across the globe.
            </p>
          </div>

          {/* Card 3: Great Facilities */}
          <div className="bg-[#1378e5] text-white p-6 sm:p-8 md:p-10 px-4 sm:px-6 md:px-8 lg:px-12">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 pb-2 border-b border-white/30 inline-block">
              Great Facilities
            </h3>
            <p className="text-sm sm:text-sm md:text-sm leading-relaxed">
              We use standard medical and imaging equipment including BiPAP ventilators, CTG, defibrillators, ultrasound scan machines, ECG, cardiac monitors, infusion pumps etc. Also, our hospital in Ikorodu includes world-class hospital furniture and a well-equipped medical laboratory to cater to all your health needs.
            </p>
          </div>

          {/* Card 4: Speak to a Doctor - Red Card */}
          <div className="bg-red-500 text-white p-6 sm:p-8 md:p-10 px-4 sm:px-6 md:px-8 lg:px-12 rounded-b-lg lg:rounded-b-none">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-5 border-b-2 border-white pb-2 inline-block">
              Speak to a Doctor
            </h3>
            <p className="text-base sm:text-base md:text-base leading-relaxed mb-8 sm:mb-7">
              Book an appointment to see a Medical Doctor for all your health concerns.
            </p>
            <button className="bg-blue-600 text-white px-5 sm:px-6 md:px-8 py-3 sm:py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg text-sm sm:text-base md:text-base">
              BOOK NOW
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCards;

// const AboutCards = () => {
//   return (
//     <section className="bg-gradient-to-b from-white to-gray-50">
//       <div className="container mx-auto px-4 sm:px-6 md:px-8">
//         <div className="bg-[#1378e5]">
//           <div className="bg-[#177fed] mx-4 text-white p-12 sm:p-14 md:p-16 px-4 sm:px-6 md:px-8 lg:px-16 text-center">
//           <p className="text-base sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto">
//             Etta-Atlantic Memorial Hospital Lekki Lagos is the best hospital in Lagos, Nigeria. Our standards are in line with the World Health Organization and principled on evidence-based medicine.
//           </p>
//         </div>

//         {/* Cards Grid - Responsive layout */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
//           {/* Card 1: Professional Team */}
//           <div className="bg-[#1378e5] text-white p-12 sm:p-14 md:p-16 px-4 sm:px-6 md:px-12">
//             <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 pb-2 border-b border-white/30 inline-block">
//               Professional Team
//             </h3>
//             <p className="text-xs sm:text-sm md:text-sm leading-normal sm:leading-relaxed">
//               We have teamed up with highly qualified physicians and health professionals to provide excellent care to all our patients. Additionally, we pride ourselves on providing quality and effective medical treatment for everyone. Our Medical Services are tailored to provide the best health care for you and your loved ones.
//             </p>
//           </div>

//           {/* Card 2: Advanced Technology */}
//           <div className="bg-[#177fed] text-white p-12 sm:p-14 md:p-16 px-4 sm:px-6 md:px-12">
//             <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 pb-2 border-b border-white/30 inline-block">
//               Advanced Technology
//             </h3>
//             <p className="text-xs sm:text-sm md:text-sm leading-normal sm:leading-relaxed">
//               We are using advanced electronic medical records systems for better services and fast delivery of good healthcare services in Lagos. Telemedicine gives us access to the best medical professionals all over the world. We also partner with hospitals and healthcare centres in Lagos, Nigeria and across the globe.
//             </p>
//           </div>

//           {/* Card 3: Great Facilities */}
//           <div className="bg-[#1378e5] text-white p-12 sm:p-14 md:p-16 px-4 sm:px-6 md:px-12">
//             <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 pb-2 border-b border-white/30 inline-block">
//               Great Facilities
//             </h3>
//             <p className="text-xs sm:text-sm md:text-sm leading-normal sm:leading-relaxed">
//               We use standard medical and imaging equipment including BiPAP ventilators, CTG, defibrillators, ultrasound scan machines, ECG, cardiac monitors, infusion pumps etc. Also, our hospital in Ikorodu includes world-class hospital furniture and a well-equipped medical laboratory to cater to all your health needs.
//             </p>
//           </div>
//         </div>
//         {/* Top Banner Section - Responsive */}
        

//           {/* Card 4: Speak to a Doctor - Red Card */}
//           <div className="bg-red-500 text-white p-12 sm:p-14 md:p-16 px-4 sm:px-6 md:px-12 rounded-b-lg sm:rounded-b-none lg:rounded-r-lg">
//             <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 border-b-2 border-white pb-2 inline-block">
//               Speak to a Doctor
//             </h3>
//             <p className="text-sm sm:text-base md:text-base leading-relaxed mb-4 sm:mb-6">
//               Book an appointment to see a Medical Doctor for all your health concerns.
//             </p>
//             <button className="bg-blue-600 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg w-full text-sm sm:text-base md:text-base">
//               BOOK NOW
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AboutCards;







// const AboutCards = () => {
//   return (
//     <section className="py-16 bg-gradient-to-b from-white to-gray-50">
//       <div className="container mx-auto px-8">
//         <div className="bg-[#177fed] text-white py-8 px-16 text-center">
//           <p className="text-xl leading-relaxed max-w-4xl mx-auto">
//             Etta-Atlantic Memorial Hospital Lekki Lagos is the best hospital in Lagos, Nigeria. Our standards are in line with the World Health Organization and principled on evidence-based medicine.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-0 px-8">
//           <div className="bg-[#1378e5] text-white p-8 px-12">
//             <h3 className="text-2xl font-bold mb-2 pb-2 inline-block">
//               Professional Team
//             </h3>
//             <p className="text-sm leading-normal">
//               We have teamed up with highly qualified physicians and health professionals to provide excellent care to all our patients. Additionally, we pride ourselves on providing quality and effective medical treatment for everyone. Our Medical Services are tailored to provide the best health care for you and your loved ones.
//             </p>
//           </div>

//           <div className="bg-[#177fed] text-white p-8 px-12">
//             <h3 className="text-2xl font-bold mb-2 pb-2 inline-block">
//               Advanced Technology
//             </h3>
//             <p className="text-sm leading-normal">
//               We are using advanced electronic medical records systems for better services and fast delivery of good healthcare services in Lagos. Telemedicine gives us access to the best medical professionals all over the world. We also partner with hospitals and healthcare centres in Lagos, Nigeria and across the globe.
//             </p>
//           </div>

//           <div className="bg-[#1378e5] text-white p-8 px-12">
//             <h3 className="text-2xl font-bold mb-2 pb-2 inline-block">
//               Great Facilities
//             </h3>
//             <p className="text-sm leading-normal">
//               We use standard medical and imaging equipment including BiPAP ventilators, CTG, defibrillators, ultrasound scan machines, ECG, cardiac monitors, infusion pumps etc. Also, our hospital in Ikorodu includes world-class hospital furniture and a well-equipped medical laboratory to cater to all your health needs.
//             </p>
//           </div>

//           <div className="bg-red-500 text-white p-8">
//             <h3 className="text-2xl font-bold mb-4 border-b-2 border-b-blue-700 border-white pb-2 inline-block">
//               Speak to a Doctor
//             </h3>
//             <p className="text-base leading-relaxed mb-6">
//               Book an appointment to see a Medical Doctor for all your health concerns.
//             </p>
//             <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg w-full">
//               BOOK NOW
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AboutCards;