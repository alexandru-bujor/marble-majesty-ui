import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetail from "./pages/ProductDetail";
import ShowroomPage from "./pages/ShowroomPage";
import Configurator from "./pages/Configurator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Get base path from Vite's import.meta.env.BASE_URL
// This will be '/' in development and '/marble-majesty-ui/' in production
// Normalize basename: remove trailing slash and ensure it starts with /
let basename = import.meta.env.BASE_URL || '/';
// Remove trailing slash if present (except for root)
if (basename !== '/' && basename.endsWith('/')) {
  basename = basename.slice(0, -1);
}
// Ensure it starts with /
if (!basename.startsWith('/')) {
  basename = '/' + basename;
}

// Debug logging (remove in production if needed)
if (import.meta.env.DEV) {
  console.log('Router basename:', basename);
  console.log('BASE_URL:', import.meta.env.BASE_URL);
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/configurator" element={<Configurator />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/showroom" element={<ShowroomPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          {/* Redirect root path if accessed with trailing slash */}
          <Route path="" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
