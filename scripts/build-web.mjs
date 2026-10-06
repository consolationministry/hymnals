import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputDir = path.join(projectRoot, "dist");

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const entry of ["index.html", "assets", "css", "data", "js"]) {
  await cp(path.join(projectRoot, entry), path.join(outputDir, entry), {
    recursive: true,
  });
}

console.log(`Copied the static hymnal app to ${outputDir}`);
