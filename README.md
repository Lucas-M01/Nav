# Link redirector

Uma página de links em HTML, CSS e JavaScript para clonar, personalizar e publicar no GitHub Pages. Identidade, aparência e links ficam em arquivos próprios. A mesma configuração é usada na home, na contagem regressiva e no 404.

## Começar com sua própria cópia

1. Faça um **Fork** deste repositório para sua conta no GitHub e abra a sua cópia.
2. Copie a URL em **Code** e clone. Substitua os nomes no exemplo.

   ```sh
   git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   cd SEU-REPOSITORIO
   ```

3. Personalize os arquivos desta tabela.

   | O que mudar | Arquivo |
   | --- | --- |
   | Nome, descrição, logo e favicon | [site.json](site.json) |
   | Adicionar, editar ou reordenar links | [redirects.json](redirects.json) |
   | Cores, fonte e cantos dos cartões | [css/tema.css](css/tema.css) |
   | Imagens da sua página e dos links | [assets/](assets/) |

4. Envie suas alterações para a sua cópia no GitHub.

   ```sh
   git add site.json redirects.json css/tema.css assets/
   git commit -m "Personaliza a página de links"
   git push
   ```

5. Em **Settings → Pages → Build and deployment**, escolha **Deploy from a branch**, selecione sua branch, a pasta **/(root)** e clique em **Save**. O GitHub mostrará o endereço da página depois da publicação. Mantenha o arquivo `.nojekyll` na raiz. [Guia do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

O GitHub Pages publica os arquivos estáticos diretamente. Nas próximas alterações, edite os arquivos e faça commit/push para atualizar o site. Também é possível editar os JSONs pelo próprio GitHub.

## Personalizar a identidade

Edite [site.json](site.json) para definir os textos e as imagens.

```json
{
  "title": "Minha marca",
  "description": "Encontre meus produtos e redes sociais.",
  "logo": "assets/minha-logo.png",
  "favicon": "assets/minha-logo.png"
}
```

O campo `title` é obrigatório e também aparece no título da aba e na página intermediária. Para ocultar a descrição ou a logo, use `""` no campo correspondente. O favicon pode ser uma imagem diferente.

Coloque as imagens em `assets/` e use caminhos relativos, como `assets/minha-logo.png`, sem a barra inicial. Assim, a mesma cópia funciona em um domínio próprio e em `usuario.github.io/nome-do-repositorio/`. Os nomes dos arquivos diferenciam maiúsculas e minúsculas.

## Adicionar e organizar links

Cada objeto em [redirects.json](redirects.json) cria um cartão e um redirecionamento. Duplique um objeto, troque os campos e separe os objetos por vírgulas.

```json
[
  {
    "slug": "cardapio",
    "title": "Meu cardápio",
    "description": "Veja os produtos disponíveis",
    "image": "assets/marca.png",
    "url": "https://example.com/cardapio",
    "delay": 0
  },
  {
    "slug": "novidades",
    "title": "Novidades",
    "url": "https://example.org/",
    "delay": 3
  }
]
```

| Campo | Uso |
| --- | --- |
| `slug` | Obrigatório. Identificador único em letras minúsculas sem acento, números e hífens entre palavras. Exemplo `meu-cardapio`. |
| `url` | Obrigatório. Destino completo, começando com `https://` ou `http://`. |
| `delay` | Obrigatório. Espera em segundos como inteiro a partir de zero. Com `0`, o visitante segue imediatamente. |
| `title` | Opcional. Nome exibido no cartão. Se omitido ou vazio, o nome vem do slug. |
| `description` | Opcional. Texto abaixo do título. Se omitido, aparece o domínio do destino. Use `""` para ocultar. |
| `image` | Opcional. Caminho de uma imagem em `assets/`. Tem prioridade sobre o ícone. |
| `icon` | Opcional. Ícone do cartão. Use `linkedin`, `instagram` ou `tiktok`. |

A ordem dos objetos define a ordem dos cartões. Para remover um link, remova o objeto inteiro. Os links que usam apenas `slug`, `url` e `delay` continuam funcionando.

Os slugs `index`, `404`, `assets`, `css`, `js` e `scripts` são reservados. JSON usa aspas duplas e exige vírgulas entre os itens, exceto depois do último. O verificador abaixo aponta configurações inválidas, slugs repetidos e imagens ausentes.

### Usar ícones das redes sociais

Adicione `"icon": "linkedin"`, `"icon": "instagram"` ou `"icon": "tiktok"` ao objeto do link. O título e o endereço de destino são definidos pelos seus campos habituais. Exemplo de um link para TikTok.

```json
{
  "slug": "tiktok",
  "title": "TikTok",
  "icon": "tiktok",
  "url": "https://www.tiktok.com/@seuusuario",
  "delay": 0
}
```

Os ícones são arquivos locais e acompanham a cor de texto dos cartões definida no tema. Quando `image` e `icon` são usados juntos, a imagem aparece primeiro. Se ela não carregar, o ícone aparece. Sem imagem ou ícone, o cartão mostra a inicial do título.

Para incluir outro ícone, salve um SVG em `assets/icons/` e adicione seu nome e caminho ao catálogo em [js/icons.mjs](js/icons.mjs). Esse nome passa a ser aceito no campo `icon`. Os três ícones incluídos vêm do Bootstrap Icons e a licença está em [assets/icons/LICENSE.txt](assets/icons/LICENSE.txt). [Fonte dos ícones](https://github.com/twbs/icons).

## Personalizar o visual

O arquivo [css/tema.css](css/tema.css) contém as variáveis do tema com comentários em português. Por exemplo, para usar uma paleta azul, ajuste estas cores dentro de `:root`.

```css
--background: #17364a;
--on-background: #ffffff;
--muted-on-background: #dae5ec;
--surface: #ffffff;
--on-surface: #152d3e;
--muted-on-surface: #4a6070;
--accent: #205578;
--on-accent: #ffffff;
--focus: #ffce73;
--card-radius: 16px;
```

As outras cores são calculadas a partir dessas variáveis. A fonte fica em `--font-family`. Escolha cores com contraste suficiente para leitura e navegação pelo teclado.

## Testar e conferir

Na pasta do projeto, inicie um servidor local.

```sh
npx serve . --listen 4173
```

Se já tiver Python, você também pode usar `python3 -m http.server 4173`. Abra `http://localhost:4173/`. As configurações são carregadas por HTTP.

Com Node.js instalado, valide os arquivos antes de enviar.

```sh
node scripts/validar-configuracao.mjs
```

Confira a home, a leitura no celular, o botão **Ir agora** de um link com espera, um link imediato e `/?go=nao-existe` para ver o 404.

## Compartilhar os links

O formato padrão dos cartões é `?go=slug`, que funciona no GitHub Pages sem configuração adicional. Preserve o nome do repositório na URL.

| Formato | Exemplo |
| --- | --- |
| GitHub Pages de projeto | `https://usuario.github.io/repositorio/?go=cardapio` |
| Alternativa com fragmento | `https://usuario.github.io/repositorio/#cardapio` |
| Domínio próprio | `https://meusite.com/?go=cardapio` |
| Rota por caminho em hosts com suporte | `https://meusite.com/cardapio` |

No GitHub Pages, compartilhe as formas com `?go=` ou `#`. Os caminhos por slug podem responder HTTP 404 nesse provedor. O documento `404.html` mantém uma tela de erro amigável e um retorno para a raiz correta do projeto.

Os parâmetros de campanha acompanham o visitante. Por exemplo, `?go=cardapio&utm_source=instagram` acrescenta `utm_source=instagram` ao destino. No formato de fragmento, coloque os parâmetros antes de `#cardapio`. Os valores repetidos e os parâmetros já presentes no destino são preservados. Os cartões também carregam os parâmetros que chegaram à home.

Quando houver um slug no caminho, ele tem prioridade. Na home, `?go=` tem prioridade sobre o fragmento. O seletor `go` é consumido apenas quando usado para selecionar o link. As páginas de redirecionamento recebem `noindex`. Na forma com query ou fragmento, um slug desconhecido mostra o erro no navegador após a resposta HTTP da home.

## Publicar em outros provedores

Se for usar rotas por caminho na Netlify, Vercel ou Cloudflare Pages, atualize as regras depois de editar os links.

```sh
node scripts/gerar-redirecionamentos.mjs
```

O comando gera `_redirects` e `vercel.json` a partir do mesmo `redirects.json`. Inclua esses arquivos atualizados na publicação. Para destinos imediatos com URLs simples, o host usa HTTP 302. Links com espera e destinos com query ou fragmento carregam a página intermediária por rewrite HTTP 200. As formas `?go=` e `#slug` consultam diretamente o JSON.

| Provedor | Configuração |
| --- | --- |
| Netlify | Importe o repositório, deixe o build em branco e use `.` como diretório de publicação. Também é possível enviar a pasta pelo Netlify Drop. |
| Vercel | Importe o repositório, selecione **Other** e deixe o build em branco. O `vercel.json` define o diretório de saída. |
| Cloudflare Pages | Crie um projeto Pages conectado ao repositório, selecione **None**, deixe o build em branco e use `.` como diretório de saída. |

Um servidor estático local genérico não interpreta as regras desses provedores. Confira os status HTTP e o cabeçalho `Location` depois de publicar. [Netlify](https://docs.netlify.com/deploy/create-deploys/), [Vercel](https://vercel.com/docs/project-configuration/vercel-json), [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/).

## Conectar um domínio próprio

Adicione o domínio ao projeto na hospedagem e crie, no seu provedor de DNS, os registros indicados pelo painel. Aguarde a validação e confirme o acesso por HTTPS.

- No **GitHub Pages**, abra **Settings → Pages → Custom domain**, salve o domínio e habilite **Enforce HTTPS** depois da validação. [Guia de domínio](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
- Na **Netlify**, abra **Domain management → Production domains** e consulte os registros em **Pending DNS verification**. [Guia de DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/).
- Na **Vercel**, abra **Settings → Domains** e siga os registros apresentados. [Guia de domínio](https://vercel.com/docs/domains/set-up-custom-domain).
- No **Cloudflare Pages**, abra **Custom domains** no projeto. [Guia de domínio](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Estrutura para manutenção

```text
index.html                       Página inicial e entrada por ?go= e #
404.html                         Erro e descoberta da subpasta do projeto
site.json                        Identidade da página
redirects.json                   Links e destinos
assets/                          Logos, favicon e imagens dos cartões
assets/icons/                    Ícones locais das redes sociais e licença
css/tema.css                     Aparência personalizável
css/site.css                     Estrutura e responsividade
js/config.mjs                    Validação compartilhada
js/icons.mjs                     Catálogo de ícones disponíveis
js/app.mjs                       Renderização e redirecionamento
scripts/validar-configuracao.mjs  Verificação opcional com Node.js
scripts/gerar-redirecionamentos.mjs
_redirects                       Regras geradas para Netlify e Cloudflare Pages
vercel.json                      Regras geradas para Vercel
.nojekyll                        Publicação estática no GitHub Pages
```
