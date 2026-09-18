/* REPER — script partagé : menu mobile accessible, formulaire de contact, animations */
(function () {
  "use strict";

  /* Active les animations seulement si ce script s'exécute :
     sans JS, tout le contenu reste visible par défaut. */
  document.documentElement.classList.add("js");

  /* ---------- Menu mobile ---------- */
  var menuBtn = document.getElementById("menu-btn");
  var menuIcon = document.getElementById("menu-icon");
  var mobileMenu = document.getElementById("mobile-menu");

  function closeMenu() {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.add("hidden");
    mobileMenu.classList.remove("flex");
    if (menuIcon) {
      menuIcon.classList.add("fa-bars");
      menuIcon.classList.remove("fa-times");
    }
    menuBtn.setAttribute("aria-expanded", "false");
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var willOpen = mobileMenu.classList.contains("hidden");
      mobileMenu.classList.toggle("hidden", !willOpen);
      mobileMenu.classList.toggle("flex", willOpen);
      if (menuIcon) {
        menuIcon.classList.toggle("fa-bars", !willOpen);
        menuIcon.classList.toggle("fa-times", willOpen);
      }
      menuBtn.setAttribute("aria-expanded", String(willOpen));
    });

    // Fermer au clic sur un lien du menu
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Fermer avec Échap
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    // Fermer au clic à l'extérieur
    document.addEventListener("click", function (e) {
      if (
        !mobileMenu.classList.contains("hidden") &&
        !mobileMenu.contains(e.target) &&
        !menuBtn.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  /* ---------- Lien actif dans la navigation ---------- */
  var current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a[href]").forEach(function (link) {
    if (link.getAttribute("href") === current) {
      link.classList.add("text-brand-red");
      link.setAttribute("aria-current", "page");
    }
  });

  /* ---------- Compteurs animés (bandeau statistiques) ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var animate = function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1400;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Apparition au scroll ---------- */
  var reveal = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reveal.length && !reduceMotion) {
    if ("IntersectionObserver" in window) {
      var rio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("reveal-visible");
              rio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      reveal.forEach(function (el) { rio.observe(el); });
    }
    // Filet de sécurité : un défilement très rapide peut sauter un élément
    // sans jamais l'intersecter ; on révèle alors tout élément déjà passé.
    var revealFallback = function () {
      var limit = window.innerHeight + 100;
      reveal.forEach(function (el) {
        if (!el.classList.contains("reveal-visible") &&
            el.getBoundingClientRect().top < limit) {
          el.classList.add("reveal-visible");
        }
      });
    };
    window.addEventListener("scroll", revealFallback, { passive: true });
    window.addEventListener("resize", revealFallback);
    revealFallback();
  } else {
    reveal.forEach(function (el) { el.classList.add("reveal-visible"); });
  }

  /* ---------- Formulaire de contact (mailto de secours) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var subject = encodeURIComponent(
        "[Site web] " + (data.get("sujet") || "Demande de contact") + " — " + (data.get("societe") || data.get("nom"))
      );
      var body = encodeURIComponent(
        "Nom : " + data.get("nom") + "\n" +
        "Société : " + data.get("societe") + "\n" +
        "E-mail : " + data.get("email") + "\n" +
        "Téléphone : " + (data.get("telephone") || "—") + "\n" +
        "Sujet : " + data.get("sujet") + "\n\n" +
        "Message :\n" + data.get("message")
      );
      window.location.href = "mailto:reper@reper.ma?subject=" + subject + "&body=" + body;
      var note = document.getElementById("form-status");
      if (note) {
        note.textContent = "Votre logiciel e-mail va s'ouvrir avec votre demande pré-remplie. Merci de cliquer sur « Envoyer ».";
        note.classList.remove("hidden");
      }
    });
  }

  /* ---------- Année automatique du copyright ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
