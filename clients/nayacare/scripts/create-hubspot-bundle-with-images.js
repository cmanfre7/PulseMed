import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createHubSpotBundleWithImages() {
  console.log('🚀 Creating HubSpot bundle with your complete NayaCare app and images...\n');
  
  try {
    // Read the built files
    const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    const cssPath = path.join(process.cwd(), 'dist', 'assets', 'index-BFTACZCZ.css');
    const jsPath = path.join(process.cwd(), 'dist', 'assets', 'index-BjPOcijk.js');
    
    const html = fs.readFileSync(htmlPath, 'utf8');
    const css = fs.readFileSync(cssPath, 'utf8');
    let js = fs.readFileSync(jsPath, 'utf8');
    
    // Read and convert images to base64
    const silhouettePath = path.join(process.cwd(), 'public', 'pregnant-woman-silhouette.png');
    const silhouetteFullPath = path.join(process.cwd(), 'public', 'pregnant-woman-silhouette-fullscreen.png');
    
    const silhouetteBase64 = fs.readFileSync(silhouettePath, 'base64');
    const silhouetteFullBase64 = fs.readFileSync(silhouetteFullPath, 'base64');
    
    // Replace image URLs in the JavaScript with base64 data URLs
    js = js.replace(/\/pregnant-woman-silhouette\.png/g, 
      `data:image/png;base64,${silhouetteBase64}`);
    js = js.replace(/\/pregnant-woman-silhouette-fullscreen\.png/g, 
      `data:image/png;base64,${silhouetteFullBase64}`);
    
    console.log('✅ Embedded pregnant-woman-silhouette images as base64');
    
    // Create the complete HubSpot template
    const hubspotTemplate = `<!--
template type: page
is_available_for_new_content: true
label: NayaCare Complete Application
-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NayaCare - 4th Trimester Guide</title>
    {{ standard_header_includes }}
    
    <style>
        /* Your complete NayaCare styles */
        ${css}
        
        /* Ensure the app is properly positioned */
        #root {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }
        
        /* Fix for the floating widget positioning */
        .fixed {
            position: fixed !important;
        }
        
        /* Ensure images display properly */
        img {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>

<body>
    {% dnd_area "dnd_area" label="Main section" %}
        <!-- HubSpot content area - hidden when chatbot is active -->
    {% end_dnd_area %}
    
    <!-- Your NayaCare React App Root -->
    <div id="root"></div>
    
    <script>
        // Fix for image paths in HubSpot environment
        window.__HUBSPOT_EMBED__ = true;
        
        // Your complete NayaCare application JavaScript with embedded images
        ${js}
    </script>
    
    {{ standard_footer_includes }}
</body>
</html>`;
    
    // Write the bundled file
    const outputPath = path.join(process.cwd(), 'nayacare-hubspot-final.html');
    fs.writeFileSync(outputPath, hubspotTemplate);
    
    console.log('✅ Successfully created HubSpot bundle with images!');
    console.log(`📄 Output file: nayacare-hubspot-final.html`);
    console.log(`📏 Total size: ${(hubspotTemplate.length / 1024 / 1024).toFixed(2)} MB`);
    console.log('\n🎯 Next steps:');
    console.log('1. Copy the contents of nayacare-hubspot-final.html');
    console.log('2. Paste into your HubSpot Design Manager');
    console.log('3. Publish to see your complete NayaCare app with images!');
    console.log('\n✨ Images included:');
    console.log('   - pregnant-woman-silhouette.png (widget overlay)');
    console.log('   - pregnant-woman-silhouette-fullscreen.png (full screen)');
    
  } catch (error) {
    console.error('❌ Error creating bundle:', error);
  }
}

// Run the bundler
createHubSpotBundleWithImages().catch(console.error);

export { createHubSpotBundleWithImages };
