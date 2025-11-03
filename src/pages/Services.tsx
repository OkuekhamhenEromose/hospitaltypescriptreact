// import React from 'react';

const Services = () => {
  const emergencyServices = [
    'Seizures',
    'Loss of consciousness',
    'Acute severe asthma (asthma attack)',
    'Shock',
    'Trauma/ Lacerations/ Cut injuries'
  ];

  const internalMedicine = [
    'Stroke',
    'Diabetes and its complications',
    'Thyroid disorders',
    'Kidney failure/ disease',
    'Hypertension and its complications'
  ];

  const generalPractice = [
    'Peptic ulcer disease/ gastritis',
    'Malaria',
    'Enteric fever',
    'Diarrhea and complications',
    'Sepsis'
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-blue-500 py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-white">Our Services</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <p className="text-gray-700 text-lg leading-relaxed">
              We offer a wide range of general medical services in Lekki Lagos and Nigeria at large,
              which involves the management of chronic and acute illnesses.
            </p>
          </div>
          <div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Our Medical Centre in Lagos is well equipped with modern medical equipment and
              professionals ready to attend to your healthcare needs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Emergency Services</h2>
            <div className="w-16 h-1 bg-red-500 mb-8"></div>
            <ul className="space-y-4">
              {emergencyServices.map((service, index) => (
                <li key={index} className="text-gray-700 text-lg leading-relaxed">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Internal Medicine</h2>
            <div className="w-16 h-1 bg-red-500 mb-8"></div>
            <ul className="space-y-4">
              {internalMedicine.map((service, index) => (
                <li key={index} className="text-gray-700 text-lg leading-relaxed">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">General Practice</h2>
            <div className="w-16 h-1 bg-red-500 mb-8"></div>
            <ul className="space-y-4">
              {generalPractice.map((service, index) => (
                <li key={index} className="text-gray-700 text-lg leading-relaxed">
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
