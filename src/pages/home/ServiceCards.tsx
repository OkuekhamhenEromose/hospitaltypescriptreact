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
        "Etta-Atlantic Hospital Lekki Lagos has a state of the art surgical centre offering a wide range of surgical services.",
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
        "Visit Etta-Atlantic Memorial Hospital in Lekki Lagos for preventive health screenings (check-ups) for you and your family.",
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
        "Fortunately, Etta-Atlantic Hospital Lekki Lagos work collaboratively with various Health Maintenance Organizations (HMOs) to ensure adequate coverage for your healthcare.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Etta-Atlantic Memorial Hospital Lekki Lagos
          </h2>
          <h3 className="text-4xl font-bold text-blue-600">
            Our Medical Services
          </h3>
        </div>

        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {firstRowServices.map((service, index) => (
              <div key={index} className="text-center">
                {service.icon}
                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h4>
                <div className="w-12 h-1 bg-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 leading-relaxed">
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
                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h4>
                <div className="w-12 h-1 bg-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 leading-relaxed">
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
