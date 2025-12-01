import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Ensure Three.js is available
if (typeof window !== 'undefined' && !(window as any).THREE) {
  (window as any).THREE = THREE;
}

interface ModelViewerProps {
  tableTopPath?: string;
  basePath?: string;
  material?: string;
  shape?: string;
  tableType?: string;
  baseStyle?: string;
}

// Material color mapping
const materialColors: Record<string, string> = {
  carrara: '#E8E6E1',
  calacatta: '#F5F3ED',
  statuario: '#F0EDE4',
  'nero-marquina': '#1A1A1A',
  'nero-assoluto': '#0A0A0A',
  natural: '#8B7355',
};

function TableTop({ modelPath, material }: { modelPath: string; material?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);
  
  // Clone the scene to avoid issues with multiple instances
  const clonedScene = scene.clone();
  
  // Apply material color if specified
  if (material && materialColors[material]) {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              const newMat = mat.clone();
              newMat.color.set(materialColors[material]);
              return newMat;
            }
            return mat;
          });
        } else if (child.material instanceof THREE.MeshStandardMaterial || child.material instanceof THREE.MeshPhysicalMaterial) {
          const newMat = child.material.clone();
          newMat.color.set(materialColors[material]);
          child.material = newMat;
        }
      }
    });
  }
  
  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

