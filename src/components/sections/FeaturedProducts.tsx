import { ShoppingBag, Eye } from 'lucide-react';
import diningTable from '@/assets/collection-dining-table.jpg';
import coffeeTable from '@/assets/collection-coffee-table.jpg';
import customDesign from '@/assets/collection-custom.jpg';

const products = [
  {
    id: 1,
    name: 'Tavola Carrara',
    category: 'Masă Dining',
    price: '€12,500',
    material: 'Marmură Carrara',
    image: diningTable,
  },
  {
    id: 2,
    name: 'Nero Elegante',
    category: 'Masă Cafea',
    price: '€4,800',
    material: 'Granit Nero Marquina',
    image: coffeeTable,
  },
  {
    id: 3,
    name: 'Scultura Bianca',
    category: 'Design Unic',
    price: '€18,900',
    material: 'Marmură Calacatta',
    image: customDesign,
  },
];

const FeaturedProducts = () => {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-luxury">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div>
            <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold mb-4">
              Piese Selectate
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground">
              Colecția Featured
            </h2>
          </div>
          <a
            href="#shop"
            className="mt-6 md:mt-0 font-sans text-sm tracking-[0.15em] uppercase text-foreground hover:text-gold transition-colors duration-300 flex items-center gap-2"
          >
            Vezi Tot <span className="text-gold">→</span>
          </a>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Product Image */}
              <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-graphite/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
                  <button className="w-12 h-12 rounded-full bg-marble flex items-center justify-center text-graphite hover:bg-gold hover:text-graphite transition-colors duration-300 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <Eye size={18} />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-graphite hover:bg-marble transition-colors duration-300 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-75">
                    <ShoppingBag size={18} />
                  </button>
                </div>

                {/* Material Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-graphite/80 backdrop-blur-sm">
                  <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-marble">
                    {product.material}
                  </span>
                </div>
              </div>

              {/* Product Info */}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
