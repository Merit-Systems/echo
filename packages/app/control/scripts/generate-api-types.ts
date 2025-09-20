#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import { Project, SyntaxKind } from 'ts-morph';

interface RouteInfo {
  filePath: string;
  routePath: string;
  methods: string[];
  hasTypeExport: boolean;
}

interface GeneratedType {
  name: string;
  method: string;
  routePath: string;
  typeDefinition: string;
  conditional?: boolean; // Mark types that should be filtered out if they resolve to unknown
}

/**
 * Convert file path to API route path
 * e.g., "apps/[id]/route.ts" -> "/apps/{id}"
 * e.g., "oauth/authorize/route.ts" -> "/oauth/authorize"
 */
function filePathToRoutePath(filePath: string): string {
  let relativePath = filePath
    .replace(/^.*\/api\//, '')
    .replace(/\/route\.ts$/, '')
    .replace(/\[([^\]]+)\]/g, '{$1}'); // Convert [id] to {id}

  // Handle OAuth routes differently - they don't need the v1 prefix
  if (relativePath.startsWith('oauth/')) {
    return `/${relativePath}`;
  }

  // For v1 routes, remove the v1 prefix
  if (relativePath.startsWith('v1/')) {
    relativePath = relativePath.replace(/^v1\//, '');
  }

  return relativePath ? `/${relativePath}` : '';
}

/**
 * Generate type name from route path and method
 */
function generateTypeName(routePath: string, method: string): string {
  const cleanPath = routePath
    .replace(/^\//, '') // Remove leading slash
    .replace(
      /\{([^}]+)\}/g,
      (_, param) => `By${param.charAt(0).toUpperCase() + param.slice(1)}`
    ) // Convert {id} to ById
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()) // Convert kebab-case to camelCase
    .split('/')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');

  const prefix =
    method.toLowerCase() === 'get'
      ? 'Get'
      : method.toLowerCase() === 'post'
        ? 'Create'
        : method.toLowerCase() === 'put'
          ? 'Update'
          : method.toLowerCase() === 'delete'
            ? 'Delete'
            : method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();

  return `${prefix}${cleanPath || 'Root'}Response`;
}

/**
 * Find all route files in the API directory
 */
function findRouteFiles(apiDir: string): RouteInfo[] {
  const routes: RouteInfo[] = [];

  function scanDirectory(dir: string) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('_')) {
        scanDirectory(fullPath);
      } else if (item === 'route.ts') {
        const relativePath = path.relative(apiDir, fullPath);
        const routePath = filePathToRoutePath(relativePath);

        routes.push({
          filePath: fullPath,
          routePath,
          methods: [], // Will be populated later
          hasTypeExport: false,
        });
      }
    }
  }

  scanDirectory(apiDir);
  return routes;
}

/**
 * Analyze a route file to extract methods and check for type exports
 */
