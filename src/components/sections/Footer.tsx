import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTiktok } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

    const socialLinks = [
        {
            Icon: Instagram,
            href: "https://www.instagram.com/mobart.md?igsh=MXRlbnMxOWV3azJmdA%3D%3D&utm_source=qr",
            label: "Instagram",
        },
        {
            Icon: Facebook,
            href: "https://www.facebook.com/share/1AEKZVuoYf/?mibextid=wwXIfr",
            label: "Facebook",
        },
    ];
  return (
    <footer className="bg-graphite text-marble">
      {/* Main Footer */}
      <div className="container-luxury py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="font-serif text-2xl tracking-wider inline-block mb-6">
              <span className="text-gold-gradient font-semibold">MOBART</span>
            </Link>
            <p className="font-sans text-sm text-marble/60 leading-relaxed mb-6">
              Creăm piese de mobilier excepționale din piatră naturală, 
              îmbinând designul contemporan.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
                {socialLinks.map(({ Icon, href, label }) => (
                    <a
                        key={href}
                        href={href}
                  className="w-10 h-10 border border-gold/30 flex items-center justify-center text-gold/70 hover:text-gold hover:border-gold transition-all duration-300"
                >
                  <Icon size={18} strokeWidth={1.5} />
                </a>
              ))}

                <a

                    href="https://www.tiktok.com/@mobart.mobilier?_r=1&_t=ZM-91qRm6pJeXL"
                    className="w-10 h-10 border border-gold/30 flex items-center justify-center text-gold/70 hover:text-gold hover:border-gold transition-all duration-300"
                >
                    <FontAwesomeIcon icon={faTiktok} />
                </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.3em] uppercase text-gold mb-6">
              Magazin
            </h4>
            <ul className="space-y-4">
              {[
                { name: 'Toate Produsele', href: '/shop' },
                { name: 'Mese Dining', href: '/shop' },
                { name: 'Mese Cafea', href: '/shop' },
                { name: 'Design Personalizat', href: '/contact' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="font-sans text-sm text-marble/60 hover:text-gold transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.3em] uppercase text-gold mb-6">
              Companie
            </h4>
            <ul className="space-y-4">
              {[
                { name: 'Despre Noi', href: '/about' },
                { name: 'Showroom', href: '/showroom' },
                { name: 'Contact', href: '/contact' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="font-sans text-sm text-marble/60 hover:text-gold transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
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
                  href="mailto:contact@mobart.md"
                  className="font-sans text-sm text-marble/60 hover:text-gold transition-colors duration-300 flex items-center gap-3"
                >
                  <Mail size={16} strokeWidth={1.5} className="text-gold/50" />
                    contact@mobart.md
                </a>
              </li>
              <li>
                <a
                  href="tel:+37379989960"
                  className="font-sans text-sm text-marble/60 hover:text-gold transition-colors duration-300 flex items-center gap-3"
                >
                  <Phone size={16} strokeWidth={1.5} className="text-gold/50" />
                  +373 799 899 60
                </a></li>
                <li>
                  <a
                      href="tel:+37379393643"
                      className="font-sans text-sm text-marble/60 hover:text-gold transition-colors duration-300 flex items-center gap-3"
                  >
                      <Phone size={16} strokeWidth={1.5} className="text-gold/50" />
                      +373 793 936 43
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
