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
const lightboxCaption = figureLightbox?.querySelector(".lightbox-caption");
const lightboxPrev = figureLightbox?.querySelector("[data-lightbox-prev]");
const lightboxNext = figureLightbox?.querySelector("[data-lightbox-next]");
const lightboxCloseButtons = figureLightbox
  ? Array.from(figureLightbox.querySelectorAll("[data-lightbox-close]"))
  : [];
let lastTrigger = null;
let currentGroup = [];
let currentIndex = 0;

const showLightboxItem = (trigger) => {
  const thumb = trigger.querySelector("img");
  if (lightboxImage) {
    lightboxImage.src = trigger.dataset.lightboxSrc || thumb?.src || lightboxImage.src;
    lightboxImage.alt = thumb?.alt || "";
  }
  if (lightboxCaption) {
    const label = trigger.dataset.lightboxCaption || "";
    lightboxCaption.textContent =
      label && currentGroup.length > 1
        ? `${label} · ${currentIndex + 1} / ${currentGroup.length}`
        : label;
  }
};

const closeFigureLightbox = () => {
  if (!figureLightbox || figureLightbox.hidden) return;

  figureLightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  lastTrigger?.focus();
};

const openFigureLightbox = (trigger) => {
  if (!figureLightbox) return;

  const group = trigger.dataset.lightboxGroup;
  currentGroup = group
    ? figureTriggers.filter((item) => item.dataset.lightboxGroup === group)
    : [trigger];
  currentIndex = Math.max(0, currentGroup.indexOf(trigger));
  const hasNav = currentGroup.length > 1;
  if (lightboxPrev) lightboxPrev.hidden = !hasNav;
  if (lightboxNext) lightboxNext.hidden = !hasNav;

  showLightboxItem(trigger);
  lastTrigger = trigger;
  figureLightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  figureLightbox.querySelector(".lightbox-close")?.focus();
};

const stepLightbox = (delta) => {
  if (!figureLightbox || figureLightbox.hidden || currentGroup.length < 2) return;

  currentIndex = (currentIndex + delta + currentGroup.length) % currentGroup.length;
  lastTrigger = currentGroup[currentIndex];
  showLightboxItem(lastTrigger);
  // Warm the cache for the next photo in the same direction.
  const upcoming = currentGroup[(currentIndex + delta + currentGroup.length) % currentGroup.length];
  if (upcoming?.dataset.lightboxSrc) new Image().src = upcoming.dataset.lightboxSrc;
};

figureTriggers.forEach((trigger) =>
  trigger.addEventListener("click", () => openFigureLightbox(trigger)),
);
lightboxCloseButtons.forEach((button) =>
  button.addEventListener("click", closeFigureLightbox),
);
lightboxPrev?.addEventListener("click", () => stepLightbox(-1));
lightboxNext?.addEventListener("click", () => stepLightbox(1));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeFigureLightbox();
  if (event.key === "ArrowLeft") stepLightbox(-1);
  if (event.key === "ArrowRight") stepLightbox(1);
});

let touchStartX = null;
figureLightbox?.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.touches[0].clientX;
  },
  { passive: true },
);
figureLightbox?.addEventListener("touchend", (event) => {
  if (touchStartX === null) return;
  const dx = event.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
});