function analyzeRouteFile(
  project: Project,
  routeInfo: RouteInfo
): GeneratedType[] {
  const sourceFile = project.addSourceFileAtPath(routeInfo.filePath);
  const generatedTypes: GeneratedType[] = [];

  // Find exported route handlers (GET, POST, PUT, DELETE, etc.)
  const exportedDeclarations = sourceFile.getExportedDeclarations();

  for (const [name] of exportedDeclarations) {
    if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(name)) {
      routeInfo.methods.push(name);

      // Check if there's already a Body type export for this method
      const bodyTypeName = name === 'GET' ? 'Body' : `${name}Body`;
      const hasExistingType = exportedDeclarations.has(bodyTypeName);

      if (!hasExistingType) {
        // Generate the response type definition (always generate response)
        const responseTypeName = generateTypeName(routeInfo.routePath, name);
        const responseTypeDefinition = `export type ${responseTypeName} = typeof ${name} extends OriginalRouteHandler<infer TParams, infer TQuery, infer TBody, infer TResponse> ? TResponse : never;`;

        generatedTypes.push({
          name: responseTypeName,
          method: name,
          routePath: routeInfo.routePath,
          typeDefinition: responseTypeDefinition,
        });

        // Generate params type definition (with conditional generation)
        const paramsTypeName = responseTypeName.replace('Response', 'Params');
        const paramsTypeDefinition = `export type ${paramsTypeName} = typeof ${name} extends OriginalRouteHandler<infer TParams, infer TQuery, infer TBody, infer TResponse> ? TParams : never;`;

        generatedTypes.push({
          name: paramsTypeName,
          method: name,
          routePath: routeInfo.routePath,
          typeDefinition: paramsTypeDefinition,
          conditional: true, // Mark as conditional for filtering
        });

        // Generate query type definition (with conditional generation)
        const queryTypeName = responseTypeName.replace('Response', 'Query');
        const queryTypeDefinition = `export type ${queryTypeName} = typeof ${name} extends OriginalRouteHandler<infer TParams, infer TQuery, infer TBody, infer TResponse> ? TQuery : never;`;

        generatedTypes.push({
          name: queryTypeName,
          method: name,
          routePath: routeInfo.routePath,
          typeDefinition: queryTypeDefinition,
          conditional: true, // Mark as conditional for filtering
        });

        // Generate body type definition only for POST routes (with conditional generation)
        if (name === 'POST') {
          const bodyTypeName = responseTypeName.replace('Response', 'Body');
          const bodyTypeDefinition = `export type ${bodyTypeName} = typeof ${name} extends OriginalRouteHandler<infer TParams, infer TQuery, infer TBody, infer TResponse> ? TBody : never;`;

          generatedTypes.push({
            name: bodyTypeName,
            method: name,
            routePath: routeInfo.routePath,
            typeDefinition: bodyTypeDefinition,
            conditional: true, // Mark as conditional for filtering
          });
        }
      } else {
        routeInfo.hasTypeExport = true;
      }
    }
  }

  // Remove the source file from project to avoid memory issues
  project.removeSourceFile(sourceFile);

  return generatedTypes;
}

/**
 * Generate the complete types file content with resolved types
 */
