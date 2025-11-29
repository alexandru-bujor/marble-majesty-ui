import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import Collections from '@/components/sections/Collections';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import Showroom from '@/components/sections/Showroom';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import Testimonials from '@/components/sections/Testimonials';
import Footer from '@/components/sections/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Collections />
        <FeaturedProducts />
        <Showroom />
        <WhyChooseUs />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
