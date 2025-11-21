interface ServiceCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Services = () => {
  const firstRowServices: ServiceCard[] = [
    {
      icon: (
        <span className="material-icons text-6xl text-red-500 mx-auto mb-4">
          local_hospital
        </span>
      ),
      title: "Acute Hospital Medicine",
      description:
        "We provide a 24-hour emergency service to ensure acute care for patients presenting with a range of medical illnesses.",
    },
    {
      icon: (
        <span className="material-icons text-6xl text-red-500 mx-auto mb-4">
          biotech
        </span>
      ),
      title: "Medical Laboratory & Diagnostics",
      description:
        "Our laboratory unit is well-equipped with advanced equipment to carry out a variety of investigations for rapid and standard results.",
    },
    {
      icon: (
        <span className="material-icons text-6xl text-red-500 mx-auto mb-4">
          hotel
        </span>
      ),
      title: "Surgery",
      description:
        "Etha-Atlantic Memorial Hospital Ikorodu Lagos has a state of the art surgical centre offering a wide range of surgical services.",
    },
  ];

  const secondRowServices: ServiceCard[] = [
    {
      icon: (
        <span className="material-icons text-6xl text-red-500 mx-auto mb-4">
          family_restroom
        </span>
      ),
      title: "Family Healthcare",
      description:
        "Visit Etha-Atlantic Memorial Hospital in Ikorodu Lagos for preventive health screenings (check-ups) for you and your family.",
    },
    {
      icon: (
        <span className="material-icons text-6xl text-red-500 mx-auto mb-4">
          local_pharmacy
        </span>
      ),
      title: "Pharmacy",
      description:
        "Our pharmacy is well-stocked with high quality medications and a qualified pharmacist for proper dispersion of needed medications.",
    },
    {
      icon: (
        <span className="material-icons text-6xl text-red-500 mx-auto mb-4">
          health_and_safety
        </span>
      ),
      title: "Health Insurance",
      description:
        "Fortunately, Etha-Atlantic Memorial Hospital Ikorodu Lagos work collaboratively with various Health Maintenance Organizations (HMOs) to ensure adequate coverage for your healthcare.",
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#2b2e32] mb-2">
            Etha-Atlantic Memorial Hospital Ikorodu Lagos
          </h2>
          <h3 className="text-4xl font-bold text-blue-600">
            Our Medical Services
          </h3>
        </div>

        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {firstRowServices.map((service, index) => (
              <div key={index} className="text-center">
                {service.icon}
                <h4 className="text-2xl text-[#2b2e32] font-bold mb-2">
                  {service.title}
                </h4>
                <div className="w-12 h-1 bg-blue-600 mx-auto mb-2"></div>
                <p className="text-[#2b2e32] leading-normal">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {secondRowServices.map((service, index) => (
              <div key={index} className="text-center">
                {service.icon}
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  {service.title}
                </h4>
                <div className="w-12 h-1 bg-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 leading-normal">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
