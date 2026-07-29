const data = window.loadSiteData();
const contentArea = document.getElementById("contentArea");
const nav = document.querySelector(".main-nav");

document.getElementById("siteTitle").innerHTML = formatTitle(data.title);
document.getElementById("siteTagline").textContent = data.tagline;

function formatTitle(title) {
  const words = title.split(" ");
  const pivot = Math.max(1, words.findIndex(word => word.toLowerCase() === "para"));
  if (pivot > 0) return `${words.slice(0, pivot).join(" ")}<br><span>${words.slice(pivot).join(" ")}</span>`;
  return title;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
}

function textToParagraphs(text = "") {
  return text.split(/\n+/).filter(Boolean).map(line => `<p>${escapeHtml(line)}</p>`).join("");
}

function pageVisual(pageKey) {
  if (pageKey === "contacts") {
    return `<div class="content-visual image-visual venue-visual"><img src="assets/images/sportoase1.jpeg" alt="Sportoase Groot Schijn and its parking area"><div class="visual-caption"><strong>Training Location</strong><span>Sportoase Groot Schijn</span></div></div>`;
  }
  return `<div class="content-visual image-visual player-visual"><img src="assets/images/player-pihts13.jpeg" alt="Para ice hockey player wearing number 13"><div class="visual-caption"><strong>Para Ice Hockey</strong><span>Speed • Skill • Teamwork</span></div></div>`;
}

function renderDocuments(documents = []) {
  if (!documents.length) return "";
  const cards = documents.map((document, index) => `
    <a class="document-card" href="${document.data}" download="${escapeHtml(document.name)}" aria-label="Download ${escapeHtml(document.title || document.name)}">
      <span class="document-icon">PDF</span>
      <span class="document-details"><strong>${escapeHtml(document.title || document.name)}</strong><small>${escapeHtml(document.name)}${document.size ? ` • ${escapeHtml(document.size)}` : ""}</small></span>
      <span class="document-download">Download</span>
    </a>`).join("");
  return `<section class="information-documents" aria-labelledby="documentsHeading"><div class="documents-heading"><p class="eyebrow">Downloads</p><h3 id="documentsHeading">Team Documents</h3></div><div class="document-grid">${cards}</div></section>`;
}

function renderPage(pageKey) {
  document.querySelectorAll(".nav-button[data-page]").forEach(button => button.classList.toggle("active", button.dataset.page === pageKey));
  if (pageKey === "sponsors") {
    contentArea.innerHTML = `<div class="content-copy"><p class="eyebrow">Partners</p><h2>Our Sponsors</h2><p>Our partners help us develop para ice hockey, provide opportunities for athletes and strengthen our team.</p><a class="primary-button inline-button" href="#sponsorZoneTitle">View sponsor logos</a></div>${pageVisual("sponsors")}`;
  } else if (pageKey === "gallery") {
    renderGallery();
  } else if (pageKey === "nepihl27") {
    renderNepihl27();
  } else {
    const page = data.pages[pageKey] || data.pages.home;
    const documents = pageKey === "information" ? renderDocuments(page.documents || []) : "";
    contentArea.innerHTML = `<div class="content-copy"><p class="eyebrow">Antwerp Phantoms Para Ice Hockey</p><h2>${escapeHtml(page.title)}</h2>${textToParagraphs(page.text)}${documents}</div>${pageVisual(pageKey)}`;
  }
  contentArea.focus({preventScroll:true});
}

function renderNepihl27() {
  const page = data.pages.nepihl27 || window.DEFAULT_SITE_DATA.pages.nepihl27;
  const boxes = (page.boxes || []).map((box, index) => {
    const hasTarget = Boolean(box.fileData || box.url || box.image);
    const interactiveClass = hasTarget ? " is-clickable" : "";
    const action = hasTarget ? `<span class="nepihl-box-action">${escapeHtml(box.actionLabel || "Open bekijken")} <span aria-hidden="true">→</span></span>` : "";
    const inner = `
      ${box.image ? `<div class="nepihl-box-image"><img src="${box.image}" alt="${escapeHtml(box.title || `Vak ${index + 1}`)}"></div>` : `<div class="nepihl-box-placeholder">${index + 1}</div>`}
      <div class="nepihl-box-copy"><h3>${escapeHtml(box.title || `Vak ${index + 1}`)}</h3>${textToParagraphs(box.text || "")}${action}</div>`;
    if (!hasTarget) return `<article class="nepihl-box">${inner}</article>`;
    return `<button type="button" class="nepihl-box${interactiveClass}" data-nepihl-open="${index}" aria-label="${escapeHtml(box.actionLabel || "Open bekijken")}: ${escapeHtml(box.title || `Vak ${index + 1}`)}">${inner}</button>`;
  }).join("");
  contentArea.innerHTML = `<section class="nepihl-content"><p class="eyebrow">20–21 March 2027</p><h2>${escapeHtml(page.title)}</h2>${textToParagraphs(page.text)}<div class="nepihl-box-grid">${boxes}</div></section>`;
}

