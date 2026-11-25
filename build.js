// يولّد الموقع من team.json:  node build.js   ثم   python3 make_pdf.py
// الموقع: عربي في الجذر (/) وإنجليزي تحت /en/. السيرة PDF إنجليزي فقط.
const fs = require("fs");
const path = require("path");

const root = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(root, "team.json"), "utf8"));
const { site, team } = data;

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const phoneFmt = (p) => p.replace(/^\+(\d{3})(\d{2})(\d{3})(\d{4})$/, "+$1 $2 $3 $4");

const UI = {
  ar: { dir: "rtl", follow: "تابع", save: "احفظ جهة الاتصال", cv: "عرض السيرة الذاتية", dl: "تحميل PDF", back: "رجوع للفريق", cvnote: "السيرة بالإنجليزي", phone: "واتساب والجوال", email: "الإيميل", switchTo: "English", sep: " · " },
  en: { dir: "ltr", follow: "Follow", save: "Save contact", cv: "View CV", dl: "Download PDF", back: "Back to team", cvnote: "The CV is in English", phone: "WhatsApp / Phone", email: "Email", switchTo: "العربية", sep: " · " },
};

const ICONS = {
  whatsapp: '<path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.6A8 8 0 1 1 21 12z"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  linkedin: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M6 16c.5-1.5 1.7-2.5 3-2.5s2.5 1 3 2.5M14 9h4M14 13h4"/>',
  github: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
};
const svg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
const full = (m, l) => `${m.first[l]} ${m.last[l]}`;

// المسارات: عربي في الجذر، إنجليزي تحت en/
const rel = (l, depth) => (l === "en" ? "../" : "") + "../".repeat(depth); // الرجوع للجذر
const home = (l) => (l === "en" ? "en/index.html" : "index.html");

const head = (l, title, desc, up, altHref) => `<!doctype html><html lang="${l}" dir="${UI[l].dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta name="theme-color" content="#194D3C">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
${altHref ? `<link rel="alternate" hreflang="${l === "ar" ? "en" : "ar"}" href="${altHref}">` : ""}
<link rel="icon" type="image/png" href="${up}favicon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap"><link rel="stylesheet" href="${up}style.css"></head><body>`;

const topbar = (l, up, altHref) =>
  `<div class="topbar"><a class="brand" href="${up}${home(l)}"><img class="logo" src="${up}logo.png" alt="" width="40" height="40"><span>${esc(site.name[l])}</span></a><a class="lang" onclick="try{localStorage.setItem('lang','${l === "ar" ? "en" : "ar"}')}catch(e){}" href="${altHref}" hreflang="${l === "ar" ? "en" : "ar"}" lang="${l === "ar" ? "en" : "ar"}">${UI[l].switchTo}</a></div>`;

const socLinks = () =>
  [["LinkedIn", site.linkedin_page], ["X", site.x], ["TikTok", site.tiktok]].filter(([, u]) => u);

const avatar = (m, l, up) =>
  `<div class="av"><img src="${up}photos/${m.slug}.jpg" alt="" onerror="this.remove()" onload="this.nextElementSibling.remove()"><span>${esc(m.initial[l])}</span></div>`;

function contactRow(label, text, href, icon, external) {
  return `<li><a href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ""}><span class="ic">${svg(icon)}</span><div><small>${label}</small><span class="v ltr">${esc(text)}</span></div></a></li>`;
}

function personPage(m, l) {
  const t = UI[l];
  const up = l === "en" ? "../../" : "../";
  const alt = l === "en" ? "../../asim/index.html".replace("asim", m.slug) : `../en/${m.slug}/index.html`;
  const rows = [];
  if (m.phone) rows.push(contactRow(t.phone, phoneFmt(m.phone), `https://wa.me/${m.phone.replace(/\D/g, "")}`, "whatsapp", true));
  if (m.email) rows.push(contactRow(t.email, m.email, `mailto:${m.email}`, "email", false));
  if (m.linkedin) rows.push(contactRow("LinkedIn", m.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), m.linkedin, "linkedin", true));
  if (m.github) rows.push(contactRow("GitHub", `github.com/${m.github}`, `https://github.com/${m.github}`, "github", true));
  const soc = socLinks();
  const title = `${full(m, l)} · ${site.name[l]}`;
  const desc = l === "ar" ? `${m.role.ar} في فريق ${site.name.ar}` : `${m.role.en} on the ${site.name.en} team`;
  return `${head(l, title, desc, up, alt)}
<div class="page"><aside><div class="side">
${topbar(l, up, alt)}
<a class="back" href="${up}${home(l)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>${t.back}</a>
${avatar(m, l, up)}
<h1>${esc(full(m, l))}</h1>
<p class="role-line">${esc(m.role[l])}</p><p class="where">${esc(m.location[l])}</p>
${(m.cv || m.cv_pdf) ? `<a class="save" href="${up}cv/${m.slug}-cv.pdf" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/></svg>${t.cv}</a>` : ""}
<div class="btnrow">${(m.cv || m.cv_pdf) ? `<a class="ghost" href="${up}cv/${m.slug}-cv.pdf" download="${esc(m.first.en)}-${esc(m.last.en)}-CV.pdf"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 11l5 5 5-5M5 20h14"/></svg>${t.dl}</a>` : ""}<a class="ghost" href="${up}vcf/${m.slug}.vcf" download="${esc(m.first.en)}-${esc(m.last.en)}.vcf"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="8" r="4"/><path d="M3 20c0-4 3-6 7-6s7 2 7 6M19 8v6M16 11h6"/></svg>${t.save}</a></div>
<ul class="contacts">${rows.join("")}</ul>
${soc.length ? `<div class="aside-soc"><h2>${t.follow} ${esc(site.name[l])}</h2><div class="row">${soc.map(([n, u2]) => `<a href="${esc(u2)}" target="_blank" rel="noopener">${n}</a>`).join("")}</div></div>` : ""}
</div></aside></div></body></html>
`;
}

function indexPage(l) {
  const up = l === "en" ? "../" : "";
  const alt = l === "en" ? "../index.html" : "en/index.html";
  const cards = team
    .map((m) => `<a class="member" href="${m.slug}/index.html">${avatar(m, l, up)}<div><b>${esc(full(m, l))}</b><div class="role">${esc(m.role[l])}</div></div></a>`)
    .join("");
  const soc = socLinks();
  const first = l === "ar"
    ? `<script>try{if(!localStorage.getItem("lang")){localStorage.setItem("lang","en");location.replace("en/index.html")}}catch(e){}</script>`
    : "";
  return `${head(l, site.title[l], site.tagline[l], up, alt).replace('<meta charset="utf-8">', '<meta charset="utf-8">' + first)}
