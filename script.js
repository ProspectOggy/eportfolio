const yearSpan = document.getElementById("year");
const themeToggle = document.getElementById("theme-toggle");
const backToTop = document.getElementById("back-to-top");
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");
const revealSections = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".nav-link");
const copyEmailBtn = document.getElementById("copy-email");
const emailText = document.getElementById("email-text");
const toastEl = document.getElementById("toast");

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
}

if (themeToggle) {
  const updateThemeLabel = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    themeToggle.textContent = currentTheme === "dark" ? "Light mode" : "Dark mode";
  };

  updateThemeLabel();

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    updateThemeLabel();
  });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-target");
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabPanels.forEach((panel) => panel.classList.remove("active"));

    button.classList.add("active");
    tabButtons.forEach((btn) => {
      btn.setAttribute("aria-selected", btn === button ? "true" : "false");
    });
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.classList.add("active");
    }
  });
});

if (navLinks.length > 0) {
  const byId = new Map(
    Array.from(navLinks).map((link) => [link.dataset.section, link])
  );
  const observedSections = Array.from(byId.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.dataset.section === id);
        });
      });
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: 0.01 }
  );

  observedSections.forEach((sec) => sectionObserver.observe(sec));
}

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    toastEl.classList.remove("show");
  }, 1800);
}

if (copyEmailBtn && emailText) {
  copyEmailBtn.addEventListener("click", async () => {
    const text = (emailText.textContent || "").trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast("Email copied to clipboard");
    } catch (e) {
      // Fallback for browsers/environments that block clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        showToast("Email copied to clipboard");
      } catch {
        showToast("Copy failed. Please copy manually.");
      } finally {
        document.body.removeChild(textarea);
      }
    }
  });
}

if (backToTop) {
  window.addEventListener("scroll", () => {
    backToTop.classList.toggle("show", window.scrollY > 240);
  });
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
});

revealSections.forEach((section) => revealObserver.observe(section));
