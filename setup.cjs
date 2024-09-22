const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); // Only declare this once

// Function to check if a file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    console.error(err);
    return false;
  }
};

// Function to create files only if they do not exist
const createFiles = () => {
  const files = {
    'tests/Consumer.test.js': `
    const { Pact } = require('@pact-foundation/pact');
    const path = require('path');
    const { like } = require('@pact-foundation/pact').Matchers;
    const axios = require('axios');
    
    const requestMethod = process.env.REQUEST_METHOD || 'GET';
    const requestPath = process.env.REQUEST_PATH || '/items';
    
    const provider = new Pact({
      port: 8081,
      log: path.resolve(process.cwd(), 'logs', 'pact.log'),
      dir: path.resolve(process.cwd(), 'contracts'),
      spec: 2,
      consumer: 'FrontendConsumer',
      provider: 'BackendProvider'
    });
    
    describe('Pact Contract Testing', () => {
      beforeAll(async () => {
        await provider.setup();
      });
    
      afterEach(async () => {
        await provider.writePact();
      });
    
      afterAll(async () => {
        try {
          console.log('Finalizing Pact...');
          await provider.finalize();
        } catch (err) {
          console.error('Error finalizing Pact:', err);
        }
      });
    
      describe('When a call is made to the provider', () => {
        beforeEach(async () => {
          const interaction = {
            state: 'I have a list of items',
            uponReceiving: 'A request for items',
            withRequest: {
              method: requestMethod,
              path: requestPath
            },
            willRespondWith: {
              status: 200,
              body: like([{ id: 1, name: 'Item 1' }])
            }
          };
          await provider.addInteraction(interaction);
        });
    
        it('should return the expected items', async () => {
          const response = await axios.get(\`http://localhost:8081\${requestPath}\`);
          expect(response.status).toEqual(200);
          expect(response.data).toEqual([{ id: 1, name: 'Item 1' }]);
        });
      });
    });
    `,

    'tests/Provider.test.js': `
    const { Verifier } = require('@pact-foundation/pact');
    const path = require('path');
    
    describe('Pact Provider Verification', () => {
      it('should validate the contract', async () => {
        const verifier = new Verifier({
          providerBaseUrl: 'http://localhost:3000',
          pactUrls: [path.resolve(process.cwd(), 'contracts/frontendconsumer-backendprovider.json')],
        });
    
        const result = await verifier.verifyProvider();
        console.log(result);
      });
    });
    `,

    'server.js': `
    import express from 'express';
    const app = express();
    const PORT = 3000;
    
    app.get('/items', (req, res) => {
      res.json([{ id: 1, name: 'Item 1' }]);
    });
    
    app.listen(PORT, () => {
      console.log(\`Provider service running on http://localhost:\${PORT}\`);
    });
    `,

    'prompt.js': `
    import inquirer from 'inquirer';
    import { exec } from 'child_process';
    
    inquirer.prompt([
      { name: 'method', message: 'Enter request method (GET/POST):' },
      { name: 'path', message: 'Enter request path (e.g., /items):' }
    ])
    .then(answers => {
      process.env.REQUEST_METHOD = answers.method;
      process.env.REQUEST_PATH = answers.path;
    
      exec('npm run test-consumer', (err, stdout, stderr) => {
        if (err) {
          console.error(\`Error executing tests: \${err}\`);
          return;
        }
        console.log(stdout);
      });
    });
    `,

    'package.json': `
    {
      "name": "contracttesting(js)",
      "version": "1.0.0",
      "main": "index.js",
      "type": "module",
      "scripts": {
        "test": "jest",
        "test-consumer": "jest tests/Consumer.test.js",
        "test-provider": "jest tests/Provider.test.js",
        "start-provider": "node server.js"
      },
      "devDependencies": {
        "@pact-foundation/pact": "^13.1.3",
        "@pact-foundation/pact-node": "^10.18.0",
        "axios": "^1.7.7",
        "express": "^4.21.0",
        "jest": "^29.7.0"
      },
      "dependencies": {
        "inquirer": "^11.0.2"
      }
    }
    `
  };

  Object.entries(files).forEach(([filePath, content]) => {
    if (!fileExists(filePath)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content.trim());
      console.log(`Created ${filePath}`);
    } else {
      console.log(`${filePath} already exists, skipping...`);
    }
  });
};

// Function to install dependencies only if not already installed
const installDependencies = () => {
  if (!fs.existsSync('node_modules')) {
    console.log('Installing dependencies...');
    exec('npm install', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error installing dependencies: ${error}`);
        return;
      }
      console.log(stdout);
    });
  } else {
    console.log('Dependencies already installed, skipping...');
  }
};

// Run the setup
createFiles();
installDependencies();
