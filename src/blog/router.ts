import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import "../style.css";
import { toBinary32 } from "../core/binary.ts";
import type { BinaryOperation, UnaryOperation } from "../types/operation";
import {
  binaryOprations,
  unaryOperations,
  unaryOperationsList,
} from "../core/operations.ts";
import { createBitGrid } from "../ui/bit-grid.ts";

type BlogPost = {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: string;
  authorUrl: string;
  content: string;
  dateValue: number;
};

const blogFiles = import.meta.glob("../../blog/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
  if (!match) {
    return { meta: {} as Record<string, string>, content: raw };
  }

  const [, frontmatter, content] = match;
  const meta: Record<string, string> = {};

  frontmatter.split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (key.trim()) {
      const value = rest.join(":").trim();
      const normalized = value.replace(/^['"]|['"]$/g, "");
      meta[key.trim()] = normalized;
    }
  });

  return { meta, content };
}

const blogPosts: BlogPost[] = Object.entries(blogFiles)
  .map(([path, raw]) => {
    const fileName = path.split("/").pop()?.replace(/\.md$/, "") ?? "post";
    const { meta, content } = parseFrontmatter(raw as string);
    const dateValue = meta.date ? new Date(meta.date).getTime() : 0;

    return {
      slug: fileName,
      title: meta.title || fileName,
      date: meta.date || "",
      description: meta.description || "",
      author: meta.author || "Anonymous",
      authorUrl: meta.authorUrl || "https://sachintiwari.netlify.app/",
      content,
      dateValue,
    };
  })
  .sort((a, b) => b.dateValue - a.dateValue);

const app = document.querySelector<HTMLDivElement>("#app")!;
const postsPerPage = 5;

marked.use(
  markedKatex({
    nonStandard: true,
    throwOnError: false,
  }),
);

function getBasePath() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base || "";
}

function getRoutePath() {
  const basePath = getBasePath();
  const pathname = window.location.pathname;
  const search = window.location.search;
  let route = pathname;

  if (basePath && route.startsWith(basePath)) {
    route = route.slice(basePath.length) || "/";
  }

  return `${route}${search}`;
}

