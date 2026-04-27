document.documentElement.classList.add("js-enabled");

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const countdownRoot = document.querySelector("[data-countdown]");
const revealElements = document.querySelectorAll("[data-reveal]");
const faqButtons = document.querySelectorAll(".faq-question");
const footerYear = document.querySelector("#footer-year");
const copyLinkButton = document.querySelector("[data-copy-link]");
const linkFeedback = document.querySelector("#register-link-feedback");

if (footerYear) {
  footerYear.textContent = `Event Build ${new Date().getFullYear()}`;
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

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

if (revealElements.length) {
  const showElement = (element) => {
    element.classList.add("is-visible");

    if (element.hasAttribute("data-countup")) {
      runCountup(element);
    }

    element.querySelectorAll("[data-countup]").forEach((child) => {
      runCountup(child);
    });
  };

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        showElement(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      showElement(element);
    });
  }
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

if (copyLinkButton && linkFeedback) {
  const fallbackCopy = (value) => {
    const tempField = document.createElement("textarea");
    tempField.value = value;
    tempField.setAttribute("readonly", "");
    tempField.style.position = "absolute";
    tempField.style.left = "-9999px";
    document.body.appendChild(tempField);
    tempField.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(tempField);
    return copied;
  };

  copyLinkButton.addEventListener("click", async () => {
    const registrationUrl = copyLinkButton.dataset.copyLink || "";

    if (!registrationUrl) {
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(registrationUrl);
      } else if (!fallbackCopy(registrationUrl)) {
        throw new Error("Copy command is unavailable.");
      }

      linkFeedback.textContent = "Registration link copied.";
      linkFeedback.className = "form-feedback is-success";
    } catch (error) {
      console.warn("Unable to copy the registration link.", error);
      linkFeedback.textContent = "Copy failed. Use the public link shown above.";
      linkFeedback.className = "form-feedback is-error";
    }
  });
}
