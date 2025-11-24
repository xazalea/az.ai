#!/usr/bin/env node
// Ensure all packages have build scripts to prevent build failures

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packagesDir = path.join(__dirname, '..', 'packages');

// Packages that don't need builds (Python, Go, or already built)
const skipBuild = [
  'WebAI-to-API',  // Python package
  'CLIProxyAPI',   // Go package
  'Groq2API',      // Go package
  'free-gpt3.5-2api', // Go package
  'ImageAI',       // Python package
  'deepseek4free', // Python package
  'gemini-multimodal-playground', // Has its own build
  'Viggle-AI-WebUI', // Already has build script
];

// Packages that should have dummy build scripts
const needDummyBuild = [
  'ChatGPTAPIFree',
  'gpt4free.js',
  'WebAI-to-API',
];

function ensureBuildScript(packageName) {
  const packagePath = path.join(packagesDir, packageName, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    return;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (!pkg.scripts) {
      pkg.scripts = {};
    }

    if (!pkg.scripts.build) {
      if (needDummyBuild.includes(packageName)) {
        pkg.scripts.build = `echo 'No build needed for ${packageName}'`;
        fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
        console.log(`✅ Added build script to ${packageName}`);
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not process ${packageName}: ${error.message}`);
  }
}

// Ensure all packages have build scripts
if (fs.existsSync(packagesDir)) {
  const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  packages.forEach(pkg => {
    if (!skipBuild.includes(pkg)) {
      ensureBuildScript(pkg);
    }
  });
}

console.log('✅ Build script check complete');

