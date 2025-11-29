import { Instagram, Facebook, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-graphite text-marble">
      {/* Main Footer */}
      <div className="container-luxury py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <a href="/" className="font-serif text-2xl tracking-wider inline-block mb-6">
              <span className="text-gold-gradient font-semibold">PIETRA</span>
              <span className="font-light"> NOBILE</span>
            </a>
            <p className="font-sans text-sm text-marble/60 leading-relaxed mb-6">
              Creăm piese de mobilier excepționale din piatră naturală, 
              îmbinând tradiția italiană cu designul contemporan.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              {[Instagram, Facebook, Linkedin].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 border border-gold/30 flex items-center justify-center text-gold/70 hover:text-gold hover:border-gold transition-all duration-300"
                >
                  <Icon size={18} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.3em] uppercase text-gold mb-6">
              Magazin
            </h4>
            <ul className="space-y-4">
              {['Mese Dining', 'Mese Cafea', 'Design Personalizat', 'Exterior', 'Toate Produsele'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="font-sans text-sm text-marble/60 hover:text-gold transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.3em] uppercase text-gold mb-6">
              Suport
            </h4>
            <ul className="space-y-4">
              {['Întrebări Frecvente', 'Livrare & Montaj', 'Garanție', 'Îngrijire Piatră', 'Politică Retur'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="font-sans text-sm text-marble/60 hover:text-gold transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.3em] uppercase text-gold mb-6">
              Contact
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:contact@pietranobile.ro"
                  className="font-sans text-sm text-marble/60 hover:text-gold transition-colors duration-300 flex items-center gap-3"
                >
                  <Mail size={16} strokeWidth={1.5} className="text-gold/50" />
                  contact@pietranobile.ro
                </a>
              </li>
              <li>
                <a
                  href="tel:+40721234567"
                  className="font-sans text-sm text-marble/60 hover:text-gold transition-colors duration-300 flex items-center gap-3"
                >
                  <Phone size={16} strokeWidth={1.5} className="text-gold/50" />
                  +40 721 234 567
                </a>
              </li>
              <li>
                <span className="font-sans text-sm text-marble/60 flex items-start gap-3">
                  <MapPin size={16} strokeWidth={1.5} className="text-gold/50 mt-0.5 flex-shrink-0" />
                  Str. Elegantei Nr. 42,
                  <br />
                  Sector 1, București
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-marble/10">
        <div className="container-luxury py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-xs text-marble/40">
            © {currentYear} Pietra Nobile. Toate drepturile rezervate.
          </p>
          <div className="flex gap-6">
            {['Termeni & Condiții', 'Confidențialitate', 'Cookie-uri'].map((item) => (
              <a
                key={item}
                href="#"
                className="font-sans text-xs text-marble/40 hover:text-gold transition-colors duration-300"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
