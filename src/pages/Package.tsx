import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import PackageDoctor from "../assets/img/packagedoctor2.jpg";
import EthaPackages from "../assets/img/etha-packages1-removebg-preview.png";

const Packages = () => {
  const healthCheckPackages = {
    silver: [
      "General Physical Examination",
      "Body Mass Index",
      "Blood Pressure Check",
      "Random Blood Sugar",
      "Kidney Function Test",
      "Retroviral Screening",
      "Helicobacter Pylori",
      "Urinalysis",
      "Complete Blood Count",
    ],
    gold: [
      "General Physical Examination",
      "Body Mass Index",
      "Blood Pressure Check",
      "Random Blood Sugar",
      "Erythrocyte Sedimentation Rate",
      "Helicobacter Pylori",
      "Retroviral Screening",
      "Liver Function Test",
      "Complete Blood Count",
      "Urinalysis",
      "Kidney Function Test",
      "Full Lipid Profile",
      "Electrocardiogram",
    ],
    platinum: [
      "General Physical Examination",
      "Body Mass Index",
      "Blood Pressure Check",
      "Hba1C (Diabetic Screen)",
      "Erythrocyte Sedimentation Rate",
      "Helicobacter Pylori",
      "Retroviral Screening",
      "Troponin",
      "Electrocardiogram",
      "Complete Blood Count",
      "Urinalysis",
      "Thyroid Stimulating Hormone",
      "Kidney Function Test",
      "Liver Function Test",
      "Full Lipid Profile",
    ],
  };

  const sexualHealth = {
    basic: ["Syphilis", "Gonorrhea", "HIV", "Hepatitis B", "Hepatitis C"],
    comprehensive: [
      "Chlamydia",
      "Gonorrhea",
      "HIV",
      "Hepatitis B",
      "Hepatitis C",
      "Syphilis",
      "Trichomoniasis",
    ],
    comprehensivePlus: [
      "Chlamydia",
      "Gonorrhea",
      "HIV",
      "Hepatitis B",
      "Hepatitis C",
      "Syphilis",
      "Trichomoniasis",
      "Females Pap Smear",
      "Herpes Profile",
      "HPV Vaccine (optional) for Negative Pap Smear Test",
      "Hepatitis B Vaccine",
    ],
  };

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

  const packageCardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        duration: 0.6,
        bounce: 0.3,
      },
    },
  };

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.8,
        bounce: 0.4,
      },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-blue-700 py-12 overflow-hidden pt-12">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Medical services background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <motion.h1
            className="text-6xl mt-4 md:text-5xl lg:text-6xl font-bold text-white"
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            Our Packages
          </motion.h1>
        </div>
      </section>

      <div className="container mx-auto px-12 py-16">
        <motion.div
          className="mb-20"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <motion.div variants={fadeInLeft}>
              <h1 className="text-5xl md:text-5xl lg:text-6xl font-extralight text-[#2b2e32]  leading-tight tracking-tight mb-4">
                Select any of
                <br />
                <span className="text-blue-700 font-bold mb-3">
                  our healthcare plans
                </span>
                <div className="w-20 h-1 bg-blue-700 mb-6"></div>
              </h1>

              <div className="space-y-8">
                <p className="text-black font-light text-xl leading-relaxed tracking-wide">
                  Healthcare services in Ikorodu Lagos made simple!
                </p>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              variants={fadeInRight}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                <img
                  src={EthaPackages}
                  alt="Etha-Atlantic Memorial Packages"
                  className="relative w-full max-w-lg h-auto object-contain"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
        {/* Health Check Packages Section */}
        <motion.div
          className="mb-24"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Health Check Packages
          </h2>
          <div className="w-20 h-1 bg-blue-500 mb-12"></div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {["silver", "gold", "platinum"].map((type) => (
              <motion.div
                key={type}
                variants={packageCardVariants}
                whileHover={{
                  scale: 1.02,
                  y: -5,
                  transition: { duration: 0.3 },
                }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
                  {type === "silver"
                    ? "Silver"
                    : type === "gold"
                    ? "Gold"
                    : "Platinum"}
                </h2>
                <div className="w-12 h-1 bg-red-500 mb-6"></div>
                <ul className="space-y-1">
                  {healthCheckPackages[
                    type as keyof typeof healthCheckPackages
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="text-gray-700 text-base leading-relaxed"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Sexual Health Panel */}
        <motion.div
          className="mb-24"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Sexual Health Panel
          </h2>
          <div className="w-20 h-1 bg-blue-500 mb-12"></div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {["basic", "comprehensive", "comprehensivePlus"].map((type) => (
              <motion.div
                key={type}
                variants={packageCardVariants}
                whileHover={{
                  scale: 1.02,
                  y: -5,
                  transition: { duration: 0.3 },
                }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
                  {type === "basic"
                    ? "Basic"
                    : type === "comprehensive"
                    ? "Comprehensive"
                    : "Comprehensive Plus"}
                </h2>
                <div className="w-12 h-1 bg-red-500 mb-6"></div>
                <ul className="space-y-1">
                  {sexualHealth[type as keyof typeof sexualHealth].map(
                    (item, index) => (
                      <li
                        key={index}
                        className="text-gray-700 text-base leading-relaxed"
                      >
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Consultation Section with Styled Quote */}
        <motion.div
          className="bg-white py-16"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* Package Doctor Image - Fades in from left */}
              <motion.div variants={fadeInLeft}>
                <img
                  src={PackageDoctor}
                  alt="Healthcare professional"
                  className="w-full h-60 object-cover"
                />
              </motion.div>

              {/* Middle Content */}
              <motion.div variants={textVariants}>
                <div className="bg-blue-500 text-white px-2 py-1 mb-6 rounded-sm">
                  <h2 className="text-xl font-medium">
                    Book for a Consultation, let a Specialist attend to you
                  </h2>
                </div>

                <p className="text-black font-light text-sm leading-relaxed mb-6">
                  If you have been looking for an affordable healthcare services
                  in Lagos, you may have found a place suitable for you.
                </p>

                <p className="text-black font-light text-sm leading-relaxed">
                  We have healthcare packages that suit your budget.
                </p>
              </motion.div>

              {/* Right Quote Section */}
              <motion.div
                className="p-6 rounded-lg relative pt-10"
                variants={textVariants}
              >
                {/* Styled Quotation Mark */}
                <svg
                  className="absolute -top-2 -left-2 w-24 h-24 text-gray-300 opacity-50"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18 7h-3l-2 4v6h6v-6h-3zM10 7H7L5 11v6h6v-6h-3z" />
                </svg>

                <p className="text-black font-light text-lg leading-loose">
                  Kindly select from any of our healthcare packages above or
                  Contact Us now.
                </p>

                <p className="text-black font-light text-lg leading-loose">
                  Our professional teams are on ground to attend to your medical
                  needs.
                </p>

                <p className="text-black text-base font-semibold">
                  Healthcare Services in Ikorodu Lagos made simple!
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Packages;
