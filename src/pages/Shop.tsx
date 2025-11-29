import Navbar from '@/components/Navbar';
import Footer from '@/components/sections/Footer';
import { ShoppingBag, Eye, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import diningTable from '@/assets/collection-dining-table.jpg';
import coffeeTable from '@/assets/collection-coffee-table.jpg';
import customDesign from '@/assets/collection-custom.jpg';
import outdoorTable from '@/assets/collection-outdoor.jpg';
import showroom1 from '@/assets/showroom-1.jpg';
import showroom2 from '@/assets/showroom-2.jpg';

const products = [
  { id: 1, name: 'Tavola Carrara', category: 'Masă Dining', price: '€12,500', material: 'Marmură Carrara', image: diningTable },
  { id: 2, name: 'Nero Elegante', category: 'Masă Cafea', price: '€4,800', material: 'Granit Nero Marquina', image: coffeeTable },
  { id: 3, name: 'Scultura Bianca', category: 'Design Unic', price: '€18,900', material: 'Marmură Calacatta', image: customDesign },
  { id: 4, name: 'Terrazza Grande', category: 'Exterior', price: '€8,200', material: 'Granit Natural', image: outdoorTable },
  { id: 5, name: 'Milano Ovale', category: 'Masă Dining', price: '€15,400', material: 'Marmură Statuario', image: showroom1 },
  { id: 6, name: 'Firenze Noir', category: 'Masă Dining', price: '€14,200', material: 'Granit Nero Assoluto', image: showroom2 },
];

const categories = ['Toate', 'Mese Dining', 'Mese Cafea', 'Design Unic', 'Exterior'];

const Shop = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Banner */}
      <section className="pt-32 pb-16 bg-graphite text-marble">
        <div className="container-luxury text-center">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold mb-4">
            Colecția Completă
          </p>
          <h1 className="font-serif text-4xl md:text-6xl mb-6">
            Magazin
          </h1>
          <p className="font-sans text-marble/60 max-w-xl mx-auto">
            Explorează întreaga noastră colecție de mese sculptate din piatră naturală
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-8 border-b border-border">
        <div className="container-luxury flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`font-sans text-xs tracking-[0.15em] uppercase px-4 py-2 transition-all duration-300 ${
                  cat === 'Toate' 
                    ? 'bg-graphite text-marble' 
                    : 'text-foreground hover:text-gold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 font-sans text-xs tracking-[0.15em] uppercase text-foreground hover:text-gold transition-colors">
            <SlidersHorizontal size={16} />
            Filtrează
          </button>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group"
              >
                <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  <div className="absolute inset-0 bg-graphite/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
                    <span className="w-12 h-12 rounded-full bg-marble flex items-center justify-center text-graphite">
                      <Eye size={18} />
                    </span>
                    <span className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-graphite">
                      <ShoppingBag size={18} />
                    </span>
                  </div>

                  <div className="absolute top-4 left-4 px-3 py-1 bg-graphite/80 backdrop-blur-sm">
                    <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-marble">
                      {product.material}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    {product.category}
                  </p>
                  <h3 className="font-serif text-xl text-foreground group-hover:text-gold transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="font-sans text-lg tracking-wider text-foreground">
                    {product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
