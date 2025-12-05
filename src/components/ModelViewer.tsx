  import { Suspense, useRef, useState, useEffect, useMemo, ErrorInfo, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
// @ts-ignore - heic2any doesn't have types
import heic2any from 'heic2any';

// Mobile detection helper - more reliable
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check user agent
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check screen width
  const isMobileWidth = window.innerWidth < 768;
  
  // Check for touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Consider mobile if any of these conditions are true
  return isMobileUA || (isMobileWidth && hasTouch);
};

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
  textureType?: string; // Texture type: '1', '2', '3', '4'
  onTextureLoading?: (loading: boolean) => void; // Callback for texture loading state
}

// AllInStone base URL for textures - using proxy in development to avoid CORS
const ALLINSTONE_BASE_URL = import.meta.env.DEV 
  ? '/api/allinstone' 
  : 'https://www.allinstone.co.uk/assets/v-5/configurator-new';

// Get base path for GitHub Pages (same as Vite's BASE_URL)
const basePathPrefix = import.meta.env.BASE_URL || '/';

// Local texture mapping - all 48 HEIC images
// Files are sorted alphabetically: IMG_4639 through IMG_4707
const heicFiles = [
  'IMG_4639.HEIC',  'IMG_4641.HEIC',
   'IMG_4644.HEIC', 'IMG_4645.HEIC',
  'IMG_4647.HEIC', 'IMG_4648.HEIC', 'IMG_4649.HEIC', 'IMG_4654.HEIC',
  'IMG_4655.HEIC',
   'IMG_4663.HEIC', 'IMG_4664.HEIC', 'IMG_4665.HEIC',
   'IMG_4668.HEIC', 'IMG_4669.HEIC',
   'IMG_4671.HEIC', 'IMG_4672.HEIC',
   'IMG_4675.HEIC',  'IMG_4677.HEIC',
   'IMG_4679.HEIC',  'IMG_4681.HEIC',
   'IMG_4683.HEIC', 'IMG_4684.HEIC'
];

const localTextures: Record<string, string> = {};
heicFiles.forEach((filename, index) => {
  localTextures[String(index + 1)] = `${basePathPrefix}models/textures/${filename}`;
});

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

// Realistic fallback material colors for natural stone
const materialColors: Record<string, string> = {
  // Marble colors - realistic natural stone tones
  carrara: '#F0EFEB', // Warm white with subtle gray
  calacatta: '#F7F5F1', // Bright white with slight warmth
  statuario: '#F4F2ED', // Creamy white
  // Granite colors - realistic stone tones
  'granite-white': '#F8F7F4', // Natural white stone
  'granite-dark': '#2C2C2C', // Deep charcoal (not pure black)
  'granite-gray': '#8B8B85', // Natural gray stone
  // Default - realistic neutral stone color
  default: '#E8E6E0', // Natural beige stone
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

// AllInStone exact edge profile shapes
function createPencilRoundProfile(thickness: number): THREE.Shape {
  const t = thickness;
  const r = 0.003; // 3mm

  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0, t - r);
  s.quadraticCurveTo(0, t, r, t);
  s.lineTo(t - r, t);
  s.quadraticCurveTo(t, t, t, t - r);
  s.lineTo(t, 0);
  s.closePath();
  return s;
}

function createSharkNoseProfile(thickness: number): THREE.Shape {
  const t = thickness;
  const r = 0.004; // small 4mm easing

  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(t * 0.6, t);     // 45° bevel
  s.quadraticCurveTo(t * 0.6 + r, t - r, t, t - r);
  s.lineTo(t, 0);
  s.closePath();
  return s;
}

function createBullnoseProfile(thickness: number): THREE.Shape {
  const r = thickness / 2;

  const s = new THREE.Shape();
  // Start left bottom
  s.moveTo(0, 0);
  // Left vertical
  s.lineTo(0, thickness);
  // Semicircle top
  s.absarc(r, thickness, r, Math.PI, 0, false);
  // Right vertical down
  s.lineTo(thickness, 0);
  s.closePath();
  return s;
}

function createEasedEdgeProfile(thickness: number): THREE.Shape {
  const r = 0.0015; // 1.5mm

  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0, thickness);
  s.lineTo(thickness - r, thickness);
  s.quadraticCurveTo(thickness, thickness, thickness, thickness - r);
  s.lineTo(thickness, 0);
  s.closePath();
  return s;
}

