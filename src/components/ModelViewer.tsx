  import { Suspense, useRef, useState, useEffect, useMemo, ErrorInfo, Component } from 'react';
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
  // Dimensions for dynamic table top generation
  dimensions?: {
    length?: number;
    width?: number;
    radius?: number;
    squareLength?: number;
    largestDiameter?: number;
    smallestDiameter?: number;
    borderRadius?: number;
  };
  edgeProfile?: string; // Edge profile type: 'straight', 'bullnose', 'beveled', 'ogee', 'eased'
  thickness?: number;
}

// AllInStone base URL for textures - using proxy in development to avoid CORS
const ALLINSTONE_BASE_URL = import.meta.env.DEV 
  ? '/api/allinstone' 
  : 'https://www.allinstone.co.uk/assets/v-5/configurator-new';

// Material texture mapping - using AllInStone texture names
// Different textures for each material with clearer textures
const materialTextures: Record<string, string> = {
  // Marble textures - clearer options
  carrara: `${ALLINSTONE_BASE_URL}/images/textures/min/carrara-white.jpg`,
  calacatta: `${ALLINSTONE_BASE_URL}/images/textures/min/white-calacatta.jpg`,
  statuario: `${ALLINSTONE_BASE_URL}/images/textures/min/eternal-staturio.jpg`,
  // Granite textures - clearer options, especially for dark granite
  'granite-white': `${ALLINSTONE_BASE_URL}/images/textures/min/white-calacatta.jpg`,
  'granite-dark': `${ALLINSTONE_BASE_URL}/images/textures/min/5100-vanilla-noir.jpg`, // Clearer dark granite texture
  'granite-gray': `${ALLINSTONE_BASE_URL}/images/textures/min/macchia-vecchia.jpg`,
};

// Fallback material colors if textures fail to load
const materialColors: Record<string, string> = {
  // Marble colors
  carrara: '#E8E6E1',
  calacatta: '#F5F3ED',
  statuario: '#F0EDE4',
  // Granite colors
  'granite-white': '#F5F5F0',
  'granite-dark': '#1A1A1A',
  'granite-gray': '#6B6B6B',
};

