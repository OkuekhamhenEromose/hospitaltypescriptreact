import { MapPin, Mail, Ambulance } from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import contactImg from "../assets/img/contact-us-illustration-540x355.webp";

const Contact = () => {
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

  const fadeInBottom: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  const zoomOut: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 1.0, 
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const formItemVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
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
      {/* Hero Section */}
      <section className="relative bg-blue-700 py-12 overflow-hidden pt-12">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Medical services background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 md:px-8 lg:px-8 relative z-10">
          <motion.h1 
            className="text-6xl mt-4 md:text-5xl lg:text-6xl font-bold text-white"
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            Contact Us
          </motion.h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-12">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Column - Form Section */}
            <div>
              <motion.h2 
                className="text-4xl font-bold text-gray-900 mb-4"
                variants={textVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                Send Us A Message
              </motion.h2>
              <motion.div 
                className="w-24 h-1 bg-blue-500 mb-8"
                variants={textVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              ></motion.div>

              <motion.p 
                className="text-gray-600 text-lg leading-relaxed mb-8"
                variants={textVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                If you would like to contact the best hospital in Lagos, kindly
                fill in the form below, and our customer care team will get back
                to you as soon as possible. You can also call or send us an
                email using the contact details provided on this page.
              </motion.p>

              <motion.form 
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <motion.div variants={formItemVariants}>
                  <label className="block text-black font-light text-sm mb-2">
                    Full Name <span className="text-blue-700">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full max-w-xl px-6 py-4 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </motion.div>

                <motion.div variants={formItemVariants}>
                  <label className="block text-black font-light text-sm mb-2">
                    Telephone Number <span className="text-blue-700">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full max-w-xl px-6 py-4 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </motion.div>

                <motion.div variants={formItemVariants}>
                  <label className="block text-black font-light text-sm mb-2">
                    Email Address <span className="text-blue-700">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full max-w-xl px-6 py-4 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </motion.div>

                <motion.div variants={formItemVariants}>
                  <label className="block text-black font-light text-sm mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="w-full max-w-xl px-6 py-4 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </motion.div>

                <motion.div variants={formItemVariants}>
                  <label className="block text-black font-light text-sm mb-2">
                    Message <span className="text-blue-700">*</span>
                  </label>
                  <textarea
                    rows={6}
                    className="w-full max-w-xl px-6 py-4 bg-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                </motion.div>

                <motion.button
                  type="submit"
                  className="bg-blue-500 text-xs hover:bg-blue-600 text-white font-semibold px-10 py-4 rounded-full transition duration-300 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  SUBMIT FORM
                </motion.button>
              </motion.form>
            </div>

            {/* Right Column - Contact Info */}
            <motion.div 
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {/* Contact Image - Fade in from bottom */}
              <motion.div 
                className="text-center"
                variants={fadeInBottom}
              >
                <img
                  src={contactImg}
                  alt="Contact illustration"
                  className="w-1/2 max-w-sm mx-auto mb-12"
                />
              </motion.div>

              {/* Contact Cards - Zoom out smoothly */}
              <motion.div 
                variants={zoomOut}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="space-y-12"
              >
                <motion.div 
                  className="flex flex-col items-center text-center"
                  // variants={contactCardVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <Ambulance className="w-12 h-12 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    EMERGENCY CONTACT
                  </h3>
                  <p className="text-black font-light text-lg">Call: +234(0)8083734008</p>
                </motion.div>

                <motion.div 
                  className="flex flex-col items-center text-center"
                  // variants={contactCardVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <MapPin className="w-12 h-12 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ADDRESS
                  </h3>
                  <p className="text-black font-light text-lg">
                    22 Abioro Street
                    <br />
                    Ikorodu,
                    <br />
                    Lagos State
                  </p>
                </motion.div>

                <motion.div 
                  className="flex flex-col items-center text-center"
                  // variants={contactCardVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <Mail className="w-12 h-12 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">EMAIL</h3>
                  <p className="text-black font-light text-lg">hello@ethaatlantic.com</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-16">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div variants={fadeInLeft}>
              <p className="text-black font-light text-2xl leading-none lg:leading-normal lg:mb-8 ">
                We have different healthcare plans, ranging from health checks,
                lifestyle plans, UTI checks to sexual health.
              </p>
            </motion.div>
            <motion.div variants={fadeInRight}>
              <p className="text-black font-light text-lg">
                <span className="font-semibold">Healthcare services</span> in
                Ikorodu Lagos made simple!
              </p>
              <p className="text-blue-500 text-2xl font-bold mb-6">
                Click Below to choose the one suitable for you.
              </p>
              <motion.button 
                className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold px-8 py-3 rounded-full transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Our Packages
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;