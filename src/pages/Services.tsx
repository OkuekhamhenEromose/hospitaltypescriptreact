const Services = () => {
  const emergencyServices = [
    "Seizures",
    "Loss of consciousness",
    "Acute severe asthma (asthma attack)",
    "Shock",
    "Trauma/ Lacerations/ Cut injuries",
  ];

  const internalMedicine = [
    "Stroke",
    "Diabetes and its complications",
    "Thyroid disorders",
    "Kidney failure/ disease",
    "Hypertension and its complications",
  ];

  const generalPractice = [
    "Peptic ulcer disease/ gastritis",
    "Malaria",
    "Enteric fever",
    "Diarrhea and complications",
    "Sepsis",
  ];

  // New services from the first image
  const gynecologyObstetrics = [
    "Antenatal services",
    "Vaginal deliveries",
    "Caeserean section",
    "Menstrual disorder",
    "Infertility",
    "Myomectomy",
    "Tubal sterilization",
    "Salpingectomy for ectopic pregnancy",
    "PCOS procedure"
  ];

  const generalSurgery = [
    "Mastectomy",
    "Hernia repair",
    "Lumpectomy",
    "Appendectomy",
    "Exploratory laparotomy",
    "Cholecystectomy",
    "Thyroidectomy"
  ];

  const orthopedicSurgery = [
    "Joint fusion",
    "Fracture repair/ Decompression",
    "Spinal decompression/ Laminectomy/ Vertebroglasty",
    "Knee athroscopy",
    "Club foot correction"
  ];

  const dermatology = [
    "Rashes/ Urticaria",
    "Fungal/ Bacterial skin infection",
    "Skin growth & lesions",
    "Acne"
  ];

  const laboratoryDiagnostics = [
    "Fully functional medical laboratory",
    "Ultrasound scans",
    "Electrocardiogram",
    "Cardiotocograph"
  ];

  const pharmacy = [
    "Ambulance services"
  ];

  // New services from the second image
  const plasticSurgery = [
    "Burns",
    "Keloid escharification",
    "Surgical debridement",
    "Lipoma removal"
  ];

  const acuteIllnesses = [
    "Pneumonia",
    "Delirium",
    "Loss of consciousness",
    "Sepsis and shock etc"
  ];

  const hematology = [
    "Sickle cell disease",
    "Blood transfusion",
    "Bleeding disorders",
    "Blood cancers/ lymphoproliferative disorders",
    "Chemotherapy"
  ];

  const cardiology = [
    "Chest pain",
    "Heart failure",
    "Irregular heartbeats",
    "Defibrillator"
  ];

  const gastroenterology = [
    "Inflammatory bowel disease in complications",
    "Upper and lower GI bleeds",
    "Liver disease",
    "Pancreatic disease"
  ];

  const nephrology = [
    "Kidney disease",
    "Hypertension",
    "Electrolyte abnormalities"
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section with Background Image */}
      <section className="relative bg-blue-500 py-16 overflow-hidden pt-48">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Medical services background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            Our Services
          </h1>
        </div>
      </section>

      {/* Main Content Section */}
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-16 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-16">
          {/* LEFT TEXT */}
          <div className="lg:col-span-7">
            <p className="text-gray-700 text-2xl leading-normal">
              We offer a wide range of general medical services in Ikorodu Lagos
              and Nigeria at large, which involves the management of chronic and
              acute illnesses.
            </p>
          </div>

          {/* RIGHT TEXT */}
          <div className="lg:col-span-5 flex justify-end">
            <p className="text-gray-700 text-sm font-semibold leading-relaxed max-w-md">
              Our Medical Centre in Lagos is well equipped with modern medical
              equipment and professionals ready to attend to your healthcare
              needs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 mx-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Emergency Services
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {emergencyServices.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Internal Medicine
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {internalMedicine.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              General Practice
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {generalPractice.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 mx-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Gynecology Obstetrics
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {gynecologyObstetrics.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              General Surgery
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {generalSurgery.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Orthopedic Surgery
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {orthopedicSurgery.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 mx-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Dermatology
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {dermatology.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Laborotory Diagnostics
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {laboratoryDiagnostics.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Pharmacy
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {pharmacy.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 mx-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Plastic Surgery
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {plasticSurgery.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Acute Illnesses
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {acuteIllnesses.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Hematology
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {hematology.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 mx-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Cardiology
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {cardiology.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Gastro Enterology
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {gastroenterology.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Nephrology
            </h2>
            <div className="w-16 h-1 bg-red-500 mb-4"></div>
            <ul className="space-y-1">
              {nephrology.map((service, index) => (
                <li
                  key={index}
                  className="text-gray-700 text-base leading-relaxed"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
