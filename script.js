const yearSpan = document.getElementById("year");
const themeToggle = document.getElementById("theme-toggle");
const backToTop = document.getElementById("back-to-top");
const folderCards = document.querySelectorAll("[data-folder]");
const revealSections = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".nav-link");
const copyEmailBtn = document.getElementById("copy-email");
const copyUniEmailBtn = document.getElementById("copy-uni-email");
const emailText = document.getElementById("email-text");
const uniEmailText = document.getElementById("uni-email-text");
const toastEl = document.getElementById("toast");
const scrollCue = document.getElementById("scroll-cue");
const scrollProgress = document.getElementById("scroll-progress");
const tiltCards = document.querySelectorAll(".tilt-card");
const rotatingWord = document.getElementById("hero-rotating-word");

const HERO_CLIP_START = 15;
const HERO_CLIP_END = 75;
const HERO_VIDEO_ID = "-6CyOPXA_Zc";

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

folderCards.forEach((card) => {
  const trigger = card.querySelector("[data-folder-toggle]");
  if (!trigger) return;
  trigger.addEventListener("click", () => {
    const next = !card.classList.contains("is-open");
    card.classList.toggle("is-open", next);
    trigger.setAttribute("aria-expanded", String(next));
  });
});

function initHeroYouTube() {
  if (typeof YT === "undefined" || !YT.Player) return;

  const player = new YT.Player("hero-yt", {
    videoId: HERO_VIDEO_ID,
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      iv_load_policy: 3,
      showinfo: 0,
      fs: 0,
      disablekb: 1,
      origin: window.location.origin,
    },
    events: {
      onReady: (e) => {
        const p = e.target;
        p.mute();
        p.seekTo(HERO_CLIP_START, true);
        p.playVideo();
        document.querySelector(".hero")?.classList.add("hero--youtube-ready");
        document.getElementById("hero-aurora")?.classList.add("is-dim");
        const frame = document.querySelector("#hero-yt iframe");
        frame?.setAttribute("title", "Cinematic backdrop video excerpt");
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED) {
          e.target.seekTo(HERO_CLIP_START, true);
          e.target.playVideo();
        }
      },
    },
  });

  window.setInterval(() => {
    try {
      const t = player.getCurrentTime();
      if (typeof t === "number" && t >= HERO_CLIP_END - 0.35) {
        player.seekTo(HERO_CLIP_START, true);
      }
    } catch {
      /* ignore */
    }
  }, 280);
}

if (!window.YT) {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScript = document.getElementsByTagName("script")[0];
  firstScript.parentNode.insertBefore(tag, firstScript);
  window.onYouTubeIframeAPIReady = initHeroYouTube;
} else if (YT.Player) {
  initHeroYouTube();
}

if (scrollCue) {
  scrollCue.addEventListener("click", () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  });
}

if (rotatingWord) {
  const words = ["Engineering", "Data Science", "Infrastructure"];
  let idx = 0;
  window.setInterval(() => {
    idx = (idx + 1) % words.length;
    rotatingWord.textContent = words[idx];
  }, 1800);
}

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    const rotateX = (0.5 - (y / rect.height)) * 8;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

function initExpandables() {
  document.querySelectorAll("[data-expandable]").forEach((root) => {
    const trigger = root.querySelector("[data-expand-trigger]");
    if (!trigger) return;
    const panelId = trigger.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;

    const isCard = root.classList.contains("card-disclosure");
    const openClass = isCard ? "is-open" : "is-expanded";

    trigger.addEventListener("click", () => {
      const open = root.classList.contains(openClass);
      const next = !open;
      root.classList.toggle(openClass, next);
      trigger.setAttribute("aria-expanded", String(next));
      panel.setAttribute("aria-hidden", String(!next));

      const show = trigger.querySelector(".expandable-label-show");
      const hide = trigger.querySelector(".expandable-label-hide");
      if (show && hide) {
        show.hidden = next;
        hide.hidden = !next;
      }
    });
  });
}

initExpandables();

function initScrollRevealFallback() {
  if (window.CSS && CSS.supports && CSS.supports("animation-timeline", "view()")) {
    return;
  }
  const els = document.querySelectorAll(".scroll-reveal");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("scroll-reveal--in");
        }
      });
    },
    { threshold: 0.06, rootMargin: "0px 0px -6% 0px" }
  );
  els.forEach((el) => io.observe(el));
}

initScrollRevealFallback();

if (scrollProgress) {
  window.addEventListener(
    "scroll",
    () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      scrollProgress.style.width = `${pct}%`;
    },
    { passive: true }
  );
}

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

if (copyUniEmailBtn && uniEmailText) {
  copyUniEmailBtn.addEventListener("click", async () => {
    const text = (uniEmailText.textContent || "").trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast("Uni email copied to clipboard");
    } catch (e) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        showToast("Uni email copied to clipboard");
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
