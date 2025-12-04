import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import heroImage from '@/assets/hero-marble-table.jpg';

const Hero = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * 0.5);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 w-full h-[120%]"
        style={{ transform: `translateY(${offset}px)` }}
      >
        <img
          src={heroImage}
          alt="Masă din marmură de lux în showroom italian"
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-graphite/60 via-graphite/40 to-graphite/80" />
      </div>

      {/* Golden Border Frame */}
      <div className="absolute inset-8 md:inset-16 border border-gold/30 pointer-events-none" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-4xl space-y-8">
          {/* Subtitle */}


          {/* Main Headline */}
          <h1
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium text-marble leading-tight opacity-0 animate-fade-in-up"
            style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
          >
            Eleganță Sculptată
            <br />
            <span className="text-gold-gradient">Din Piatră Naturală</span>
          </h1>

          {/* Subheadline */}
          <p
            className="font-sans text-base md:text-lg text-marble/70 max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in-up"
            style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
          >
            Mese din granit și marmură, clasa premium.
            Fiecare piesă, o operă de artă unică.
          </p>

          {/* CTA Button */}
          <div
            className="pt-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}
          >
            <Link
              to="/shop"
              className="btn-luxury-filled inline-block"
            >
              Explorează Colecția
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: '1200ms', animationFillMode: 'forwards' }}>
          <a
            href="#collections"
            className="flex flex-col items-center gap-2 text-marble/50 hover:text-gold transition-colors duration-300"
          >
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase">Scroll</span>
            <ChevronDown size={20} className="animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
