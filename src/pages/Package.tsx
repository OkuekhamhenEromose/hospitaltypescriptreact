// import React from 'react';
import { Heart, Activity, TrendingUp, Pill, Shield, Clock } from 'lucide-react';

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

  const icons = [
    { Icon: Heart, color: 'text-red-500' },
    { Icon: Activity, color: 'text-blue-500' },
    { Icon: TrendingUp, color: 'text-pink-500' },
    { Icon: Pill, color: 'text-blue-400' },
    { Icon: Shield, color: 'text-pink-400' },
    { Icon: Clock, color: 'text-blue-600' },
    { Icon: Heart, color: 'text-pink-500' },
    { Icon: Activity, color: 'text-blue-300' },
    { Icon: Shield, color: 'text-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-blue-500 py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-white">Our Packages</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Select any of
            </h2>
            <h2 className="text-5xl font-bold text-blue-600 mb-4">
              our healthcare plans
            </h2>
            <div className="w-20 h-1 bg-blue-500 mb-6"></div>
            <p className="text-gray-700 text-lg">
              Healthcare services in Lekki Lagos made simple!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {icons.map((item, index) => {
              const IconComponent = item.Icon;
              return (
                <div key={index} className="flex justify-center items-center">
                  <IconComponent className={`w-12 h-12 ${item.color}`} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-24">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Health Check Packages</h2>
          <div className="w-20 h-1 bg-blue-500 mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Silver</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
                {healthCheckPackages.silver.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Gold</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
                {healthCheckPackages.gold.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Platinum</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pre School</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
                {healthChecks.preSchool.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pre Nanny/Domestic Staff</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
                {healthChecks.preNanny.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pre Employment</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pre Marital</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
                {healthChecks.preMarital.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Food Handlers Test</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
                {healthChecks.foodHandlers.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Food Handlers Test (plus)</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Lifestyle Plan A</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
                {lifestylePlans.planA.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Lifestyle Plan B</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">UTI Checks</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
                {utiChecks.basic.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">UTI Check Plus</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
                {utiChecks.plus.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">UTI Check Ultra</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
                {sexualHealth.basic.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Comprehensive</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
                {sexualHealth.comprehensive.map((item, index) => (
                  <li key={index} className="text-gray-700 text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Comprehensive Plus</h3>
              <div className="w-12 h-1 bg-red-500 mb-6"></div>
              <ul className="space-y-3">
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
