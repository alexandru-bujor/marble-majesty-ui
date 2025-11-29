import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import diningTable from '@/assets/collection-dining-table.jpg';
import coffeeTable from '@/assets/collection-coffee-table.jpg';
import customDesign from '@/assets/collection-custom.jpg';
import outdoorTable from '@/assets/collection-outdoor.jpg';

const collections = [
  {
    title: 'Mese de Dining',
    subtitle: 'Dining Tables',
    description: 'Eleganță rafinată pentru fiecare cină în familie',
    image: diningTable,
    href: '/shop',
  },
  {
    title: 'Mese de Cafea',
    subtitle: 'Coffee Tables',
    description: 'Piese statement pentru living-ul modern',
    image: coffeeTable,
    href: '/shop',
  },
  {
    title: 'Design Personalizat',
    subtitle: 'Custom Marble',
    description: 'Viziunea ta, sculptată în piatră naturală',
    image: customDesign,
    href: '/contact',
  },
  {
    title: 'Exterior Luxury',
    subtitle: 'Outdoor Stone',
    description: 'Durabilitate și stil pentru terasă',
    image: outdoorTable,
    href: '/shop',
  },
];

const Collections = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems((prev) => [...prev, index]);
          }
        });
      },
      { threshold: 0.2 }
    );

    const items = sectionRef.current?.querySelectorAll('.collection-item');
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="collections" ref={sectionRef} className="section-padding bg-background">
      <div className="container-luxury">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold mb-4">
            Colecții Exclusive
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-6">
            Mastercrafted pentru Excelenți
          </h2>
          <p className="font-sans text-muted-foreground max-w-xl mx-auto">
            Descoperă colecțiile noastre de piese unice, fiecare creată cu pasiune și măiestrie italiană
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {collections.map((collection, index) => (
            <Link
              key={collection.title}
              to={collection.href}
              data-index={index}
              className={`collection-item group relative overflow-hidden cursor-pointer transition-all duration-700 ${
                visibleItems.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-graphite/90 via-graphite/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Marble texture hover effect */}
                <div className="absolute inset-0 bg-marble-texture opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold mb-2">
                  {collection.subtitle}
                </p>
                <h3 className="font-serif text-2xl md:text-3xl text-marble mb-3">
                  {collection.title}
                </h3>
                <p className="font-sans text-sm text-marble/60 mb-6 max-w-xs">
                  {collection.description}
                </p>
                <div className="flex items-center gap-2 text-gold opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <span className="font-sans text-xs tracking-[0.2em] uppercase">
                    Vezi Colecția
                  </span>
                  <ArrowRight size={16} />
                </div>
              </div>

              {/* Golden corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
