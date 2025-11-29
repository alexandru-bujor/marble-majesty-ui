import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/sections/Footer';
import { ShoppingBag, Heart, Truck, Shield, RotateCcw, ChevronRight, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import diningTable from '@/assets/collection-dining-table.jpg';
import coffeeTable from '@/assets/collection-coffee-table.jpg';
import customDesign from '@/assets/collection-custom.jpg';
import outdoorTable from '@/assets/collection-outdoor.jpg';
import showroom1 from '@/assets/showroom-1.jpg';
import showroom2 from '@/assets/showroom-2.jpg';

const allProducts = [
  { id: 1, name: 'Tavola Carrara', category: 'Masă Dining', price: '€12,500', material: 'Marmură Carrara', image: diningTable, dimensions: '200 x 100 x 75 cm', weight: '180 kg' },
  { id: 2, name: 'Nero Elegante', category: 'Masă Cafea', price: '€4,800', material: 'Granit Nero Marquina', image: coffeeTable, dimensions: '120 x 60 x 45 cm', weight: '85 kg' },
  { id: 3, name: 'Scultura Bianca', category: 'Design Unic', price: '€18,900', material: 'Marmură Calacatta', image: customDesign, dimensions: '180 x 90 x 75 cm', weight: '150 kg' },
  { id: 4, name: 'Terrazza Grande', category: 'Exterior', price: '€8,200', material: 'Granit Natural', image: outdoorTable, dimensions: '160 x 80 x 75 cm', weight: '200 kg' },
  { id: 5, name: 'Milano Ovale', category: 'Masă Dining', price: '€15,400', material: 'Marmură Statuario', image: showroom1, dimensions: '220 x 110 x 75 cm', weight: '195 kg' },
  { id: 6, name: 'Firenze Noir', category: 'Masă Dining', price: '€14,200', material: 'Granit Nero Assoluto', image: showroom2, dimensions: '200 x 100 x 75 cm', weight: '185 kg' },
];

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const product = allProducts.find(p => p.id === Number(id)) || allProducts[0];
  const images = [product.image, showroom1, showroom2];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="pt-28 pb-4 bg-secondary/30">
        <div className="container-luxury">
          <nav className="flex items-center gap-2 font-sans text-xs tracking-wider">
            <Link to="/" className="text-muted-foreground hover:text-gold transition-colors">Acasă</Link>
            <ChevronRight size={12} className="text-muted-foreground" />
            <Link to="/shop" className="text-muted-foreground hover:text-gold transition-colors">Magazin</Link>
            <ChevronRight size={12} className="text-muted-foreground" />
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden bg-secondary/30">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? 'border-gold' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold mb-2">
                  {product.category}
                </p>
                <h1 className="font-serif text-3xl md:text-5xl text-foreground mb-4">
                  {product.name}
                </h1>
                <p className="font-serif text-2xl md:text-3xl text-foreground">
                  {product.price}
                </p>
              </div>

              <p className="font-sans text-muted-foreground leading-relaxed">
                O piesă de mobilier excepțională, sculptată manual din {product.material.toLowerCase()} 
                de cea mai înaltă calitate. Fiecare masă este unică, prezentând venatura naturală 
                și caracterul distinct al pietrei.
              </p>

              {/* Specifications */}
              <div className="border-t border-b border-border py-6 space-y-4">
                <div className="flex justify-between">
                  <span className="font-sans text-sm text-muted-foreground">Material</span>
                  <span className="font-sans text-sm text-foreground">{product.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-sm text-muted-foreground">Dimensiuni</span>
                  <span className="font-sans text-sm text-foreground">{product.dimensions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-sm text-muted-foreground">Greutate</span>
                  <span className="font-sans text-sm text-foreground">{product.weight}</span>
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-sans text-xs tracking-[0.15em] uppercase text-foreground">
                    Cantitate
                  </span>
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-secondary/50 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-6 font-sans">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-secondary/50 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="btn-luxury-filled flex-1 flex items-center justify-center gap-2">
                    <ShoppingBag size={18} />
                    Adaugă în Coș
                  </button>
                  <button className="w-14 h-14 border border-gold/30 flex items-center justify-center hover:bg-gold/5 transition-colors">
                    <Heart size={20} className="text-gold" />
                  </button>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center">
                  <Truck size={24} className="text-gold mx-auto mb-2" strokeWidth={1.5} />
                  <p className="font-sans text-[10px] tracking-wider uppercase text-muted-foreground">
                    Livrare Premium
                  </p>
                </div>
                <div className="text-center">
                  <Shield size={24} className="text-gold mx-auto mb-2" strokeWidth={1.5} />
                  <p className="font-sans text-[10px] tracking-wider uppercase text-muted-foreground">
                    Garanție pe Viață
                  </p>
                </div>
                <div className="text-center">
                  <RotateCcw size={24} className="text-gold mx-auto mb-2" strokeWidth={1.5} />
                  <p className="font-sans text-[10px] tracking-wider uppercase text-muted-foreground">
                    Retur 30 Zile
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;