// Error boundary component for 3D models
class ModelErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Model loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function TableTop({ 
  modelPath, 
  material, 
  shape, 
  dimensions 
}: { 
  modelPath: string; 
  material?: string; 
  shape?: string;
  dimensions?: ModelViewerProps['dimensions'];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);
  
  // Load texture if material is specified - use a placeholder if texture URL doesn't exist
  const textureUrl = material && materialTextures[material] 
    ? materialTextures[material] 
    : `${ALLINSTONE_BASE_URL}/images/textures/min/white-calacatta.jpg`; // Default texture
  
  // useTexture will handle loading errors gracefully via Suspense
  const texture = useTexture(textureUrl);
  
  // Clone the scene to avoid issues with multiple instances
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  // Calculate scale based on dimensions
  const scale = useMemo(() => {
    if (!dimensions || !shape) return { x: 1, y: 1, z: 1 };
    
    // Get bounding box of the original model
    const box = new THREE.Box3();
    box.setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    
    // Calculate scale factors based on shape and dimensions
    let scaleX = 1;
    let scaleZ = 1;
    
    switch (shape) {
      case 'round': {
        // For round, scale based on radius
        const targetRadius = (dimensions.radius || 100) / 100; // Convert cm to meters
        const currentRadius = Math.max(size.x, size.z) / 2;
        if (currentRadius > 0) {
          const scaleFactor = targetRadius / currentRadius;
          scaleX = scaleFactor;
          scaleZ = scaleFactor;
        }
        break;
      }
      case 'rectangular':
      case 'curved-rectangular': {
        // For rectangular, scale based on length and width
        const targetLength = (dimensions.length || 200) / 100; // Convert cm to meters
        const targetWidth = (dimensions.width || 100) / 100;
        if (size.x > 0 && size.z > 0) {
          scaleX = targetLength / size.x;
          scaleZ = targetWidth / size.z;
        }
        break;
      }
      case 'square': {
        // For square, scale based on squareLength
        const targetSize = (dimensions.squareLength || 150) / 100;
        const currentSize = Math.max(size.x, size.z);
        if (currentSize > 0) {
          const scaleFactor = targetSize / currentSize;
          scaleX = scaleFactor;
          scaleZ = scaleFactor;
        }
        break;
      }
      case 'oval': {
        // For oval, scale based on diameters
        const targetLargest = (dimensions.largestDiameter || 200) / 100;
        const targetSmallest = (dimensions.smallestDiameter || 120) / 100;
        const currentLargest = Math.max(size.x, size.z);
        const currentSmallest = Math.min(size.x, size.z);
        if (currentLargest > 0 && currentSmallest > 0) {
          scaleX = size.x > size.z ? targetLargest / size.x : targetSmallest / size.x;
          scaleZ = size.z > size.x ? targetLargest / size.z : targetSmallest / size.z;
        }
        break;
      }
    }
    
    return { x: scaleX, y: 1, z: scaleZ };
  }, [dimensions, shape, clonedScene]);
  
  // Apply material texture or color if specified
  useEffect(() => {
    if (material) {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const applyMaterial = (mat: THREE.Material) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              const newMat = mat.clone();
              
              // Try to use texture, fallback to color
              try {
                if (texture) {
                  newMat.map = texture;
                  newMat.needsUpdate = true;
                }
              } catch (error) {
                // If texture fails, use color fallback
                if (materialColors[material]) {
                  newMat.color.set(materialColors[material]);
                }
              }
              
              // Always set color as fallback
              if (materialColors[material] && !newMat.map) {
                newMat.color.set(materialColors[material]);
              }
              
              return newMat;
            }
            return mat;
          };
          
          if (Array.isArray(child.material)) {
            child.material = child.material.map(applyMaterial);
          } else {
            child.material = applyMaterial(child.material);
          }
        }
      });
    }
  }, [material, texture, clonedScene]);
  
  return (
    <group ref={groupRef} scale={[scale.x, scale.y, scale.z]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Generate table top geometry dynamically based on shape and dimensions
function GeneratedTableTop({ 
  shape, 
  dimensions, 
  thickness = 0.02, 
  material,
  edgeProfile = 'straight'
}: { 
  shape?: string; 
  dimensions?: ModelViewerProps['dimensions']; 
  thickness?: number; 
  material?: string;
  edgeProfile?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  // Load texture asynchronously
  useEffect(() => {
    if (material && materialTextures[material]) {
      const loader = new THREE.TextureLoader();
      loader.load(
        materialTextures[material],
        (loadedTexture) => {
          loadedTexture.wrapS = THREE.RepeatWrapping;
          loadedTexture.wrapT = THREE.RepeatWrapping;
          // Scale texture based on table size for better appearance
          if (dimensions) {
            let scale = 1;
            if (shape === 'round' && dimensions.radius) {
              scale = (dimensions.radius || 100) / 100;
            } else if ((shape === 'rectangular' || shape === 'curved-rectangular') && dimensions.length && dimensions.width) {
              scale = Math.max((dimensions.length || 200) / 100, (dimensions.width || 100) / 100);
            } else if (shape === 'square' && dimensions.squareLength) {
              scale = (dimensions.squareLength || 150) / 100;
            }
            loadedTexture.repeat.set(scale, scale);
          }
          setTexture(loadedTexture);
        },
        undefined,
        () => {
          // Texture load failed, use color fallback
          console.warn(`Failed to load texture for material: ${material}`);
          setTexture(null);
        }
      );
    } else {
      setTexture(null);
    }
  }, [material, shape, dimensions]);

  // Generate 2D shape based on table shape
  const generateShape = useMemo(() => {
    if (!shape || !dimensions) {
      console.warn('GeneratedTableTop: Missing shape or dimensions', { shape, dimensions });
      return null;
    }

    const shape2D = new THREE.Shape();

    switch (shape) {
      case 'round': {
        // Perfect circle - mathematically perfect using absarc
        const radius = (dimensions.radius || 100) / 100; // Convert cm to meters
        // Use absarc for mathematically perfect circle - this is the most precise method
        // absarc creates a perfect arc using the mathematical definition of a circle
        shape2D.absarc(0, 0, radius, 0, Math.PI * 2, false);
        // Close the path to ensure it's a complete circle
        shape2D.closePath();
        break;
      }
      case 'square': {
        // Square with optional rounded corners (only at corners, doesn't change shape)
        // Make square larger - scale it up to match visual size of rectangular tables
        const size = ((dimensions.squareLength || 150) / 100) * 1.3; // Scale up by 1.3x
        const cornerRadius = Math.min((dimensions.borderRadius || 0) / 100, size / 4); // Limit to max 1/4 of size
        const halfSize = size / 2;
        
        if (cornerRadius > 0 && cornerRadius < halfSize) {
          // Rounded corners ONLY - shape stays the same, only corners are rounded
          // Start from top-left corner, going clockwise
          // Top-left corner: start at the point before the arc
          shape2D.moveTo(-halfSize, -halfSize + cornerRadius);
          // Top-left corner arc (quarter circle from top to left)
          shape2D.absarc(-halfSize + cornerRadius, -halfSize + cornerRadius, cornerRadius, Math.PI, Math.PI * 1.5, false);
          // Top edge (straight line)
          shape2D.lineTo(halfSize - cornerRadius, -halfSize);
          // Top-right corner arc (quarter circle from top to right)
          shape2D.absarc(halfSize - cornerRadius, -halfSize + cornerRadius, cornerRadius, Math.PI * 1.5, 0, false);
          // Right edge (straight line)
          shape2D.lineTo(halfSize, halfSize - cornerRadius);
          // Bottom-right corner arc (quarter circle from right to bottom)
          shape2D.absarc(halfSize - cornerRadius, halfSize - cornerRadius, cornerRadius, 0, Math.PI * 0.5, false);
          // Bottom edge (straight line)
          shape2D.lineTo(-halfSize + cornerRadius, halfSize);
          // Bottom-left corner arc (quarter circle from bottom to left)
          shape2D.absarc(-halfSize + cornerRadius, halfSize - cornerRadius, cornerRadius, Math.PI * 0.5, Math.PI, false);
          // Left edge (straight line back to start)
          shape2D.lineTo(-halfSize, -halfSize + cornerRadius);
          shape2D.closePath();
        } else {
          // Sharp corners
          shape2D.moveTo(-halfSize, -halfSize);
          shape2D.lineTo(halfSize, -halfSize);
          shape2D.lineTo(halfSize, halfSize);
          shape2D.lineTo(-halfSize, halfSize);
          shape2D.lineTo(-halfSize, -halfSize);
        }
        break;
      }
      case 'rectangular': {
        // Rectangle with optional rounded corners (only at corners, doesn't change shape)
        // Use length for X axis and width for Y axis (standard rectangle)
        const length = (dimensions.length || 200) / 100;
        const width = (dimensions.width || 100) / 100;
        const cornerRadius = Math.min((dimensions.borderRadius || 0) / 100, Math.min(length, width) / 4); // Limit to max 1/4 of smallest dimension
        const halfLength = length / 2;
        const halfWidth = width / 2;
        
        if (cornerRadius > 0 && cornerRadius < Math.min(halfLength, halfWidth)) {
          // Rounded corners ONLY - shape stays the same, only corners are rounded
          // Start from top-left corner, going clockwise
          // Top-left corner: start at the point before the arc
          shape2D.moveTo(-halfLength, -halfWidth + cornerRadius);
          // Top-left corner arc (quarter circle from top to left)
          shape2D.absarc(-halfLength + cornerRadius, -halfWidth + cornerRadius, cornerRadius, Math.PI, Math.PI * 1.5, false);
          // Top edge (straight line)
          shape2D.lineTo(halfLength - cornerRadius, -halfWidth);
          // Top-right corner arc (quarter circle from top to right)
          shape2D.absarc(halfLength - cornerRadius, -halfWidth + cornerRadius, cornerRadius, Math.PI * 1.5, 0, false);
          // Right edge (straight line)
          shape2D.lineTo(halfLength, halfWidth - cornerRadius);
          // Bottom-right corner arc (quarter circle from right to bottom)
          shape2D.absarc(halfLength - cornerRadius, halfWidth - cornerRadius, cornerRadius, 0, Math.PI * 0.5, false);
          // Bottom edge (straight line)
          shape2D.lineTo(-halfLength + cornerRadius, halfWidth);
          // Bottom-left corner arc (quarter circle from bottom to left)
          shape2D.absarc(-halfLength + cornerRadius, halfWidth - cornerRadius, cornerRadius, Math.PI * 0.5, Math.PI, false);
          // Left edge (straight line back to start)
          shape2D.lineTo(-halfLength, -halfWidth + cornerRadius);
          shape2D.closePath();
        } else {
          // Sharp corners
          shape2D.moveTo(-halfLength, -halfWidth);
          shape2D.lineTo(halfLength, -halfWidth);
          shape2D.lineTo(halfLength, halfWidth);
          shape2D.lineTo(-halfLength, halfWidth);
          shape2D.lineTo(-halfLength, -halfWidth);
        }
        break;
      }
      case 'oval': {
        // Perfect oval (ellipse) - mathematically perfect using Bezier curves (vector-based, infinite precision)
        const a = (dimensions.largestDiameter || 200) / 200; // Semi-major axis
        const b = (dimensions.smallestDiameter || 120) / 200; // Semi-minor axis
        
        // Use Bezier curves for mathematically perfect ellipse - NO segments, pure vector math
        // An ellipse can be perfectly represented using 4 cubic Bezier curves
        // This is mathematically exact, not an approximation
        
        // Magic number for perfect ellipse: 4/3 * tan(π/8) ≈ 0.5522847498
        const k = 0.5522847498;
        const kx = k * a; // Control point offset for x-axis
        const ky = k * b; // Control point offset for y-axis
        
        // Start at rightmost point (a, 0)
        shape2D.moveTo(a, 0);
        
        // First quadrant: from (a, 0) to (0, b) - top-right curve
        shape2D.bezierCurveTo(
          a, ky,      // Control point 1
          kx, b,      // Control point 2
          0, b        // End point
        );
        
        // Second quadrant: from (0, b) to (-a, 0) - top-left curve
        shape2D.bezierCurveTo(
          -kx, b,     // Control point 1
          -a, ky,     // Control point 2
          -a, 0       // End point
        );
        
        // Third quadrant: from (-a, 0) to (0, -b) - bottom-left curve
        shape2D.bezierCurveTo(
          -a, -ky,    // Control point 1
          -kx, -b,    // Control point 2
          0, -b       // End point
        );
        
        // Fourth quadrant: from (0, -b) to (a, 0) - bottom-right curve
        shape2D.bezierCurveTo(
          kx, -b,     // Control point 1
          a, -ky,     // Control point 2
          a, 0        // End point (back to start)
        );
        
        shape2D.closePath();
        break;
      }
      default:
        return null;
    }

    return shape2D;
  }, [shape, dimensions]);

  // Create extrude geometry
  const geometry = useMemo(() => {
    if (!generateShape) {
      console.warn('GeneratedTableTop: No shape generated, using fallback box');
      // Fallback to simple box
      return new THREE.BoxGeometry(2, thickness, 1);
    }

    try {
      // Extrude settings with edge profile support
      let bevelEnabled = false;
      let bevelThickness = 0;
      let bevelSize = 0;
      let bevelSegments = 0;

      // Apply edge profile settings
      switch (edgeProfile) {
        case 'standard':
          bevelEnabled = false;
          break;
        case 'pencil-round':
          bevelEnabled = true;
          bevelThickness = thickness * 0.2; // 20% of thickness
          bevelSize = thickness * 0.2;
          bevelSegments = 32; // More segments for perfect smooth curve
          break;
        case 'shark-nose':
          bevelEnabled = true;
          bevelThickness = thickness * 0.5; // 50% of thickness
          bevelSize = thickness * 0.05; // Small bevel size
          bevelSegments = 16; // More segments for precision
          break;
        case 'bull-nose':
        case 'bullnose':
          bevelEnabled = true;
          bevelThickness = thickness * 0.5; // 50% of thickness
          bevelSize = thickness * 0.5;
          bevelSegments = 64; // Maximum segments for perfect round edge
          break;
        case 'eased':
          bevelEnabled = true;
          bevelThickness = thickness * 0.1; // 10% of thickness
          bevelSize = thickness * 0.1;
          bevelSegments = 24; // More segments for smooth eased edge
          break;
        default:
          bevelEnabled = false;
      }

      const extrudeSettings = {
        depth: thickness,
        bevelEnabled: bevelEnabled,
        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelSegments: bevelSegments,
        curveSegments: 128, // Maximum segments for perfect curves (AllInStone precision)
      };

      return new THREE.ExtrudeGeometry(generateShape, extrudeSettings);
    } catch (error) {
      console.error('Error creating ExtrudeGeometry:', error);
      // Fallback to box on error
      return new THREE.BoxGeometry(2, thickness, 1);
    }
  }, [generateShape, thickness, edgeProfile]);

  // Create material with texture support
  const material3D = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: material && materialColors[material] ? materialColors[material] : '#8B7355',
      roughness: 0.3,
      metalness: 0.1,
    });
    
    // Apply texture if loaded
    if (texture) {
      mat.map = texture;
      mat.needsUpdate = true;
    }

    return mat;
  }, [material, texture]);

  // Ensure we always have valid geometry and material
  if (!geometry || !material3D) {
    console.error('GeneratedTableTop: Missing geometry or material', { geometry, material3D });
    return (
      <mesh>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
    );
  }

  // Rotate to lay flat on the XZ plane (Y is up) and rotate 90 degrees horizontally around Y
  const rotation: [number, number, number] = useMemo(() => {
    return [-Math.PI / 2, 0, 0]; // -90 around X to lay flat, no Y rotation initially
  }, []);

  return (
    <group rotation={[0, Math.PI / 2, 0]}> {/* Rotate 90 degrees horizontally around Y */}
      <mesh ref={meshRef} geometry={geometry} material={material3D} rotation={rotation} />
    </group>
  );
}

