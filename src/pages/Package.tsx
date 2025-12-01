// import React from 'react';
import ethaPackages from "../assets/img/etha-packages1-removebg-preview.png"
// import { Heart, Activity, TrendingUp, Pill, Shield, Clock } from 'lucide-react';



const Packages = () => {
  const healthCheckPackages = {
    silver: [
      'General Physical Examination',
      'Body Mass Index',
      'Blood Pressure Check',
      'Random Blood Sugar',
      'Kidney Function Test',
      'Retroviral Screening',
      'Helicobacter Pylori',
      'Urinalysis',
      'Complete Blood Count',
    ],
    gold: [
      'General Physical Examination',
      'Body Mass Index',
      'Blood Pressure Check',
      'Random Blood Sugar',
      'Erythrocyte Sedimentation Rate',
      'Helicobacter Pylori',
      'Retroviral Screening',
      'Liver Function Test',
      'Complete Blood Count',
      'Urinalysis',
      'Kidney Function Test',
      'Full Lipid Profile',
      'Electrocardiogram',
    ],
    platinum: [
      'General Physical Examination',
      'Body Mass Index',
      'Blood Pressure Check',
      'Hba1C (Diabetic Screen)',
      'Erythrocyte Sedimentation Rate',
      'Helicobacter Pylori',
      'Retroviral Screening',
      'Troponin',
      'Electrocardiogram',
      'Complete Blood Count',
      'Urinalysis',
      'Thyroid Stimulating Hormone',
      'Kidney Function Test',
      'Liver Function Test',
      'Full Lipid Profile',
    ],
  };

  const healthChecks = {
    preSchool: [
      'General Physical Examination',
      'Temperature',
      'Heart Rate',
      'Eye, Ear, Nose Check',
      'Malaria Parasite Testing',
      'Blood Group & Genotype',
    ],
    preNanny: [
      'General Physical Examination',
      'Retroviral Screening',
      'Hepatitis B Screening',
      'Hepatitis C Screening',
      'VDRL',
      'Tuberculosis Screening Test',
      'Pregnancy Test (for female)',
    ],
    preEmployment: [
      'General Physical Examination',
      'Visual Acuity',
      'Blood Pressure Check',
      'Random Blood Sugar',
      'Complete Blood Count',
      'Tuberculosis Screening',
      'Blood Group',
      'Urinalysis',
      'With ECG (optional)',
    ],
    preMarital: [
      'General Physical Examination',
      'Retroviral Screening',
      'Hepatitis B & C Screening',
    ],
    foodHandlers: [
      'Hepatitis A',
      'Tuberculosis Screening',
      'Vidal Test',
    ],
    foodHandlersPlus: [
      'Hepatitis A',
      'Tuberculosis Screening',
      'Vidal Test',
    ],
  };

  const lifestylePlans = {
    planA: [
      'Kidney Function Tests',
      'Liver Function Tests',
    ],
    planB: [
      'HbA1c Test',
      'Kidney Function Tests',
      'Liver Function Tests',
    ],
  };

  const utiChecks = {
    basic: [
      'Urinalysis',
      'Urine MCS',
    ],
    plus: [
      'Urinalysis',
      'Urine MCS',
      'HVS/Urethral Swab',
    ],
    ultra: [
      'For Reports of Rashes in the Genital Area',
      'Urinalysis',
      'Urine MCS',
    ],
  };

  const sexualHealth = {
    basic: [
      'Syphilis',
      'Gonorrhea',
      'HIV',
      'Hepatitis B',
      'Hepatitis C',
    ],
    comprehensive: [
      'Chlamydia',
      'Gonorrhea',
      'HIV',
      'Hepatitis B',
      'Hepatitis C',
      'Syphilis',
      'Trichomoniasis',
    ],
    comprehensivePlus: [
      'Chlamydia',
      'Gonorrhea',
      'HIV',
      'Hepatitis B',
      'Hepatitis C',
      'Syphilis',
      'Trichomoniasis',
      'Females Pap Smear',
      'Herpes Profile',
      'HPV Vaccine (optional) for Negative Pap Smear Test',
      'Hepatitis B Vaccine',
    ],
  };

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
            Our Packages
          </h1>
        </div>
      </section>
      <div className="container mx-auto px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div>
            <h2 className="text-6xl font-light text-gray-900 mb-2">
              Select any of
            </h2>
            <h2 className="text-5xl font-bold text-blue-600 mb-4">
              our healthcare plans
            </h2>
            <div className="w-20 h-1 bg-blue-500 mb-6"></div>
            <p className="text-gray-700 text-lg">
              Healthcare services in Ikorodu Lagos made simple!
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <img
              src={ethaPackages}
              alt="Healthcare Plans"
              className="w-full max-w-sm h-auto"
            />
          </div>

          {/* <div className="grid grid-cols-3 gap-6">
            {icons.map((item, index) => {
              const IconComponent = item.Icon;
              return (
                <div key={index} className="flex justify-center items-center">
                  <IconComponent className={`w-12 h-12 ${item.color}`} />
                </div>
              );
            })}
          </div> */}
        </div>

        <div className="mb-24">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Health Check Packages</h2>
          <div className="w-20 h-1 bg-blue-500 mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Silver</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {healthCheckPackages.silver.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gold</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {healthCheckPackages.gold.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Platinum</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {healthCheckPackages.platinum.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-24">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Health Checks</h2>
          <div className="w-20 h-1 bg-blue-500 mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pre School</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {healthChecks.preSchool.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pre Nanny/Domestic Staff</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {healthChecks.preNanny.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pre Employment</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {healthChecks.preEmployment.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pre Marital</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {healthChecks.preMarital.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Food Handlers Test</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {healthChecks.foodHandlers.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Food Handlers Test (plus)</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {healthChecks.foodHandlersPlus.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-24">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Lifestyle Plan Package</h2>
          <div className="w-20 h-1 bg-blue-500 mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lifestyle Plan A</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {lifestylePlans.planA.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lifestyle Plan B</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {lifestylePlans.planB.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-3">UTI Checks Plan</h2>
          <div className="w-20 h-1 bg-blue-500 mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">UTI Checks</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {utiChecks.basic.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">UTI Check Plus</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {utiChecks.plus.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">UTI Check Ultra</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {utiChecks.ultra.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Sexual Health Panel</h2>
          <div className="w-20 h-1 bg-blue-500 mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Basic</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {sexualHealth.basic.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Comprehensive</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {sexualHealth.comprehensive.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Comprehensive Plus</h2>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-1">
                {sexualHealth.comprehensivePlus.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Packages;
