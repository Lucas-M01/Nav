import { icons } from "./icons.mjs";

const reserved = new Set(["index", "404", "assets", "css", "js", "scripts"]);

// As imagens ficam dentro do projeto para funcionarem em /repositorio/ também.
export function isAssetPath(value) {
  return typeof value === "string" && value === value.trim()
    && !/^[\/]|[\\:?#\u0000-\u001f]/.test(value)
    && !value.split("/").includes("..") && !/%(?:2e|2f|5c)/i.test(value);
}

export function parseSiteConfig(entry) {
  if (!entry || typeof entry.title !== "string" || !entry.title.trim()) return null;
  if (entry.description !== undefined && typeof entry.description !== "string") return null;
  if (entry.logo !== undefined && !isAssetPath(entry.logo)) return null;
  if (entry.favicon !== undefined && !isAssetPath(entry.favicon)) return null;

  return {
    title: entry.title.trim(),
    description: entry.description?.trim() ?? "",
    logo: entry.logo ?? "",
    favicon: entry.favicon ?? "",
  };
}

export function isSlug(value) {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && !reserved.has(value);
}

// A validação é compartilhada pelo navegador e pelo gerador de regras HTTP.
export function parseRule(entry) {
  if (!isSlug(entry?.slug) || !Number.isSafeInteger(entry.delay) || entry.delay < 0) {
    return null;
  }

  if (typeof entry.url !== "string" || !/^https?:\/\/[^/?#\\\s]+/i.test(entry.url)) return null;

  try {
    const target = new URL(entry.url);
    if (target.username || target.password) return null;
    if (entry.title !== undefined && typeof entry.title !== "string") return null;
    if (entry.description !== undefined && typeof entry.description !== "string") return null;
    if (entry.image !== undefined && !isAssetPath(entry.image)) return null;
    if (entry.icon !== undefined && (typeof entry.icon !== "string"
      || (entry.icon !== "" && !Object.hasOwn(icons, entry.icon)))) return null;

    return {
      slug: entry.slug,
      target,
      delay: entry.delay,
      title: entry.title?.trim()
        || entry.slug.replaceAll("-", " ").replace(/^./, (initial) => initial.toUpperCase()),
      description: entry.description?.trim() ?? target.host,
      image: entry.image ?? "",
      icon: entry.icon ?? "",
    };
  } catch {
    return null;
  }
}

export function parseRules(entries) {
  if (!Array.isArray(entries)) throw new Error("redirects.json precisa conter uma lista.");
  const rules = new Map();

  for (const [index, entry] of entries.entries()) {
    const rule = parseRule(entry);
    if (!rule) {
      throw new Error(`Link ${index + 1} inválido em redirects.json. Confira slug, url, delay, title, description, image e icon. Ícones disponíveis: ${Object.keys(icons).join(", ")}.`);
    }
    if (rules.has(rule.slug)) throw new Error(`Slug duplicado em redirects.json: ${rule.slug}.`);
    rules.set(rule.slug, rule);
  }

  return rules;
}