function generateTypesFileContent(generatedTypes: GeneratedType[]): string {
  const imports = `import { OriginalRouteHandler } from '../lib/api/types';
import { z } from 'zod';

// Auto-generated API response types
// This file is generated by running: npm run generate-api-types
// Do not edit this file manually - it will be overwritten

// Utility type to extract types from route handlers
type ExtractRouteHandlerTypes<T> = T extends OriginalRouteHandler<infer TParams, infer TQuery, infer TBody, infer TResponse, infer TServerErrorBody, infer TInternalErrorBody> 
  ? { 
      params: TParams extends z.Schema ? z.infer<TParams> : TParams; 
      query: TQuery extends z.Schema ? z.infer<TQuery> : TQuery; 
      body: TBody extends z.Schema ? z.infer<TBody> : TBody; 
      response: TResponse;
      serverErrorBody: TServerErrorBody;
      internalErrorBody: TInternalErrorBody;
    }
  : never;

`;

  const typesByRoute = generatedTypes.reduce(
    (acc, type) => {
      if (!acc[type.routePath]) {
        acc[type.routePath] = [];
      }
      acc[type.routePath].push(type);
      return acc;
    },
    {} as Record<string, GeneratedType[]>
  );

  let content = imports;

  // Generate imports for each route (deduplicated)
  const routeImports: string[] = [];
  const seenImports = new Set<string>();

  for (const [routePath, types] of Object.entries(typesByRoute)) {
    for (const type of types) {
      const routeImportPath = routePath.replace(/\{[^}]+\}/g, '[id]'); // Convert back to Next.js format

      // Determine the correct import path based on whether it's an OAuth route or v1 route
      let importPath: string;
      if (routePath.startsWith('/oauth/')) {
        // Handle specific OAuth route paths
        if (routePath === '/oauth/authorize') {
          importPath = `../app/(auth)/(oauth)/(authorize)/api/oauth/authorize/route`;
        } else if (routePath === '/oauth/token') {
          importPath = `../app/(auth)/(oauth)/api/oauth/token/route`;
        } else if (routePath === '/oauth/userinfo') {
          importPath = `../app/(auth)/(oauth)/api/oauth/userinfo/route`;
        } else {
          importPath = `../app/api${routeImportPath}/route`;
        }
      } else {
        importPath = `../app/api/v1${routeImportPath}/route`;
      }

      const importAlias = `${type.method}${routePath.replace(/[^a-zA-Z0-9]/g, '')}`;
      const importStatement = `import { ${type.method} as ${importAlias} } from '${importPath}';`;

      if (!seenImports.has(importStatement)) {
        seenImports.add(importStatement);
        routeImports.push(importStatement);
      }
    }
  }

  content += routeImports.join('\n') + '\n\n';

  for (const [routePath, types] of Object.entries(typesByRoute)) {
    content += `// Route: ${routePath || '/'}\n`;

    for (const type of types) {
      const importAlias = `${type.method}${routePath.replace(/[^a-zA-Z0-9]/g, '')}`;
      let typeDefinition: string;

      if (type.name.endsWith('Response')) {
        typeDefinition = `export type ${type.name} = ExtractRouteHandlerTypes<typeof ${importAlias}>['response'];`;
      } else if (type.name.endsWith('Params')) {
        typeDefinition = `export type ${type.name} = ExtractRouteHandlerTypes<typeof ${importAlias}>['params'];`;
      } else if (type.name.endsWith('Query')) {
        typeDefinition = `export type ${type.name} = ExtractRouteHandlerTypes<typeof ${importAlias}>['query'];`;
      } else if (type.name.endsWith('Body')) {
        typeDefinition = `export type ${type.name} = ExtractRouteHandlerTypes<typeof ${importAlias}>['body'];`;
      } else {
        typeDefinition = `export type ${type.name} = ExtractRouteHandlerTypes<typeof ${importAlias}>['response'];`;
      }

      content += `${typeDefinition}\n`;
    }

    content += '\n';
  }

  return content;
}

/**
 * Clean up type definitions for SDK consumption using ts-morph for enum resolution
 * - Remove absolute import paths
 * - Convert Date to string
 * - Convert Decimal to string
 * - Resolve enum references to string literals using ts-morph
 */
function cleanTypeForSDK(typeText: string): string {
  let cleanText = typeText;

  // Replace Date with string (since JSON serialization converts dates to strings)
  cleanText = cleanText.replace(/\bDate\b/g, 'string');

  // Replace Prisma Decimal with string (common serialization format)
  cleanText = cleanText.replace(/\bDecimal\b/g, 'string');

  // Try to resolve known enum types using ts-morph
  const enumReplacements = [
    {
      name: 'PaymentStatus',
    },
    {
      name: 'PayoutStatus',
    },
    {
      name: 'EnumPaymentSource',
    },
  ];

  for (const { name } of enumReplacements) {
    const enumPattern = new RegExp(`\\b${name}\\b`, 'g');
    console.log(`🔍 Attempting to resolve enum: ${name} on text: ${cleanText}`);
    if (enumPattern.test(cleanText)) {
      cleanText = cleanText.replace(enumPattern, 'string');
    }
  }

  // Replace absolute import paths with their simple type names
  cleanText = cleanText.replace(/import\(".*?\/([^"\/]+)"\)\.(\w+)/g, '$2');

  // Handle malformed import paths (like .string after import)
  cleanText = cleanText.replace(/import\(".*?"\)\.string/g, 'string');

  // Handle any remaining import statements by replacing with 'any'
  cleanText = cleanText.replace(/import\(".*?"\)/g, 'any');

  // Replace enum references with string for simplicity (after import processing)
  cleanText = cleanText.replace(/\$Enums\.\w+/g, 'string');

  // Fix any.string patterns - this handles cases like "any.string" in the resolved types
  cleanText = cleanText.replace(/any\.string/g, 'string');

  // Handle complex patterns like any.$Enums."string literal"
  cleanText = cleanText.replace(/any\.\$Enums\."[^"]+"/g, 'string');

  // Handle any other patterns that might result from import resolution
  cleanText = cleanText.replace(/any\.\w+/g, 'any');

  return cleanText;
}

