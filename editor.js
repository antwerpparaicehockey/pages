function updateSite() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".html";

    fileInput.onchange = async () => {
        const file = fileInput.files[0];
        const text = await file.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        // -------------------------
        // LOGO
        // -------------------------
        const logoUrl = document.getElementById("logoUrl").value.trim();
        if (logoUrl) {
            let header = doc.querySelector("header");
            if (header) {
                let existingLogo = header.querySelector("img.site-logo");
                if (!existingLogo) {
                    existingLogo = doc.createElement("img");
                    existingLogo.className = "site-logo";
                    existingLogo.style.maxHeight = "120px";
                    existingLogo.style.display = "block";
                    existingLogo.style.margin = "0 auto 20px auto";
                    header.prepend(existingLogo);
                }
                existingLogo.src = logoUrl;
            }
        }

        // -------------------------
        // INFO TEKST
        -------------------------
        const infoText = document.getElementById("infoText").value.trim();
        if (infoText) {
            const infoCard = doc.querySelector("#info .card");
            if (infoCard) {
                infoCard.innerHTML = `<p>${infoText.replace(/\n/g, "<br>")}</p>`;
            }
        }

        // -------------------------
        // CONTACT EMAIL
        // -------------------------
        const contactEmail = document.getElementById("contactEmail").value.trim();
        if (contactEmail) {
            const contactCard = doc.querySelector("#contact .card");
            if (contactCard) {
                contactCard.innerHTML = `
                    <p><strong>Email:</strong> ${contactEmail}</p>
                    <a class="btn" href="mailto:${contactEmail}">Stuur een mail</a>
                `;
            }
        }

        // -------------------------
        // NIEUWE SECTIE
        // -------------------------
        const newTitle = document.getElementById("newSectionTitle").value.trim();
        const newContent = document.getElementById("newSectionContent").value.trim();

        if (newTitle && newContent) {
            const newSection = doc.createElement("section");
            newSection.className = "section";

            newSection.innerHTML = `
                <h2>${newTitle}</h2>
                <div class="card">
                    <p>${newContent.replace(/\n/g, "<br>")}</p>
                </div>
            `;

            doc.body.insertBefore(newSection, doc.querySelector("footer"));
        }

        // -------------------------
        // SPONSOR MODULE
        // -------------------------
        const sponsorFiles = document.getElementById("sponsorFiles").files;
        if (sponsorFiles.length > 0) {
            let sponsorSection = doc.querySelector("#sponsors");

            if (!sponsorSection) {
                sponsorSection = doc.createElement("section");
                sponsorSection.id = "sponsors";
                sponsorSection.className = "section";
                sponsorSection.innerHTML = `
                    <h2>Sponsors</h2>
                    <div class="card">
                        <div class="sponsor-grid"></div>
                    </div>
                `;
                doc.body.insertBefore(sponsorSection, doc.querySelector("footer"));
            }

            const grid = sponsorSection.querySelector(".sponsor-grid");
            grid.style.display = "grid";
            grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(150px, 1fr))";
            grid.style.gap = "20px";
            grid.style.alignItems = "center";

            for (let file of sponsorFiles) {
                const reader = new FileReader();
                reader.onload = () => {
                    const img = doc.createElement("img");
                    img.src = reader.result;
                    img.style.maxWidth = "100%";
                    img.style.maxHeight = "100px";
                    img.style.objectFit = "contain";
                    img.style.background = "#fff2";
                    img.style.padding = "10px";
                    img.style.borderRadius = "8px";
                    grid.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        }

        // -------------------------
        // THEMA EDITOR
        // -------------------------
        const primary = document.getElementById("primaryColor").value;
        const bg = document.getElementById("backgroundColor").value;
        const textColor = document.getElementById("textColor").value;

        const styleTag = doc.querySelector("style");

        if (styleTag) {
            let css = styleTag.innerHTML;

            css = css.replace(/#e60000/g, primary);
            css = css.replace(/#0d0d0d/g, bg);
            css = css.replace(/white/g, textColor);

            styleTag.innerHTML = css;
        }

        // -------------------------
        // DOWNLOAD NIEUWE INDEX
        // -------------------------
        const serializer = new XMLSerializer();
        const newHtml = serializer.serializeToString(doc);

        const blob = new Blob([newHtml], { type: "text/html" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "index.html";
        a.click();

        URL.revokeObjectURL(url);

        alert("Nieuwe index.html is gedownload met sponsors + thema.");
    };

    fileInput.click();
}
