import { readFile, writeFile } from "node:fs/promises";
import { parseRules } from "../js/config.mjs";

const root = new URL("../", import.meta.url);
const entries = JSON.parse(await readFile(new URL("redirects.json", root), "utf8"));
const rules = parseRules(entries);

const netlify = ["# Gerado por scripts/gerar-redirecionamentos.mjs. Edite redirects.json."];
const vercel = {
  $schema: "https://openapi.vercel.sh/vercel.json",
  framework: null,
  outputDirectory: ".",
  redirects: [],
  rewrites: [],
};

for (const { slug, target, delay } of rules.values()) {
  const source = `/${slug}`;
  // Habilita 302 para URLs simples. O navegador combina queries e fragmentos
  // e aceita caminhos que podem ser interpretados como padrões pelos hosts.
  const redirectLine = `${source} ${target.href} 302`;
  const native = delay === 0 && !/[?#]/.test(target.href)
    && /^[-\w./%~]*$/.test(target.pathname) && redirectLine.length <= 1000;
  if (native) {
    netlify.push(redirectLine);
    vercel.redirects.push({ source, destination: target.href, statusCode: 302 });
  } else {
    netlify.push(`${source} /404.html 200`);
    vercel.rewrites.push({ source, destination: "/404.html" });
  }
}

await Promise.all([
  writeFile(new URL("_redirects", root), `${netlify.join("\n")}\n`),
  writeFile(new URL("vercel.json", root), `${JSON.stringify(vercel, null, 2)}\n`),
]);

console.log(`Regras de ${rules.size} link(s) atualizadas em _redirects e vercel.json.`);