// Generate table top geometry dynamically based on shape and dimensions
function GeneratedTableTop({ 
  shape, 
  dimensions, 
  thickness = 0.02, 
  material,
  edgeProfile = 'straight',
  textureType,
  onTextureLoading
}: { 
  shape?: string; 
  dimensions?: ModelViewerProps['dimensions']; 
  thickness?: number; 
  material?: string;
  edgeProfile?: string;
  textureType?: string;
  onTextureLoading?: (loading: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [isTextureLoading, setIsTextureLoading] = useState(false);
  
  // Notify parent when loading state changes - use ref to prevent duplicate calls
  const prevLoadingRef = useRef<boolean | null>(null);
  useEffect(() => {
    // Only call if the value actually changed
    if (prevLoadingRef.current !== isTextureLoading) {
      prevLoadingRef.current = isTextureLoading;
      onTextureLoading?.(isTextureLoading);
    }
  }, [isTextureLoading]); // Remove onTextureLoading from deps to prevent re-runs
  
  // Load texture asynchronously with better error handling to prevent crashes
  // Priority: textureType (local) > material (AllInStone)
  useEffect(() => {
    let textureUrl: string | null = null;
    let isHeic = false;
    let isMounted = true;
    let abortController: AbortController | null = null;
    
    // If textureType is provided, use local texture
    if (textureType && localTextures[textureType]) {
      textureUrl = localTextures[textureType];
      isHeic = textureUrl.toLowerCase().endsWith('.heic');
    } 
    // Otherwise, use material texture if available
    else if (material && materialTextures[material]) {
      textureUrl = materialTextures[material];
    }
    
    if (textureUrl) {
      setIsTextureLoading(true);
      const loadTexture = async () => {
        try {
          abortController = new AbortController();
          let finalUrl = textureUrl!;
          
          // Convert HEIC to blob URL if needed - with timeout and error handling
          if (isHeic) {
            try {
              const response = await fetch(textureUrl!, { 
                signal: abortController.signal,
                // Add timeout to prevent hanging
              });
              
              if (!isMounted) return;
              
              const blob = await response.blob();
              
              if (!isMounted) return;
              
              // Resize HEIC before conversion for mobile - limit to 2560px max
              const resizeBlob = async (blob: Blob): Promise<Blob> => {
                return new Promise((resolve, reject) => {
                  const img = new Image();
                  img.onload = () => {
                    const maxSize = 2560;
                    if (img.width <= maxSize && img.height <= maxSize) {
                      resolve(blob); // No resize needed
                      return;
                    }
                    
                    const scale = Math.min(maxSize / img.width, maxSize / img.height);
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.floor(img.width * scale);
                    canvas.height = Math.floor(img.height * scale);
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                      resolve(blob); // Fallback to original
                      return;
                    }
                    
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((resizedBlob) => {
                      resolve(resizedBlob || blob);
                    }, 'image/jpeg', 0.85);
                  };
                  img.onerror = () => resolve(blob); // Fallback to original
                  img.src = URL.createObjectURL(blob);
                });
              };
              
              // Resize if on mobile before converting
              const isMobile = isMobileDevice();
              const processedBlob = isMobile ? await resizeBlob(blob) : blob;
              
              // Limit HEIC conversion time to prevent crashes
              const conversionPromise = heic2any({
                blob: processedBlob,
                toType: 'image/jpeg',
                quality: isMobile ? 0.75 : 0.8 // Lower quality on mobile to reduce memory
              });
              
              // Add timeout to HEIC conversion
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('HEIC conversion timeout')), 10000)
              );
              
              const convertedBlob = await Promise.race([conversionPromise, timeoutPromise]);
              
              if (!isMounted) return;
              
              // heic2any can return an array or a single blob
              const result = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
              finalUrl = URL.createObjectURL(result);
            } catch (heicError) {
              console.warn('HEIC conversion failed, skipping texture:', heicError);
              if (isMounted) {
                setTexture(null);
                setIsTextureLoading(false);
              }
              return;
            }
          }
          
          if (!isMounted) return;
          
          const loader = new THREE.TextureLoader();
          loader.load(
            finalUrl,
            (loadedTexture) => {
              if (!isMounted) return;
              
              try {
                // Mobile texture optimization - reduce memory usage
                const isIOSDevice = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
                const highDPR = window.devicePixelRatio > 2;
                
                if (isIOSDevice && highDPR) {
                  // Optimize for iOS high-DPI devices
                  loadedTexture.minFilter = THREE.LinearFilter;
                  loadedTexture.magFilter = THREE.LinearFilter;
                  loadedTexture.generateMipmaps = false;
                  loadedTexture.anisotropy = 1;
                  // Color space is handled automatically in newer Three.js versions
                  
                  // Limit texture size to 2048-2560px max for mobile WebGL
                  const maxSize = 2560;
                  if (loadedTexture.image && (loadedTexture.image.width > maxSize || loadedTexture.image.height > maxSize)) {
                    const scale = Math.min(maxSize / loadedTexture.image.width, maxSize / loadedTexture.image.height);
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.floor(loadedTexture.image.width * scale);
                    canvas.height = Math.floor(loadedTexture.image.height * scale);
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.drawImage(loadedTexture.image, 0, 0, canvas.width, canvas.height);
                      const resizedImage = new Image();
                      resizedImage.onload = () => {
                        if (!isMounted) return;
                        const resizedTexture = new THREE.Texture(resizedImage);
                        resizedTexture.wrapS = THREE.ClampToEdgeWrapping;
                        resizedTexture.wrapT = THREE.ClampToEdgeWrapping;
                        resizedTexture.repeat.set(1, 1);
                        resizedTexture.minFilter = THREE.LinearFilter;
                        resizedTexture.magFilter = THREE.LinearFilter;
                        resizedTexture.generateMipmaps = false;
                        resizedTexture.anisotropy = 1;
                        // Color space is handled automatically in newer Three.js versions
                        resizedTexture.needsUpdate = true;
                        setTexture(resizedTexture);
                        setIsTextureLoading(false);
                      };
                      resizedImage.src = canvas.toDataURL('image/jpeg', 0.85);
                      return; // Exit early, texture will be set in onload
                    }
                  }
                }
                
                // Use ClampToEdgeWrapping to prevent texture repetition
                loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
                loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
                // Set repeat to 1,1 so texture appears once without duplication
                loadedTexture.repeat.set(1, 1);
                loadedTexture.needsUpdate = true;
                setTexture(loadedTexture);
                setIsTextureLoading(false);
              } catch (textureError) {
                console.warn('Error setting texture properties:', textureError);
                if (isMounted) {
                  setTexture(null);
                  setIsTextureLoading(false);
                }
              }
            },
            undefined,
            (error) => {
              // Texture load failed, use color fallback
              console.warn(`Failed to load texture: ${textureUrl}`, error);
              if (isMounted) {
                setTexture(null);
                setIsTextureLoading(false);
              }
            }
          );
        } catch (error) {
          console.warn(`Failed to load texture: ${textureUrl}`, error);
          if (isMounted) {
            setTexture(null);
            setIsTextureLoading(false);
          }
        }
      };
      
      loadTexture();
    } else {
      setTexture(null);
      setIsTextureLoading(false);
    }
    
    return () => {
      isMounted = false;
      if (abortController) {
        abortController.abort();
      }
    };
    // Use JSON.stringify for dimensions to prevent unnecessary re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material, textureType, shape, JSON.stringify(dimensions)]);

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

  // Create extrude geometry with AllInStone exact edge profiles
  const geometry = useMemo(() => {
    if (!generateShape) {
      console.warn('GeneratedTableTop: No shape generated, using fallback box');
      // Fallback to simple box
      return new THREE.BoxGeometry(2, thickness, 1);
    }

    try {
      // Get edge profile shape based on edgeProfile type
      let edgeProfileShape: THREE.Shape | null = null;
      
      switch (edgeProfile) {
        case 'pencil-round':
          edgeProfileShape = createPencilRoundProfile(thickness);
          break;
        case 'shark-nose':
          edgeProfileShape = createSharkNoseProfile(thickness);
          break;
        case 'bull-nose':
        case 'bullnose':
          edgeProfileShape = createBullnoseProfile(thickness);
          break;
        case 'eased':
          edgeProfileShape = createEasedEdgeProfile(thickness);
          break;
        case 'standard':
        default:
          // Standard edge - no custom profile, use simple extrude
          edgeProfileShape = null;
          break;
      }

      // If we have a custom edge profile, we need to use a more complex approach
      // For now, we'll use ExtrudeGeometry with optimized bevel settings that match the profiles
      // This is a practical approach that works with Three.js ExtrudeGeometry
      
      let bevelEnabled = false;
      let bevelThickness = 0;
      let bevelSize = 0;
      let bevelSegments = 0;

      if (edgeProfileShape) {
        // Use bevel settings that approximate the custom profiles
        // The exact shape profiles are defined above for reference
        switch (edgeProfile) {
          case 'pencil-round':
            // R=3mm profile - use bevel to approximate
            bevelEnabled = true;
            bevelSize = 0.003; // 3mm
            bevelThickness = 0.003; // 3mm
            bevelSegments = 16; // Reduced for faster rendering
            break;
          case 'shark-nose':
            // 45° + 4mm easing
            bevelEnabled = true;
            bevelSize = 0.004; // 4mm easing
            bevelThickness = thickness * 0.6; // 60% for 45° bevel
            bevelSegments = 12;
            break;
          case 'bull-nose':
          case 'bullnose':
            // Perfect semicircle
            bevelEnabled = true;
            bevelSize = thickness * 0.5; // Half thickness = radius
            bevelThickness = thickness * 0.5;
            bevelSegments = 32; // Reduced for faster rendering
            break;
          case 'eased':
            // 1.5mm radius
            bevelEnabled = true;
            bevelSize = 0.0015; // 1.5mm
            bevelThickness = 0.0015; // 1.5mm
            bevelSegments = 8;
            break;
        }
      }

      const extrudeSettings = {
        depth: thickness,
        bevelEnabled: bevelEnabled,
        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelSegments: bevelSegments,
        curveSegments: 64, // Reduced for faster rendering while maintaining quality
      };

      const extrudeGeometry = new THREE.ExtrudeGeometry(generateShape, extrudeSettings);
      
      // Normalize UV coordinates to 0-1 range to prevent texture repetition
      const uvAttribute = extrudeGeometry.getAttribute('uv');
      if (uvAttribute) {
        const uvArray = uvAttribute.array as Float32Array;
        // Find min/max UV values
        let minU = Infinity, maxU = -Infinity;
        let minV = Infinity, maxV = -Infinity;
        
        for (let i = 0; i < uvArray.length; i += 2) {
          minU = Math.min(minU, uvArray[i]);
          maxU = Math.max(maxU, uvArray[i]);
          minV = Math.min(minV, uvArray[i + 1]);
          maxV = Math.max(maxV, uvArray[i + 1]);
        }
        
        // Normalize to 0-1 range
        const rangeU = maxU - minU;
        const rangeV = maxV - minV;
        
        if (rangeU > 0 && rangeV > 0) {
          for (let i = 0; i < uvArray.length; i += 2) {
            uvArray[i] = (uvArray[i] - minU) / rangeU;
            uvArray[i + 1] = (uvArray[i + 1] - minV) / rangeV;
          }
          uvAttribute.needsUpdate = true;
        }
      }
      
      return extrudeGeometry;
    } catch (error) {
      console.error('Error creating ExtrudeGeometry:', error);
      // Fallback to box on error
      return new THREE.BoxGeometry(2, thickness, 1);
    }
  }, [generateShape, thickness, edgeProfile]);

  // Create material with texture support - realistic marble/granite properties
  const material3D = useMemo(() => {
    const fallbackColor = material && materialColors[material] 
      ? materialColors[material] 
      : materialColors.default;
    
    const mat = new THREE.MeshPhysicalMaterial({
      color: fallbackColor, // Realistic natural stone color
      roughness: 0.08, // Very low roughness for highly polished stone
      metalness: 0.0, // No metalness for natural stone
      clearcoat: 0.6, // Higher clearcoat for glossy polished finish
      clearcoatRoughness: 0.05, // Very smooth clearcoat
      reflectivity: 0.6, // Higher reflectivity for polished surface
      ior: 1.5, // Index of refraction for stone
      transmission: 0.0, // No transmission for solid stone
      side: THREE.DoubleSide, // Render both sides so bottom looks complete
    });
    
    // Apply texture if loaded
    if (texture) {
      mat.map = texture;
      // Add normal map for surface detail (optional, can be added later)
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
          <meshStandardMaterial color={materialColors.default} />
        </mesh>
      );
  }

  // Rotate to lay flat on the XZ plane (Y is up) - no horizontal rotation
  const rotation: [number, number, number] = useMemo(() => {
    return [-Math.PI / 2, 0, 0]; // -90 around X to lay flat
  }, []);

  // Show loading overlay when texture is loading
  if (isTextureLoading) {
    return (
      <group>
        <mesh 
          ref={meshRef} 
          geometry={geometry} 
          material={material3D} 
          rotation={rotation}
          castShadow={false}
          receiveShadow={false}
        />
        {/* Loading indicator - subtle overlay */}
        <mesh rotation={rotation}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.3}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh 
        ref={meshRef} 
        geometry={geometry} 
        material={material3D} 
        rotation={rotation}
        castShadow
        receiveShadow
      />
    </group>
  );
}