function dataUrlToBlob(dataUrl) {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) throw new Error("Invalid stored file data");
  const comma = dataUrl.indexOf(",");
  if (comma < 0) throw new Error("Incomplete stored file data");
  const meta = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  const mimeMatch = meta.match(/^data:([^;]+)/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const binary = meta.includes(";base64") ? atob(payload) : decodeURIComponent(payload);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mime });
}

function ensureContentViewer() {
  let viewer = document.getElementById("contentViewer");
  if (viewer) return viewer;
  viewer = document.createElement("div");
  viewer.id = "contentViewer";
  viewer.className = "content-viewer";
  viewer.hidden = true;
  viewer.innerHTML = `<div class="content-viewer-backdrop" data-close-viewer></div><section class="content-viewer-panel" role="dialog" aria-modal="true" aria-labelledby="contentViewerTitle"><header><h2 id="contentViewerTitle">NEPIHL27</h2><button type="button" class="content-viewer-close" data-close-viewer aria-label="Sluiten">×</button></header><div class="content-viewer-body" id="contentViewerBody"></div><footer><button type="button" class="secondary-button" data-close-viewer>Sluiten</button></footer></section>`;
  document.body.appendChild(viewer);
  viewer.addEventListener("click", event => {
    if (event.target.closest("[data-close-viewer]")) closeContentViewer();
    const download = event.target.closest("[data-download-nepihl]");
    if (download) downloadNepihlFile(Number(download.dataset.downloadNepihl));
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !viewer.hidden) closeContentViewer();
  });
  return viewer;
}

function closeContentViewer() {
  const viewer = document.getElementById("contentViewer");
  if (!viewer) return;
  viewer.hidden = true;
  document.body.classList.remove("viewer-open");
  document.getElementById("contentViewerBody").innerHTML = "";
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "NEPIHL27-bestand";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

function downloadNepihlFile(index) {
  const box = (data.pages.nepihl27?.boxes || [])[index];
  if (!box?.fileData) return;
  try {
    downloadBlob(dataUrlToBlob(box.fileData), box.fileName);
  } catch (error) {
    console.error("Could not download the linked NEPIHL27 file", error);
    alert("Dit bestand is beschadigd of onvolledig opgeslagen. Upload het opnieuw via Settings.");
  }
}

function safeExternalUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const parsed = new URL(candidate);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch (_) {
    return "";
  }
}

function filePreviewMarkup(box) {
  if (!box.fileData) return "";
  const type = String(box.fileType || "").toLowerCase();
  const fileName = escapeHtml(box.fileName || "Gekoppeld bestand");
  if (type.startsWith("image/") && box.fileData.startsWith("data:image/")) {
    return `<section class="viewer-section"><h3>Gekoppelde afbeelding</h3><img class="content-viewer-image" src="${box.fileData}" alt="${fileName}"></section>`;
  }
  if (type.startsWith("text/") && box.fileData.startsWith("data:")) {
    try {
      const blobText = atob(box.fileData.split(",")[1] || "");
      const decoded = new TextDecoder("utf-8").decode(Uint8Array.from(blobText, char => char.charCodeAt(0)));
      return `<section class="viewer-section"><h3>${fileName}</h3><pre class="viewer-text-file">${escapeHtml(decoded)}</pre></section>`;
    } catch (_) {}
  }
  const label = type === "application/pdf" ? "PDF-document" : "Document";
  return `<section class="viewer-file-card"><div class="viewer-file-icon">${type === "application/pdf" ? "PDF" : "FILE"}</div><div><h3>${fileName}</h3><p>${label} is gekoppeld aan dit vak. Gebruik de downloadknop om het betrouwbaar te openen in de standaardapp van je toestel.</p></div></section>`;
}