function navigate(path: string) {
  const basePath = getBasePath();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const nextPath = `${basePath}${normalizedPath}`;
  window.history.pushState({}, "", nextPath);
  render();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(dateValue: string) {
  if (!dateValue) return "";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;

  return parsed.toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderMarkdown(content: string) {
  const renderer = new marked.Renderer();

  renderer.code = ({ text, lang }) => {
    const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
    const highlighted = hljs.highlight(text, { language }).value;
    const encoded = encodeURIComponent(text);

    return `
      <div class="code-block">
        <div class="code-block__header">
          <span class="code-block__lang">${escapeHtml(language)}</span>
          <button class="code-block__copy" type="button" data-code="${encoded}">Copy</button>
        </div>
        <pre><code class="language-${escapeHtml(language)}">${highlighted}</code></pre>
      </div>
    `;
  };

  return marked.parse(content, {
    breaks: true,
    gfm: true,
    renderer,
  }) as string;
}

function renderShell(content: string) {
  app.innerHTML = `
    <header class="site-header">
      <div class="site-header__inner">
        <a href="${getBasePath()}/" data-route="home" class="site-title">Binary Bitwise Visualizer</a>
        <nav class="site-nav">
          <a href="${getBasePath()}/" data-route="home">Home</a>
          <a href="${getBasePath()}/blog" data-route="blog">Blog</a>
        </nav>
      </div>
    </header>
    ${content}
    <footer class="site-footer">
      <div class="site-footer__inner">
        <span>Built with curiosity by <a href="https://sachintiwari.netlify.app/" target="_blank" rel="noopener noreferrer"><strong>Sachin Tiwari</strong></a></span>
      </div>
    </footer>
  `;
}

function renderHomePage() {
  renderShell(`
    <main class="container">
      <section class="hero">
        <div class="hero-background">
          <span class="float-number">0</span>
          <span class="float-number">1</span>
          <span class="float-number">0</span>
          <span class="float-number">1</span>
          <span class="float-number">1</span>
          <span class="float-number">0</span>
          <span class="float-number">1</span>
          <span class="float-number">0</span>
        </div>
        <p class="subtitle">Visualize 32-bit binary numbers and bitwise operations in real time</p>
      </section>

      <section class="tool-placeholder">
        <h2>Interactive Visualizer</h2>
        <p>Enter a number and see its 32-bit binary representation in real time.</p>

        <form class="grid-container" id="bitwiseForm">
          <div class="input-group">
            <label for="numberInput">Enter a number</label>
            <input
              type="number"
              id="numberInput"
              placeholder="Enter a number"
              value="2"
            />
          </div>

          <div class="input-group" id="numberInput2Container">
            <label for="numberInput2" id="numberInput2Label">
              Enter number (for binary operations)
            </label>
            <input
              type="number"
              id="numberInput2"
              placeholder="Enter another number"
              value="2"
            />
          </div>

          <div class="input-group">
            <label for="operationSelect">Select operation</label>
            <select id="operationSelect">
              <option value="not">Bitwise NOT (~)</option>
              <option value="and">Bitwise AND (&)</option>
              <option value="or">Bitwise OR (|)</option>
              <option value="xor">Bitwise XOR (^)</option>
              <option value="leftShift">Left Shift (<<)</option>
              <option value="rightShift">Right Shift (>>)</option>
              <option value="unsignedRightShift">Unsigned Right Shift (>>>)</option>
            </select>
          </div>

          <div class="input-group button-group">
            <label class="sr-only" for="operationButton">Run operation</label>
            <button type="button" id="operationButton">Perform Operation</button>
          </div>
        </form>
      </section>

      <section class="results-section">
        <div class="card">
          <h3>Input Binary Representation</h3>
          <div id="inputGrid" class="bit-grid"></div>
        </div>

        <div class="card" id="resultCard" hidden>
          <h3>Result of <span id="operationName">Operation</span></h3>
          <div id="resultGrid" class="bit-grid"></div>
        </div>

        <div class="card" id="explanation"></div>
      </section>

      <section class="info-section">
        <div class="card">
          <h2>Why learn bitwise operations?</h2>
          <p>
            Bitwise operations are fundamental to low-level programming and optimizations. They're used in cryptography, graphics processing, networking, and embedded systems. Understanding how bits work helps you write more efficient code and prepares you for technical interviews.
          </p>
        </div>

        <div class="card">
          <h2>Get started now</h2>
          <p>
            Enter any number above and experiment with different bitwise operations. Watch the 32-bit binary representation change in real time. For deeper insights, check out our <a href="${getBasePath()}/blog" data-route="blog" style="color: #2563eb; text-decoration: none; font-weight: 600;">blog posts</a> on how JavaScript handles numbers internally.
          </p>
        </div>
      </section>
    </main>
  `);

  const operationName =
    document.querySelector<HTMLHeadingElement>("#resultCard h3")!;
  const numberInput = document.querySelector<HTMLInputElement>("#numberInput")!;
  const numberInput2 =
    document.querySelector<HTMLInputElement>("#numberInput2")!;
  const numberInput2Container = document.querySelector<HTMLDivElement>(
    "#numberInput2Container",
  )!;
  const numberInput2Label =
    document.querySelector<HTMLLabelElement>("#numberInput2Label")!;
  const performOperationButton =
    document.querySelector<HTMLButtonElement>("#operationButton")!;
  const inputGrid = document.querySelector<HTMLDivElement>("#inputGrid")!;
  const resultGrid = document.querySelector<HTMLDivElement>("#resultGrid")!;
  const explanation = document.querySelector<HTMLDivElement>("#explanation")!;
  const resultCard = document.querySelector<HTMLDivElement>("#resultCard")!;
  const operationSelect =
    document.querySelector<HTMLSelectElement>("#operationSelect")!;

  function renderInputBinary() {
    const value = Number(numberInput.value);
    inputGrid.innerHTML = createBitGrid(toBinary32(value));
  }

  function onOperationChange() {
    const operationToPerform = operationSelect.value;
    let operation;
    numberInput2Container.hidden = false;
    if (unaryOperationsList.includes(operationToPerform)) {
      operation = unaryOperations.find((op) => op.id === operationToPerform);
      numberInput2Container.classList.add("hidden");
    } else {
      operation = binaryOprations.find((op) => op.id === operationToPerform);
      numberInput2Container.classList.remove("hidden");
    }
    numberInput2Label.textContent = `Enter number (for ${operation?.label ?? ""} operation):`;
    performOperationButton.textContent = `Perform ${operation?.label ?? ""} operation`;
  }

  function applyOperation() {
    const value = Number(numberInput.value);
    const value2 = Number(numberInput2.value);
    const isBinaryOperation = !unaryOperationsList.includes(
      operationSelect.value,
    );

    resultCard.hidden = false;
    explanation.hidden = false;
    let selected: UnaryOperation | BinaryOperation | undefined;
    let result: number;

    if (!isBinaryOperation) {
      const unarySelected = unaryOperations.find(
        (op) => op.id === operationSelect.value,
      );
      selected = unarySelected;
      result = unarySelected ? unarySelected.execute(value) : value;
    } else {
      const binarySelected = binaryOprations.find(
        (op) => op.id === operationSelect.value,
      );
      selected = binarySelected;
      result = binarySelected ? binarySelected.execute(value, value2) : value;
    }

    operationName.textContent = selected?.label ?? "Operation";
    const beforeBinary = toBinary32(value);
    let beforeBinary2 = "";
    if (isBinaryOperation) {
      beforeBinary2 = toBinary32(Number(numberInput2.value));
    }
    const afterBinary = toBinary32(result);
    explanation.innerHTML = selected?.explanation ?? "";

    if (!isBinaryOperation) {
      resultGrid.innerHTML = `<div>
        <h3>Before</h3>
        <span>Value: ${value}</span>
        <div class="bit-grid">
          ${createBitGrid(beforeBinary)}
        </div>
        <h3>After ${selected?.label ?? "Operation"}</h3>
        <span>Result: ${result}</span>
        <div class="bit-grid">
          ${createBitGrid(afterBinary, beforeBinary)}
        </div>
      </div>`;
    } else {
      resultGrid.innerHTML = `<div>
        <h3>Before</h3>
        <span>First Value: ${value}</span>
        <div class="bit-grid">
          ${createBitGrid(beforeBinary)}
        </div>
        <span>Second Value: ${value2}</span>
        <div class="bit-grid">
          ${createBitGrid(beforeBinary2)}
        </div>
        <h3>After ${selected?.label ?? "Operation"}</h3>
        <span>Result: ${result}</span>
        <div class="bit-grid">
          ${createBitGrid(afterBinary, beforeBinary)}
        </div>
      </div>`;
    }
  }

  numberInput.addEventListener("input", renderInputBinary);
  numberInput2.addEventListener("input", applyOperation);
  operationSelect.addEventListener("change", onOperationChange);
  performOperationButton.addEventListener("click", applyOperation);

  renderInputBinary();
  onOperationChange();
}

function renderBlogListPage() {
  const pageParam = new URLSearchParams(window.location.search).get("page");
  const currentPage = Number(pageParam || 1);
  const totalPages = Math.max(1, Math.ceil(blogPosts.length / postsPerPage));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const start = (safePage - 1) * postsPerPage;
  const visiblePosts = blogPosts.slice(start, start + postsPerPage);

  renderShell(`
    <main class="container blog-page">
      <section class="card blog-page__card">
        <div class="blog-page__header">
          <div>
            <p class="blog-page__eyebrow">Knowledge Hub</p>
            <h1>Blog</h1>
            <p class="blog-page__intro">Browse all published posts and read the latest articles.</p>
          </div>
          <a href="${getBasePath()}/" data-route="home" class="blog-page__back">← Back to home</a>
        </div>

        ${visiblePosts.length ? "" : "<p>No posts yet.</p>"}

        <div class="blog-list">
          ${visiblePosts
            .map(
              (post) => `
                <article class="blog-card">
                  <p class="blog-card__meta">${escapeHtml(formatDate(post.date))}</p>
                  <h2 class="blog-card__title">
                    <a href="${getBasePath()}/blog/${post.slug}" data-route="blog-post" data-slug="${post.slug}">${escapeHtml(post.title)}</a>
                  </h2>
                  <p class="blog-card__description">${escapeHtml(post.description || "Read the full article.")}</p>
                  <p class="blog-card__author">
                    By <a href="${escapeHtml(post.authorUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.author)}</a>
                  </p>
                </article>
              `,
            )
            .join("")}
        </div>

        <div class="pagination">
          <a href="${getBasePath()}/blog?page=${Math.max(1, safePage - 1)}" data-route="blog-page" data-page="${Math.max(1, safePage - 1)}" ${safePage <= 1 ? "aria-disabled='true' class='is-disabled'" : ""}>← Previous</a>
          <span>Page ${safePage} of ${totalPages}</span>
          <a href="${getBasePath()}/blog?page=${Math.min(totalPages, safePage + 1)}" data-route="blog-page" data-page="${Math.min(totalPages, safePage + 1)}" ${safePage >= totalPages ? "aria-disabled='true' class='is-disabled'" : ""}>Next →</a>
        </div>
      </section>
    </main>
  `);
}

function renderBlogPostPage(slug: string) {
  const post = blogPosts.find((entry) => entry.slug === slug);

  if (!post) {
    renderShell(`
      <main class="container">
        <section class="card">
          <p><a href="${getBasePath()}/blog" data-route="blog">← Back to blog</a></p>
          <h1>Post not found</h1>
          <p>The requested blog post could not be found.</p>
        </section>
      </main>
    `);
    return;
  }

  const contentHtml = renderMarkdown(post.content);

  renderShell(`
    <main class="container blog-post-page">
      <section class="card blog-post-card">
        <div class="blog-post-card__header">
          <a href="${getBasePath()}/blog" data-route="blog" class="blog-page__back">← Back to blog</a>
          <p class="blog-card__meta">${escapeHtml(formatDate(post.date))}</p>
        </div>
        <h1>${escapeHtml(post.title)}</h1>
        <p class="blog-post__meta">
          By <a href="${escapeHtml(post.authorUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.author)}</a>
        </p>
        <div class="markdown-body">${contentHtml}</div>
      </section>
    </main>
  `);

  document
    .querySelectorAll<HTMLButtonElement>(".code-block__copy")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const code = decodeURIComponent(button.getAttribute("data-code") ?? "");
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = "Copied";
          window.setTimeout(() => {
            button.textContent = "Copy";
          }, 1500);
        } catch {
          button.textContent = "Copy failed";
        }
      });
    });
}

