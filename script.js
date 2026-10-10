const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Header shadow on scroll ---------- */
const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 16);
});

/* ---------- Mobile nav ---------- */
const menuTrigger = document.querySelector(".menu-trigger");
const mobileNav = document.getElementById("mobile-nav");

function closeMobileNav() {
  mobileNav.setAttribute("data-open", "false");
  menuTrigger.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
  window.setTimeout(() => {
    if (mobileNav.getAttribute("data-open") === "false") mobileNav.hidden = true;
  }, 250);
}

function openMobileNav() {
  mobileNav.hidden = false;
  requestAnimationFrame(() => mobileNav.setAttribute("data-open", "true"));
  menuTrigger.setAttribute("aria-expanded", "true");
  document.body.classList.add("nav-open");
}

if (menuTrigger && mobileNav) {
  menuTrigger.addEventListener("click", () => {
    const isOpen = menuTrigger.getAttribute("aria-expanded") === "true";
    isOpen ? closeMobileNav() : openMobileNav();
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuTrigger.getAttribute("aria-expanded") === "true") {
      closeMobileNav();
      menuTrigger.focus();
    }
  });
}

/* ---------- Scroll-spy nav (desktop + mobile share [data-nav]) ---------- */
const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && sections.length) {
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((section) => spyObserver.observe(section));
}

/* ---------- Reveal-on-scroll ---------- */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && revealEls.length && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Hero stat count-up ---------- */
const statEls = document.querySelectorAll("[data-count-to]");
function animateCount(el) {
  const target = parseInt(el.getAttribute("data-count-to"), 10);
  const suffix = el.getAttribute("data-suffix") || "";
  if (prefersReducedMotion) {
    el.textContent = target + suffix;
    return;
  }
  const duration = 900;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(progress * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

if ("IntersectionObserver" in window && statEls.length) {
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  statEls.forEach((el) => statObserver.observe(el));
}

/* ---------- Skill ecosystem: cycling focus + orbiting related tags ---------- */
const skillData = [
  { word: "React", desc: "Component-driven UI for every recent build.", related: ["HTML", "CSS", "JavaScript", "TypeScript", "Tailwind"] },
  { word: "TypeScript", desc: "Typed safety layered onto growing React builds.", related: ["React", "Vite", "Node.js"] },
  { word: "Supabase", desc: "Auth, Postgres, and storage for CampusBites and the voting platform.", related: ["PostgreSQL", "Auth", "Row Level Security"] },
  { word: "Python", desc: "A growing area, alongside data structures and algorithms.", related: ["AI", "Learning"] },
  { word: "AI / LLMs", desc: "Prompt engineering and AI-assisted development — explored honestly, not oversold.", related: ["Prompt Engineering", "RAG", "AI Agents"] },
];

const orbit = document.getElementById("skill-orbit");
const focusWord = document.getElementById("skill-focus-word");
const focusDesc = document.getElementById("skill-focus-desc");

function renderOrbit(index) {
  const entry = skillData[index];
  if (!focusWord || !orbit) return;

  focusWord.style.opacity = 0;
  window.setTimeout(() => {
    focusWord.textContent = entry.word;
    focusDesc.textContent = entry.desc;
    focusWord.style.opacity = 1;
  }, prefersReducedMotion ? 0 : 200);

  orbit.innerHTML = "";
  const radius = orbit.clientWidth ? orbit.clientWidth / 2.6 : 160;
  const count = entry.related.length;
  entry.related.forEach((tag, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = 50 + (Math.cos(angle) * radius) / (orbit.clientWidth || 320) * 100;
    const y = 50 + (Math.sin(angle) * radius) / (orbit.clientHeight || 320) * 100;
    const el = document.createElement("span");
    el.className = "orbit-tag related";
    el.textContent = tag;
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;
    el.style.transform = "translate(-50%, -50%)";
    orbit.appendChild(el);
  });
}

if (orbit && focusWord) {
  let skillIndex = 0;
  renderOrbit(skillIndex);

  let cycleTimer = null;
  function startCycle() {
    if (prefersReducedMotion) return;
    cycleTimer = window.setInterval(() => {
      skillIndex = (skillIndex + 1) % skillData.length;
      renderOrbit(skillIndex);
    }, 4200);
  }
  function stopCycle() {
    if (cycleTimer) window.clearInterval(cycleTimer);
  }

  startCycle();

  const ecosystem = document.querySelector(".skill-ecosystem");
  if (ecosystem) {
    ecosystem.addEventListener("mouseenter", stopCycle);
    ecosystem.addEventListener("mouseleave", startCycle);
    ecosystem.addEventListener("focusin", stopCycle);
    ecosystem.addEventListener("focusout", startCycle);
  }
}