function openNepihlBox(index) {
  const box = (data.pages.nepihl27?.boxes || [])[index];
  if (!box) return;
  const viewer = ensureContentViewer();
  const title = box.title || `Vak ${index + 1}`;
  const url = safeExternalUrl(box.url);
  document.getElementById("contentViewerTitle").textContent = title;
  document.getElementById("contentViewerBody").innerHTML = `<div class="viewer-detail">
    ${box.image ? `<section class="viewer-section"><img class="content-viewer-image viewer-main-image" src="${box.image}" alt="${escapeHtml(title)}"></section>` : ""}
    <section class="viewer-section viewer-copy"><h3>${escapeHtml(title)}</h3>${textToParagraphs(box.text || "")}</section>
    ${filePreviewMarkup(box)}
    <div class="viewer-actions">
      ${box.fileData ? `<button type="button" class="primary-button" data-download-nepihl="${index}">Download ${escapeHtml(box.fileName || "bestand")}</button>` : ""}
      ${url ? `<a class="secondary-button" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open gekoppelde website</a>` : ""}
    </div>
  </div>`;
  viewer.hidden = false;
  document.body.classList.add("viewer-open");
}

contentArea.addEventListener("click", event => {
  const trigger = event.target.closest("[data-nepihl-open]");
  if (trigger) openNepihlBox(Number(trigger.dataset.nepihlOpen));
});

function renderSponsors() {
  const groups = { current: document.getElementById("currentSponsors"), permanent: document.getElementById("permanentSponsors") };
  Object.values(groups).forEach(group => group.innerHTML = "");
  Object.entries(groups).forEach(([type, container]) => {
    const sponsors = data.sponsors.filter(item => item.group === type);
    if (!sponsors.length) {
      container.innerHTML = `<div class="empty-state">Sponsor information will be added soon.</div>`;
      return;
    }
    sponsors.forEach(sponsor => {
      const content = `<img src="${sponsor.image}" alt="${escapeHtml(sponsor.name)} logo"><span>${escapeHtml(sponsor.name)}</span>`;
      const card = document.createElement(sponsor.url ? "a" : "div");
      card.className = "sponsor-card";
      if (sponsor.url) { card.href = sponsor.url; card.target = "_blank"; card.rel = "noopener"; }
      card.innerHTML = content;
      container.appendChild(card);
    });
  });
}

function addGalleryNavigation() {
  if (!data.albums.length || document.querySelector('[data-page="gallery"]')) return;
  const settings = document.querySelector(".settings-link");
  const button = document.createElement("button");
  button.className = "nav-button";
  button.dataset.page = "gallery";
  button.textContent = "Gallery";
  nav.insertBefore(button, settings);
}

function renderGallery() {
  const cards = data.albums.map(album => `<article class="album-card"><div class="album-cover">${album.images[0] ? `<img src="${album.images[0]}" alt="${escapeHtml(album.title)}">` : ""}<span>${album.images.length} photos</span></div><div class="album-copy"><h3>${escapeHtml(album.title)}</h3><p>${escapeHtml(album.description || "Team photo album")}</p></div></article>`).join("");
  contentArea.innerHTML = `<div class="gallery-content"><p class="eyebrow">Team moments</p><h2>Photo Gallery</h2><div class="album-grid">${cards || '<div class="empty-state">No albums have been published yet.</div>'}</div></div>`;
}

nav.addEventListener("click", event => {
  const target = event.target.closest("[data-page]");
  if (target) renderPage(target.dataset.page);
});

addGalleryNavigation();
renderSponsors();
renderPage("home");

// Version 1.1.0 showcase: hero actions and live NEPIHL countdown.
document.querySelectorAll('[data-page-jump]').forEach(button => {
  button.addEventListener('click', () => {
    const target = document.querySelector(`.nav-button[data-page="${button.dataset.pageJump}"]`);
    if (target) target.click();
    document.getElementById('contentArea')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

function updateEventCountdown() {
  const target = new Date('2027-03-20T08:00:00+01:00');
  const diff = target - new Date();
  const strip = document.querySelector('#eventCountdown span');
  const fixed = document.getElementById('fixedCountdownText');
  if (diff <= 0) {
    if (strip) strip.textContent = 'Tournament weekend is here';
    if (fixed) fixed.textContent = 'NEPIHL27 is begonnen';
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (strip) strip.textContent = `${days} days • ${hours} hours to go`;
  if (fixed) fixed.textContent = `${days} dagen • ${String(hours).padStart(2,'0')} uur • ${String(minutes).padStart(2,'0')} min • ${String(seconds).padStart(2,'0')} sec`;
}
updateEventCountdown();
setInterval(updateEventCountdown, 1000);
