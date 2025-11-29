import Navbar from '@/components/Navbar';
import Footer from '@/components/sections/Footer';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, Clock } from 'lucide-react';
import showroom1 from '@/assets/showroom-1.jpg';
import showroom2 from '@/assets/showroom-2.jpg';
import heroImage from '@/assets/hero-marble-table.jpg';

const ShowroomPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative h-[70vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Showroom Pietra Nobile"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-luxury pb-16">
            <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold mb-4">
              Experiență Exclusivă
            </p>
            <h1 className="font-serif text-4xl md:text-6xl text-marble mb-4">
              Showroom București
            </h1>
            <p className="font-sans text-marble/70 max-w-xl">
              Vizitează spațiul nostru de expunere și descoperă în persoană frumusețea 
              pietrei naturale prelucrate cu măiestrie
            </p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            <div className="p-8 border border-border hover:border-gold/30 transition-colors">
              <MapPin size={28} className="text-gold mb-4" strokeWidth={1.5} />
              <h3 className="font-serif text-xl text-foreground mb-2">Locație</h3>
              <p className="font-sans text-sm text-muted-foreground">
                Str. Elegantei Nr. 42<br />
                Sector 1, București<br />
                România
              </p>
            </div>
            <div className="p-8 border border-border hover:border-gold/30 transition-colors">
              <Clock size={28} className="text-gold mb-4" strokeWidth={1.5} />
              <h3 className="font-serif text-xl text-foreground mb-2">Program</h3>
              <p className="font-sans text-sm text-muted-foreground">
                Luni - Vineri: 10:00 - 19:00<br />
                Sâmbătă: 10:00 - 16:00<br />
                Duminică: Închis
              </p>
            </div>
            <div className="p-8 border border-border hover:border-gold/30 transition-colors">
              <Calendar size={28} className="text-gold mb-4" strokeWidth={1.5} />
              <h3 className="font-serif text-xl text-foreground mb-2">Programare</h3>
              <p className="font-sans text-sm text-muted-foreground mb-4">
                Recomandăm programarea pentru consultații personalizate
              </p>
              <Link to="/contact" className="font-sans text-xs tracking-[0.15em] uppercase text-gold hover:underline">
                Programează Vizită →
              </Link>
            </div>
          </div>

          {/* Gallery */}
          <div className="space-y-8">
            <div className="text-center">
              <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold mb-4">
                Galerie
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">
                Spațiul Nostru
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-[4/3] overflow-hidden group">
                <img
                  src={showroom1}
                  alt="Interior showroom"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="aspect-[4/3] overflow-hidden group">
                <img
                  src={showroom2}
                  alt="Piese expuse"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-graphite text-marble">
        <div className="container-luxury text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-6">
            Pregătit să Vizitezi?
          </h2>
          <p className="font-sans text-marble/60 max-w-lg mx-auto mb-8">
            Echipa noastră de consultanți te așteaptă pentru a te ghida în alegerea 
            piesei perfecte pentru spațiul tău
          </p>
          <Link to="/contact" className="btn-luxury-filled inline-flex items-center gap-2">
            Programează Acum
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShowroomPage;
