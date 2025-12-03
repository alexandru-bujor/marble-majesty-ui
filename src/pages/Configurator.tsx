import { useState, useMemo, lazy, Suspense, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/sections/Footer';

const ModelViewer = lazy(() => import('@/components/ModelViewer'));
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
import { ShoppingBag, Download, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Configurator = () => {
  const [material, setMaterial] = useState('granite-white');
  const [shape, setShape] = useState('rectangular');
  // Dimensions based on shape
  const [radius, setRadius] = useState([100]); // For circle
  const [squareLength, setSquareLength] = useState([150]); // For square
  const [length, setLength] = useState([200]); // For rectangular/curved-rectangular
  const [width, setWidth] = useState([100]); // For rectangular/curved-rectangular
  const [largestDiameter, setLargestDiameter] = useState([200]); // For oval
  const [smallestDiameter, setSmallestDiameter] = useState([120]); // For oval
  const [borderRadius, setBorderRadius] = useState([0]); // Border radius for all shapes (cm)
  const [edgeProfile, setEdgeProfile] = useState('standard'); // Edge profile type
  const [thickness, setThickness] = useState(20); // Thickness in mm (20mm or 30mm)
  const [baseStyle, setBaseStyle] = useState('base1');
  const [materialCategory, setMaterialCategory] = useState('granite');

  // Material categories
  const materialCategories = [
    { value: 'marble', label: 'Marmură' },
    { value: 'granite', label: 'Granit' },
  ];

  // Marble materials
  const marbleMaterials = [
    { value: 'carrara', label: 'Carrara', category: 'marble' },
    { value: 'calacatta', label: 'Calacatta', category: 'marble' },
    { value: 'statuario', label: 'Statuario', category: 'marble' },
  ];

  // Granite materials - white, dark, gray
  const graniteMaterials = [
    { value: 'granite-white', label: 'Granit Alb', category: 'granite' },
    { value: 'granite-dark', label: 'Granit Închis', category: 'granite' },
    { value: 'granite-gray', label: 'Granit Gri', category: 'granite' },
  ];

  // Filter materials based on category
  const materials = useMemo(() => {
    if (materialCategory === 'marble') {
      return marbleMaterials;
    } else {
      return graniteMaterials;
    }
  }, [materialCategory]);

  // Reset material when category changes
  useEffect(() => {
    if (materialCategory === 'marble') {
      setMaterial(marbleMaterials[0].value);
    } else {
      setMaterial(graniteMaterials[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialCategory]);

  const shapes = [
    { value: 'rectangular', label: 'Dreptunghiulară' },
    { value: 'square', label: 'Pătrată' },
    { value: 'round', label: 'Rotundă' },
    { value: 'oval', label: 'Ovală' },
  ];

  // Edge profile types (edge shape) - matching AllInStone
  const edgeProfiles = [
    { value: 'standard', label: 'Standard' },
    { value: 'pencil-round', label: 'Pencil Round' },
    { value: 'shark-nose', label: 'Shark Nose' },
    { value: 'bullnose', label: 'Bull Nose' },
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
    setMaterialCategory('granite');
    setMaterial('granite-white');
    setShape('rectangular');
    setRadius([100]);
    setSquareLength([150]);
    setLength([200]);
    setWidth([100]);
    setLargestDiameter([200]);
    setSmallestDiameter([120]);
    setBorderRadius([0]);
    setEdgeProfile('standard');
    setThickness(20);
    setBaseStyle('base1');
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

  const downloadPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Modern header with gradient effect (simulated with rectangles)
    doc.setFillColor(68, 68, 69); // Dark gray background
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Title with modern styling
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const title = 'Specificații Masă Personalizată';
    doc.text(title, pageWidth / 2, 25, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Capture 3D model view
    let yPos = 50;
    if (canvasRef.current) {
      try {
        // Wait for rendering to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find the canvas element inside the container
        const canvasElement = canvasRef.current.querySelector('canvas') as HTMLCanvasElement;
        if (canvasElement) {
          // Capture the canvas directly with better settings
          const canvas = await html2canvas(canvasRef.current, {
            backgroundColor: '#f5f5f5',
            useCORS: true,
            scale: 2,
            logging: false,
            allowTaint: true,
            foreignObjectRendering: true,
            removeContainer: false,
          });
          
          const imgData = canvas.toDataURL('image/png', 1.0);
          
          // Add main 3D visualization - large and prominent
          const imgWidth = pageWidth - 40; // Full width with margins
          const imgHeight = (canvas.height / canvas.width) * imgWidth;
          const maxImgHeight = 120; // Maximum height for image
          const finalImgHeight = Math.min(imgHeight, maxImgHeight);
          const finalImgWidth = (canvas.width / canvas.height) * finalImgHeight;
          
          // Center the image
          const imgX = (pageWidth - finalImgWidth) / 2;
          
          doc.addImage(imgData, 'PNG', imgX, yPos, finalImgWidth, finalImgHeight);
          yPos += finalImgHeight + 15;
        }
      } catch (error) {
        console.error('Error capturing 3D view:', error);
        // Add placeholder text if capture fails
        doc.setFontSize(12);
        doc.setTextColor(150, 150, 150);
        doc.text('Vizualizare 3D indisponibilă', pageWidth / 2, yPos, { align: 'center' });
        yPos += 20;
      }
    }
    
    // Modern section divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;
    
    // Specifications section with modern card-like design
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, yPos - 5, pageWidth - 30, 140, 3, 3, 'F');
    
    // Section title
    doc.setTextColor(68, 68, 69);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalii Configurație', pageWidth / 2, yPos + 8, { align: 'center' });
    yPos += 15;
    
    // Specifications in modern grid layout
    doc.setFontSize(11);
    const leftCol = 25;
    const rightCol = pageWidth / 2 + 10;
    let leftY = yPos;
    let rightY = yPos;
    
    // Helper function to add text
    const addText = (text: string, x: number, y: number, options?: { bold?: boolean; color?: [number, number, number] }) => {
      if (options?.color) {
        doc.setTextColor(options.color[0], options.color[1], options.color[2]);
      }
      doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
      doc.text(text, x, y);
    };
    
    // Left column
    addText('Material:', leftCol, leftY, { bold: true, color: [100, 100, 100] });
    addText(materials.find(m => m.value === material)?.label || material, leftCol + 35, leftY, { color: [0, 0, 0] });
    leftY += 8;
    
    addText('Formă:', leftCol, leftY, { bold: true, color: [100, 100, 100] });
    addText(shapes.find(s => s.value === shape)?.label || shape, leftCol + 35, leftY, { color: [0, 0, 0] });
    leftY += 8;
    
    addText('Grosime:', leftCol, leftY, { bold: true, color: [100, 100, 100] });
    addText(`${thickness} mm`, leftCol + 35, leftY, { color: [0, 0, 0] });
    leftY += 8;
    
    addText('Profil Margini:', leftCol, leftY, { bold: true, color: [100, 100, 100] });
    addText(edgeProfiles.find(p => p.value === edgeProfile)?.label || edgeProfile, leftCol + 35, leftY, { color: [0, 0, 0] });
    leftY += 8;
    
    addText('Bază:', leftCol, leftY, { bold: true, color: [100, 100, 100] });
    addText(baseStyles.find(b => b.value === baseStyle)?.label || baseStyle, leftCol + 35, leftY, { color: [0, 0, 0] });
    
    // Right column - Dimensions
    addText('Dimensiuni:', rightCol, rightY, { bold: true, color: [100, 100, 100] });
    rightY += 8;
    
    if (shape === 'round') {
      addText(`Rază: ${radius[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      if (borderRadius[0] > 0) {
        rightY += 7;
        addText(`Rază colțuri: ${borderRadius[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      }
    } else if (shape === 'square') {
      addText(`Lungime: ${squareLength[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      if (borderRadius[0] > 0) {
        rightY += 7;
        addText(`Rază colțuri: ${borderRadius[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      }
    } else if (shape === 'rectangular') {
      addText(`Lungime: ${length[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      rightY += 7;
      addText(`Lățime: ${width[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      if (borderRadius[0] > 0) {
        rightY += 7;
        addText(`Rază colțuri: ${borderRadius[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      }
    } else if (shape === 'oval') {
      addText(`Diametru mare: ${largestDiameter[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      rightY += 7;
      addText(`Diametru mic: ${smallestDiameter[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      if (borderRadius[0] > 0) {
        rightY += 7;
        addText(`Rază colțuri: ${borderRadius[0]} cm`, rightCol, rightY, { color: [0, 0, 0] });
      }
    }
    
    // Modern footer
    yPos = pageHeight - 20;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 8;
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date().toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generat la: ${dateStr}`, pageWidth / 2, yPos, { align: 'center' });
    
    // Save PDF with proper encoding
    doc.save(`specificatii-masa-${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Banner */}
      <section className="pt-32 pb-16 bg-graphite text-marble">
        <div className="container-luxury text-center">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-gold mb-4">
            Design Personalizat
          </p>
          <h1 className="font-serif text-4xl md:text-6xl mb-6">
            Configurator Mese
          </h1>
          <p className="font-sans text-marble/60 max-w-xl mx-auto">
            Creează masa perfectă potrivită pentru spațiul tău
          </p>
        </div>
      </section>

      {/* Configurator Section */}
      <section className="section-padding">
        <div className="container-luxury">
          {/* 3D Model Viewer - Full Width on Top */}
          <div className="mb-8">
            <Card className="border-border overflow-hidden">
              <CardContent className="p-0">
                <div ref={canvasRef} className="aspect-video w-full min-h-[500px] lg:min-h-[600px]">
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                      <div className="text-center p-8">
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
                      />
                  </Suspense>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel - Below Viewer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Material Category Selection */}
            <Card className="border-border">
              <CardContent className="p-6 space-y-4">
                <label className="font-sans text-sm tracking-[0.15em] uppercase text-foreground mb-3 block">
                  Tip Material
                </label>
                <Select value={materialCategory} onValueChange={setMaterialCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {materialCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Material Selection */}
            <Card className="border-border">
              <CardContent className="p-6 space-y-4">
                <label className="font-sans text-sm tracking-[0.15em] uppercase text-foreground mb-3 block">
                  Material
                </label>
                <Select value={material} onValueChange={setMaterial}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((mat) => (
                      <SelectItem key={mat.value} value={mat.value}>
                        {mat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

              {/* Shape Selection */}
              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <label className="font-sans text-sm tracking-[0.15em] uppercase text-foreground mb-3 block">
                    Formă
                  </label>
                  <Select value={shape} onValueChange={setShape}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shapes.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
            </Card>

            {/* Dimensions - Shape Specific - Full Width */}
            <Card className="border-border md:col-span-2 lg:col-span-4">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-sans text-sm tracking-[0.15em] uppercase text-foreground">
                  Dimensiuni (cm)
                </h3>
                  
                  <div className="space-y-4">
                    {/* Circle: Radius */}
                    {shape === 'round' && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-sans text-xs text-muted-foreground">Rază</span>
                          <span className="font-sans text-xs text-foreground">{radius[0]} cm</span>
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
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-sans text-xs text-muted-foreground">Lungime</span>
                          <span className="font-sans text-xs text-foreground">{squareLength[0]} cm</span>
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
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-sans text-xs text-muted-foreground">Lungime</span>
                            <span className="font-sans text-xs text-foreground">{length[0]} cm</span>
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
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-sans text-xs text-muted-foreground">Lățime</span>
                            <span className="font-sans text-xs text-foreground">{width[0]} cm</span>
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
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-sans text-xs text-muted-foreground">Rază Colțuri</span>
                        <span className="font-sans text-xs text-foreground">{borderRadius[0]} cm</span>
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
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-sans text-xs text-muted-foreground">Diametru Mare</span>
                            <span className="font-sans text-xs text-foreground">{largestDiameter[0]} cm</span>
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
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-sans text-xs text-muted-foreground">Diametru Mic</span>
                            <span className="font-sans text-xs text-foreground">{smallestDiameter[0]} cm</span>
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

            {/* Thickness */}
            <Card className="border-border">
              <CardContent className="p-6 space-y-4">
                <label className="font-sans text-sm tracking-[0.15em] uppercase text-foreground mb-3 block">
                  Grosime (mm)
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setThickness(20)}
                    className={`flex-1 px-4 py-2 rounded border transition-colors ${
                      thickness === 20
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    20mm
                  </button>
                  <button
                    type="button"
                    onClick={() => setThickness(30)}
                    className={`flex-1 px-4 py-2 rounded border transition-colors ${
                      thickness === 30
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    30mm
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Edge Profile */}
            <Card className="border-border">
              <CardContent className="p-6 space-y-4">
                <label className="font-sans text-sm tracking-[0.15em] uppercase text-foreground mb-3 block">
                  Profil Margini
                </label>
                <Select value={edgeProfile} onValueChange={setEdgeProfile}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {edgeProfiles.map((profile) => (
                      <SelectItem key={profile.value} value={profile.value}>
                        {profile.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Base Style */}
            <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <label className="font-sans text-sm tracking-[0.15em] uppercase text-foreground mb-3 block">
                    Stil Bază
                  </label>
                  <Select value={baseStyle} onValueChange={setBaseStyle}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    {baseStyles.map((base) => (
                      <SelectItem key={base.value} value={base.value}>
                        {base.label} {base.isRound && '🔵'}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

            {/* Summary & Actions - Full Width */}
            <Card className="border-border md:col-span-2 lg:col-span-4">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-serif text-2xl text-foreground mb-4">
                  Rezumat Configurație
                </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-sans text-muted-foreground">Material</span>
                      <span className="font-sans text-foreground">
                        {materials.find(m => m.value === material)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-muted-foreground">Formă</span>
                      <span className="font-sans text-foreground">
                        {shapes.find(s => s.value === shape)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-muted-foreground">Dimensiuni</span>
                      <span className="font-sans text-foreground">
                        {shape === 'round' && `${radius[0]} cm (rază)`}
                        {shape === 'square' && `${squareLength[0]} cm`}
                        {(shape === 'rectangular' || shape === 'curved-rectangular') && `${length[0]} cm${borderRadius[0] > 0 ? ` (rază colțuri: ${borderRadius[0]} cm)` : ''}`}
                        {shape === 'oval' && `Diametru mare: ${largestDiameter[0]} cm, Diametru mic: ${smallestDiameter[0]} cm`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-muted-foreground">Bază</span>
                      <span className="font-sans text-foreground">
                        {baseStyles.find(b => b.value === baseStyle)?.label}
                      </span>
                    </div>
                  </div>


                  <div className="space-y-3">
                    <Button className="w-full btn-luxury-filled flex items-center justify-center gap-2">
                      <ShoppingBag size={18} />
                      Adaugă în Coș
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={downloadPDF}
                    >
                      <Download size={18} />
                      Descarcă Specificații
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={resetConfig}
                    >
                      <RotateCcw size={18} />
                      Resetează
                    </Button>
                  </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Configurator;
