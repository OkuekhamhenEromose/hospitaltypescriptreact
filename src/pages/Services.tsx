import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import ServiceDoctor from "../assets/img/servicedoctor.jpg"

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

  // Animation variants
  const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const serviceCardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        type: "spring", 
        duration: 0.6, 
        bounce: 0.3 
      },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section with Background Image */}
      <section className="relative bg-[#0052a4] py-12 overflow-hidden pt-16">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Medical services background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <motion.h1 
            className="text-6xl md:text-7xl lg:text-8xl mt-4 font-bold text-white"
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            Our Services
          </motion.h1>
        </div>
      </section>

      {/* Main Content Section */}
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-16 font-sans">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* LEFT TEXT */}
          <motion.div className="lg:col-span-7" variants={textVariants}>
            <p className="text-gray-700 text-2xl leading-normal">
              We offer a wide range of general medical services in Ikorodu Lagos
              and Nigeria at large, which involves the management of chronic and
              acute illnesses.
            </p>
          </motion.div>

          {/* RIGHT TEXT */}
          <motion.div className="lg:col-span-5 flex justify-end" variants={textVariants}>
            <p className="text-gray-700 text-sm font-semibold leading-relaxed max-w-md">
              Our Medical Centre in Lagos is well equipped with modern medical
              equipment and professionals ready to attend to your healthcare
              needs.
            </p>
          </motion.div>
        </motion.div>

        {/* Services Grid Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* First Row */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 mx-8" variants={containerVariants}>
            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
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
            </motion.div>

            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
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
            </motion.div>

            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
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
            </motion.div>
          </motion.div>

          {/* Second Row */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 mx-8" variants={containerVariants}>
            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
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
            </motion.div>

            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
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
            </motion.div>

            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
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
            </motion.div>
          </motion.div>

          {/* Third Row */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 mx-8" variants={containerVariants}>
            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
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
            </motion.div>

            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Laboratory Diagnostics
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
            </motion.div>

            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
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
            </motion.div>
          </motion.div>

          {/* Fourth Row */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 mx-8" variants={containerVariants}>
            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
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
            </motion.div>

            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
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
            </motion.div>

            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
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
            </motion.div>
          </motion.div>

          {/* Fifth Row */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 mx-8" variants={containerVariants}>
            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
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
            </motion.div>

            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Gastroenterology
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
            </motion.div>

            <motion.div variants={serviceCardVariants} whileHover={{ scale: 1.02, y: -5 }}>
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
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom Section with Image and Text */}
        <motion.div 
          className="mt-16 grid grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Left Text Content */}
          <motion.div className="mb-20" variants={fadeInLeft}>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              We have different healthcare plans, ranging from health checks, lifestyle plans, UTI checks to sexual health.
            </p>

            <div className="mb-8">
              <h2 className="text-gray-700 text-lg mb-2">
                <span className="font-semibold">Healthcare/ Medical Services</span> <span className="text-gray-500">in Ikorodu Lagos made simple!</span>
              </h2>
              <p className="text-blue-500 text-2xl font-bold">
                Click Below to choose the one suitable for you.
              </p>
            </div>

            <motion.button 
              className="border-2 border-blue-500 text-blue-500 px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Our Packages
            </motion.button>
          </motion.div>

          {/* Right Image - Fades in from right */}
          <motion.div variants={fadeInRight}>
            <img
              src={ServiceDoctor}
              alt="Medical professionals at work"
              className="w-full h-80 object-cover mb-4"
            />
            <p className="text-gray-600 text-sm">
              Our professionals offering medical services in Lagos...
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;