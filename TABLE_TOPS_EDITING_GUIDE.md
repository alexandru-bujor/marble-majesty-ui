# Table Tops Editing Guide

This guide explains how to edit and customize table top shapes in the configurator.

## File Structure

The table top generation logic is located in:
- **`src/components/ModelViewer.tsx`** - Contains the `GeneratedTableTop` component that creates 3D table tops dynamically

## How Table Tops Work

Table tops are generated dynamically using Three.js geometry:
1. A 2D shape is created using `THREE.Shape`
2. The shape is extruded into 3D using `THREE.ExtrudeGeometry`
3. Materials and textures are applied

## Available Shapes

### 1. Round (Circle)
- **Location**: `src/components/ModelViewer.tsx`, lines ~280-285
- **Dimensions**: Uses `radius` (in cm)
- **Shape Creation**: Uses `absarc()` to create a perfect circle
- **Code**:
  ```typescript
  case 'round': {
    const radius = (dimensions.radius || 100) / 100; // Convert cm to meters
    shape2D.absarc(0, 0, radius, 0, Math.PI * 2, false);
    shape2D.closePath();
    break;
  }
  ```

### 2. Square
- **Location**: `src/components/ModelViewer.tsx`, lines ~286-300
- **Dimensions**: Uses `squareLength` (in cm)
- **Shape Creation**: Creates a square with sharp corners
- **Scaling**: Multiplied by 1.3x to match visual size of rectangular tables
- **Code**:
  ```typescript
  case 'square': {
    const size = ((dimensions.squareLength || 150) / 100) * 1.3;
    const halfSize = size / 2;
    shape2D.moveTo(-halfSize, -halfSize);
    shape2D.lineTo(halfSize, -halfSize);
    shape2D.lineTo(halfSize, halfSize);
    shape2D.lineTo(-halfSize, halfSize);
    shape2D.lineTo(-halfSize, -halfSize);
    break;
  }
  ```

### 3. Rectangular / Curved-Rectangular
- **Location**: `src/components/ModelViewer.tsx`, lines ~301-320
- **Dimensions**: Uses `length` and `width` (in cm)
- **Shape Creation**: Creates a rectangle with sharp corners
- **Code**:
  ```typescript
  case 'rectangular':
  case 'curved-rectangular': {
    const length = (dimensions.length || 200) / 100;
    const width = (dimensions.width || 100) / 100;
    const halfLength = length / 2;
    const halfWidth = width / 2;
    shape2D.moveTo(-halfLength, -halfWidth);
    shape2D.lineTo(halfLength, -halfWidth);
    shape2D.lineTo(halfLength, halfWidth);
    shape2D.lineTo(-halfLength, halfWidth);
    shape2D.lineTo(-halfLength, -halfWidth);
    break;
  }
  ```

### 4. Oval
- **Location**: `src/components/ModelViewer.tsx`, lines ~321-340
- **Dimensions**: Uses `largestDiameter` and `smallestDiameter` (in cm)
- **Shape Creation**: Creates an ellipse using parametric equations
- **Code**:
  ```typescript
  case 'oval': {
    const a = (dimensions.largestDiameter || 200) / 200; // Semi-major axis
    const b = (dimensions.smallestDiameter || 120) / 200; // Semi-minor axis
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = b * Math.cos(angle);
      const y = a * Math.sin(angle);
      if (i === 0) {
        shape2D.moveTo(x, y);
      } else {
        shape2D.lineTo(x, y);
      }
    }
    break;
  }
  ```

## How to Edit Table Tops

### Changing Dimensions

1. **Find the shape case** in `GeneratedTableTop` function (around line 279)
2. **Modify the dimension conversion**:
   - Dimensions come in centimeters (cm)
   - Convert to meters by dividing by 100: `(dimensions.radius || 100) / 100`
   - Default values are used if dimension is missing

### Adding Rounded Corners

To add rounded corners to a shape, use `quadraticCurveTo()`:

