# 3D Models Directory

Place your `.glb` files in this directory.

## Recommended File Naming Convention

Based on the configurator options, you can name your files using this pattern:

- `{tableType}-{shape}-{material}.glb`

Examples:
- `dining-rectangular-carrara.glb`
- `dining-round-carrara.glb`
- `coffee-rectangular-carrara.glb`
- `custom-oval-statuario.glb`

## Alternative Structure

You can also organize by category:
- `/models/dining/rectangular-carrara.glb`
- `/models/coffee/round-carrara.glb`
- etc.

Update the `modelPath` logic in `src/pages/Configurator.tsx` to match your file structure.