// Placeholder table top when model fails to load
function PlaceholderTableTop({ material }: { material?: string }) {
  return (
    <mesh>
      <boxGeometry args={[2, 0.1, 1]} />
      <meshStandardMaterial color={material && materialColors[material] ? materialColors[material] : materialColors.default} />
    </mesh>
  );
}

// AllInStone metal material presets - exact specifications
function getAllInStoneMetalMaterial(type: string): THREE.MeshPhysicalMaterial {
  switch (type) {
    case "steel-polished":
      return new THREE.MeshPhysicalMaterial({
      color: "#D8D8D8", // Slightly warmer, more realistic polished steel
      metalness: 1.0,
      roughness: 0.12, // Even smoother for realistic polished metal
      clearcoat: 1.0,
      clearcoatRoughness: 0.08, // Smoother clearcoat
      reflectivity: 1.0,
      ior: 2.4,
      });

    case "steel-brushed":
      return new THREE.MeshPhysicalMaterial({
        color: "#c4c4c4",
        metalness: 0.95,
        roughness: 0.35,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3,
        reflectivity: 0.9,
        ior: 2.2,
      });

    case "black-matte":
      return new THREE.MeshPhysicalMaterial({
        color: "#1a1a1a",
        metalness: 0.8,
        roughness: 0.6,
        clearcoat: 0.2,
        clearcoatRoughness: 0.5,
        reflectivity: 0.4,
        ior: 2.0,
      });

    case "brass-gold":
      return new THREE.MeshPhysicalMaterial({
        color: "#d4c19c",
        metalness: 1.0,
        roughness: 0.25,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        reflectivity: 1.0,
        ior: 2.8,
      });

    case "gunmetal":
    default:
      return new THREE.MeshPhysicalMaterial({
        color: "#4a4a4a",
        metalness: 0.95,
        roughness: 0.4,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3,
        reflectivity: 0.8,
        ior: 2.3,
      });
  }
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

function Base({ modelPath, baseStyle, dimensions, shape }: { 
    modelPath: string; 
    baseStyle?: string;
    dimensions?: ModelViewerProps['dimensions'];
    shape?: string;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useGLTF(modelPath);

    // Clone to avoid shared material editing
    const clonedScene = scene.clone();

    // Calculate base scale based on table dimensions
    const baseScale = useMemo(() => {
        if (!dimensions || !shape) return { x: 1, y: 1, z: 1 };
        
        // Get base bounding box to determine original size
        const box = new THREE.Box3();
        box.setFromObject(clonedScene);
        const baseSize = box.getSize(new THREE.Vector3());
        
        // Calculate target size based on table dimensions
        let targetLength = 1;
        let targetWidth = 1;
        
        if (shape === 'rectangular' || shape === 'curved-rectangular') {
            targetLength = (dimensions.length || 200) / 100; // Convert cm to meters
            targetWidth = (dimensions.width || 100) / 100;
        } else if (shape === 'square') {
            const size = (dimensions.squareLength || 150) / 100;
            targetLength = size;
            targetWidth = size;
        } else if (shape === 'round') {
            const radius = (dimensions.radius || 100) / 100;
            targetLength = radius * 2;
            targetWidth = radius * 2;
        } else if (shape === 'oval') {
            targetLength = (dimensions.largestDiameter || 200) / 100;
            targetWidth = (dimensions.smallestDiameter || 120) / 100;
        }
        
        // Scale base to fit table with some margin (90% of table size for base4, adjust as needed)
        const scaleFactor = baseStyle === 'base4' ? 0.85 : 0.9; // base4 should be smaller
        const scaleX = baseSize.x > 0 ? (targetLength * scaleFactor) / baseSize.x : 1;
        const scaleZ = baseSize.z > 0 ? (targetWidth * scaleFactor) / baseSize.z : 1;
        
        return { x: scaleX, y: 1, z: scaleZ };
    }, [dimensions, shape, baseStyle, clonedScene]);

    // --- APPLY REALISTIC MATTE GRAY MATERIAL TO BASE ---
    useEffect(() => {
        clonedScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Realistic matte gray metal finish - like powder-coated or anodized furniture
                // No shine, no reflections, just solid matte material
                // Double-sided to hide gaps from any viewing angle
                child.material = new THREE.MeshStandardMaterial({
                    color: "#5A5A5A", // Slightly darker realistic gray
                    metalness: 0.1, // Very low metalness - barely metallic
                    roughness: 0.95, // Very high roughness - completely matte
                    side: THREE.DoubleSide, // Render both sides to hide gaps
                    // No clearcoat, no reflectivity - just solid matte material
                });
                child.castShadow = false;
                child.receiveShadow = false;
            }
        });
    }, [clonedScene, baseStyle]);

    // Calculate base bounding box for bottom cap
    const baseBoundingBox = useMemo(() => {
        const box = new THREE.Box3();
        box.setFromObject(clonedScene);
        if (!box.isEmpty()) {
            return {
                min: box.min.clone(),
                max: box.max.clone(),
                size: box.getSize(new THREE.Vector3()),
                center: box.getCenter(new THREE.Vector3())
            };
        }
        return null;
    }, [clonedScene]);

    // Base material for bottom cap - match background color to hide it
    const baseMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: "#f5f5f5", // Match canvas background color
            side: THREE.DoubleSide,
        });
    }, []);

    return (
        <group 
            ref={groupRef} 
            rotation={[0, Math.PI, 0]}
            scale={[baseScale.x, baseScale.y, baseScale.z]}
        >
            <primitive object={clonedScene} />
            {/* Bottom cap to close gaps at the base of feet */}
            {baseBoundingBox && (
                <mesh
                    position={[
                        baseBoundingBox.center.x,
                        baseBoundingBox.min.y - 0.001, // Slightly below the bottom
                        baseBoundingBox.center.z
                    ]}
                    material={baseMaterial}
                    rotation={[-Math.PI / 2, 0, 0]} // Rotate to face upward
                >
                    <planeGeometry 
                        args={[
                            baseBoundingBox.size.x * 1.2, // Slightly larger to ensure coverage
                            baseBoundingBox.size.z * 1.2
                        ]} 
                    />
                </mesh>
            )}
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
  textureType,
  baseStyle,
  onPositioned,
  onTextureLoading
}: { 
  tableTopPath?: string; 
  basePath?: string; 
  material?: string; 
  shape?: string;
  dimensions?: ModelViewerProps['dimensions'];
  edgeProfile?: string;
  thickness?: number;
  textureType?: string;
  baseStyle?: string;
  onPositioned?: () => void;
  onTextureLoading?: (loading: boolean) => void;
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
          // Calculate position immediately for generated table tops
          try {
            if (baseGroupRef.current) {
              const baseBox = new THREE.Box3();
              baseBox.setFromObject(baseGroupRef.current!);
              
              if (!baseBox.isEmpty()) {
                const baseTop = baseBox.max.y;
                setTableHeight(baseTop);
              } else {
                const tableTopThickness = thickness || 0.02;
                setTableHeight(tableTopThickness / 2);
              }
            } else {
              const tableTopThickness = thickness || 0.02;
              setTableHeight(tableTopThickness / 2);
            }
            setIsPositioned(true);
            onPositioned?.();
          } catch (error) {
            console.error('Error calculating position:', error);
            const tableTopThickness = thickness || 0.02;
            setTableHeight(tableTopThickness / 2);
            setIsPositioned(true);
            onPositioned?.();
          }
        } else {
          // No base (round/oval), position at ground level with half thickness
          const tableTopThickness = thickness || 0.02;
          setTableHeight(tableTopThickness / 2); // Position so bottom sits on ground
          setIsPositioned(true);
          onPositioned?.();
        }
        return;
      }

      // For GLB models, calculate position immediately
      if (baseGroupRef.current) {
        try {
          const baseBox = new THREE.Box3();
          baseBox.setFromObject(baseGroupRef.current!);
          
          if (!baseBox.isEmpty()) {
            const baseTop = baseBox.max.y;
            setTableHeight(baseTop);
          } else {
            const tableTopThickness = thickness || 0.02;
            setTableHeight(tableTopThickness / 2);
          }
          setIsPositioned(true);
          onPositioned?.();
        } catch (error) {
          console.error('Error calculating position:', error);
          const tableTopThickness = thickness || 0.02;
          setTableHeight(tableTopThickness / 2);
          setIsPositioned(true);
          onPositioned?.();
        }
      } else {
        // No base (round/oval), position at ground level with half thickness
        const tableTopThickness = thickness || 0.02;
        setTableHeight(tableTopThickness / 2);
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
                <Base 
                    modelPath={basePath} 
                    baseStyle={baseStyle}
                    dimensions={dimensions}
                    shape={shape}
                />
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
              textureType={textureType}
              onTextureLoading={onTextureLoading}
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
        <meshStandardMaterial color={materialColors.default} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 32]} />
        <meshStandardMaterial color="#4A4A4A" />
      </mesh>
    </group>
  );
}

