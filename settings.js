const SETTINGS_PASSWORD_HASH_KEY = "antwerpPhantomsSettingsPasswordHashV2";
const ADMIN_PASSWORD_HASH_KEY = "antwerpPhantomsAdministratorPasswordHashV2";
const DEFAULT_SETTINGS_PASSWORD = "admin";
const DEFAULT_ADMINISTRATOR_PASSWORD = "1234Hoedjevanpapier$";

// Synchronous salted one-way verifier that also works when the site is opened
// directly from disk with file://. The previous Web Crypto implementation did
// not run reliably in that situation.
function passwordHash(value) {
  const input = `ANTWERP-PHANTOMS-v1.1.2::${String(value)}`;
  let a = 0x811c9dc5;
  let b = 0x9e3779b9;
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    a ^= code;
    a = Math.imul(a, 0x01000193) >>> 0;
    b ^= (code + i) >>> 0;
    b = Math.imul(b, 0x85ebca6b) >>> 0;
    b = (b ^ (b >>> 13)) >>> 0;
  }
  return `${a.toString(16).padStart(8, "0")}${b.toString(16).padStart(8, "0")}`;
}

function ensureDefaultSecurityHashes() {
  if (!localStorage.getItem(SETTINGS_PASSWORD_HASH_KEY)) {
    localStorage.setItem(SETTINGS_PASSWORD_HASH_KEY, passwordHash(DEFAULT_SETTINGS_PASSWORD));
  }
  if (!localStorage.getItem(ADMIN_PASSWORD_HASH_KEY)) {
    localStorage.setItem(ADMIN_PASSWORD_HASH_KEY, passwordHash(DEFAULT_ADMINISTRATOR_PASSWORD));
  }
}

function showSecurityMessage(element, message, type = "") {
  element.textContent = message;
  element.className = `security-message ${type}`.trim();
}

function initialiseSettingsLogin() {
  ensureDefaultSecurityHashes();
  const gate = document.getElementById("settingsLoginGate");
  const application = document.getElementById("settingsApplication");

  function unlockApplication() {
    document.body.classList.remove("settings-is-locked");
    gate.hidden = true;
    application.hidden = false;
    application.inert = false;
    application.setAttribute("aria-hidden", "false");
  }

  function lockApplication() {
    document.body.classList.add("settings-is-locked");
    gate.hidden = false;
    application.hidden = true;
    application.inert = true;
    application.setAttribute("aria-hidden", "true");
  }

  // Deliberately lock on every page load. Refreshing or reopening Settings must
  // never leave the administration form exposed.
  lockApplication();

  document.getElementById("settingsLoginForm").addEventListener("submit", event => {
    event.preventDefault();
    const input = document.getElementById("settingsAccessPassword");
    const message = document.getElementById("loginMessage");
    const suppliedHash = passwordHash(input.value);
    const storedHash = localStorage.getItem(SETTINGS_PASSWORD_HASH_KEY);
    if (suppliedHash !== storedHash) {
      showSecurityMessage(message, "Incorrect password. Access denied.", "error");
      input.select();
      return;
    }
    unlockApplication();
    input.value = "";
    showSecurityMessage(message, "", "");
  });
}

try {
  initialiseSettingsLogin();
} catch (error) {
  console.error("Security could not be initialised", error);
  document.body.classList.add("settings-is-locked");
  const application = document.getElementById("settingsApplication");
  application.hidden = true;
  application.inert = true;
  showSecurityMessage(document.getElementById("loginMessage"), "Security could not be initialised. Settings remain locked.", "error");
}

let data = window.loadSiteData();
const status = document.getElementById("saveStatus");

function markSaved(message = "All changes saved locally") {
  status.textContent = message;
  status.classList.add("flash");
  setTimeout(() => status.classList.remove("flash"), 900);
}

function persist(message) {
  window.saveSiteData(data);
  markSaved(message);
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
}

const headings = {general:"General Settings", pages:"Page Content & Documents", sponsors:"Sponsor Management", nepihl:"NEPIHL27 Content", albums:"Photo Albums", security:"Security Settings", publish:"Publish Website"};
document.querySelectorAll(".settings-tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".settings-tab").forEach(item => item.classList.toggle("active", item === tab));
  document.querySelectorAll(".settings-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === tab.dataset.tab));
  document.getElementById("settingsHeading").textContent = headings[tab.dataset.tab];
}));

const titleInput = document.getElementById("titleInput");
const taglineInput = document.getElementById("taglineInput");
const homeHeadingInput = document.getElementById("homeHeadingInput");
const homeTextInput = document.getElementById("homeTextInput");

titleInput.value = data.title;
taglineInput.value = data.tagline;
homeHeadingInput.value = data.pages.home.title;
homeTextInput.value = data.pages.home.text;

