const fs = require('fs');
const path = require('path');

// List of API route files to update
const apiRoutes = [
  'app/api/auth/create-admin/route.ts',
  'app/api/auth/session/route.ts',
  'app/api/availability/route.ts',
  'app/api/debug/check-admin/route.ts',
  'app/api/debug/env/route.ts',
  'app/api/debug/firebase/route.ts',
  'app/api/debug/firestore-test/route.ts',
  'app/api/debug/permissions/route.ts',
  'app/api/debug/set-admin-claim/route.ts',
  'app/api/debug/test-write/route.ts',
  'app/api/debug-firebase/route.ts'
];

// The export statement to add
const exportStatement = '\n// This is required for static export\nexport const dynamic = "force-static"\n';

// Process each file
apiRoutes.forEach(routePath => {
  const fullPath = path.join(process.cwd(), routePath);
  
  try {
    // Read the file content
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if the file already has the export statement
    if (!content.includes('export const dynamic = "force-static"')) {
      // Find the first import block
      const importEndIndex = content.indexOf('\n\n', content.lastIndexOf('import '));
      
      if (importEndIndex !== -1) {
        // Insert the export statement after the imports
        const newContent = content.slice(0, importEndIndex + 2) + 
                          exportStatement + 
                          content.slice(importEndIndex + 2);
        
        // Write the updated content back to the file
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${routePath}`);
      } else {
        console.log(`Could not find import block in ${routePath}`);
      }
    } else {
      console.log(`${routePath} already has the export statement`);
    }
  } catch (error) {
    console.error(`Error processing ${routePath}:`, error);
  }
});

console.log('All API routes updated!');
