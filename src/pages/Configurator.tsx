import { useState, useMemo, lazy, Suspense, useEffect, useRef, Component, ErrorInfo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/sections/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Download, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Lazy load ModelViewer with error handling to prevent continuous errors
const ModelViewer = lazy(() => {
  return import('@/components/ModelViewer').catch((error) => {
    console.error('Failed to lazy load ModelViewer:', error);
    // Return a safe fallback component that won't cause errors
    return {
      default: () => (
        <div className="w-full h-full flex items-center justify-center bg-secondary/10">
          <div className="text-center p-8 space-y-4">
            <p className="font-sans text-sm text-muted-foreground mb-2">
              Configuratorul 3D nu este disponibil pe acest dispozitiv
            </p>
            <p className="font-sans text-xs text-muted-foreground">
              Te rugăm să încerci pe un dispozitiv desktop sau să actualizezi browserul
            </p>
          </div>
        </div>
      )
    };
  });
});

// Check WebGL support
const checkWebGLSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
};

// Error Boundary for Configurator
class ConfiguratorErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Configurator error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-background flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center p-6 pt-24">
            <div className="max-w-md text-center space-y-4">
              <h2 className="font-serif text-2xl text-foreground">Eroare la încărcare</h2>
              <p className="font-sans text-sm text-muted-foreground">
                Ne pare rău, a apărut o problemă la încărcarea configuratorului.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-luxury-filled px-6 py-3"
              >
                Reîncarcă pagina
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Configurator = () => {
  const isMobile = useIsMobile();
  const [material, setMaterial] = useState(''); // Not used, kept for compatibility
  const [shape, setShape] = useState('rectangular');
  const [isTextureLoading, setIsTextureLoading] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);
  const [modelViewerError, setModelViewerError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  // Dimensions based on shape
  const [radius, setRadius] = useState([100]); // For circle
  const [squareLength, setSquareLength] = useState([150]); // For square
  const [length, setLength] = useState([200]); // For rectangular/curved-rectangular
  const [width, setWidth] = useState([100]); // For rectangular/curved-rectangular
  const [largestDiameter, setLargestDiameter] = useState([200]); // For oval
  const [smallestDiameter, setSmallestDiameter] = useState([120]); // For oval
  const [borderRadius, setBorderRadius] = useState([0]); // Border radius for all shapes (cm)
  const [edgeProfile, setEdgeProfile] = useState('eased'); // Edge profile type
  const [thickness, setThickness] = useState(20); // Thickness in mm (20mm or 30mm)
  const [baseStyle, setBaseStyle] = useState('base4'); // Default to base4 (baza eleganta)
  const [textureType, setTextureType] = useState('1');
  const [configPanelOpen, setConfigPanelOpen] = useState(false); // Config panel visibility - starts closed so users can see 3D viewer

  // Texture type options - all 48 HEIC images
  const textureTypes = Array.from({ length: 26 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  const shapes = [
    { value: 'rectangular', label: 'Dreptunghiulară' },
    { value: 'square', label: 'Pătrată' },
    { value: 'round', label: 'Rotundă' },
    { value: 'oval', label: 'Ovală' },
  ];

  // Edge profile types (edge shape) - only rounded options
  const edgeProfiles = [
    { value: 'eased', label: 'Puțin Rotunjit' },
    { value: 'pencil-round', label: 'Rotunjit' },
  ];

  // AllInStone base styles - using their actual base names from the API
  // Base styles - all bases including round ones
  const baseStyles = [
    { value: 'base1', label: 'Bază Modernă', baseName: 'base1', isRound: false },
    { value: 'base2', label: 'Bază Clasică', baseName: 'base2', isRound: false },
    { value: 'base3', label: 'Bază Minimalistă', baseName: 'base3', isRound: false },
    { value: 'base4', label: 'Bază Elegantă', baseName: 'base4', isRound: false },
    { value: 'base5', label: 'Bază Contemporană', baseName: 'base5', isRound: false },
    { value: 'base6', label: 'Bază Tradițională', baseName: 'base6', isRound: false },
    { value: 'base7', label: 'Bază Premium', baseName: 'base7', isRound: false },
    { value: 'buraga', label: 'Bază Rotundă (Buraga)', baseName: 'buraga', isRound: true },
  ];

  // Get base path for GitHub Pages (same as Vite's BASE_URL)
  const basePathPrefix = import.meta.env.BASE_URL || '/';

  // Map base styles to local base model files
  // Use basePathPrefix to ensure paths work on GitHub Pages
  const baseStyleToModel: Record<string, string> = {
    'base1': `${basePathPrefix}models/base1.glb`,
    'base2': `${basePathPrefix}models/base2.glb`,
    'base3': `${basePathPrefix}models/base3.glb`,
    'base4': `${basePathPrefix}models/base4.glb`,
    'base5': `${basePathPrefix}models/base5.glb`,
    'base6': `${basePathPrefix}models/base6.glb`,
    'base7': `${basePathPrefix}models/base7.glb`,
    'buraga': `${basePathPrefix}models/buraga.glb`,
  };

  // Use undefined for tableTopPath to generate shapes via code instead of GLB files
  // This allows full control over shape and texture
  const tableTopPath = useMemo(() => {
    return undefined; // Always generate shapes via code
  }, []);

  // Allow all bases for all shapes (user will specify which don't work)
  const basePath = useMemo(() => {
    return baseStyleToModel[baseStyle] || `${basePathPrefix}models/base1.glb`;
  }, [baseStyle, basePathPrefix]);



  const resetConfig = () => {
    setMaterial('');
    setShape('rectangular');
    setRadius([100]);
    setSquareLength([150]);
    setLength([200]);
    setWidth([100]);
    setLargestDiameter([200]);
    setSmallestDiameter([120]);
    setBorderRadius([0]);
    setEdgeProfile('eased');
    setThickness(20);
    setBaseStyle('base4');
    setTextureType('1');
  };

  // Prepare dimensions object for ModelViewer
  const dimensions = useMemo(() => {
    switch (shape) {
      case 'round':
        return { radius: radius[0] };
      case 'square':
        return { squareLength: squareLength[0], borderRadius: borderRadius[0] };
      case 'rectangular':
        return { length: length[0], width: width[0], borderRadius: borderRadius[0] };
      case 'oval':
        return { largestDiameter: largestDiameter[0], smallestDiameter: smallestDiameter[0], borderRadius: borderRadius[0] };
      default:
        return {};
    }
  }, [shape, radius, squareLength, length, width, largestDiameter, smallestDiameter, borderRadius]);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Check WebGL support on mount
  useEffect(() => {
    const webglSupported = checkWebGLSupport();
    setWebGLSupported(webglSupported);
    
    // On mobile, open settings panel by default but allow 3D viewer
    if (isMobile) {
      setConfigPanelOpen(false); // Start with panel closed so users can see 3D viewer
      console.log('Mobile device detected - 3D viewer enabled');
    }
  }, [isMobile]);

  // Set timeout for loading to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 30000); // 30 seconds timeout

    return () => clearTimeout(timer);
  }, []);

  // Handle ModelViewer errors - prevent continuous error loops
  useEffect(() => {
    if (modelViewerError) return; // Don't set up handlers if already in error state
    
    let errorCount = 0;
    const MAX_ERRORS = 3; // Stop after 3 errors to prevent loops
    
    const handleError = (event: ErrorEvent) => {
      errorCount++;
      if (errorCount > MAX_ERRORS) {
        // Stop propagation to prevent continuous errors
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      
      // Only catch errors related to ModelViewer/Canvas/WebGL
      const errorMsg = event.error?.message || event.message || '';
      const isRelevantError = 
        errorMsg.includes('Canvas') || 
        errorMsg.includes('WebGL') || 
        errorMsg.includes('ModelViewer') ||
        errorMsg.includes('three') ||
        errorMsg.includes('THREE') ||
        errorMsg.includes('GLTF') ||
        errorMsg.includes('GLB');
      
      if (isRelevantError && !modelViewerError) {
        console.error('Configurator error:', event.error);
        setModelViewerError(true);
        // Prevent error from propagating further
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errorCount++;
      if (errorCount > MAX_ERRORS) {
        event.preventDefault();
        return;
      }
      
      const reason = event.reason;
      const errorMsg = typeof reason === 'object' && reason?.message 
        ? String(reason.message) 
        : String(reason);
      
      const isRelevantError = 
        errorMsg.includes('Canvas') || 
        errorMsg.includes('WebGL') || 
        errorMsg.includes('ModelViewer') ||
        errorMsg.includes('three') ||
        errorMsg.includes('THREE') ||
        errorMsg.includes('GLTF') ||
        errorMsg.includes('GLB');
      
      if (isRelevantError && !modelViewerError) {
        console.error('Unhandled promise rejection:', event.reason);
        setModelViewerError(true);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError, { capture: true });
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError, { capture: true });
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [modelViewerError]);

  const downloadPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Modern header
    doc.setFillColor(45, 45, 45); // Dark background
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Title in English
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Custom Table Specifications', pageWidth / 2, 22, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Capture 3D model view - improved method
    let yPos = 45;
    if (canvasRef.current) {
      try {
        // Wait longer for rendering and texture loading
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to find the actual Three.js canvas
        const canvasElement = canvasRef.current.querySelector('canvas') as HTMLCanvasElement;
        if (canvasElement) {
          // Capture directly from the canvas element
          const imgData = canvasElement.toDataURL('image/png', 1.0);
          
          // Calculate image dimensions - make it larger and better positioned
          const imgWidth = pageWidth - 30; // Full width with margins
          const aspectRatio = canvasElement.height / canvasElement.width;
          const maxImgHeight = 100; // Maximum height for image
          const finalImgHeight = Math.min(imgWidth * aspectRatio, maxImgHeight);
          const finalImgWidth = finalImgHeight / aspectRatio;
          
          // Center the image
          const imgX = (pageWidth - finalImgWidth) / 2;
          
          // Add border around image
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.roundedRect(imgX - 2, yPos - 2, finalImgWidth + 4, finalImgHeight + 4, 2, 2, 'S');
          
          doc.addImage(imgData, 'PNG', imgX, yPos, finalImgWidth, finalImgHeight);
          yPos += finalImgHeight + 20;
        } else {
          // Fallback: try html2canvas on the container
          const canvas = await html2canvas(canvasRef.current, {
            backgroundColor: '#ffffff',
            useCORS: true,
            scale: 2,
            logging: false,
            allowTaint: true,
          });
          
          const imgData = canvas.toDataURL('image/png', 1.0);
          const imgWidth = pageWidth - 30;
          const aspectRatio = canvas.height / canvas.width;
          const maxImgHeight = 100;
          const finalImgHeight = Math.min(imgWidth * aspectRatio, maxImgHeight);
          const finalImgWidth = finalImgHeight / aspectRatio;
          const imgX = (pageWidth - finalImgWidth) / 2;
          
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.roundedRect(imgX - 2, yPos - 2, finalImgWidth + 4, finalImgHeight + 4, 2, 2, 'S');
          
          doc.addImage(imgData, 'PNG', imgX, yPos, finalImgWidth, finalImgHeight);
          yPos += finalImgHeight + 20;
        }
      } catch (error) {
        console.error('Error capturing 3D view:', error);
        doc.setFontSize(11);
        doc.setTextColor(150, 150, 150);
        doc.text('3D visualization unavailable', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
      }
    }
    
    // Section divider
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 12;
    
    // Configuration Details Section - Better Layout
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(15, yPos - 3, pageWidth - 30, 100, 2, 2, 'F');
    
    // Section title
    doc.setTextColor(45, 45, 45);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Configuration Details', 20, yPos + 8);
    yPos += 12;
    
    // Specifications in two columns - better spacing
    doc.setFontSize(10);
    const leftCol = 22;
    const rightCol = pageWidth / 2 + 5;
    let leftY = yPos;
    let rightY = yPos;
    const lineHeight = 7;
    
    // Helper function to add text
    const addText = (text: string, x: number, y: number, options?: { bold?: boolean; color?: [number, number, number]; size?: number }) => {
      if (options?.color) {
        doc.setTextColor(options.color[0], options.color[1], options.color[2]);
      }
      if (options?.size) {
        doc.setFontSize(options.size);
      }
      doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
      doc.text(text, x, y);
      doc.setFontSize(10); // Reset to default
    };
    
    // Left column - Main specs
    addText('Texture:', leftCol, leftY, { bold: true, color: [80, 80, 80] });
    addText(`Texture ${textureType}`, leftCol + 28, leftY, { color: [0, 0, 0] });
    leftY += lineHeight;
    
    addText('Shape:', leftCol, leftY, { bold: true, color: [80, 80, 80] });
    const shapeLabel = shapes.find(s => s.value === shape)?.label || shape;
    addText(shapeLabel, leftCol + 28, leftY, { color: [0, 0, 0] });
    leftY += lineHeight;
    
    addText('Thickness:', leftCol, leftY, { bold: true, color: [80, 80, 80] });
    addText(`${thickness} mm`, leftCol + 28, leftY, { color: [0, 0, 0] });
    leftY += lineHeight;
    
    addText('Edge Profile:', leftCol, leftY, { bold: true, color: [80, 80, 80] });
    addText(edgeProfiles.find(p => p.value === edgeProfile)?.label || edgeProfile, leftCol + 28, leftY, { color: [0, 0, 0] });
    leftY += lineHeight;
    
    addText('Base:', leftCol, leftY, { bold: true, color: [80, 80, 80] });
    addText(baseStyles.find(b => b.value === baseStyle)?.label || baseStyle, leftCol + 28, leftY, { color: [0, 0, 0] });
    
    // Right column - Dimensions
    addText('Dimensions:', rightCol, rightY, { bold: true, color: [80, 80, 80] });
    rightY += lineHeight;
    
    if (shape === 'round') {
      addText(`Radius: ${radius[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      if (borderRadius[0] > 0) {
        rightY += lineHeight;
        addText(`Corner Radius: ${borderRadius[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      }
    } else if (shape === 'square') {
      addText(`Length: ${squareLength[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      if (borderRadius[0] > 0) {
        rightY += lineHeight;
        addText(`Corner Radius: ${borderRadius[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      }
    } else if (shape === 'rectangular' || shape === 'curved-rectangular') {
      addText(`Length: ${length[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      rightY += lineHeight;
      addText(`Width: ${width[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      if (borderRadius[0] > 0) {
        rightY += lineHeight;
        addText(`Corner Radius: ${borderRadius[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      }
    } else if (shape === 'oval') {
      addText(`Major Diameter: ${largestDiameter[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      rightY += lineHeight;
      addText(`Minor Diameter: ${smallestDiameter[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      if (borderRadius[0] > 0) {
        rightY += lineHeight;
        addText(`Corner Radius: ${borderRadius[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      }
    }
    
    // Footer
    yPos = pageHeight - 15;
    doc.setDrawColor(220, 220, 220);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 7;
    
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated on: ${dateStr}`, pageWidth / 2, yPos, { align: 'center' });
    
    // Save PDF
    doc.save(`table-specifications-${Date.now()}.pdf`);
  };

  // Show WebGL error if not supported
  if (webGLSupported === false) {
    return (
      <div className="h-screen w-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 pt-24">
          <div className="max-w-md text-center space-y-4">
            <h2 className="font-serif text-2xl text-foreground">WebGL nu este suportat</h2>
            <p className="font-sans text-sm text-muted-foreground">
              Configuratorul necesită WebGL pentru a funcționa. Te rugăm să folosești un browser modern sau să activezi accelerația hardware.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-luxury-filled px-6 py-3"
            >
              Reîncarcă pagina
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ConfiguratorErrorBoundary>
      <div className="h-screen w-screen bg-background overflow-hidden flex flex-col">
        <Navbar />
      
      {/* Configurator Section - Full Screen, positioned below navbar */}
      <section className="flex-1 flex flex-col md:flex-row min-h-0 pt-20 md:pt-24">
        {/* 3D Model Viewer - Hidden on mobile when panel is open, takes remaining space on desktop */}
        <div className={`${isMobile && configPanelOpen ? 'hidden' : 'flex-1'} min-h-0 relative`}>
          <Card className="border-border overflow-hidden h-full">
            <CardContent className="p-0 h-full">
              <div ref={canvasRef} className="w-full h-full relative">
                {/* Show error message only if there's an actual error */}
                {modelViewerError ? (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                    <div className="text-center p-8 space-y-4">
                      <p className="font-sans text-sm text-muted-foreground mb-2">
                        Eroare la încărcarea vizualizatorului 3D
                      </p>
                      <button
                        onClick={() => {
                          setModelViewerError(false);
                          window.location.reload();
                        }}
                        className="btn-luxury-filled px-4 py-2 text-sm"
                      >
                        Reîncarcă
                      </button>
                    </div>
                  </div>
                ) : (
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                      <div className="text-center p-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4"></div>
                        <p className="font-sans text-sm text-muted-foreground">
                          Se încarcă vizualizatorul 3D...
                        </p>
                      </div>
                    </div>
                  }>
                    <ModelViewer
                        tableTopPath={tableTopPath}
                        basePath={basePath}
                        material={material}
                        shape={shape}
                        baseStyle={baseStyle}
                        dimensions={dimensions}
                        edgeProfile={edgeProfile}
                        thickness={thickness / 1000} // Convert mm to meters
                        textureType={textureType}
                        onTextureLoading={setIsTextureLoading}
                    />
                  </Suspense>
                )}
                
                {/* Texture Loading Overlay */}
                {isTextureLoading && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center p-8 space-y-4">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                      <p className="font-sans text-sm font-medium text-foreground">
                        Loading texture...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Toggle Button - Mobile Only */}
          <button
            onClick={() => setConfigPanelOpen(!configPanelOpen)}
            className="md:hidden absolute bottom-0 left-1/2 transform -translate-x-1/2 z-50 bg-background/95 backdrop-blur-sm border border-border border-b-0 rounded-t-lg px-4 py-2.5 flex items-center gap-2 hover:bg-background transition-colors shadow-lg"
          >
            <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-foreground">
              {configPanelOpen ? 'Ascunde' : 'Afișează'}
            </span>
            {configPanelOpen ? <ChevronDown size={18} className="w-4 h-4" /> : <ChevronUp size={18} className="w-4 h-4" />}
          </button>
        </div>

        {/* Configuration Panel - Desktop: Fixed Right Sidebar, Mobile: Full Screen Overlay */}
        <div className={`md:static md:w-[420px] md:h-full md:translate-y-0 md:border-t-0 md:border-l absolute bottom-0 left-0 right-0 md:right-auto bg-background/98 backdrop-blur-md border-t border-border transition-transform duration-300 ${isMobile ? 'max-h-[100vh]' : 'max-h-[85vh]'} md:max-h-full overflow-y-auto ${
            configPanelOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'
          }`}>
            <div className="p-4 md:p-6 pb-6 md:pb-6 md:overflow-y-auto md:h-full">
              {/* Mobile: Single column, Desktop: Single column sidebar */}
              <div className="flex flex-col gap-4 md:gap-4">
              {/* Shape Selection - First */}
              <Card className="border-border shadow-sm">
                <CardContent className="p-5 md:p-4 space-y-3">
                  <label className="font-sans text-sm md:text-xs tracking-[0.15em] uppercase text-foreground mb-3 md:mb-2 block font-medium">
                    Formă
                  </label>
                  <Select value={shape} onValueChange={setShape}>
                    <SelectTrigger className="w-full h-12 md:h-10 text-base md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shapes.map((s) => (
                        <SelectItem key={s.value} value={s.value} className="text-base md:text-sm py-3 md:py-2">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

            {/* Texture Type Selection */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 md:p-4 space-y-3">
                <label className="font-sans text-sm md:text-xs tracking-[0.15em] uppercase text-foreground mb-3 md:mb-2 block font-medium">
                  Textură
                </label>
                <Select value={textureType} onValueChange={setTextureType}>
                  <SelectTrigger className="w-full h-12 md:h-10 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[60vh]">
                    {textureTypes.map((tex) => (
                      <SelectItem key={tex.value} value={tex.value} className="text-base md:text-sm py-3 md:py-2">
                        {tex.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Thickness - Mobile Optimized */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 md:p-4 space-y-3">
                <label className="font-sans text-sm md:text-xs tracking-[0.15em] uppercase text-foreground mb-3 md:mb-2 block font-medium">
                  Grosime (mm)
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setThickness(20)}
                    className={`flex-1 px-4 py-3 md:py-2 rounded-lg border-2 transition-all text-base md:text-sm font-medium min-h-[48px] md:min-h-0 ${
                      thickness === 20
                        ? 'bg-foreground text-background border-foreground shadow-md scale-[1.02]'
                        : 'bg-background text-foreground border-border hover:bg-secondary active:scale-[0.98]'
                    }`}
                  >
                    20mm
                  </button>
                  <button
                    type="button"
                    onClick={() => setThickness(30)}
                    className={`flex-1 px-4 py-3 md:py-2 rounded-lg border-2 transition-all text-base md:text-sm font-medium min-h-[48px] md:min-h-0 ${
                      thickness === 30
                        ? 'bg-foreground text-background border-foreground shadow-md scale-[1.02]'
                        : 'bg-background text-foreground border-border hover:bg-secondary active:scale-[0.98]'
                    }`}
                  >
                    30mm
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Edge Profile */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 md:p-4 space-y-3">
                <label className="font-sans text-sm md:text-xs tracking-[0.15em] uppercase text-foreground mb-3 md:mb-2 block font-medium">
                  Profil Margini
                </label>
                <Select value={edgeProfile} onValueChange={setEdgeProfile}>
                  <SelectTrigger className="w-full h-12 md:h-10 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {edgeProfiles.map((ep) => (
                      <SelectItem key={ep.value} value={ep.value} className="text-base md:text-sm py-3 md:py-2">
                        {ep.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Base Style */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 md:p-4 space-y-3">
                <label className="font-sans text-sm md:text-xs tracking-[0.15em] uppercase text-foreground mb-3 md:mb-2 block font-medium">
                  Bază
                </label>
                <Select value={baseStyle} onValueChange={setBaseStyle}>
                  <SelectTrigger className="w-full h-12 md:h-10 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {baseStyles.map((bs) => (
                      <SelectItem key={bs.value} value={bs.value} className="text-base md:text-sm py-3 md:py-2">
                        {bs.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Dimensions - Shape Specific - Full Width */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 md:p-6 space-y-5 md:space-y-6">
                <h3 className="font-sans text-base md:text-sm tracking-[0.15em] uppercase text-foreground font-semibold mb-4 md:mb-0">
                  Dimensiuni (cm)
                </h3>
                  
                  <div className="space-y-5 md:space-y-4">
                    {/* Circle: Radius */}
                    {shape === 'round' && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-sans text-sm md:text-xs text-muted-foreground font-medium">Rază</span>
                          <span className="font-sans text-lg md:text-xs text-foreground font-semibold bg-secondary/50 px-3 py-1 rounded-md">{radius[0]} cm</span>
                        </div>
                        <Slider
                          value={radius}
                          onValueChange={setRadius}
                          min={50}
                          max={150}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Square: Length */}
                    {shape === 'square' && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-sans text-sm md:text-xs text-muted-foreground font-medium">Lungime</span>
                          <span className="font-sans text-lg md:text-xs text-foreground font-semibold bg-secondary/50 px-3 py-1 rounded-md">{squareLength[0]} cm</span>
                        </div>
                        <Slider
                          value={squareLength}
                          onValueChange={setSquareLength}
                          min={80}
                          max={200}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Rectangular: Length and Width */}
                    {shape === 'rectangular' && (
                      <>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-sans text-sm md:text-xs text-muted-foreground font-medium">Lungime</span>
                            <span className="font-sans text-lg md:text-xs text-foreground font-semibold bg-secondary/50 px-3 py-1 rounded-md">{length[0]} cm</span>
                          </div>
                          <Slider
                            value={length}
                            onValueChange={setLength}
                            min={120}
                            max={300}
                            step={10}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-sans text-sm md:text-xs text-muted-foreground font-medium">Lățime</span>
                            <span className="font-sans text-lg md:text-xs text-foreground font-semibold bg-secondary/50 px-3 py-1 rounded-md">{width[0]} cm</span>
                          </div>
                          <Slider
                            value={width}
                            onValueChange={setWidth}
                            min={60}
                            max={150}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      </>
                    )}

                    {/* Border Radius - Available for all shapes */}
                    <div className="space-y-3 pt-2 border-t border-border/50">
                      <div className="flex justify-between items-center">
                        <span className="font-sans text-sm md:text-xs text-muted-foreground font-medium">Rază Colțuri</span>
                        <span className="font-sans text-lg md:text-xs text-foreground font-semibold bg-secondary/50 px-3 py-1 rounded-md">{borderRadius[0]} cm</span>
                      </div>
                      <Slider
                        value={borderRadius}
                        onValueChange={setBorderRadius}
                        min={0}
                        max={20}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Oval: Largest and Smallest Diameter */}
                    {shape === 'oval' && (
                      <>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-sans text-sm md:text-xs text-muted-foreground font-medium">Diametru Mare</span>
                            <span className="font-sans text-lg md:text-xs text-foreground font-semibold bg-secondary/50 px-3 py-1 rounded-md">{largestDiameter[0]} cm</span>
                          </div>
                          <Slider
                            value={largestDiameter}
                            onValueChange={setLargestDiameter}
                            min={120}
                            max={300}
                            step={10}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-sans text-sm md:text-xs text-muted-foreground font-medium">Diametru Mic</span>
                            <span className="font-sans text-lg md:text-xs text-foreground font-semibold bg-secondary/50 px-3 py-1 rounded-md">{smallestDiameter[0]} cm</span>
                          </div>
                          <Slider
                            value={smallestDiameter}
                            onValueChange={setSmallestDiameter}
                            min={60}
                            max={150}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      </>
                    )}

                  </div>
                </CardContent>
            </Card>

            {/* Summary & Actions - Full Width */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 md:p-6 space-y-5 md:space-y-6">
                <h3 className="font-serif text-xl md:text-2xl text-foreground mb-4 font-semibold">
                  Rezumat Configurație
                </h3>

                  <div className="space-y-3 md:space-y-2.5 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="font-sans text-sm md:text-xs text-muted-foreground font-medium">Textură</span>
                      <span className="font-sans text-base md:text-sm text-foreground font-semibold">
                        Textură {textureType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="font-sans text-sm md:text-xs text-muted-foreground font-medium">Formă</span>
                      <span className="font-sans text-base md:text-sm text-foreground font-semibold">
                        {shapes.find(s => s.value === shape)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-start py-2 border-b border-border/30">
                      <span className="font-sans text-sm md:text-xs text-muted-foreground font-medium">Dimensiuni</span>
                      <span className="font-sans text-base md:text-sm text-foreground font-semibold text-right max-w-[60%]">
                        {shape === 'round' && `${radius[0]} cm (rază)`}
                        {shape === 'square' && `${squareLength[0]} cm`}
                        {(shape === 'rectangular' || shape === 'curved-rectangular') && `${length[0]} × ${width[0]} cm`}
                        {shape === 'oval' && `${largestDiameter[0]} × ${smallestDiameter[0]} cm`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-sans text-sm md:text-xs text-muted-foreground font-medium">Bază</span>
                      <span className="font-sans text-base md:text-sm text-foreground font-semibold">
                        {baseStyles.find(b => b.value === baseStyle)?.label}
                      </span>
                    </div>
                  </div>


                  <div className="space-y-3 pt-2">
                    <Button className="w-full btn-luxury-filled flex items-center justify-center gap-2 h-12 md:h-10 text-base md:text-sm font-medium">
                      <ShoppingBag size={20} className="md:w-4 md:h-4" />
                      Trimite specificații
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 h-12 md:h-10 text-base md:text-sm font-medium border-2"
                      onClick={downloadPDF}
                    >
                      <Download size={20} className="md:w-4 md:h-4" />
                      Descarcă Specificații
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-center gap-2 h-12 md:h-10 text-base md:text-sm font-medium"
                      onClick={resetConfig}
                    >
                      <RotateCcw size={20} className="md:w-4 md:h-4" />
                      Resetează
                    </Button>
                  </div>
                </CardContent>
            </Card>
              </div>
            </div>
        </div>
      </section>
      </div>
    </ConfiguratorErrorBoundary>
  );
};

export default Configurator;