<div class="hero">${topbar(l, up, alt)}<div class="hero-text"><h1>${esc(site.title[l])}</h1><p>${esc(site.tagline[l])}</p></div></div>
<div class="members">${cards}</div>
${soc.length ? `<div class="soc">${soc.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${n}</a>`).join("")}</div>` : ""}
<footer class="site">${esc(site.title[l])}${UI[l].sep}${esc(site.tagline[l])}</footer>
</body></html>
`;
}

// ---- السيرة الذاتية: إنجليزي فقط، عمود واحد، نص عادي (ATS) ----
function cvDocPage(m) {
  const cv = m.cv;
  const sec = (h, body) => `<section><h2>${h}</h2>${body}</section>`;
  const contact = [
    m.location.en,
    m.phone ? phoneFmt(m.phone) : "",
    m.email,
    m.linkedin ? m.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : "",
  ].filter(Boolean).map(esc).join(" | ");
  const parts = [];
  parts.push(sec("Summary", `<p>${esc(cv.summary)}</p>`));
  parts.push(sec("Projects", cv.projects.map((p) => `<div class="item"><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><p class="tech">Technologies: ${esc(p.stack)}</p></div>`).join("")));
  parts.push(sec("Experience", cv.experience.map((e) => `<div class="item"><h3>${esc(e.title)}</h3><p class="meta">${esc(e.org)} | ${esc(e.period)}</p><ul>${e.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")));
  parts.push(sec("Education", cv.education.map((e) => `<div class="item"><h3>${esc(e.title)}</h3><p class="meta">${esc(e.org)}${e.period ? " | " + esc(e.period) : ""}${e.note ? " | " + esc(e.note) : ""}</p></div>`).join("")));
  parts.push(sec("Certifications", `<ul>${cv.certs.map((c) => `<li>${esc(c.name)} (${esc(c.date)})</li>`).join("")}</ul>`));
  parts.push(sec("Skills", `<p>${esc(cv.skills)}</p>`));
  return `<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><title>${esc(full(m, "en"))} - CV</title>
<link rel="stylesheet" href="../cv.css"></head><body>
<header><h1>${esc(full(m, "en"))}</h1><p class="title">${esc(cv.title)}</p><p class="contact">${contact}</p></header>
${parts.join("\n")}
</body></html>
`;
}

function vcard(m) {
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${m.last.en};${m.first.en};;;`, `FN:${full(m, "en")}`, `ORG:${site.name.en} (${site.name.ar})`, `TITLE:${m.role.en}`];
  if (m.phone) lines.push(`TEL;TYPE=CELL:${m.phone}`);
  if (m.email) lines.push(`EMAIL;TYPE=INTERNET:${m.email}`);
  if (m.github) lines.push(`URL:https://github.com/${m.github}`);
  if (m.linkedin) lines.push(`URL:${m.linkedin}`);
  lines.push("END:VCARD");
  return lines.join("\r\n") + "\r\n";
}

const write = (p, s) => {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), s);
};
write("index.html", indexPage("ar"));
write("en/index.html", indexPage("en"));
for (const m of team) {
  write(`${m.slug}/index.html`, personPage(m, "ar"));
  write(`en/${m.slug}/index.html`, personPage(m, "en"));
  write(`vcf/${m.slug}.vcf`, vcard(m));
  if (m.cv) write(`_cv/${m.slug}.html`, cvDocPage(m));
}
console.log(`built ${team.length} member(s) x 2 languages`);
