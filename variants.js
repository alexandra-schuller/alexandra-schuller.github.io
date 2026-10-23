// Tailored versions of the home page for the CV short links.
// alexschuller.com/sb redirects to /?v=sb; this picks the version, remembers it for the
// visit (so "Back to home" from a project page keeps it), and tidies the address bar.
// Runs before i18n.js so the language switch picks up the tailored French text.
(function () {
  var VARIANTS = {
    // Structural, buildings
    sb: {
      order: ["office", "capdecarie", "bridge", "canoe", "rockslope", "water"],
      cv: null,
      fr: "J’ai un désir profond de concevoir des bâtiments sûrs, durables et passionnants à construire. Mes cours, stages et activités parascolaires m’ont permis d’acquérir de l’expérience en conception structurale avec ETABS, SAFE, SAP2000, WoodWorks, Revit et AutoCAD, notamment pour la conception d’un immeuble de bureaux de dix étages à Québec : cheminement des charges latérales et gravitaires, disposition des murs de refend et conception des dalles. Mes cours avancés comprennent la conception des structures en béton armé I et II, la conception des structures en acier, la conception des structures en bois, la conception des fondations et le génie géotechnique avancé. Au cours de mes trois stages, j’ai eu l’occasion de travailler dans des contextes variés et complémentaires : au sein d’un laboratoire de recherche en énergie propre de Ressources naturelles Canada, sur le chantier du tunnel Louis-Hippolyte-La Fontaine, ainsi qu’au développement d’un nouveau système de planification pour environ 1 000 barrages sous gestion publique au Québec.",
      en: "I have a deep desire to design buildings that are safe, durable, and exciting to build. My coursework, internships, and extracurricular activities have given me experience in structural design with ETABS, SAFE, SAP2000, WoodWorks, Revit, and AutoCAD, including the design of a ten-storey office building in Quebec City: lateral and gravity load paths, shear wall layout, and slab design. My advanced courses include Reinforced Concrete Design I and II, Design of Steel Structures, Design of Wood Structures, Foundation Design, and Advanced Geotechnical Engineering. Over the course of my three internships, I had the opportunity to work in varied and complementary settings: within a clean energy research laboratory at Natural Resources Canada, on the Louis-Hippolyte-La Fontaine tunnel construction site, and on the development of a new planning system for about 1,000 publicly managed dams in Québec."
    },
    // Structural, infrastructure
    si: {
      order: ["capdecarie", "bridge", "rockslope", "water", "office", "canoe"],
      cv: null,
      fr: "J’ai un désir profond de participer à l’avenir des infrastructures. Mes cours, stages et activités parascolaires m’ont permis d’acquérir de l’expérience en analyse et en conception structurale avec CSI Bridge, SAP2000, Abaqus, DIANA, ETABS et AutoCAD. Dans mon projet de fin d’études, CapDécarie, nous avons redessiné le viaduc Queen Mary et conçu le recouvrement d’une section de la tranchée de l’autoroute Décarie : fondations, analyse des charges, conception en acier et en béton armé. Au cours de mes trois stages, j’ai eu l’occasion de travailler dans des contextes variés et complémentaires : sur le chantier du tunnel Louis-Hippolyte-La Fontaine, au développement d’un nouveau système de planification pour environ 1 000 barrages sous gestion publique au Québec, ainsi qu’au sein d’un laboratoire de recherche en énergie propre de Ressources naturelles Canada.",
      en: "I have a deep desire to contribute to the future of infrastructure. My coursework, internships, and extracurricular activities have given me experience in structural analysis and design with CSI Bridge, SAP2000, Abaqus, DIANA, ETABS, and AutoCAD. In my capstone project, CapDécarie, we redesigned the Queen Mary overpass and designed a cover over a section of the Décarie Expressway trench: foundations, load analysis, and steel and reinforced concrete design. Over the course of my three internships, I had the opportunity to work in varied and complementary settings: on the Louis-Hippolyte-La Fontaine tunnel construction site, on the development of a new planning system for about 1,000 publicly managed dams in Québec, and within a clean energy research laboratory at Natural Resources Canada."
    },
    // Construction, buildings
    cb: {
      order: ["canoe", "office", "capdecarie", "water", "bridge", "rockslope"],
      cv: null,
      fr: "J’ai un désir profond de contribuer à la réalisation de bâtiments, de la planification jusqu’au chantier. Mes cours, stages et activités parascolaires m’ont permis d’acquérir de l’expérience avec MS Project, Primavera P6, Procore, Bluebeam, Revit et AutoCAD. Comme capitaine de l’équipe de canoë de béton de Concordia, j’ai dirigé une équipe de douze personnes dans la conception, la construction et le transport d’un canot de 6 mètres, en gérant le budget, l’acquisition des matériaux et la sécurité en laboratoire. Au cours de mes trois stages, j’ai eu l’occasion de travailler dans des contextes variés et complémentaires : sur le chantier du tunnel Louis-Hippolyte-La Fontaine avec Pomerleau, au développement d’un nouveau système de planification pour environ 1 000 barrages sous gestion publique au Québec, ainsi qu’au sein d’un laboratoire de recherche en énergie propre de Ressources naturelles Canada.",
      en: "I have a deep desire to help bring buildings to life, from planning through to the job site. My coursework, internships, and extracurricular activities have given me experience with MS Project, Primavera P6, Procore, Bluebeam, Revit, and AutoCAD. As captain of the Concordia Concrete Canoe team, I led a team of twelve in designing, building, and transporting a 6-meter canoe, managing the budget, material procurement, and lab safety. Over the course of my three internships, I had the opportunity to work in varied and complementary settings: on the Louis-Hippolyte-La Fontaine tunnel construction site with Pomerleau, on the development of a new planning system for about 1,000 publicly managed dams in Québec, and within a clean energy research laboratory at Natural Resources Canada."
    },
    // Construction, infrastructure
    ci: {
      order: ["capdecarie", "canoe", "water", "bridge", "rockslope", "office"],
      cv: null,
      fr: "J’ai un désir profond de participer à la réalisation des grands projets d’infrastructure. Chez Pomerleau, sur le chantier du tunnel Louis-Hippolyte-La Fontaine, j’ai assuré le suivi de l’avancement des réparations des câbles chauffants dans le tunnel principal et le tunnel d’accès. À la Direction générale des barrages, j’ai contribué à la mise en œuvre d’un nouveau système centralisé de planification avec MS Project pour environ 1 000 barrages au Québec, en consolidant les échéanciers et les jalons des projets. Mes cours et activités parascolaires m’ont aussi permis d’acquérir de l’expérience avec Primavera P6, Procore, Aconex, Bluebeam et AutoCAD, et mon projet de fin d’études, CapDécarie, comprenait la gestion de la circulation, l’estimation des coûts et la planification de la construction.",
      en: "I have a deep desire to help deliver major infrastructure projects. With Pomerleau on the Louis-Hippolyte-La Fontaine tunnel site, I tracked the progress of heating cable repairs in the main and access tunnels. At the Direction générale des barrages, I helped implement a new centralized MS Project planning system for about 1,000 dams in Québec by consolidating project schedules and milestones. My coursework and extracurricular activities have also given me experience with Primavera P6, Procore, Aconex, Bluebeam, and AutoCAD, and my capstone project, CapDécarie, included traffic management, cost estimating, and construction planning."
    }
  };

  var KEY = "site-variant";
  var key = new URLSearchParams(location.search).get("v");
  if (VARIANTS[key]) {
    try { sessionStorage.setItem(KEY, key); } catch (e) {}
    history.replaceState(null, "", location.pathname + location.hash);
  } else {
    try { key = sessionStorage.getItem(KEY); } catch (e) { key = null; }
  }
  var v = VARIANTS[key];
  if (!v) return;

  var intro = document.getElementById("intro");
  if (intro) {
    intro.textContent = v.fr;
    intro.setAttribute("data-en", v.en);
  }

  var grid = document.querySelector("#projects .grid");
  if (grid) {
    v.order.forEach(function (id) {
      var card = grid.querySelector('[data-card="' + id + '"]');
      if (card) grid.appendChild(card);
    });
  }

  var cv = document.getElementById("cv-link");
  if (cv && v.cv) cv.setAttribute("href", v.cv);
})();
