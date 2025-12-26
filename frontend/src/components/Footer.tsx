// import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import EthaLogo from '../assets/img/etta-replace1-removebg-preview.png';

const Footer = () => {
  return (
    <footer className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
          {/* Logo & Address Section */}
          <div className="text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 sm:gap-3 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center">
                <img
                  src={EthaLogo}
                  alt="Etha-Atlantic Memorial Logo"
                  className="w-10 h-10"
                />
              </div>
              <div className="text-center sm:text-left lg:text-left">
                <h1 className="text-lg font-bold tracking-tight">ETHA-ATLANTIC</h1>
                <p className="text-xs font-semibold tracking-wider">MEMORIAL</p>
              </div>
            </div>
            <address className="not-italic text-base leading-relaxed text-center lg:text-left">
              <strong>22 Abioro Street, Ikorodu,</strong><br />
              <strong> Lagos State</strong><br />
              Nigeria
            </address>
          </div>

          {/* About Us Section */}
          <div className="text-center lg:text-left">
            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">About Us</h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <a href="#about" className="hover:text-gray-200 transition-colors text-sm block">
                  About Etha-Atlantic Memorial
                </a>
              </li>
              <li>
                <a href="#news" className="hover:text-gray-200 transition-colors text-sm block">
                  News & Articles
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-gray-200 transition-colors text-sm block">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Useful Links Section */}
          <div className="text-center lg:text-left">
            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Useful Links</h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <a href="#services" className="hover:text-gray-200 transition-colors text-sm block">
                  Services
                </a>
              </li>
              <li>
                <a href="#packages" className="hover:text-gray-200 transition-colors text-sm block">
                  Healthcare Packages
                </a>
              </li>
              <li>
                <a href="#appointment" className="hover:text-gray-200 transition-colors text-sm block">
                  Book an Appointment
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social Section */}
          <div className="text-center lg:text-left">
            <p className="text-sm leading-normal mb-4">
              Call us now if you are in a medical emergency need, we will reply swiftly and provide you with a medical aid.
            </p>
            <p className="text-2xl md:text-3xl font-bold mb-2">09067784278</p>
            <p className="text-sm font-bold mb-4 md:mb-6">hello@ethaatlantic.com</p>

            <p className="text-sm mb-3">Visit us as social advisor! 💬</p>
            <div className="flex justify-center lg:justify-start space-x-3">
              <a
                href="#"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 hover:bg-gray-100 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 hover:bg-gray-100 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 hover:bg-gray-100 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-[#2b2e32] text-sm">
            © 2025 Chardev | All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;