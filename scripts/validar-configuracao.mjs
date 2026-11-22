import { readFile, access } from "node:fs/promises";
import { parseRules, parseSiteConfig } from "../js/config.mjs";
import { icons } from "../js/icons.mjs";

const root = new URL("../", import.meta.url);

try {
  const site = parseSiteConfig(JSON.parse(await readFile(new URL("site.json", root), "utf8")));
  if (!site) throw new Error("site.json inválido. Confira title, description, logo e favicon.");

  const rules = parseRules(JSON.parse(await readFile(new URL("redirects.json", root), "utf8")));
  const assets = new Set([
    site.logo, site.favicon,
    ...[...rules.values()].flatMap((rule) => [rule.image, icons[rule.icon]]),
  ]);
  for (const path of assets) {
    if (!path) continue;
    try {
      await access(new URL(path, root));
    } catch {
      throw new Error(`Imagem não encontrada: ${path}.`);
    }
  }
  console.log(`Configuração válida. ${rules.size} link(s) e imagens conferidos.`);
} catch (error) {
  console.error(`Não foi possível validar a configuração. ${error.message}`);
  process.exitCode = 1;
}
