const fs = require('fs');
const path = require('path');

// Copy built assets to HubSpot CMS module
function copyBundleToHubSpot() {
  const distDir = path.join(__dirname, '../web/dist');
  const moduleDir = path.join(__dirname, '../cms/modules/chatbot');
  
  // Ensure module directory exists
  if (!fs.existsSync(moduleDir)) {
    fs.mkdirSync(moduleDir, { recursive: true });
  }
  
  // Find the main JS bundle
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.error('Build assets not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  const files = fs.readdirSync(assetsDir);
  const jsFile = files.find(file => file.endsWith('.js'));
  
  if (!jsFile) {
    console.error('No JS bundle found in assets directory.');
    process.exit(1);
  }
  
  const sourceFile = path.join(assetsDir, jsFile);
  const targetFile = path.join(moduleDir, 'module.js');
  
  // Copy the bundle
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✅ Copied ${jsFile} to ${targetFile}`);
  
  // Update module.json if it exists
  const moduleJsonPath = path.join(moduleDir, 'module.json');
  if (fs.existsSync(moduleJsonPath)) {
    const moduleConfig = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));
    moduleConfig.bundle_js = 'module.js';
    fs.writeFileSync(moduleJsonPath, JSON.stringify(moduleConfig, null, 2));
    console.log('✅ Updated module.json with bundle_js field');
  } else {
    // Create basic module.json
    const moduleConfig = {
      name: 'NayaCare Chatbot',
      description: 'Educational postpartum tutor chatbot',
      bundle_js: 'module.js',
      fields: [
        {
          name: 'title',
          label: 'Chat Title',
          type: 'text',
          default: '4th Trimester Guide'
        },
        {
          name: 'show_consent',
          label: 'Show Consent Modal',
          type: 'boolean',
          default: true
        }
      ]
    };
    fs.writeFileSync(moduleJsonPath, JSON.stringify(moduleConfig, null, 2));
    console.log('✅ Created module.json');
  }
}

copyBundleToHubSpot();