const ModelViewer = ({ tableTopPath, basePath, material, shape, tableType, baseStyle, dimensions, edgeProfile, thickness, textureType, onTextureLoading }: ModelViewerProps) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPositioned, setIsPositioned] = useState(false);
  const isMobile = isMobileDevice();
  const mountCountRef = useRef(0);
  const lastPropsRef = useRef<string>('');

  useEffect(() => {
    // Create a key from props to detect actual changes
    const propsKey = `${tableTopPath || ''}-${basePath || ''}-${material || ''}-${shape || ''}`;
    
    // Only log and reset if props actually changed (not just re-render)
    if (propsKey !== lastPropsRef.current) {
      mountCountRef.current++;
      lastPropsRef.current = propsKey;
      
      // Use String() to properly log objects on iOS
      console.log('ModelViewer: Component mounted/reset', 
        'hasBase:', String(!!basePath), 
        'hasTableTop:', String(!!tableTopPath), 
        'shape:', String(shape || 'none'),
        'isMobile:', String(isMobile),
        'mountCount:', mountCountRef.current
      );
      setHasError(false);
      setErrorMessage(null);
      setIsPositioned(false); // Reset when models change
    }
    // Remove isMobile from deps - it's calculated once and doesn't change during component lifecycle
  }, [tableTopPath, basePath, material, shape]);

  // Always render Canvas to prevent hook order changes - hide with CSS when error
  // Wrap Canvas in Error Boundary to catch and stop continuous errors
  return (
    <ModelErrorBoundary
      fallback={
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
      }
    >
      <div className="w-full h-full bg-gradient-to-b from-secondary/20 to-secondary/5 rounded-lg overflow-hidden relative" style={{ minHeight: isMobile ? '300px' : '100%' }}>
        {/* Always mount Canvas to maintain hook order - hide when error */}
        <div style={{ display: hasError ? 'none' : 'block' }} className="w-full h-full">
          <Canvas
          shadows={false}
          gl={{ 
            antialias: false, // Disable antialias on mobile for better performance
            alpha: true,
            powerPreference: isMobile ? "low-power" : "high-performance",
            stencil: false,
            depth: true,
            preserveDrawingBuffer: true, // Important for mobile
            failIfMajorPerformanceCaveat: false, // Allow fallback on mobile
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2
          }}
          dpr={isMobile ? [1, 1.5] : [1, 1.5]} // Lower DPR on mobile for better performance
          performance={{ min: 0.5 }} // Reduce performance target on mobile
          className="w-full h-full"
          onCreated={(state) => {
            console.log('Canvas created successfully!', 
              'hasGL:', String(!!state.gl), 
              'hasScene:', String(!!state.scene),
              'hasCamera:', String(!!state.camera)
            );
            try {
              // Ensure Three.js is properly initialized
              if (state.gl) {
                const renderer = state.gl;
                renderer.setClearColor('#f5f5f5', 0);
                console.log('Canvas renderer initialized');
                
                // Get the actual WebGL context from the renderer
                const glContext = renderer.getContext();
                
                // Add WebGL context loss handler (iOS critical)
                const canvas = renderer.domElement;
                const handleContextLost = (e: Event) => {
                  e.preventDefault();
                  console.warn('❌ WebGL Context Lost - attempting recovery');
                  setHasError(true);
                  setErrorMessage('WebGL context lost. Please try again.');
                };
                
                const handleContextRestored = () => {
                  console.log('✅ WebGL Context Restored');
                  setHasError(false);
                  setErrorMessage(null);
                };
                
                canvas.addEventListener('webglcontextlost', handleContextLost);
                canvas.addEventListener('webglcontextrestored', handleContextRestored);
                
                // Log WebGL info for debugging (always log on mobile for debugging)
                if (glContext) {
                  const debugInfo = glContext.getExtension('WEBGL_debug_renderer_info');
                  if (debugInfo) {
                    const vendor = glContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                    const rendererName = glContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    // Log individual properties for better iOS compatibility
                    console.log('Canvas WebGL - Vendor:', String(vendor || 'unknown'));
                    console.log('Canvas WebGL - Renderer:', String(rendererName || 'unknown'));
                    console.log('Canvas WebGL - Mobile:', isMobile);
                  } else {
                    console.log('Canvas WebGL - Debug info not available');
                  }
                } else {
                  console.warn('Canvas WebGL - Context not available');
                }
              } else {
                console.warn('Canvas created but GL renderer not available');
              }
            } catch (error) {
              console.error('Error in Canvas onCreated (non-critical):', error);
              // Don't set error state - let it try to render anyway
              // Only log for debugging
            }
          }}
          onError={(error) => {
            console.error('Canvas error (will try to continue):', error);
            const errorMsg = error instanceof Error ? error.message : String(error);
            // Only set error state for critical errors that prevent rendering
            // Don't block on non-critical errors
            if (errorMsg.includes('WebGL') && errorMsg.includes('not supported')) {
              if (!hasError) {
                setHasError(true);
                setErrorMessage(`${errorMsg}`.substring(0, 500));
              }
            } else {
              // Log but don't block - let it try to render
              console.warn('Non-critical Canvas error, continuing:', errorMsg);
            }
          }}
        >
          <Suspense 
          fallback={
            <mesh>
              <boxGeometry args={[1, 0.1, 0.5]} />
              <meshStandardMaterial color={materialColors.default} />
            </mesh>
          }
        >
            <PerspectiveCamera makeDefault position={[0, 1, 3]} fov={50} />
            
            {/* Optimized lighting setup for faster rendering */}
            <ambientLight intensity={0.6} />
            
            {/* Main key light - bright, no shadows for performance */}
            <directionalLight 
              position={[5, 8, 5]} 
              intensity={1.5} 
              castShadow={false}
            />
            
            {/* Fill light - softer, from opposite side */}
            <directionalLight 
              position={[-5, 6, -5]} 
              intensity={0.5} 
              castShadow={false}
            />
            
            <CombinedModel 
              tableTopPath={tableTopPath} 
              basePath={basePath} 
              material={material}
              shape={shape}
              dimensions={dimensions}
              edgeProfile={edgeProfile}
              thickness={thickness}
              textureType={textureType}
              baseStyle={baseStyle}
              onPositioned={() => setIsPositioned(true)}
              onTextureLoading={onTextureLoading}
            />
            
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={10}
              minPolarAngle={Math.PI / 3} // Prevent looking from below (60 degrees minimum - very restrictive)
              maxPolarAngle={Math.PI / 1.4} // Limit to about 128 degrees (prevent viewing base from below)
              autoRotate={false}
              enableDamping={!isMobile} // Disable damping on mobile for better performance
              dampingFactor={0.05}
            />
            
            {/* Simplified environment for faster loading */}
            <Environment 
              preset="city" 
              background={false}
              environmentIntensity={0.8}
            />
          </Suspense>
        </Canvas>
        </div>
        
        {/* Show error overlay when there's an error - Canvas stays mounted but hidden */}
        {hasError && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-secondary/10 overflow-y-auto z-50">
            <div className="text-center p-8 max-w-md">
              <p className="font-sans text-sm text-muted-foreground mb-2">
                Eroare la încărcarea modelului 3D
              </p>
              {errorMessage && (
                <div className="bg-background/50 p-4 rounded-lg text-left max-h-48 overflow-y-auto mb-4">
                <p className="font-sans text-xs text-muted-foreground mb-2 font-semibold">
                  Detalii eroare:
                </p>
                <pre className="font-sans text-xs text-muted-foreground whitespace-pre-wrap break-words">
                  {errorMessage}
                </pre>
              </div>
              )}
              <p className="font-sans text-xs text-muted-foreground mb-4">
                Configuratorul poate funcționa parțial
              </p>
              <button
                onClick={() => {
                  setHasError(false);
                  setErrorMessage(null);
                  // Try again without reloading
                }}
                className="btn-luxury-filled px-4 py-2 text-sm"
              >
                Încearcă din nou
              </button>
            </div>
          </div>
        )}
      </div>
    </ModelErrorBoundary>
  );
};

export default ModelViewer;
