const fs = require('fs');
const { exec } = require('child_process');

const routePath = 'src/app/api/scan-vulnerability/route.ts';
const errorPattern = /valid: false/;

function checkAndFix() {
  fs.readFile(routePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    if (!errorPattern.test(data)) {
      console.log('Error detected: valid: false not found. Fixing...');

      // Find the catch block and add valid: false
      const fixedData = data.replace(
        /return \{\s*status: 'Error',\s*error: 'Unable to connect to vulnerability scanner service',\s*details: \{ target: url, ssl: 'Unknown', threat_level: 'Unknown' \}\s*\};/,
        "return {\n      valid: false,\n      status: 'Error',\n      error: 'Unable to connect to vulnerability scanner service',\n      details: { target: url, ssl: 'Unknown', threat_level: 'Unknown' }\n    };"
      );

      fs.writeFile(routePath, fixedData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing file:', err);
          return;
        }

        console.log('Fixed the code. Committing and pushing...');

        exec('git add . && git commit -m "Auto-fix: Add valid: false to fallback response" && git push', (err, stdout, stderr) => {
          if (err) {
            console.error('Error with git:', err);
            return;
          }
          console.log('Changes committed and pushed successfully.');
        });
      });
    } else {
      console.log('No error detected. Code is correct.');
    }
  });
}

// Run the check
checkAndFix();

// Optional: Run periodically, e.g., every hour
setInterval(checkAndFix, 60 * 60 * 1000); // 1 hour