/**
 * Generate resolved types file for SDK consumption
 */
function generateResolvedTypesFile(
  generatedTypes: GeneratedType[],
  project: Project,
  outputDir: string
): void {
  console.log('🔧 Generating resolved types for SDK...');

  const typeChecker = project.getTypeChecker();
  const resolvedTypes: string[] = [];

  // Create a temporary file to resolve the types
  const tempFilePath = path.join(outputDir, 'temp-resolve.ts');

  const typesByRoute = generatedTypes.reduce(
    (acc, type) => {
      if (!acc[type.routePath]) {
        acc[type.routePath] = [];
      }
      acc[type.routePath].push(type);
      return acc;
    },
    {} as Record<string, GeneratedType[]>
  );

  // Build the temp file content with imports and type definitions
  let tempContent = `import { OriginalRouteHandler } from '../lib/api/types';
import { z } from 'zod';

// Utility type to extract types from route handlers
type ExtractRouteHandlerTypes<T> = T extends OriginalRouteHandler<infer TParams, infer TQuery, infer TBody, infer TResponse, infer TServerErrorBody, infer TInternalErrorBody> 
  ? { 
      params: TParams extends z.Schema ? z.infer<TParams> : TParams; 
      query: TQuery extends z.Schema ? z.infer<TQuery> : TQuery; 
      body: TBody extends z.Schema ? z.infer<TBody> : TBody; 
      response: TResponse;
      serverErrorBody: TServerErrorBody;
      internalErrorBody: TInternalErrorBody;
    }
  : never;

`;

  // Add all route imports (deduplicated)
  const seenImports = new Set<string>();
  for (const [routePath, types] of Object.entries(typesByRoute)) {
    for (const type of types) {
      const routeImportPath = routePath.replace(/\{[^}]+\}/g, '[id]');

      // Determine the correct import path based on whether it's an OAuth route or v1 route
      let importPath: string;
      if (routePath.startsWith('/oauth/')) {
        // Handle specific OAuth route paths
        if (routePath === '/oauth/authorize') {
          importPath = `../app/(auth)/(oauth)/(authorize)/api/oauth/authorize/route`;
        } else if (routePath === '/oauth/token') {
          importPath = `../app/(auth)/(oauth)/api/oauth/token/route`;
        } else if (routePath === '/oauth/userinfo') {
          importPath = `../app/(auth)/(oauth)/api/oauth/userinfo/route`;
        } else {
          importPath = `../app/api${routeImportPath}/route`;
        }
      } else {
        importPath = `../app/api/v1${routeImportPath}/route`;
      }

      const importAlias = `${type.method}${routePath.replace(/[^a-zA-Z0-9]/g, '')}`;
      const importStatement = `import { ${type.method} as ${importAlias} } from '${importPath}';`;

      if (!seenImports.has(importStatement)) {
        seenImports.add(importStatement);
        tempContent += `${importStatement}\n`;
      }
    }
  }

  tempContent += '\n';

  // Add type definitions
  for (const [routePath, types] of Object.entries(typesByRoute)) {
    for (const type of types) {
      const importAlias = `${type.method}${routePath.replace(/[^a-zA-Z0-9]/g, '')}`;
      if (type.name.endsWith('Response')) {
        tempContent += `export type ${type.name} = ExtractRouteHandlerTypes<typeof ${importAlias}>['response'];\n`;
      } else if (type.name.endsWith('Params')) {
        tempContent += `export type ${type.name} = ExtractRouteHandlerTypes<typeof ${importAlias}>['params'];\n`;
      } else if (type.name.endsWith('Query')) {
        tempContent += `export type ${type.name} = ExtractRouteHandlerTypes<typeof ${importAlias}>['query'];\n`;
      } else if (type.name.endsWith('Body')) {
        tempContent += `export type ${type.name} = ExtractRouteHandlerTypes<typeof ${importAlias}>['body'];\n`;
      }
    }
  }

  // Write temp file and add to project
  fs.writeFileSync(tempFilePath, tempContent, 'utf8');
  const tempSourceFile = project.addSourceFileAtPath(tempFilePath);

  try {
    // Get all exported types from the temp file
    const exports = tempSourceFile.getExportedDeclarations();

    for (const [exportName, declarations] of exports) {
      for (const declaration of declarations) {
        // Check for TypeAliasDeclaration using the enum value
        if (declaration.getKind() === SyntaxKind.TypeAliasDeclaration) {
          try {
            console.log(`🔍 Attempting to resolve type: ${exportName}`);

            // Get the resolved type
            const type = typeChecker.getTypeAtLocation(declaration);
            const typeText = type.getText(declaration);

            console.log(`📝 Raw type text for ${exportName}: ${typeText}`);

            // Skip unresolved types (omit them entirely)
            if (
              typeText === 'any' ||
              typeText === 'never' ||
              typeText === 'unknown'
            ) {
              console.log(
                `⚠️  Skipping type: ${exportName} (got: ${typeText}) - no parameters defined for this route`
              );
              continue;
            }

            // Clean up the type text for SDK consumption
            const cleanTypeText = cleanTypeForSDK(typeText);

            // Create clean type definition (always use export type)
            let cleanDefinition: string;
            if (cleanTypeText.startsWith('{') && cleanTypeText.endsWith('}')) {
              cleanDefinition = `export type ${exportName} = ${cleanTypeText};`;
            } else {
              cleanDefinition = `export type ${exportName} = ${cleanTypeText};`;
            }

            resolvedTypes.push(cleanDefinition);
            console.log(
              `✅ Resolved type: ${exportName} -> ${typeText.substring(0, 100)}...`
            );
          } catch (error) {
            console.warn(`⚠️  Error resolving ${exportName}:`, error);
            resolvedTypes.push(
              `export type ${exportName} = any; // Resolution failed: ${error}`
            );
          }
        } else {
          console.log(
            `⚠️  Declaration ${exportName} is not a type alias (kind: ${declaration.getKind()})`
          );
        }
      }
    }
  } finally {
    // Clean up temp file
    project.removeSourceFile(tempSourceFile);
    fs.unlinkSync(tempFilePath);
  }

  // Build the record type mapping routes to their types
  const routeTypeMap: string[] = [];

  // Group resolved types by route
  const routeTypesMapping: Record<
    string,
    { response?: string; params?: string; query?: string; body?: string }
  > = {};

  for (const typeDef of resolvedTypes) {
    // Extract type name from the resolved type definition
    const match = typeDef.match(/export (?:interface|type) (\w+)/);
    if (!match) continue;

    const typeName = match[1];

    // Find the corresponding generated type to get route info
    const generatedType = generatedTypes.find(gt => gt.name === typeName);
    if (!generatedType) continue;

    const routeKey = `${generatedType.method} ${generatedType.routePath || '/'}`;

    if (!routeTypesMapping[routeKey]) {
      routeTypesMapping[routeKey] = {};
    }

    if (typeName.endsWith('Response')) {
      routeTypesMapping[routeKey].response = typeName;
    } else if (typeName.endsWith('Params')) {
      routeTypesMapping[routeKey].params = typeName;
    } else if (typeName.endsWith('Query')) {
      routeTypesMapping[routeKey].query = typeName;
    } else if (typeName.endsWith('Body')) {
      routeTypesMapping[routeKey].body = typeName;
    }
  }

  // Generate the mapping with all available types
  for (const [routeKey, types] of Object.entries(routeTypesMapping)) {
    const typeProps: string[] = [];

    if (types.response) typeProps.push(`response: ${types.response}`);
    if (types.params) typeProps.push(`params: ${types.params}`);
    if (types.query) typeProps.push(`query: ${types.query}`);
    if (types.body) typeProps.push(`body: ${types.body}`);

    if (typeProps.length > 0) {
      routeTypeMap.push(`  '${routeKey}': { ${typeProps.join('; ')} };`);
    }
  }

  const recordType = `export type ApiRoutes = {
${routeTypeMap.join('\n')}
};`;

  // Generate the resolved types file
  const resolvedContent = `// Auto-generated resolved API response types
// This file is generated by running: npm run generate-api-types
// These types are resolved from the actual route handlers and can be safely copied to the SDK
// Do not edit this file manually - it will be overwritten

${resolvedTypes.join('\n\n')}

${recordType}
`;

  const resolvedTypesPath = path.join(outputDir, 'api-types-resolved.ts');
  fs.writeFileSync(resolvedTypesPath, resolvedContent, 'utf8');

  console.log(
    `📝 Generated resolved types: ${path.relative(process.cwd(), resolvedTypesPath)}`
  );
  console.log(`   ${resolvedTypes.length} types resolved`);
}