document.getElementById("saveGeneral").addEventListener("click", () => {
  data.title = titleInput.value.trim() || window.DEFAULT_SITE_DATA.title;
  data.tagline = taglineInput.value.trim();
  data.pages.home.title = homeHeadingInput.value.trim();
  data.pages.home.text = homeTextInput.value.trim();
  persist("General settings saved");
});

document.getElementById("resetAll").addEventListener("click", () => {
  if (!confirm("Reset all locally saved test data?")) return;
  localStorage.removeItem("antwerpPhantomsSiteData");
  location.reload();
});

const pageSelect = document.getElementById("pageSelect");
const pageTitleInput = document.getElementById("pageTitleInput");
const pageTextInput = document.getElementById("pageTextInput");
const documentCards = [document.getElementById("informationDocumentsCard"), document.getElementById("informationDocumentsManagerCard")];
function loadPageForm() {
  const page = data.pages[pageSelect.value];
  pageTitleInput.value = page.title;
  pageTextInput.value = page.text;
  documentCards.forEach(card => card.hidden = pageSelect.value !== "information");
}
pageSelect.addEventListener("change", loadPageForm);
document.getElementById("savePage").addEventListener("click", () => {
  const oldPage = data.pages[pageSelect.value] || {};
  data.pages[pageSelect.value] = { ...oldPage, title: pageTitleInput.value.trim(), text: pageTextInput.value.trim() };
  persist("Page content saved");
});
loadPageForm();

function ensureDocuments() {
  if (!Array.isArray(data.pages.information.documents)) data.pages.information.documents = [];
  return data.pages.information.documents;
}

function renderDocumentManager() {
  const manager = document.getElementById("documentManager");
  const documents = ensureDocuments();
  if (!documents.length) {
    manager.innerHTML = '<div class="empty-state">No Information documents have been uploaded yet.</div>';
    return;
  }
  manager.innerHTML = documents.map((item, index) => `<div class="manager-item document-manager-item"><div class="file-type-badge">${escapeHtml((item.extension || "FILE").toUpperCase())}</div><div><strong>${escapeHtml(item.title || item.name)}</strong><span>${escapeHtml(item.name)}</span><small>${escapeHtml(item.size || "")}</small></div><button class="icon-button danger" data-remove-document="${index}">Remove</button></div>`).join("");
}

document.getElementById("addDocument").addEventListener("click", async () => {
  const input = document.getElementById("documentFile");
  const file = input.files[0];
  const title = document.getElementById("documentTitle").value.trim();
  if (!file) { alert("Select a document to upload."); return; }
  // Local storage is deliberately limited; keep prototype uploads reasonably small.
  if (file.size > 4 * 1024 * 1024) { alert("For this browser test, select a document smaller than 4 MB."); return; }
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "file";
  ensureDocuments().push({
    title: title || file.name.replace(/\.[^.]+$/, ""),
    name: file.name,
    type: file.type,
    size: formatFileSize(file.size),
    extension,
    data: await readAsDataURL(file)
  });
  persist("Information document uploaded");
  document.getElementById("documentTitle").value = "";
  input.value = "";
  renderDocumentManager();
});

document.getElementById("documentManager").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-document]");
  if (!button) return;
  ensureDocuments().splice(Number(button.dataset.removeDocument), 1);
  persist("Information document removed");
  renderDocumentManager();
});

function renderSponsorManager() {
  const manager = document.getElementById("sponsorManager");
  if (!data.sponsors.length) { manager.innerHTML = '<div class="empty-state">No sponsors have been added yet.</div>'; return; }
  manager.innerHTML = data.sponsors.map((item, index) => `<div class="manager-item"><img src="${item.image}" alt=""><div><strong>${escapeHtml(item.name)}</strong><span>${item.group === "current" ? "Current sponsor" : "Permanent partner"}</span></div><button class="icon-button danger" data-remove-sponsor="${index}">Remove</button></div>`).join("");
}

document.getElementById("addSponsor").addEventListener("click", async () => {
  const name = document.getElementById("sponsorName").value.trim();
  const file = document.getElementById("sponsorImage").files[0];
  if (!name || !file) { alert("Enter a sponsor name and select a logo image."); return; }
  data.sponsors.push({ name, group: document.getElementById("sponsorGroup").value, url: document.getElementById("sponsorUrl").value.trim(), image: await readAsDataURL(file) });
  persist("Sponsor added");
  document.getElementById("sponsorName").value = "";
  document.getElementById("sponsorUrl").value = "";
  document.getElementById("sponsorImage").value = "";
  renderSponsorManager();
});

document.getElementById("sponsorManager").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-sponsor]");
  if (!button) return;
  data.sponsors.splice(Number(button.dataset.removeSponsor), 1);
  persist("Sponsor removed");
  renderSponsorManager();
});

