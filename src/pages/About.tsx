import Navbar from '@/components/Navbar';
import Footer from '@/components/sections/Footer';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import Testimonials from '@/components/sections/Testimonials';
import showroom1 from '@/assets/showroom-1.jpg';
import showroom2 from '@/assets/showroom-2.jpg';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-20 bg-graphite text-marble">
        <div className="container-luxury">
          <div className="max-w-3xl">
            <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold mb-4">
              Despre Noi
            </p>
            <h1 className="font-serif text-4xl md:text-6xl mb-6 leading-tight">
              Tradiție și Inovație
              <br />
              <span className="text-gold-gradient">În Piatră Naturală</span>
            </h1>
            <p className="font-sans text-marble/60 text-lg leading-relaxed">
              De peste 15 ani, Pietra Nobile creează piese de mobilier excepționale, 
              îmbinând măiestria artizanilor italieni cu cele mai fine materiale naturale din lume.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src={showroom1}
                alt="Atelier Pietra Nobile"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute -bottom-8 -right-8 w-48 h-48 border border-gold/30 hidden lg:block" />
            </div>
            
            <div className="space-y-6">
              <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold">
                Povestea Noastră
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">
                Pasiune Pentru Perfecțiune
              </h2>
              <p className="font-sans text-muted-foreground leading-relaxed">
                Fondată în 2008, Pietra Nobile s-a născut din dorința de a aduce eleganța 
                intemporală a pietrei naturale în casele moderne. Fondatorul nostru, 
                Alessandro Nobile, a petrecut ani de zile studiind tehnicile tradiționale 
                de sculptură în Italia, înainte de a deschide primul atelier în București.
              </p>
              <p className="font-sans text-muted-foreground leading-relaxed">
                Astăzi, echipa noastră de meșteri artizani continuă această tradiție, 
                creând piese unice care îmbină designul contemporan cu metodele clasice 
                de prelucrare a pietrei.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-secondary/30">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-6">
              <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold">
                Filozofia Noastră
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">
                Calitate Fără Compromis
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-px bg-gold/30" />
                  <div>
                    <h3 className="font-serif text-lg text-foreground mb-2">Materiale Premium</h3>
                    <p className="font-sans text-sm text-muted-foreground">
                      Selectăm personal fiecare bloc de piatră din cele mai renumite cariere din Italia, 
                      Grecia și Brazilia.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-px bg-gold/30" />
                  <div>
                    <h3 className="font-serif text-lg text-foreground mb-2">Artizanat Manual</h3>
                    <p className="font-sans text-sm text-muted-foreground">
                      Fiecare piesă este sculptată și finisată manual, asigurând atenție maximă la detalii.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-px bg-gold/30" />
                  <div>
                    <h3 className="font-serif text-lg text-foreground mb-2">Sustenabilitate</h3>
                    <p className="font-sans text-sm text-muted-foreground">
                      Utilizăm metode de extracție responsabile și minimizăm risipa prin valorificarea 
                      fiecărei bucăți de piatră.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 relative">
              <img
                src={showroom2}
                alt="Proces de sculptură"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default About;
