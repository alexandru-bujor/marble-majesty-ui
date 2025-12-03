# Testing Table Top Model Paths

To find the correct table top model path, try accessing these URLs directly in your browser:

## Test URLs (replace `rectangle` with `circle`, `oval`, `square` as needed):

1. **Similar to bases structure:**
   - https://www.allinstone.co.uk/assets/v-5/configurator-new/tops/rectangle/model.glb
   - https://www.allinstone.co.uk/assets/v-5/configurator-new/tops/circle/model.glb
   - https://www.allinstone.co.uk/assets/v-5/configurator-new/tops/oval/model.glb
   - https://www.allinstone.co.uk/assets/v-5/configurator-new/tops/square/model.glb

2. **Direct in models folder:**
   - https://www.allinstone.co.uk/assets/v-5/configurator-new/models/rectangle.glb
   - https://www.allinstone.co.uk/assets/v-5/configurator-new/models/circle.glb

3. **Table-tops folder:**
   - https://www.allinstone.co.uk/assets/v-5/configurator-new/table-tops/rectangle.glb

4. **Root level:**
   - https://www.allinstone.co.uk/assets/v-5/configurator-new/rectangle.glb

5. **Capitalized:**
   - https://www.allinstone.co.uk/assets/v-5/configurator-new/tops/Rectangle/model.glb
   - https://www.allinstone.co.uk/assets/v-5/configurator-new/tops/Circle/model.glb

## Instructions:

1. Open each URL in a new browser tab
2. If it downloads a `.glb` file, that's the correct path!
3. Update the `tableTopPath` in `Configurator.tsx` with the working path
4. Uncomment the corresponding line in the code

## Alternative: Check if table tops are in base models

The table tops might be part of the base models themselves. You can:
1. Download a base model (e.g., `bases/pescara/model.glb`)
2. Open it in a 3D viewer (like Blender or online GLTF viewer)
3. Check if it contains both the base and table top

