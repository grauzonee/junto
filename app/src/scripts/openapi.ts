import "./registerTsPaths";
import fs from "fs";
import path from "path";
import { generateOpenApiSpec } from "../openapi/generate";

const outputPath = path.resolve(__dirname, "..", "..", "docs", "openapi.json");
const spec = generateOpenApiSpec();

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(spec, null, 2)}\n`);

console.log(`OpenAPI spec written to ${outputPath}`);