/**
 * Main function to generate API types
 */
async function main() {
  const v1ApiDir = path.join(__dirname, '../src/app/api/v1');
  const outputFile = path.join(__dirname, '../src/generated/api-types.ts');

  console.log('🔍 Scanning API routes...');

  // Create output directory if it doesn't exist
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create TypeScript project for analysis
  const project = new Project({
    tsConfigFilePath: path.join(__dirname, '../tsconfig.json'),
  });

  // Find all v1 route files
  const v1Routes = findRouteFiles(v1ApiDir);

  // Hardcode OAuth routes with their specific paths
  const oauthRoutes: RouteInfo[] = [
    {
      filePath: path.join(
        __dirname,
        '../src/app/(auth)/(oauth)/(authorize)/api/oauth/authorize/route.ts'
      ),
      routePath: '/oauth/authorize',
      methods: [],
      hasTypeExport: false,
    },
    {
      filePath: path.join(
        __dirname,
        '../src/app/(auth)/(oauth)/api/oauth/token/route.ts'
      ),
      routePath: '/oauth/token',
      methods: [],
      hasTypeExport: false,
    },
    {
      filePath: path.join(
        __dirname,
        '../src/app/(auth)/(oauth)/api/oauth/userinfo/route.ts'
      ),
      routePath: '/oauth/userinfo',
      methods: [],
      hasTypeExport: false,
    },
  ];

  const routes = [...v1Routes, ...oauthRoutes];

  console.log(`📁 Found ${v1Routes.length} v1 route files`);
  console.log(`📁 Found ${oauthRoutes.length} oauth route files`);
  console.log(`📁 Total: ${routes.length} route files`);

  // Analyze each route file
  const allGeneratedTypes: GeneratedType[] = [];

  for (const route of routes) {
    try {
      const types = analyzeRouteFile(project, route);
      allGeneratedTypes.push(...types);

      if (types.length > 0) {
        console.log(
          `✅ ${route.routePath || '/'}: Generated ${types.length} types`
        );
      } else if (route.hasTypeExport) {
        console.log(`⏭️  ${route.routePath || '/'}: Already has type exports`);
      } else {
        console.log(`⚠️  ${route.routePath || '/'}: No types generated`);
      }
    } catch (error) {
      console.error(`❌ Error analyzing ${route.filePath}:`, error);
    }
  }

  // Generate and write the types file
  if (allGeneratedTypes.length > 0) {
    const content = generateTypesFileContent(allGeneratedTypes);
    fs.writeFileSync(outputFile, content, 'utf8');

    // Also generate resolved types for SDK consumption
    generateResolvedTypesFile(allGeneratedTypes, project, outputDir);

    console.log(
      `\n🎉 Generated ${allGeneratedTypes.length} API response types`
    );
    console.log(
      `📝 Output written to: ${path.relative(process.cwd(), outputFile)}`
    );
  } else {
    console.log(
      '\n⚠️  No new types generated - all routes may already have type exports'
    );
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}
