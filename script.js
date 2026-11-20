const year = document.querySelector("#current-year");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

const navLinks = Array.from(document.querySelectorAll("[data-nav-section]"));
const sections = navLinks
  .map((link) => document.querySelector(`#${link.dataset.navSection}`))
  .filter(Boolean);

if ("IntersectionObserver" in window && sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        const isCurrent = link.dataset.navSection === visible.target.id;
        if (isCurrent) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    {
      rootMargin: "-10% 0px -72%",
      threshold: [0, 0.15, 0.4],
    },
  );

  sections.forEach((section) => observer.observe(section));
}

const figureTriggers = Array.from(document.querySelectorAll("[data-lightbox-open]"));
const figureLightbox = document.querySelector("#figure-lightbox");
const lightboxImage = figureLightbox?.querySelector(".lightbox-panel img");
const lightboxCloseButtons = figureLightbox
  ? Array.from(figureLightbox.querySelectorAll("[data-lightbox-close]"))
  : [];
let lastTrigger = null;

const closeFigureLightbox = () => {
  if (!figureLightbox || figureLightbox.hidden) return;

  figureLightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  lastTrigger?.focus();
};

const openFigureLightbox = (trigger) => {
  if (!figureLightbox) return;

  const thumb = trigger.querySelector("img");
  if (lightboxImage) {
    lightboxImage.src = trigger.dataset.lightboxSrc || thumb?.src || lightboxImage.src;
    lightboxImage.alt = thumb?.alt || "";
  }
  lastTrigger = trigger;
  figureLightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  figureLightbox.querySelector(".lightbox-close")?.focus();
};

figureTriggers.forEach((trigger) =>
  trigger.addEventListener("click", () => openFigureLightbox(trigger)),
);
lightboxCloseButtons.forEach((button) =>
  button.addEventListener("click", closeFigureLightbox),
);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeFigureLightbox();
});
