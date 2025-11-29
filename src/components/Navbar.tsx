import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Acasă', href: '/' },
    { name: 'Magazin', href: '/shop' },
    { name: 'Showroom', href: '/showroom' },
    { name: 'Despre Noi', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container-luxury flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-serif text-2xl tracking-wider text-foreground">
          <span className="text-gold-gradient font-semibold">PIETRA</span>
          <span className="font-light"> NOBILE</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`font-sans text-sm tracking-[0.15em] uppercase transition-colors duration-300 ${
                isActive(link.href) 
                  ? 'text-gold' 
                  : 'text-foreground/80 hover:text-gold'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Cart & Mobile Menu */}
        <div className="flex items-center gap-4">
          <Link to="/shop" className="relative p-2 text-foreground hover:text-gold transition-colors duration-300">
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-graphite text-[10px] rounded-full flex items-center justify-center font-sans">
              0
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 glass transition-all duration-500 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-luxury py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`font-sans text-sm tracking-[0.15em] uppercase transition-colors duration-300 py-2 ${
                isActive(link.href) 
                  ? 'text-gold' 
                  : 'text-foreground/80 hover:text-gold'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
