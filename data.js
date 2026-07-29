window.DEFAULT_SITE_DATA = {
  version: "1.1.4",
  title: "Antwerp Phantoms Para Ice Hockey",
  tagline: "Strength on ice. United as one.",
  pages: {
    home: {
      title: "Welcome to Antwerp Phantoms Para Ice Hockey",
      text: "We are committed to growing para ice hockey in Antwerp and beyond. Discover our team, training sessions, partners and upcoming activities."
    },
    training: {
      title: "Training Hours",
      text: "Training information will be added soon. Please contact the team for the latest schedule."
    },
    information: {
      title: "About Para Ice Hockey",
      text: "Para ice hockey is a fast, physical and highly tactical team sport. Players use a specially designed sledge and two short sticks to move across the ice, control the puck and compete as a team.",
      documents: []
    },
    contacts: {
      title: "Contact Us",
      text: "Contact details will be added soon."
    },
    nepihl27: {
      title: "NEPIHL27",
      text: "The NEPIHL27 para ice hockey tournament takes place on 20 and 21 March 2027. More tournament information will be published here.",
      boxes: [
        { title: "Vak 1", text: "Add the content for Vak 1 in Settings.", image: "", url: "", actionLabel: "Open bekijken", fileData: "", fileName: "", fileType: "" },
        { title: "Vak 2", text: "Add the content for Vak 2 in Settings.", image: "", url: "", actionLabel: "Open bekijken", fileData: "", fileName: "", fileType: "" },
        { title: "Vak 3", text: "Add the content for Vak 3 in Settings.", image: "", url: "", actionLabel: "Open bekijken", fileData: "", fileName: "", fileType: "" },
        { title: "Vak 4", text: "Add the content for Vak 4 in Settings.", image: "", url: "", actionLabel: "Open bekijken", fileData: "", fileName: "", fileType: "" }
      ]
    }
  },
  sponsors: [],
  albums: []
};

function mergeSiteData(stored) {
  const defaults = structuredClone(window.DEFAULT_SITE_DATA);
  return {
    ...defaults,
    ...stored,
    pages: {
      ...defaults.pages,
      ...(stored.pages || {}),
      information: {
        ...defaults.pages.information,
        ...((stored.pages || {}).information || {}),
        documents: Array.isArray(((stored.pages || {}).information || {}).documents)
          ? stored.pages.information.documents
          : []
      },
      nepihl27: {
        ...defaults.pages.nepihl27,
        ...((stored.pages || {}).nepihl27 || {}),
        boxes: Array.isArray(((stored.pages || {}).nepihl27 || {}).boxes)
          ? defaults.pages.nepihl27.boxes.map((box, index) => ({ ...box, ...(stored.pages.nepihl27.boxes[index] || {}) }))
          : defaults.pages.nepihl27.boxes
      }
    },
    sponsors: Array.isArray(stored.sponsors) ? stored.sponsors : [],
    albums: Array.isArray(stored.albums) ? stored.albums : []
  };
}

window.loadSiteData = function () {
  try {
    const stored = localStorage.getItem("antwerpPhantomsSiteData");
    return stored ? mergeSiteData(JSON.parse(stored)) : structuredClone(window.DEFAULT_SITE_DATA);
  } catch (error) {
    console.error("Could not load saved website data", error);
    return structuredClone(window.DEFAULT_SITE_DATA);
  }
};

window.saveSiteData = function (data) {
  localStorage.setItem("antwerpPhantomsSiteData", JSON.stringify(data));
};
