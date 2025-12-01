import { MapPin, Mail, Ambulance } from 'lucide-react';
import contactImg from '../assets/img/contact-us-illustration-540x355.webp';

const Contact = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <section className="relative bg-[#0052a4] py-12 overflow-hidden pt-16">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Medical services background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <h1 className="text-6xl mt-4 md:text-7xl lg:text-8xl font-bold text-white">
            Contact Us
          </h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Send Us A Message</h2>
              <div className="w-24 h-1 bg-blue-500 mb-8"></div>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                If you would like to contact the best hospital in Lagos, kindly fill in the form below, and
                our customer care team will get back to you as soon as possible. You can also call or
                send us an email using the contact details provided on this page.
              </p>

              <form className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Telephone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full px-6 py-4 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full px-6 py-4 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">Subject</label>
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-6 py-4 bg-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-10 py-4 rounded-full transition duration-300 shadow-lg"
                >
                  SUBMIT FORM
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div className="text-center">
                <img
                  src={contactImg}
                  alt="Contact illustration"
                  className="w-1/2 max-w-md mx-auto mb-12"
                />
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Ambulance className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">EMERGENCY CONTACT</h3>
                <p className="text-gray-700 text-lg">Call: +234(0)8083734008</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <MapPin className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">ADDRESS</h3>
                <p className="text-gray-700 text-lg">
                  22 Abioro Street<br />
                  Ikorodu,<br />
                  Lagos State
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Mail className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">EMAIL</h3>
                <p className="text-gray-700 text-lg">hello@ettaatlantic.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-700 text-2xl leading-relaxed">
                We have different healthcare plans, ranging from health checks, lifestyle plans, UTI checks to sexual health.
              </p>
            </div>
            <div>
              <p className="text-gray-700 text-lg mb-4">
                <span className="font-semibold">Healthcare services</span> in Lekki Lagos made simple!
              </p>
              <p className="text-blue-500 text-2xl font-bold mb-6">
                Click Below to choose the one suitable for you.
              </p>
              <button className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold px-8 py-3 rounded-full transition duration-300">
                Our Packages
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
