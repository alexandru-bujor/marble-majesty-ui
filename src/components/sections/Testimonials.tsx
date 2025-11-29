import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: 'Masa din marmură Carrara pe care am achiziționat-o este pur și simplu extraordinară. A transformat complet dining room-ul nostru într-un spațiu de o eleganță rafinată.',
    author: 'Alexandra Ionescu',
    title: 'Arhitect de Interior, București',
  },
  {
    quote: 'Calitatea excepțională și atenția la detalii sunt evidente în fiecare centimetru pătrat. Am colaborat pentru o masă personalizată și rezultatul a depășit toate așteptările.',
    author: 'Mihai Popescu',
    title: 'Colecționar de Artă, Cluj',
  },
  {
    quote: 'O investiție în frumos și durabilitate. După 5 ani, masa arată la fel de impecabil ca în prima zi. Recomand cu încredere Pietra Nobile.',
    author: 'Elena Dumitrescu',
    title: 'Designer, Timișoara',
  },
];

const Testimonials = () => {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-luxury">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold mb-4">
            Testimoniale
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground">
            Clienții Noștri
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative p-8 md:p-10 bg-card border border-border hover:border-gold/30 transition-all duration-500"
            >
              {/* Quote Icon */}
              <Quote
                size={40}
                strokeWidth={1}
                className="text-gold/30 mb-6"
              />

              {/* Quote Text */}
              <blockquote className="font-serif text-lg md:text-xl text-foreground leading-relaxed mb-8 italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="border-t border-border pt-6">
                <p className="font-sans text-sm font-medium text-foreground">
                  {testimonial.author}
                </p>
                <p className="font-sans text-xs text-muted-foreground mt-1">
                  {testimonial.title}
                </p>
              </div>

              {/* Decorative corner */}
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-gold/0 group-hover:border-gold/40 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