function renderAlbumManager() {
  const manager = document.getElementById("albumManager");
  if (!data.albums.length) { manager.innerHTML = '<div class="empty-state">No photo albums have been created yet.</div>'; return; }
  manager.innerHTML = data.albums.map((item, index) => `<div class="manager-item"><div class="album-thumb">${item.images[0] ? `<img src="${item.images[0]}" alt="">` : ""}</div><div><strong>${escapeHtml(item.title)}</strong><span>${item.images.length} photos</span></div><button class="icon-button danger" data-remove-album="${index}">Remove</button></div>`).join("");
}

document.getElementById("addAlbum").addEventListener("click", async () => {
  const title = document.getElementById("albumTitle").value.trim();
  const files = [...document.getElementById("albumImages").files];
  if (!title || !files.length) { alert("Enter an album title and select at least one photo."); return; }
  const images = await Promise.all(files.map(readAsDataURL));
  data.albums.push({ title, description: document.getElementById("albumDescription").value.trim(), images });
  persist("Photo album created");
  document.getElementById("albumTitle").value = "";
  document.getElementById("albumDescription").value = "";
  document.getElementById("albumImages").value = "";
  renderAlbumManager();
});

document.getElementById("albumManager").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-album]");
  if (!button) return;
  data.albums.splice(Number(button.dataset.removeAlbum), 1);
  persist("Photo album removed");
  renderAlbumManager();
});

renderDocumentManager();
renderSponsorManager();
renderAlbumManager();


let securityControlsUnlocked = false;
const passwordManagementCard = document.getElementById("passwordManagementCard");
const changeSettingsPasswordButton = document.getElementById("changeSettingsPassword");
const resetSettingsPasswordButton = document.getElementById("resetSettingsPassword");

function setSecurityControlsUnlocked(unlocked) {
  securityControlsUnlocked = unlocked;
  passwordManagementCard.classList.toggle("security-locked", !unlocked);
  changeSettingsPasswordButton.disabled = !unlocked;
  resetSettingsPasswordButton.disabled = !unlocked;
}

setSecurityControlsUnlocked(false);

document.getElementById("unlockSecurity").addEventListener("click", () => {
  const input = document.getElementById("administratorPassword");
  const message = document.getElementById("securityUnlockMessage");
  const suppliedHash = passwordHash(input.value);
  if (suppliedHash !== localStorage.getItem(ADMIN_PASSWORD_HASH_KEY)) {
    setSecurityControlsUnlocked(false);
    showSecurityMessage(message, "Incorrect administrator password.", "error");
    input.select();
    return;
  }
  setSecurityControlsUnlocked(true);
  input.value = "";
  showSecurityMessage(message, "Security Settings unlocked for this page session.", "success");
});

changeSettingsPasswordButton.addEventListener("click", () => {
  if (!securityControlsUnlocked) return;
  const password = document.getElementById("newSettingsPassword").value;
  const confirmation = document.getElementById("confirmSettingsPassword").value;
  const message = document.getElementById("passwordChangeMessage");
  if (password.length < 4) {
    showSecurityMessage(message, "Use a password with at least 4 characters.", "error");
    return;
  }
  if (password !== confirmation) {
    showSecurityMessage(message, "The two passwords do not match.", "error");
    return;
  }
  localStorage.setItem(SETTINGS_PASSWORD_HASH_KEY, passwordHash(password));
  document.getElementById("newSettingsPassword").value = "";
  document.getElementById("confirmSettingsPassword").value = "";
  showSecurityMessage(message, "The encrypted Settings password has been changed.", "success");
  markSaved("Security password changed");
});

resetSettingsPasswordButton.addEventListener("click", () => {
  if (!securityControlsUnlocked) return;
  if (!confirm('Reset the Settings access password to the default password “admin”?')) return;
  localStorage.setItem(SETTINGS_PASSWORD_HASH_KEY, passwordHash(DEFAULT_SETTINGS_PASSWORD));
  document.getElementById("newSettingsPassword").value = "";
  document.getElementById("confirmSettingsPassword").value = "";
  showSecurityMessage(document.getElementById("passwordChangeMessage"), 'Settings access password reset to “admin”.', "success");
  markSaved("Security password reset");
});


function ensureNepihlBoxes() {
  const defaults = window.DEFAULT_SITE_DATA.pages.nepihl27.boxes;
  if (!data.pages.nepihl27) data.pages.nepihl27 = structuredClone(window.DEFAULT_SITE_DATA.pages.nepihl27);
  if (!Array.isArray(data.pages.nepihl27.boxes)) data.pages.nepihl27.boxes = structuredClone(defaults);
  data.pages.nepihl27.boxes = defaults.map((box, index) => ({ ...box, ...(data.pages.nepihl27.boxes[index] || {}) }));
  return data.pages.nepihl27.boxes;
}

