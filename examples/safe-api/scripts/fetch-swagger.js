const fs = require('fs');
const path = require('path');

// Fetch swagger.json from the API and save it to packages/utils/swagger.json
async function fetchSwagger() {
  const swaggerUrl = process.env.SWAGGER_URL || 'http://localhost:3000/api/swagger';
  const outputPath = path.join(process.cwd(), 'swagger.json');

  try {
    const response = await fetch(swaggerUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch swagger: ${response.statusText}`);
    }

    const swagger = await response.json();
    fs.writeFileSync(outputPath, JSON.stringify(swagger, null, 2));
    console.log(`✅ Swagger JSON saved to ${outputPath}`);
  } catch (error) {
    console.error('❌ Error fetching swagger:', error.message);
    console.log('💡 Make sure the Next.js dev server is running: npm run dev');
    process.exit(1);
  }
}

fetchSwagger();
