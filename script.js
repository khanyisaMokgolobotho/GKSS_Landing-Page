document.documentElement.classList.add("js-enabled");

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a[href^='#']");
const countdownRoot = document.querySelector("[data-countdown]");
const countupElements = document.querySelectorAll("[data-countup]");
const revealElements = document.querySelectorAll("[data-reveal]");
const faqButtons = document.querySelectorAll(".faq-question");
const registrationForm = document.querySelector("#registration-form");
const feedback = document.querySelector("#form-feedback");
const footerYear = document.querySelector("#footer-year");
const STORAGE_KEY = "gkss-registration-interest";

if (footerYear) {
  footerYear.textContent = `Event Build ${new Date().getFullYear()}`;
}

// Navigation Toggle for Mobile Dropdown
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

// Countdown Logic for 7 May 2026
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
      Object.values(units).forEach((unit) => {
        if (unit) unit.textContent = "00";
      });
      if (countdownLabel) {
        countdownLabel.textContent = "Expo day has arrived. Welcome to TUT Ga Rankuwa!";
      }
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

// Function to handle the counting animation
const runCountup = (element) => {
  const target = Number(element.dataset.countup);
  const suffix = element.dataset.countupSuffix || "";
  const duration = 2000; // Animation lasts 2 seconds
  const startTime = performance.now();

  const step = (timestamp) => {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // Smooth "out-cubic" easing
    const value = Math.round(target * eased);
    
    element.textContent = `${value}${suffix}`;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

// Observer to trigger animations when sections become visible
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Add the visibility class for CSS transitions
      entry.target.classList.add("is-visible");

      // Check if the entering element is a countup number
      if (entry.target.hasAttribute("data-countup")) {
        runCountup(entry.target);
      }

      // Also check if any children of the entering section need counting
      const childrenToCount = entry.target.querySelectorAll("[data-countup]");
      childrenToCount.forEach((child) => runCountup(child));

      // Stop observing once the animation has triggered
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

// Initialize the observer on all reveal elements
document.querySelectorAll("[data-reveal]").forEach((element) => {
  revealObserver.observe(element);
});

revealElements.forEach((element) => {
  if (revealObserver) {
    revealObserver.observe(element);
  } else {
    element.classList.add("is-visible");
  }
});

// FAQ Accordion Logic
faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    const expanded = button.getAttribute("aria-expanded") === "true";

    faqButtons.forEach((otherButton) => {
      otherButton.setAttribute("aria-expanded", "false");
      const otherAnswer = otherButton.nextElementSibling;
      if (otherAnswer) otherAnswer.classList.remove("is-open");
    });

    if (!expanded) {
      button.setAttribute("aria-expanded", "true");
      if (answer) answer.classList.add("is-open");
    }
  });
});

// Registration Form Validation and Submission
if (registrationForm && feedback) {
  const fieldRules = {
    fullName: {
      validate: (value) => value.trim().length >= 3,
      message: "Please enter your full name."
    },
    email: {
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      message: "Please enter a valid email address."
    },
    gender: {
      validate: (value) => value.trim() !== "",
      message: "Please select your gender."
    },
    careerInterest: {
      validate: (value) => value.trim().length >= 2,
      message: "Please tell us your career interests."
    },
    organization: {
      validate: (value) => value.trim().length >= 2,
      message: "Please add your school or organisation."
    },
    interest: {
      validate: (value) => value.trim() !== "",
      message: "Please select a focus area."
    }
  };

  const setFieldState = (field, message = "") => {
    const label = field.closest("label");
    const errorNode = label ? label.querySelector(".field-error") : null;
    if (label) label.classList.toggle("is-invalid", Boolean(message));
    if (errorNode) errorNode.textContent = message;
  };

  registrationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.textContent = "";
    feedback.className = "form-feedback";

    const formData = new FormData(registrationForm);
    let firstInvalidField = null;

    Object.entries(fieldRules).forEach(([fieldName, rule]) => {
      const field = registrationForm.elements.namedItem(fieldName);
      const value = String(formData.get(fieldName) || "");
      const isValid = rule.validate(value);

      setFieldState(field, isValid ? "" : rule.message);
      if (!isValid && !firstInvalidField) firstInvalidField = field;
    });

    if (firstInvalidField) {
      feedback.textContent = "Please fix the highlighted fields and try again.";
      feedback.classList.add("is-error");
      firstInvalidField.focus();
      return;
    }

    const submission = {
      fullName: String(formData.get("fullName")).trim(),
      email: String(formData.get("email")).trim(),
      gender: String(formData.get("gender")),
      careerInterest: String(formData.get("careerInterest")).trim(),
      organization: String(formData.get("organization")).trim(),
      interest: String(formData.get("interest")),
      savedAt: new Date().toISOString()
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submission));
    } catch (error) {
      console.warn("Unable to save registration details.", error);
    }

    feedback.textContent = `Thanks, ${submission.fullName}. Your interest for the ${submission.interest} session is saved!`;
    feedback.classList.add("is-success");
    registrationForm.reset();

    registrationForm.querySelectorAll("label").forEach((label) => {
      label.classList.remove("is-invalid");
      const errorNode = label.querySelector(".field-error");
      if (errorNode) errorNode.textContent = "";
    });
  });
}