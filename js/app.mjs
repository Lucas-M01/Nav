import { isSlug, parseRules, parseSiteConfig } from "./config.mjs";
import { icons } from "./icons.mjs";

const base = new URL("../", import.meta.url);
const status = document.getElementById("status");
let configurationPromise;
let routeVersion = 0;
let timer;

async function readJson(path) {
  const response = await fetch(new URL(path, base), { cache: "no-cache" });
  if (!response.ok) throw new Error(`Não foi possível carregar ${path}.`);
  return response.json();
}

function loadConfiguration() {
  configurationPromise ??= Promise.all([readJson("site.json"), readJson("redirects.json")])
    .then(([identity, entries]) => {
      const site = parseSiteConfig(identity);
      if (!site) throw new Error("site.json inválido. Confira title, description, logo e favicon.");
      return { site, rules: parseRules(entries) };
    });
  return configurationPromise;
}

function applyIdentity(site) {
  const title = document.getElementById("home-title");
  if (title) {
    title.textContent = site.title;
    const description = document.getElementById("site-description");
    description.textContent = site.description;
    description.hidden = !site.description;
    applyLogo(document.getElementById("site-logo"), site.logo);
  }

  let favicon = document.querySelector('link[rel="icon"]');
  if (site.favicon) {
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.append(favicon);
    }
    favicon.href = new URL(site.favicon, base);
  } else {
    favicon?.remove();
  }
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = site.description;
  document.querySelector('meta[name="theme-color"]').content =
    getComputedStyle(document.documentElement).getPropertyValue("--background").trim();
}

