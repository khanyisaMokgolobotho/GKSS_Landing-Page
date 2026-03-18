document.documentElement.classList.add("js-enabled");

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a[href^='#']");
const countdownRoot = document.querySelector("[data-countdown]");
const countupElements = document.querySelectorAll("[data-countup]");
const revealElements = document.querySelectorAll("[data-reveal]");
const agendaFilters = document.querySelectorAll(".agenda-filter");
const agendaItems = document.querySelectorAll(".agenda-item");
const faqButtons = document.querySelectorAll(".faq-question");
const registrationForm = document.querySelector("#registration-form");
const feedback = document.querySelector("#form-feedback");
const footerYear = document.querySelector("#footer-year");
const STORAGE_KEY = "gkss-registration-interest";

if (footerYear) {
  footerYear.textContent = `Site updated ${new Date().getFullYear()}`;
}

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
        if (unit) {
          unit.textContent = "00";
        }
      });

      if (countdownLabel) {
        countdownLabel.textContent = "Expo day has arrived. Check in and enjoy the experience.";
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

const runCountup = (element) => {
  const target = Number(element.dataset.countup);
  const suffix = element.dataset.countupSuffix || "";
  const duration = 1200;
  const startTime = performance.now();

  const step = (timestamp) => {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = `${value}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");

        if (entry.target.hasAttribute("data-countup")) {
          runCountup(entry.target);
        }

        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2 })
  : null;

revealElements.forEach((element) => {
  if (revealObserver) {
    revealObserver.observe(element);
  } else {
    element.classList.add("is-visible");
  }
});

countupElements.forEach((element) => {
  if (revealObserver) {
    revealObserver.observe(element);
  } else {
    runCountup(element);
  }
});

if (agendaFilters.length && agendaItems.length) {
  agendaFilters.forEach((filterButton) => {
    filterButton.addEventListener("click", () => {
      const selectedFilter = filterButton.dataset.filter;

      agendaFilters.forEach((button) => button.classList.remove("is-active"));
      filterButton.classList.add("is-active");

      agendaItems.forEach((item) => {
        const tracks = (item.dataset.track || "").split(" ");
        const shouldShow = selectedFilter === "all" || tracks.includes(selectedFilter);
        item.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });
}

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    const expanded = button.getAttribute("aria-expanded") === "true";

    faqButtons.forEach((otherButton) => {
      otherButton.setAttribute("aria-expanded", "false");
      const otherAnswer = otherButton.nextElementSibling;
      if (otherAnswer) {
        otherAnswer.classList.remove("is-open");
      }
    });

    if (!expanded) {
      button.setAttribute("aria-expanded", "true");
      if (answer) {
        answer.classList.add("is-open");
      }
    }
  });
});

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
    organization: {
      validate: (value) => value.trim().length >= 2,
      message: "Please add your school or organisation."
    },
    role: {
      validate: (value) => value.trim() !== "",
      message: "Please choose how you are attending."
    },
    interest: {
      validate: (value) => value.trim() !== "",
      message: "Please select a track."
    }
  };

  const setFieldState = (field, message = "") => {
    const label = field.closest("label");
    const errorNode = label ? label.querySelector(".field-error") : null;

    if (label) {
      label.classList.toggle("is-invalid", Boolean(message));
    }

    if (errorNode) {
      errorNode.textContent = message;
    }
  };

  try {
    const savedSubmission = window.localStorage.getItem(STORAGE_KEY);

    if (savedSubmission) {
      const parsedSubmission = JSON.parse(savedSubmission);
      Object.entries(parsedSubmission).forEach(([fieldName, value]) => {
        const field = registrationForm.elements.namedItem(fieldName);
        if (field && typeof value === "string") {
          field.value = value;
        }
      });
    }
  } catch (error) {
    console.warn("Unable to load saved registration details.", error);
  }

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

      if (!isValid && !firstInvalidField) {
        firstInvalidField = field;
      }
    });

    if (firstInvalidField) {
      feedback.textContent = "Please fix the highlighted fields and try again.";
      feedback.classList.add("is-error");
      firstInvalidField.focus();
      return;
    }

    const submission = {
      fullName: String(formData.get("fullName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      organization: String(formData.get("organization") || "").trim(),
      role: String(formData.get("role") || "").trim(),
      interest: String(formData.get("interest") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
      savedAt: new Date().toISOString()
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submission));
    } catch (error) {
      console.warn("Unable to save registration details.", error);
    }

    feedback.textContent = `Thanks, ${submission.fullName}. You are on the interest list for the ${submission.interest} track.`;
    feedback.classList.add("is-success");
    registrationForm.reset();

    registrationForm.querySelectorAll("label").forEach((label) => {
      label.classList.remove("is-invalid");
      const errorNode = label.querySelector(".field-error");
      if (errorNode) {
        errorNode.textContent = "";
      }
    });
  });
}

const sectionLinks = [...navLinks];
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && observedSections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const activeId = `#${entry.target.id}`;
      sectionLinks.forEach((link) => {
        link.classList.toggle("is-current", link.getAttribute("href") === activeId);
      });
    });
  }, {
    rootMargin: "-35% 0px -45% 0px",
    threshold: 0.1
  });

  observedSections.forEach((section) => navObserver.observe(section));
}
