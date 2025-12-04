// MobileNav.tsx - Mobile navigation with smooth slide animation
import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HeaderLogo from "../assets/img/etta-replace1-removebg-preview.png";

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogoClick: () => void;
  user: any;
  onLoginClick: () => void;
}
const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onToggle,
  currentPage,
  onNavigate,
  onLogoClick,
  user,
  onLoginClick,
}) => {
  const navLinks = [
    "home",
    "about us",
    "services",
    "packages",
    "blog",
    "contact",
  ];

  const handleNavClick = (page: string) => {
    onNavigate(page);
    onToggle(); // Close menu after navigation
  };

  const handleLogoClickInternal = () => {
    onLogoClick();
    onToggle(); // Close menu after logo click
  };

 const [isHovered, setIsHovered] = useState(false);


  

  return (
    <>
      {/* Hamburger Button - Always visible when closed */}
      {!isOpen && (
  <motion.button
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onToggle}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    className="fixed top-4 left-4 z-50 p-3 bg-gray-100 rounded-full shadow-lg hover:shadow-xl transition-shadow"
    aria-label="Open menu"
  >
    
    <div className="flex flex-col space-y-2.5 w-8">
        
      <motion.div
        animate={{
          backgroundColor: isHovered ? "#2563eb" : "#1f2937",
          y: isHovered ? -2 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-0.5 w-full rounded-full"
      />
      <motion.div
        animate={{
          backgroundColor: isHovered ? "#2563eb" : "#1f2937",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-0.5 w-full rounded-full"
      />
      <motion.div
        animate={{
          backgroundColor: isHovered ? "#2563eb" : "#1f2937",
          y: isHovered ? 2 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-0.5 w-full rounded-full"
      />
    </div>
    
  </motion.button>
  
  
)}


      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Slide-in Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed top-0 left-0 h-full w-80 bg-gradient-to-br from-white via-gray-50 to-white shadow-2xl z-50 flex flex-col"
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={onToggle}
              className="absolute top-6 right-6 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="w-7 h-7 text-gray-800" strokeWidth={2.5} />
            </motion.button>

            {/* Logo Section */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={handleLogoClickInternal}
              className="flex flex-col items-center pb-3 px-6 border-b border-gray-200"
            >
              <div className="bg-white flex items-center justify-center p-4">
                <img
                  src={HeaderLogo}
                  alt="Etha-Atlantic Memorial Logo"
                  className="w-8 h-8"
                />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                  ETHA-ATLANTIC
                </h1>
                <p className="text-xs font-semibold text-gray-700 tracking-wider">
                  MEMORIAL
                </p>
              </div>
            </motion.button>

            {/* Book Appointment Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="px-10 pt-3 pb-4 mx-12"
            >
              <button className="w-full text-xs bg-red-500 text-white py-2 rounded-full font-semibold hover:bg-red-600 transition-all shadow-md hover:shadow-lg">
                Book Appointment
              </button>
            </motion.div>

            {/* Navigation Links */}
            <nav className="flex-1 px-6 py-4 overflow-y-auto">
              <ul>
                {navLinks.map((page, index) => (
                  <motion.li
                    key={page}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    <button
                      onClick={() => handleNavClick(page)}
                      className={`w-full text-center px-4 py-3 rounded-lg font-semibold text-sm uppercase transition-all ${
                        currentPage === page
                          ? "text-blue-600"
                          : "text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      {page}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Sign In Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="px-6 py-6 border-t border-gray-200"
            >
              {!user && (
                <button
                  onClick={() => {
                    onLoginClick();
                    onToggle();
                  }}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  Sign In
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNav;