// Placeholder table top when model fails to load
function PlaceholderTableTop({ material }: { material?: string }) {
  return (
    <mesh>
      <boxGeometry args={[2, 0.1, 1]} />
      <meshStandardMaterial color={material && materialColors[material] ? materialColors[material] : '#8B7355'} />
    </mesh>
  );
}

// Placeholder base when model fails to load
function PlaceholderBase() {
  return (
    <mesh position={[0, -0.5, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 1, 32]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.9} />
    </mesh>
  );
}

function Base({ modelPath }: { modelPath: string }) {
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useGLTF(modelPath);

    // Clone to avoid shared material editing
    const clonedScene = scene.clone();

    // --- APPLY VERY DARK GRAY MATERIAL TO ALL MESHES ---
    useEffect(() => {
        clonedScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: "#1a1a1a", // Very dark gray, almost black
                    metalness: 0.1, // Low metalness for matte look
                    roughness: 0.9, // High roughness for matte finish
                });
            }
        });
    }, [clonedScene]);

    return (
        <group ref={groupRef} rotation={[0, Math.PI, 0]}>
            <primitive object={clonedScene} />
        </group>
    );
}


function CombinedModel({ 
  tableTopPath, 
  basePath, 
  material, 
  shape,
  dimensions,
  edgeProfile,
  thickness,
  onPositioned 
}: { 
  tableTopPath?: string; 
  basePath?: string; 
  material?: string; 
  shape?: string;
  dimensions?: ModelViewerProps['dimensions'];
  edgeProfile?: string;
  thickness?: number;
  onPositioned?: () => void;
}) {
  const baseGroupRef = useRef<THREE.Group>(null);
  const tableGroupRef = useRef<THREE.Group>(null);
  const [tableHeight, setTableHeight] = useState(0.3); // Default height above ground
  const [isPositioned, setIsPositioned] = useState(false);

  // Calculate table top position based on base height after models load
  useEffect(() => {
    const calculatePosition = () => {
      // If using generated table top (no tableTopPath), position immediately
      if (!tableTopPath && shape) {
        // For generated table tops, position immediately without waiting
        if (baseGroupRef.current) {
          // Try to calculate from base, but don't wait too long
          const timeoutId = setTimeout(() => {
            try {
              const baseBox = new THREE.Box3();
              baseBox.setFromObject(baseGroupRef.current!);
              
              if (!baseBox.isEmpty()) {
                const baseTop = baseBox.max.y;
                // Position table top so its bottom surface sits EXACTLY on top of the base (perfectly attached)
                // ExtrudeGeometry creates geometry extruded along Y from 0 to thickness
                // After rotation [-PI/2, 0, 0] then [0, PI/2, 0], the bottom is at the origin
                // So we position exactly at baseTop for perfect attachment
                const calculatedHeight = baseTop; // Direct attachment - no gap
                setTableHeight(calculatedHeight); // Exact positioning - perfectly attached
              } else {
                // Fallback if base not loaded yet - wait a bit more
                setTimeout(() => {
                  if (baseGroupRef.current) {
                    try {
                      const baseBox = new THREE.Box3();
                      baseBox.setFromObject(baseGroupRef.current!);
                      if (!baseBox.isEmpty()) {
                        const baseTop = baseBox.max.y;
                        setTableHeight(baseTop); // Direct attachment
                      }
                    } catch (e) {
                      const tableTopThickness = thickness || 0.02;
                      setTableHeight(tableTopThickness / 2);
                    }
                  }
                }, 100);
              }
            } catch (error) {
              console.error('Error calculating position:', error);
              setTableHeight(0.3); // Default height above ground
            }
            setIsPositioned(true);
            onPositioned?.();
          }, 50); // Shorter timeout for generated tops
          return () => clearTimeout(timeoutId);
        } else {
          // No base (round/oval), position at ground level with half thickness
          const tableTopThickness = thickness || 0.02;
          setTableHeight(tableTopThickness / 2); // Position so bottom sits on ground
          setIsPositioned(true);
          onPositioned?.();
        }
        return;
      }

      // For GLB models, use the original positioning logic
      if (baseGroupRef.current) {
        const timeoutId = setTimeout(() => {
          try {
            const baseBox = new THREE.Box3();
            baseBox.setFromObject(baseGroupRef.current!);
            
            if (!baseBox.isEmpty()) {
              const baseTop = baseBox.max.y;
              // Position table top so its bottom surface sits EXACTLY on top of the base (perfectly attached)
              // ExtrudeGeometry creates geometry with bottom at y=0, so we position at baseTop
              const calculatedHeight = baseTop; // Direct attachment - no offset
              setTableHeight(calculatedHeight); // Exact positioning - perfectly attached
            } else {
              // Retry if base not loaded yet
              setTimeout(() => {
                if (baseGroupRef.current) {
                  try {
                    const retryBox = new THREE.Box3();
                    retryBox.setFromObject(baseGroupRef.current!);
                    if (!retryBox.isEmpty()) {
                      const baseTop = retryBox.max.y;
                      setTableHeight(baseTop); // Direct attachment
                    }
                  } catch (e) {
                    const tableTopThickness = thickness || 0.02;
                    setTableHeight(tableTopThickness / 2);
                  }
                }
              }, 150);
            }
            
            setTimeout(() => {
              setIsPositioned(true);
              onPositioned?.();
            }, 150);
          } catch (error) {
            console.error('Error calculating position:', error);
            const tableTopThickness = thickness || 0.02;
            setTableHeight(0.3 + (tableTopThickness / 2)); // Default height with thickness
            setIsPositioned(true);
            onPositioned?.();
          }
        }, 200);
        
        return () => clearTimeout(timeoutId);
      } else {
        // No base (round/oval), position at ground level with half thickness
        const tableTopThickness = thickness || 0.02;
        setTableHeight(tableTopThickness / 2); // Position so bottom sits on ground
        setIsPositioned(true);
        onPositioned?.();
      }
    };

    // Reset positioning state when models change
    setIsPositioned(false);
    calculatePosition();
  }, [basePath, tableTopPath, shape, onPositioned]);

  // Show base for all shapes (user will specify which don't work)
  const shouldShowBase = basePath;

  return (
    <group>
          {/* Base/Feet - Position at bottom - only for rectangular/square shapes */}
          {shouldShowBase && (
            <group ref={baseGroupRef}>
              <ModelErrorBoundary
                fallback={<PlaceholderBase />}
              >
                <Base modelPath={basePath} />
              </ModelErrorBoundary>
            </group>
          )}
      {/* Table Top - Positioned dynamically above the base/feet */}
      <group 
        ref={tableGroupRef} 
        position={[0, tableHeight, 0]}
      >
        <Suspense fallback={<PlaceholderTableTop material={material} />}>
          {tableTopPath ? (
            <ModelErrorBoundary
              fallback={<PlaceholderTableTop material={material} />}
            >
              <TableTop 
                modelPath={tableTopPath} 
                material={material} 
                shape={shape}
                dimensions={dimensions}
              />
            </ModelErrorBoundary>
          ) : shape && dimensions && Object.keys(dimensions).length > 0 ? (
            <GeneratedTableTop 
              shape={shape} 
              dimensions={dimensions} 
              thickness={thickness || 0.02}
              material={material}
              edgeProfile={edgeProfile}
            />
          ) : (
            <PlaceholderTableTop material={material} />
          )}
        </Suspense>
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

const ModelViewer = ({ tableTopPath, basePath, material, shape, tableType, baseStyle, dimensions, edgeProfile, thickness }: ModelViewerProps) => {
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
            
            <CombinedModel 
              tableTopPath={tableTopPath} 
              basePath={basePath} 
              material={material}
              shape={shape}
              dimensions={dimensions}
              edgeProfile={edgeProfile}
              thickness={thickness}
              onPositioned={() => setIsPositioned(true)}
            />
            
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
