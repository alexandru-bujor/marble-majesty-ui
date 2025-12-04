import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import showroom1 from '@/assets/showroom-1.jpg';
import showroom2 from '@/assets/showroom-2.jpg';

const Showroom = () => {
  return (
    <section id="showroom" className="section-padding bg-graphite text-marble overflow-hidden">
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold mb-4">
                Experiență Exclusivă
              </p>
              <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight">
                Fiecare Masă Este
                <br />
                <span className="text-gold-gradient">O Piesă de Artă</span>
              </h2>
            </div>

            <p className="font-sans text-marble/60 leading-relaxed max-w-lg">
              Vizitează showroom-ul nostru pentru a experimenta direct eleganța și 
              calitatea excepțională a pieselor noastre. Consultanții noștri te vor 
              ghida în alegerea perfectă pentru spațiul tău.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/contact" className="btn-luxury-filled text-center">
                Programează Vizită
              </Link>
              <Link to="/configurator" className="btn-luxury flex items-center justify-center gap-2">
                Crează-ți Visul
                <ArrowUpRight size={16} />
              </Link>
            </div>

            {/* Stats
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-marble/10">
              <div>
                <p className="font-serif text-3xl md:text-4xl text-gold">8+</p>
                <p className="font-sans text-xs tracking-[0.2em] uppercase text-marble/50 mt-2">
                  Ani Experiență
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl text-gold">Destule</p>
                <p className="font-sans text-xs tracking-[0.2em] uppercase text-marble/50 mt-2">
                  Piese Create
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl text-gold">50+</p>
                <p className="font-sans text-xs tracking-[0.2em] uppercase text-marble/50 mt-2">
                  Tipuri Piatră
                </p>
              </div>
            </div>*/}
          </div>

          {/* Right Images */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative z-10">
              <img
                src={showroom1}
                alt="Showroom MobArt cu masă de marmură"
                className="w-full aspect-[16/10] object-cover"
              />
              <div className="absolute inset-0 border border-gold/20" />
            </div>

            {/* Secondary Image */}
            <div className="absolute -bottom-12 -left-12 w-2/3 z-20 hidden lg:block">
              <img
                src={showroom2}
                alt="Interior luxury cu masă din granit"
                className="w-full aspect-[16/10] object-cover shadow-luxury"
              />
              <div className="absolute inset-0 border border-gold/30" />
            </div>

            {/* Decorative Element */}
            <div className="absolute -top-8 -right-8 w-32 h-32 border border-gold/20 hidden lg:block" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showroom;
