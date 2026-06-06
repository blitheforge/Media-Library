import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import prefixwrap from "postcss-prefixwrap";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const tmpUtilities = path.join(distDir, ".utilities.tmp.css");
const tokensPath = path.join(rootDir, "src/styles.tokens.css");
const outputPath = path.join(distDir, "style.css");
const tailwindBin = path.join(rootDir, "node_modules", ".bin", "tailwindcss");

fs.mkdirSync(distDir, { recursive: true });

execSync(`"${tailwindBin}" -i ./src/styles.build.css -o ./dist/.utilities.tmp.css --minify`, {
  cwd: rootDir,
  stdio: "inherit"
});

const utilities = fs.readFileSync(tmpUtilities, "utf8");
const wrapped = await postcss([
  prefixwrap(".bfml-root", {
    ignoredSelectors: [":root", ":host", "@keyframes", "@property"]
  })
]).process(utilities, { from: tmpUtilities });

const tokens = fs.readFileSync(tokensPath, "utf8");
fs.writeFileSync(outputPath, `${tokens.trim()}\n${wrapped.css.trim()}\n`);
fs.unlinkSync(tmpUtilities);

console.log(`Built scoped CSS: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
