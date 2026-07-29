# Antwerp Phantoms Website — Version 1.1.4

First local test website for Antwerp Phantoms Para Ice Hockey.

## Changes in 1.1.4

- Replaced the former number 13 graphic with the supplied para ice hockey player image.
- The Contacts page now displays the supplied Sportoase image.
- Added document upload and removal controls to **Settings → Page Content → Information**.
- Uploaded documents appear as aligned download cards below the Information text.
- Existing sponsor and album prototype functions remain available.
- The existing PDF in the GitHub repository is not included or changed by this local package.

## Run locally on macOS

Open Terminal in this folder and run:

```bash
python3 -m http.server 8080
```

Then visit:

- Website: http://localhost:8080
- Settings: http://localhost:8080/settings.html

## Prototype storage notice

This version stores edits, sponsor logos, albums, and documents in browser local storage. Documents should be smaller than 4 MB during local testing. GitHub publishing will be implemented later.


## Security in version 1.1.4

- *
- *
- Passwords are stored as SHA-256 hashes in browser storage.
- This is client-side protection for the prototype. It is not equivalent to server-side authentication and must be replaced before a production public deployment.


## Version 1.1.4 visual showcase
- Dark professional ice-sport design
- Animated hero and ice background
- 3D navigation and action buttons
- Team highlight scoreboard
- NEPIHL 2027 countdown
- Sponsor presentation prepared for logos
- Improved responsive layout and accessibility


## Version 1.1.4
- Fixed top countdown to 20 March 2027 at 08:00.
- Added NEPIHL27 navigation and page.
- Added four responsive, Settings-managed content boxes with title, text and image.
- Updated hero button text to “Discover It..”.
- Improved Speed • Skill • Teamwork caption fitting.


## Version 1.1.4
- Settings is locked on every page load and works when opened through `file://`.
- NEPIHL27 cards can open an attached document, external link or their image.
- Each card has a configurable action label in Settings.


## Version 1.1.4
- NEPIHL27 cards no longer open data URLs in a new blank tab.
- Images, PDFs and text files open in an integrated viewer.
- Other document types download directly.
- External links continue to open in a separate browser tab.


## Version 1.1.4
- NEPIHL27-vakken openen altijd in een intern detailvenster.
- Geen automatische nieuwe pagina meer bij het aanklikken van een vak.
- Afbeelding, tekst, link en document worden afzonderlijk en betrouwbaar aangeboden.
- PDF- en Office-bestanden krijgen een duidelijke downloadactie om blanco browservensters te vermijden.
