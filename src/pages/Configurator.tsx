import { useState, useMemo, lazy, Suspense } from 'react';
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

const Configurator = () => {
  const [material, setMaterial] = useState('carrara');
  const [shape, setShape] = useState('rectangular');
  // Dimensions based on shape
  const [radius, setRadius] = useState([100]); // For circle
  const [squareLength, setSquareLength] = useState([150]); // For square
  const [length, setLength] = useState([200]); // For rectangular/curved-rectangular
  const [largestDiameter, setLargestDiameter] = useState([200]); // For oval
  const [smallestDiameter, setSmallestDiameter] = useState([120]); // For oval
  const [borderRadius, setBorderRadius] = useState([5]); // For rectangular/curved-rectangular rounded corners
  const [edgeFinish, setEdgeFinish] = useState('polished');
  const [baseStyle, setBaseStyle] = useState('pedestal');

  const materials = [
    { value: 'carrara', label: 'Marmură Carrara' },
    { value: 'calacatta', label: 'Marmură Calacatta' },
    { value: 'statuario', label: 'Marmură Statuario' },
    { value: 'nero-marquina', label: 'Granit Nero Marquina' },
    { value: 'nero-assoluto', label: 'Granit Nero Assoluto' },
    { value: 'natural', label: 'Granit Natural' },
  ];

  const shapes = [
    { value: 'rectangular', label: 'Dreptunghiulară' },
    { value: 'square', label: 'Pătrată' },
    { value: 'round', label: 'Rotundă' },
    { value: 'oval', label: 'Ovală' },
    { value: 'curved-rectangular', label: 'Dreptunghiulară Curbată' },
  ];

  const edgeFinishes = [
    { value: 'polished', label: 'Lustruită' },
    { value: 'honed', label: 'Mată' },
    { value: 'chiseled', label: 'Ciocănită' },
    { value: 'bullnose', label: 'Rotunjită' },
  ];

  const baseStyles = [
    { value: 'pedestal', label: 'Piedestal', model: 'BaseMonolithCurveX.glb' },
    { value: 'trestle', label: 'Suport Trepied', model: 'TieBaseX.glb' },
    { value: 'legs', label: 'Picioare Clasice', model: 'XSoloBaseX.glb' },
    { value: 'metal', label: 'Bază Metalică', model: 'XCrossBaseX.glb' },
    { value: 'cylindric', label: 'Bază Cilindrică', model: 'CylindricWoodBaseX.glb' },
    { value: 'twin', label: 'Bază Dublă', model: 'SquareTwinBaseX.glb' },
    { value: 'x-inclined', label: 'Bază X Înclinată', model: 'XBaseInclinedX.glb' },
    { value: 'x-parallel', label: 'Bază X Paralelă', model: 'XCrossParalelX.glb' },
    { value: 'twin-leaner', label: 'Bază Dublă Înclinată', model: 'TwinLeanerBaseX.glb' },
    { value: 'semicircle', label: 'Bază Semicerc', model: 'SemiCircleBaseX.glb' },
    { value: 'africa', label: 'Bază Africa', model: 'AfricaX.glb' },
    { value: 'valhalla', label: 'Bază Valhalla', model: 'ValhallaX.glb' },
  ];

  // Map shapes to table top models
  const shapeToModel: Record<string, string> = {
    rectangular: 'RectangleTable21.glb',
    round: 'RoundTable.glb',
    oval: 'OvalTable.glb',
    square: 'SquareTable.glb',
    'curved-rectangular': 'CurvedRectangle21X.glb',
  };

  // Determine model paths based on selections
  const tableTopPath = useMemo(() => {
    const tableModel = shapeToModel[shape] || shapeToModel.rectangular;
    return `/models/${tableModel}`;
  }, [shape]);

  const basePath = useMemo(() => {
    const selectedBase = baseStyles.find(b => b.value === baseStyle);
    if (selectedBase?.model) {
      return `/models/${selectedBase.model}`;
    }
    return undefined;
  }, [baseStyle]);



  const resetConfig = () => {
    setMaterial('carrara');
    setShape('rectangular');
    setRadius([100]);
    setSquareLength([150]);
    setLength([200]);
    setLargestDiameter([200]);
    setSmallestDiameter([120]);
    setBorderRadius([5]);
    setEdgeFinish('polished');
    setBaseStyle('pedestal');
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* 3D Model Viewer - Left Side */}
            <div className="order-2 lg:order-1">
              <Card className="border-border overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square w-full min-h-[500px] lg:min-h-[600px]">
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
                      />
                    </Suspense>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Configuration Panel - Right Side */}
            <div className="order-1 lg:order-2 space-y-6">
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

              {/* Dimensions - Shape Specific */}
              <Card className="border-border">
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

                    {/* Rectangular/Curved-Rectangular: Length only */}
                    {(shape === 'rectangular' || shape === 'curved-rectangular') && (
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
                      </>
                    )}

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

              {/* Edge Finish */}
              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <label className="font-sans text-sm tracking-[0.15em] uppercase text-foreground mb-3 block">
                    Finisare Margini
                  </label>
                  <Select value={edgeFinish} onValueChange={setEdgeFinish}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {edgeFinishes.map((edge) => (
                        <SelectItem key={edge.value} value={edge.value}>
                          {edge.label}
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
                          {base.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Summary & Actions */}
              <Card className="border-border">
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
                      <span className="font-sans text-muted-foreground">Finisare</span>
                      <span className="font-sans text-foreground">
                        {edgeFinishes.find(e => e.value === edgeFinish)?.label}
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Configurator;
