// import React from 'react';
import { Activity, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-blue-600 text-white">
      <div className="container mx-auto px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-red-500">
                <Activity className="w-8 h-8 text-red-500" strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">ETHA-ATLANTIC</h1>
                <p className="text-xs font-semibold tracking-wider">MEMORIAL</p>
              </div>
            </div>
            <address className="not-italic text-base leading-relaxed">
              <strong>22 Abioro Street, Ikorodu, Lagos State</strong><br />
              Nigeria
            </address>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6">About Us</h3>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="hover:text-gray-200 transition-colors">
                  About Etha-Atlantic Memorial
                </a>
              </li>
              <li>
                <a href="#news" className="hover:text-gray-200 transition-colors">
                  News & Articles
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-gray-200 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6">Useful Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="hover:text-gray-200 transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#packages" className="hover:text-gray-200 transition-colors">
                  Healthcare Packages
                </a>
              </li>
              <li>
                <a href="#appointment" className="hover:text-gray-200 transition-colors">
                  Book an Appointment
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm leading-normal mb-4">
              Call us now if you are in a medical emergency need, we will reply swiftly and provide you with a medical aid.
            </p>
            <p className="text-3xl font-bold mb-2">09067784278</p>
            <p className="text-lg mb-6">hello@ethaatlantic.com</p>

            <p className="text-sm mb-3">Visit us on social networks:</p>
            <div className="flex space-x-3">
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