function Base({ modelPath }: { modelPath: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);
  
  // Clone the scene to avoid issues with multiple instances
  const clonedScene = scene.clone();
  
  // Rotate 180 degrees around Y axis
  return (
    <group ref={groupRef} rotation={[0, Math.PI, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

function CombinedModel({ tableTopPath, basePath, material, onPositioned }: { tableTopPath: string; basePath?: string; material?: string; onPositioned?: () => void }) {
  const baseGroupRef = useRef<THREE.Group>(null);
  const tableGroupRef = useRef<THREE.Group>(null);
  const [tableHeight, setTableHeight] = useState(0.7);
  const [isPositioned, setIsPositioned] = useState(false);

  // Check if this is the curved rectangular table (needs special handling)
  const isCurvedRectangular = tableTopPath.includes('CurvedRectangle21X');

  // Calculate table top position based on base height after models load
  useEffect(() => {
    const calculatePosition = () => {
      if (baseGroupRef.current) {
        // Wait for the model to fully load and render
        const timeoutId = setTimeout(() => {
          try {
            const baseBox = new THREE.Box3();
            baseBox.setFromObject(baseGroupRef.current!);
            
            if (!baseBox.isEmpty()) {
              // Get the top of the base (max Y after rotation)
              const baseTop = baseBox.max.y;
              
              // Special handling for curved rectangular table
              if (isCurvedRectangular) {
                // For curved rectangular, use an extremely low position
                // This table model has different scale/structure
                // TO MAKE LOWER: reduce 0.1 (multiplier) and/or reduce 0.02 (min) and 0.1 (max)
                const calculatedHeight = baseTop * 0.1; // <-- REDUCE THIS (e.g., 0.05, 0.08) to make lower
                setTableHeight(Math.max(0.02, Math.min(calculatedHeight, 0.01))); // <-- REDUCE 0.02 (min) and/or 0.1 (max) to make lower
              } else {
                // Normal positioning for other tables
                const calculatedHeight = baseTop + 0.08;
                setTableHeight(Math.max(0.35, Math.min(calculatedHeight, 0.7)));
              }
            } else {
              // Fallback to default position
              if (isCurvedRectangular) {
                // Fixed position for curved rectangular when calculation fails
                // TO MAKE LOWER: reduce 0.02 (e.g., 0.01, 0.0)
                setTableHeight(0.001); // <-- REDUCE THIS to make lower
              } else {
                setTableHeight(0.7);
              }
            }
            
            // Mark as positioned after a short delay to ensure smooth transition
            setTimeout(() => {
              setIsPositioned(true);
              onPositioned?.();
            }, 150);
          } catch (error) {
            console.error('Error calculating position:', error);
            if (isCurvedRectangular) {
              // Fixed position for curved rectangular on error
              // TO MAKE LOWER: reduce 0.02 (e.g., 0.01, 0.0)
              setTableHeight(0.02); // <-- REDUCE THIS to make lower
            } else {
              setTableHeight(0.7);
            }
            setIsPositioned(true);
            onPositioned?.();
          }
        }, 200);
        
        return () => clearTimeout(timeoutId);
      } else {
        // If no base, use default position
        if (isCurvedRectangular) {
          // Fixed position for curved rectangular without base
          // TO MAKE LOWER: reduce 0.02 (e.g., 0.01, 0.0)
          setTableHeight(0.02); // <-- REDUCE THIS to make lower
        } else {
          setTableHeight(0.7);
        }
        setIsPositioned(true);
        onPositioned?.();
      }
    };

    // Reset positioning state when models change
    setIsPositioned(false);
    calculatePosition();
  }, [basePath, tableTopPath, isCurvedRectangular, onPositioned]);

  return (
    <group>
      {/* Base/Feet - Position at bottom */}
      {basePath && (
        <group ref={baseGroupRef}>
          <Base modelPath={basePath} />
        </group>
      )}
      {/* Table Top - Positioned dynamically above the base/feet */}
      {/* Hide until positioned to prevent visible jumping */}
      <group 
        ref={tableGroupRef} 
        position={[0, tableHeight, 0]}
        visible={isPositioned}
      >
        <TableTop modelPath={tableTopPath} material={material} />
      </group>
    </group>
  );
}

function PlaceholderModel() {
  const groupRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 32]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
    </group>
  );
}

const ModelViewer = ({ tableTopPath, basePath, material, shape, tableType, baseStyle }: ModelViewerProps) => {
  const [hasError, setHasError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setHasError(false);
  }, []);

  useEffect(() => {
    setHasError(false);
    setIsPositioned(false); // Reset when models change
  }, [tableTopPath, basePath, material]);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary/10">
        <div className="text-center p-8">
          <p className="font-sans text-sm text-muted-foreground">
            Se încarcă...
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary/10">
        <div className="text-center p-8">
          <p className="font-sans text-sm text-muted-foreground mb-2">
            Eroare la încărcarea modelului 3D
          </p>
          <p className="font-sans text-xs text-muted-foreground">
            Te rugăm să reîmprospătezi pagina
          </p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="w-full h-full bg-gradient-to-b from-secondary/20 to-secondary/5 rounded-lg overflow-hidden relative">
        {/* Loading overlay - hides the jumping effect */}
        {!isPositioned && (
          <div className="absolute inset-0 bg-secondary/10 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center p-8">
              <p className="font-sans text-sm text-muted-foreground">
                Se încarcă...
              </p>
            </div>
          </div>
        )}
        <Canvas
          shadows
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true
          }}
          dpr={[1, 2]}
          className="w-full h-full"
          onCreated={(state) => {
            try {
              // Ensure Three.js is properly initialized
              if (state.gl) {
                state.gl.setClearColor('#f5f5f5', 0);
              }
            } catch (error) {
              console.error('Error initializing Canvas:', error);
              setHasError(true);
            }
          }}
        >
          <Suspense 
          fallback={
            <mesh>
              <boxGeometry args={[1, 0.1, 0.5]} />
              <meshStandardMaterial color="#8B7355" />
            </mesh>
          }
        >
            <PerspectiveCamera makeDefault position={[0, 1, 3]} fov={50} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
            <directionalLight position={[-5, 5, -5]} intensity={0.5} />
            <pointLight position={[0, 10, 0]} intensity={0.5} />
            
            {tableTopPath ? (
              <CombinedModel 
                tableTopPath={tableTopPath} 
                basePath={basePath} 
                material={material}
                onPositioned={() => setIsPositioned(true)}
              />
            ) : (
              <PlaceholderModel />
            )}
            
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={10}
              autoRotate={false}
            />
            <Environment preset="studio" />
          </Suspense>
        </Canvas>
      </div>
    );
  } catch (error) {
    console.error('Error rendering ModelViewer:', error);
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary/10">
        <div className="text-center p-8">
          <p className="font-sans text-sm text-muted-foreground mb-2">
            Eroare la inițializarea vizualizatorului 3D
          </p>
          <p className="font-sans text-xs text-muted-foreground">
            Te rugăm să reîmprospătezi pagina
          </p>
        </div>
      </div>
    );
  }
};

export default ModelViewer;