function renderNepihlBoxEditor() {
  const editor = document.getElementById("nepihlBoxEditor");
  const boxes = ensureNepihlBoxes();
  editor.innerHTML = boxes.map((box, index) => `
    <fieldset class="nepihl-editor-card" data-nepihl-box="${index}">
      <legend>Vak ${index + 1}</legend>
      <label>Titel<input class="nepihl-title-input" type="text" value="${escapeHtml(box.title || `Vak ${index + 1}`)}"></label>
      <label>Tekst<textarea class="nepihl-text-input" rows="6">${escapeHtml(box.text || "")}</textarea></label>
      <label>Afbeelding<input class="nepihl-image-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
      <div class="nepihl-image-preview">${box.image ? `<img src="${box.image}" alt="Preview">` : '<span>Geen afbeelding ingesteld</span>'}</div>
      <button type="button" class="danger-button remove-nepihl-image" ${box.image ? '' : 'disabled'}>Afbeelding verwijderen</button>
      <label>Link achter het vak (optioneel)<input class="nepihl-url-input" type="url" value="${escapeHtml(box.url || "")}" placeholder="https://..."></label>
      <label>Tekst op de knop<input class="nepihl-action-label-input" type="text" value="${escapeHtml(box.actionLabel || "Open bekijken")}" placeholder="Open bekijken"></label>
      <label>Bestand achter het vak (optioneel)<input class="nepihl-file-input" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"></label>
      <div class="nepihl-file-status">${box.fileName ? `Gekoppeld bestand: <strong>${escapeHtml(box.fileName)}</strong>` : 'Geen document gekoppeld. Zonder link of document opent een klik de ingestelde afbeelding.'}</div>
      <button type="button" class="danger-button remove-nepihl-file" ${box.fileData ? '' : 'disabled'}>Gekoppeld bestand verwijderen</button>
    </fieldset>`).join("");
}

function syncNepihlEditorText() {
  document.querySelectorAll("[data-nepihl-box]").forEach(card => {
    const index = Number(card.dataset.nepihlBox);
    ensureNepihlBoxes()[index].title = card.querySelector(".nepihl-title-input").value;
    const box = ensureNepihlBoxes()[index];
    box.text = card.querySelector(".nepihl-text-input").value;
    box.url = card.querySelector(".nepihl-url-input").value.trim();
    box.actionLabel = card.querySelector(".nepihl-action-label-input").value.trim();
  });
}

document.getElementById("nepihlBoxEditor").addEventListener("change", async event => {
  const imageInput = event.target.closest(".nepihl-image-input");
  const fileInput = event.target.closest(".nepihl-file-input");
  if ((!imageInput && !fileInput) || !event.target.files[0]) return;
  syncNepihlEditorText();
  const card = event.target.closest("[data-nepihl-box]");
  const index = Number(card.dataset.nepihlBox);
  const box = ensureNepihlBoxes()[index];
  if (imageInput) {
    box.image = await readAsDataURL(imageInput.files[0]);
  } else {
    box.fileData = await readAsDataURL(fileInput.files[0]);
    box.fileName = fileInput.files[0].name;
    box.fileType = fileInput.files[0].type || "application/octet-stream";
  }
  renderNepihlBoxEditor();
});

document.getElementById("nepihlBoxEditor").addEventListener("click", event => {
  const button = event.target.closest(".remove-nepihl-image");
  if (!button) return;
  syncNepihlEditorText();
  const index = Number(button.closest("[data-nepihl-box]").dataset.nepihlBox);
  ensureNepihlBoxes()[index].image = "";
  renderNepihlBoxEditor();
});

document.getElementById("nepihlBoxEditor").addEventListener("click", event => {
  const button = event.target.closest(".remove-nepihl-file");
  if (!button) return;
  syncNepihlEditorText();
  const index = Number(button.closest("[data-nepihl-box]").dataset.nepihlBox);
  const box = ensureNepihlBoxes()[index];
  box.fileData = "";
  box.fileName = "";
  box.fileType = "";
  renderNepihlBoxEditor();
});

document.getElementById("saveNepihlBoxes").addEventListener("click", () => {
  document.querySelectorAll("[data-nepihl-box]").forEach(card => {
    const index = Number(card.dataset.nepihlBox);
    ensureNepihlBoxes()[index].title = card.querySelector(".nepihl-title-input").value.trim() || `Vak ${index + 1}`;
    const box = ensureNepihlBoxes()[index];
    box.text = card.querySelector(".nepihl-text-input").value.trim();
    box.url = card.querySelector(".nepihl-url-input").value.trim();
    box.actionLabel = card.querySelector(".nepihl-action-label-input").value.trim() || "Open bekijken";
  });
  persist("NEPIHL27 boxes saved");
  renderNepihlBoxEditor();
});

renderNepihlBoxEditor();
