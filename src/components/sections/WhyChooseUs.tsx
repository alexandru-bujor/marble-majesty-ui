import { Gem, Palette, Hand, Shield } from 'lucide-react';

const features = [
  {
    icon: Gem,
    title: '100% Piatră Naturală',
    description: 'Folosim exclusiv marmură și granit de cea mai înaltă calitate, selectat din cele mai renumite cariere din lume.',
  },
  {
    icon: Palette,
    title: 'Design Italian',
    description: 'Fiecare piesă este proiectată de designeri italieni cu experiență în mobilierul de lux și arhitectură interioară.',
  },
  {
    icon: Hand,
    title: 'Sculptat Manual',
    description: 'Meșterii noștri artizani creează fiecare masă cu atenție la detalii, folosind tehnici tradiționale perfecționate în generații.',
  },
  {
    icon: Shield,
    title: 'Durabilitate pe Viață',
    description: 'Oferim garanție pe viață pentru toate piesele noastre, reflectând încrederea în calitatea excepțională a produselor.',
  },
];

const WhyChooseUs = () => {
  return (
    <section id="about" className="section-padding bg-background">
      <div className="container-luxury">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold mb-4">
            De Ce Noi
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-6">
            Excelență În Fiecare Detaliu
          </h2>
          <p className="font-sans text-muted-foreground max-w-2xl mx-auto">
            De peste 15 ani, creăm piese de mobilier care definesc luxul autentic 
            și rafinamentul în designul interior
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group text-center p-8 transition-all duration-500 hover:bg-secondary/50"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 border border-gold/30 group-hover:border-gold group-hover:bg-gold/5 transition-all duration-500">
                <feature.icon
                  size={28}
                  strokeWidth={1}
                  className="text-gold"
                />
              </div>

              {/* Content */}
              <h3 className="font-serif text-xl text-foreground mb-4 group-hover:text-gold transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
