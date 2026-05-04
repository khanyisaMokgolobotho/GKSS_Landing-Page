document.documentElement.classList.add("js-enabled");

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const countdownRoot = document.querySelector("[data-countdown]");
const revealElements = document.querySelectorAll("[data-reveal]");
const faqButtons = document.querySelectorAll(".faq-question");
const footerYear = document.querySelector("#footer-year");
const registrationForm = document.querySelector("#registration-form");
const feedback = document.querySelector("#form-feedback");

// 1. Update Footer Year
if (footerYear) {
  footerYear.textContent = `Event Build ${new Date().getFullYear()}`;
}

// 2. Navigation Toggle Logic
if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// 3. Countdown Timer Logic (Target: 7 May 2026)
if (countdownRoot) {
  const endDate = new Date(countdownRoot.dataset.countdown);
  const countdownLabel = document.querySelector("[data-countdown-label]");
  const units = {
    days: countdownRoot.querySelector("[data-countdown-value='days']"),
    hours: countdownRoot.querySelector("[data-countdown-value='hours']"),
    minutes: countdownRoot.querySelector("[data-countdown-value='minutes']"),
    seconds: countdownRoot.querySelector("[data-countdown-value='seconds']")
  };

  const updateCountdown = () => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) {
      Object.values(units).forEach((unit) => { if (unit) unit.textContent = "00"; });
      if (countdownLabel) countdownLabel.textContent = "Welcome to YMCA Ga-Rankuwa! Expo day is here.";
      return;
    }

    const seconds = Math.floor(diff / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainderSeconds = seconds % 60;

    if (units.days) units.days.textContent = String(days).padStart(2, "0");
    if (units.hours) units.hours.textContent = String(hours).padStart(2, "0");
    if (units.minutes) units.minutes.textContent = String(minutes).padStart(2, "0");
    if (units.seconds) units.seconds.textContent = String(remainderSeconds).padStart(2, "0");
  };

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

// 4. Numerical Countup Animation
const runCountup = (element) => {
  const target = Number(element.dataset.countup);
  const suffix = element.dataset.countupSuffix || "";
  const duration = 2000;
  const startTime = performance.now();

  const step = (timestamp) => {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = `${value}${suffix}`;
    if (progress < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
};

// 5. Scroll Reveal & Countup Trigger
if (revealElements.length) {
  const showElement = (element) => {
    element.classList.add("is-visible");
    if (element.hasAttribute("data-countup")) runCountup(element);
    element.querySelectorAll("[data-countup]").forEach(runCountup);
  };

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        showElement(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach(showElement);
  }
}

// 6. FAQ Accordion Logic
faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    const expanded = button.getAttribute("aria-expanded") === "true";

    faqButtons.forEach((other) => {
      other.setAttribute("aria-expanded", "false");
      if (other.nextElementSibling) other.nextElementSibling.classList.remove("is-open");
    });

    if (!expanded) {
      button.setAttribute("aria-expanded", "true");
      if (answer) answer.classList.add("is-open");
    }
  });
});

// 7. Internal Registration Form Handling (Phone Only)
if (registrationForm && feedback) {
  registrationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.textContent = "";

    const formData = new FormData(registrationForm);
    const name = formData.get("fullName");
    const phone = formData.get("phone").replace(/\s/g, "");

    // Simple 10-digit South African Phone Validation
    if (!/^\d{10}$/.test(phone)) {
      feedback.textContent = "Please enter a valid 10-digit phone number.";
      feedback.className = "form-feedback is-error";
      return;
    }

    // Success Simulation
    feedback.textContent = `Thanks, ${name}. Your interest for the expo has been recorded!`;
    feedback.className = "form-feedback is-success";
    registrationForm.reset();
  });
}

// 8. Smooth Scroll to Top Fix
document.querySelector('a[href="#top"]').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});