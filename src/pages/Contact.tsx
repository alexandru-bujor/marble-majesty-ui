import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/sections/Footer';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  
  const [phoneError, setPhoneError] = useState('');

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
      if (cleaned.length > 0 && cleaned[0] !== '+') {
        cleaned = '+' + cleaned.replace(/\+/g, '');
      } else if (cleaned.length === 0) {
        return '';
      }
    }
    
    // Format: +373-123-45-678
    if (cleaned.startsWith('+373')) {
      let digits = cleaned.slice(4).replace(/\D/g, ''); // Remove non-digits after +373
      if (digits.length > 8) digits = digits.slice(0, 8); // Limit to 8 digits
      
      let formatted = '+373';
      if (digits.length > 0) {
        formatted += '-' + digits.slice(0, 3);
        if (digits.length > 3) {
          formatted += '-' + digits.slice(3, 5);
          if (digits.length > 5) {
            formatted += '-' + digits.slice(5, 8);
          }
        }
      }
      return formatted;
    }
    
    // If not +373, just add dashes every few digits
    if (cleaned.length > 1) {
      let digits = cleaned.slice(1).replace(/\D/g, '');
      let formatted = '+' + digits.slice(0, 3);
      if (digits.length > 3) {
        formatted += '-' + digits.slice(3, 6);
        if (digits.length > 6) {
          formatted += '-' + digits.slice(6, 8);
        }
      }
      return formatted;
    }
    
    return cleaned;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Format: +373-123-45-678 (exactly this format)
    const phoneRegex = /^\+373-\d{3}-\d{2}-\d{3}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Pre-fill with +373 if empty
    if (!formData.phone) {
      setFormData({ ...formData, phone: '+373' });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
    
    if (formatted && !validatePhoneNumber(formatted)) {
      setPhoneError('Format: +373-123-45-678');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number format
    if (!validatePhoneNumber(formData.phone)) {
      setPhoneError('Format: +373-123-45-678');
      toast({
        title: "Eroare",
        description: "Te rugăm să introduci un număr de telefon valid în formatul +373-123-45-678",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Mesaj trimis!",
      description: "Vă vom contacta în cel mai scurt timp posibil.",
    });
    setFormData({ name: '', email: '', phone: '', message: '' });
    setPhoneError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-graphite text-marble">
        <div className="container-luxury text-center">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold mb-4">
            Contact
          </p>
          <h1 className="font-serif text-4xl md:text-6xl mb-6">
            Suntem Aici Pentru Tine
          </h1>
          <p className="font-sans text-marble/60 max-w-xl mx-auto">
            Programează o vizită la showroom sau contactează-ne pentru orice întrebare
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-12">
              <div>
                <h2 className="font-serif text-2xl text-foreground mb-6">Informații Contact</h2>
                <div className="space-y-6">
                  <a href="mailto:mobart.md@gmail.com" className="flex items-start gap-4 group">
                    <div className="w-12 h-12 border border-gold/30 flex items-center justify-center group-hover:bg-gold/5 transition-colors">
                      <Mail size={20} className="text-gold" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">Email</p>
                      <p className="font-sans text-foreground group-hover:text-gold transition-colors">
                          mobart.md@gmail.com</p>
                    </div>
                  </a>
                  
                  <a href="tel:+40721234567" className="flex items-start gap-4 group">
                    <div className="w-12 h-12 border border-gold/30 flex items-center justify-center group-hover:bg-gold/5 transition-colors">
                      <Phone size={20} className="text-gold" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">Telefon</p>
                      <a href="tel:0799 89 960" className="font-sans text-foreground group-hover:text-gold transition-colors">0799 89 960</a>
                    </div>
                  </a>
                  

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 border border-gold/30 flex items-center justify-center">
                      <Clock size={20} className="text-gold" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground mb-1">Program</p>
                      <p className="font-sans text-foreground">Luni - Vineri: 10:00 - 19:00<br />Sâmbătă: 10:00 - 16:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}

            </div>

            {/* Contact Form */}
            <div className="bg-card border border-border p-8 md:p-12">
              <h2 className="font-serif text-2xl text-foreground mb-2">Trimite un Mesaj</h2>
              <p className="font-sans text-sm text-muted-foreground mb-8">
                Completează formularul și te vom contacta în cel mai scurt timp
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-sans text-xs tracking-[0.15em] uppercase text-foreground mb-2 block">
                      Nume *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-border focus:border-gold outline-none transition-colors font-sans text-sm"
                      placeholder="Numele dumneavoastră"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs tracking-[0.15em] uppercase text-foreground mb-2 block">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border focus:border-gold outline-none transition-colors font-sans text-sm"
                      placeholder="email@exemplu.ro"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-sans text-xs tracking-[0.15em] uppercase text-foreground mb-2 block">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onFocus={handlePhoneFocus}
                    required
                    className={`w-full px-4 py-3 bg-background border ${
                      phoneError ? 'border-red-500' : 'border-border'
                    } focus:border-gold outline-none transition-colors font-sans text-sm`}
                    placeholder="+373-123-45-678"
                  />
                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                  )}
                </div>

                <div>
                  <label className="font-sans text-xs tracking-[0.15em] uppercase text-foreground mb-2 block">
                    Mesaj
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 bg-background border border-border focus:border-gold outline-none transition-colors font-sans text-sm resize-none"
                    placeholder="Descrieți cererea dumneavoastră..."
                  />
                </div>

                <button type="submit" className="btn-luxury-filled w-full flex items-center justify-center gap-2">
                  <Send size={16} />
                  Trimite Mesajul
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