function render() {
  const route = getRoutePath();
  const pathname = route.split("?")[0];
  const blogPostMatch = pathname.match(/^\/blog\/([^/]+)$/);

  if (pathname === "/blog" || pathname.startsWith("/blog")) {
    if (pathname === "/blog") {
      renderBlogListPage();
    } else if (blogPostMatch) {
      renderBlogPostPage(blogPostMatch[1]);
    }
  } else {
    renderHomePage();
  }

  bindRouteLinks();
}

function bindRouteLinks() {
  document
    .querySelectorAll<HTMLAnchorElement>("a[data-route]")
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        const route = link.getAttribute("data-route");
        const page = link.getAttribute("data-page");
        const slug = link.getAttribute("data-slug");

        if (!route) {
          return;
        }

        event.preventDefault();

        if (route === "home") {
          navigate("/");
        } else if (route === "blog") {
          navigate("/blog");
        } else if (route === "blog-page") {
          navigate(`/blog?page=${page ?? 1}`);
        } else if (route === "blog-post" && slug) {
          navigate(`/blog/${slug}`);
        }
      });
    });
}

window.addEventListener("popstate", render);

// Handle 404.html redirect for GitHub Pages SPA routing
if (sessionStorage.redirect) {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  window.history.replaceState(null, "", redirect);
}

render();