```typescript
// Example: Rounded rectangle
const cornerRadius = 0.05; // 5cm in meters
shape2D.moveTo(-halfLength + cornerRadius, -halfWidth);
shape2D.lineTo(halfLength - cornerRadius, -halfWidth);
shape2D.quadraticCurveTo(halfLength, -halfWidth, halfLength, -halfWidth + cornerRadius);
// Continue for all 4 corners...
```

### Changing Shape Size/Scale

1. **Square scaling**: Currently multiplied by 1.3x (line ~289)
   - Change: `const size = ((dimensions.squareLength || 150) / 100) * 1.3;`
   - To remove scaling: `const size = (dimensions.squareLength || 150) / 100;`

2. **Other shapes**: Adjust the division factor or add multipliers as needed

### Adding New Shapes

1. **Add shape value** to `shapes` array in `src/pages/Configurator.tsx`:
   ```typescript
   const shapes = [
     // ... existing shapes
     { value: 'new-shape', label: 'New Shape' },
   ];
   ```

2. **Add dimension handling** in `dimensions` useMemo in `Configurator.tsx`:
   ```typescript
   case 'new-shape':
     return { newDimension: newDimensionValue[0] };
   ```

3. **Add shape generation case** in `ModelViewer.tsx`:
   ```typescript
   case 'new-shape': {
     // Create your shape using THREE.Shape methods
     const size = (dimensions.newDimension || 100) / 100;
     // ... shape creation code
     break;
   }
   ```

## Shape Coordinate System

- **Origin**: (0, 0) is the center of the shape
- **X-axis**: Left (-) to Right (+)
- **Y-axis**: Bottom (-) to Top (+)
- **After rotation**: Shape is rotated -90° around X-axis to lay flat on XZ plane

## Extrusion Settings

The 2D shape is extruded into 3D using these settings (around line 370):

```typescript
const extrudeSettings = {
  depth: thickness,        // Table top thickness (default: 0.02m = 2cm)
  bevelEnabled: false,      // No beveled edges
  bevelThickness: 0,
  bevelSize: 0,
  bevelSegments: 0,
};
```

To add beveled edges:
```typescript
const extrudeSettings = {
  depth: thickness,
  bevelEnabled: true,
  bevelThickness: 0.01,     // Bevel thickness
  bevelSize: 0.01,          // Bevel size
  bevelSegments: 3,         // Bevel smoothness
};
```

## Material and Texture

- **Location**: Lines ~230-270 in `ModelViewer.tsx`
- **Textures**: Loaded from AllInStone URLs (see `materialTextures` object)
- **Fallback**: Solid colors if texture fails (see `materialColors` object)
- **Texture scaling**: Automatically scaled based on table size

## Rotation

All shapes are rotated to lay flat:
- **Rotation**: `[-Math.PI / 2, 0, 0]` (line ~431)
- This rotates -90° around X-axis to place shape on XZ plane

## Testing Changes

1. **Start dev server**: `npm run dev`
2. **Navigate to**: `/configurator`
3. **Select shape** from dropdown
4. **Adjust dimensions** using sliders
5. **Check 3D viewer** for changes

## Common Issues

### Shape appears rotated incorrectly
- Check the rotation value (should be `[-Math.PI / 2, 0, 0]`)
- Verify shape coordinates are centered at (0, 0)

### Shape too small/large
- Check dimension conversion (cm to meters: divide by 100)
- Adjust scaling multipliers if needed

### Shape not appearing
- Check console for errors
- Verify dimensions object has required values
- Ensure shape case matches shape value from Configurator

### Texture not loading
- Check `materialTextures` object has entry for material
- Verify texture URLs are accessible
- Check browser console for CORS or 404 errors

## Tips

1. **Always center shapes** at (0, 0) for consistent positioning
2. **Use half-dimensions** (halfLength, halfWidth) for easier coordinate calculation
3. **Close paths** with `closePath()` or return to start point
4. **Test with different dimensions** to ensure shape scales correctly
5. **Check rotation** if shape appears in wrong orientation

## Related Files

- `src/pages/Configurator.tsx` - UI controls and dimension state
- `src/components/ModelViewer.tsx` - 3D rendering and shape generation
- `vite.config.ts` - Proxy configuration for AllInStone assets