function applyLogo(image, path) {
  image.hidden = !path;
  if (path) {
    image.src = new URL(path, base);
    image.onerror = () => { image.hidden = true; };
  }
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

function readRoute(current) {
  const path = current.pathname.slice(base.pathname.length).replace(/\/$/, "");
  if (path && path !== "index.html") return { slug: decode(path), fromQuery: false };

  if (current.searchParams.has("go")) {
    return { slug: current.searchParams.get("go"), fromQuery: true };
  }
  if (current.hash) return { slug: decode(current.hash.slice(1)), fromQuery: false };
  return null;
}

function destinationFor(rule, current, route) {
  const target = new URL(rule.target);
  // Anexar cada par preserva os valores repetidos e os parâmetros do destino.
  for (const [key, value] of current.searchParams) {
    if (route.fromQuery && key === "go") continue;
    target.searchParams.append(key, value);
  }
  return target.href;
}

function renderHome(rules, current) {
  const list = document.getElementById("links");
  list.setAttribute("aria-busy", "false");
  const items = [...rules.values()].map(({ slug, title, description, image, icon }) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <a class="link-card">
        <span class="link-thumbnail" aria-hidden="true"><span></span></span>
        <span class="link-label"><strong></strong><span></span></span>
      </a>`;

    const href = new URL(base);
    href.search = current.search;
    href.searchParams.set("go", slug);
    item.querySelector("a").href = href;
    item.querySelector(".link-thumbnail span").textContent = [...title][0];
    // A imagem personalizada aparece sobre o ícone, que também serve de fallback.
    if (icon) {
      const badge = item.querySelector(".link-thumbnail");
      badge.firstElementChild.hidden = true;
      const symbol = document.createElement("span");
      symbol.className = "link-icon";
      symbol.style.setProperty("--icon-image", `url("${new URL(icons[icon], base)}")`);
      badge.append(symbol);
    }
    item.querySelector("strong").textContent = title;
    const subtitle = item.querySelector(".link-label span");
    subtitle.textContent = description;
    subtitle.hidden = !description;
    if (image) {
      const thumbnail = document.createElement("img");
      thumbnail.src = new URL(image, base);
      thumbnail.alt = "";
      thumbnail.width = 44;
      thumbnail.height = 44;
      thumbnail.loading = "lazy";
      thumbnail.onerror = () => thumbnail.remove();
      item.querySelector(".link-thumbnail").append(thumbnail);
    }
    return item;
  });
  list.replaceChildren(...items);
  document.getElementById("home-notice").textContent = items.length ? "" : "Nenhum link disponível.";
}

function showMessage(label, title, description, siteTitle = "Meus links") {
  status.className = "status";
  status.setAttribute("aria-labelledby", "status-title");
  status.innerHTML = `
    <p class="eyebrow"></p>
    <h1 id="status-title"></h1>
    <p class="status-description"></p>
    <a class="primary-link">Voltar para a página inicial</a>`;
  status.querySelector(".eyebrow").textContent = label;
  status.querySelector("h1").textContent = title;
  status.querySelector(".status-description").textContent = description;
  status.querySelector("a").href = base;
  document.title = `${title} | ${siteTitle}`;
  status.hidden = false;
}

function showNotFound(site) {
  showMessage("Erro 404", "Link não encontrado", "Confira o endereço ou volte para a página inicial.", site.title);
}

function showRedirect(destination, delay, version, site) {
  status.className = "status";
  status.setAttribute("aria-labelledby", "status-title");
  status.innerHTML = `
    <img class="brand-mark" width="64" height="64" alt="">
    <h1 id="status-title"></h1>
    <p class="countdown" aria-hidden="true"></p>
    <p class="status-description" aria-live="polite" aria-atomic="true"></p>
    <a class="primary-link">Ir agora</a>
    <a class="text-link">Abrir o destino manualmente</a>`;
  status.querySelector("h1").textContent = site.title;
  applyLogo(status.querySelector("img"), site.logo);
  status.hidden = false;

  const countdown = status.querySelector(".countdown");
  const message = status.querySelector(".status-description");
  const end = performance.now() + delay * 1000;

  for (const link of status.querySelectorAll("a")) {
    link.href = destination;
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      clearTimeout(timer);
      message.textContent = "Abrindo o destino…";
    });
  }

  function tick() {
    if (version !== routeVersion) return;
    const remaining = end - performance.now();
    const seconds = Math.ceil(remaining / 1000);
    if (seconds <= 0) {
      countdown.textContent = "0";
      message.textContent = "Abrindo o destino…";
      try {
        window.location.replace(destination);
      } catch {
        message.textContent = "Use um dos links abaixo para continuar.";
      }
      return;
    }
    countdown.textContent = seconds;
    message.textContent = `Você será redirecionado em ${seconds} ${seconds === 1 ? "segundo" : "segundos"}…`;
    timer = setTimeout(tick, Math.max(16, remaining - (seconds - 1) * 1000));
  }

  if (delay === 0) {
    countdown.hidden = true;
    message.textContent = "Use um dos links abaixo para continuar.";
  } else {
    tick();
  }
}

async function render() {
  const version = ++routeVersion;
  clearTimeout(timer);
  const current = new URL(window.location.href);
  const route = readRoute(current);
  const fallback = document.documentElement.dataset.page === "404";
  const isHome = !route && !fallback;

  // Atualiza também quando alguém troca ou remove o fragmento na mesma aba.
  document.documentElement.dataset.route = isHome ? "home" : "redirect";
  let robots = document.querySelector('meta[name="robots"]');
  if (isHome) {
    robots?.remove();
    document.title = "Meus links";
  } else {
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      robots.content = "noindex";
      document.head.append(robots);
    }
    document.title = "Redirecionamento";
  }
  status.hidden = true;

  let configuration;
  try {
    configuration = await loadConfiguration();
  } catch (error) {
    if (version !== routeVersion) return;
    console.error(error);
    if (isHome) {
      document.getElementById("links").setAttribute("aria-busy", "false");
      document.getElementById("home-notice").textContent = "Não foi possível carregar a página. Tente novamente em alguns instantes.";
    } else {
      showMessage("Redirecionamento", "Links indisponíveis", "Tente abrir este link novamente em alguns instantes.");
    }
    return;
  }
  if (version !== routeVersion) return;
  const { site, rules } = configuration;
  applyIdentity(site);
  document.title = isHome ? site.title : `Redirecionamento | ${site.title}`;

  if (isHome) {
    renderHome(rules, current);
    return;
  }

  const rule = isSlug(route?.slug) && rules.get(route.slug);
  if (!rule) {
    showNotFound(site);
    return;
  }

  const destination = destinationFor(rule, current, route);
  if (rule.delay === 0) {
    try {
      window.location.replace(destination);
    } catch {
      showRedirect(destination, 0, version, site);
    }
    return;
  }
  showRedirect(destination, rule.delay, version, site);
}

window.addEventListener("hashchange", render);
render();
