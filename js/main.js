/* ============================================================
   UCCL — main.js
   navbar scroll, top-bar hide, mobile menu, dropdowns,
   back-to-top, cookie banner, smooth scroll, image fallback
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Navbar scroll + top bar hide/show ---------- */
  var navWrap = document.querySelector(".nav-wrap");
  var topbar = document.querySelector(".topbar");
  var lastScroll = 0;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (navWrap) {
      navWrap.classList.toggle("scrolled", y > 80);
    }

    // Top bar: hide on scroll down, show on scroll up
    if (topbar) {
      if (y > lastScroll && y > 120) {
        topbar.classList.add("hide");
      } else {
        topbar.classList.remove("hide");
      }
    }

    // Back to top
    if (backTop) {
      backTop.classList.toggle("show", y > 500);
    }

    lastScroll = y <= 0 ? 0 : y;
  }

  /* ---------- Back to top ---------- */
  var backTop = document.querySelector(".back-top");
  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var hamburger = document.querySelector(".hamburger");
  var mobileMenu = document.querySelector(".mobile-menu");
  var overlay = document.querySelector(".menu-overlay");

  function setMenu(open) {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.toggle("menu-open", open);
    hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    mobileMenu.classList.toggle("open", open);
    if (overlay) overlay.classList.toggle("show", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      setMenu(!mobileMenu.classList.contains("open"));
    });
  }
  if (overlay) overlay.addEventListener("click", function () { setMenu(false); });

  // Close mobile menu on link click
  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  // Mobile submenu accordion
  document.querySelectorAll(".m-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var sub = btn.nextElementSibling;
      var open = sub.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- Desktop dropdowns (hover + click + keyboard) ---------- */
  document.querySelectorAll(".has-dropdown").forEach(function (dd) {
    var toggle = dd.querySelector(".dropdown-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      var open = dd.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Keyboard: close on Escape
    dd.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        dd.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  });

  // Close dropdowns on outside click
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".has-dropdown.open").forEach(function (dd) {
      if (!dd.contains(e.target)) {
        dd.classList.remove("open");
        var t = dd.querySelector(".dropdown-toggle");
        if (t) t.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === "#" || href.length < 2) return;
    link.addEventListener("click", function (e) {
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  });

  /* ---------- Cookie banner ---------- */
  var cookie = document.querySelector(".cookie-banner");
  if (cookie) {
    if (!localStorage.getItem("ucclCookies")) {
      setTimeout(function () { cookie.classList.add("show"); }, 1200);
    }
    var acceptBtn = cookie.querySelector(".cookie-accept");
    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        localStorage.setItem("ucclCookies", "accepted");
        cookie.classList.add("dismiss");
        cookie.classList.remove("show");
      });
    }
  }

  /* ---------- Image fallback ---------- */
  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.classList.add("img-error");
      img.alt = img.alt || "Image unavailable";
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = document.querySelector(".contact-form");
  if (form) {
    var success = document.querySelector(".form-success");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showError(field, msg) {
      var input = form.querySelector('[name="' + field + '"]');
      if (!input) return;
      input.classList.add("invalid");
      input.setAttribute("aria-invalid", "true");
      var err = input.parentNode.querySelector(".error-msg");
      if (err) { err.textContent = msg; err.classList.add("show"); }
    }
    function clearError(input) {
      input.classList.remove("invalid");
      input.removeAttribute("aria-invalid");
      var err = input.parentNode.querySelector(".error-msg");
      if (err) err.classList.remove("show");
    }

    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("input", function () { clearError(el); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var firstInvalid = null;

      function fail(name, msg) {
        ok = false;
        showError(name, msg);
        if (!firstInvalid) firstInvalid = form.querySelector('[name="' + name + '"]');
      }

      var name = form.elements["name"].value.trim();
      var email = form.elements["email"].value.trim();
      var phone = form.elements["phone"].value.trim();
      var subject = form.elements["subject"].value.trim();
      var message = form.elements["message"].value.trim();

      if (!name) fail("name", "Please enter your full name.");
      if (!email) fail("email", "Please enter your email address.");
      else if (!emailRe.test(email)) fail("email", "Please enter a valid email address.");
      if (!phone) fail("phone", "Please enter your phone number.");
      else if (phone.replace(/\D/g, "").length < 7) fail("phone", "Please enter a valid phone number.");
      if (!subject) fail("subject", "Please add a subject.");
      if (!message) fail("message", "Please write your message.");

      if (!ok) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Success state
      form.style.display = "none";
      if (success) {
        success.classList.add("show");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
      form.reset();
    });
  }

  /* ---------- Footer year (safety, spec mandates 2026) ---------- */
  // Copyright is hard-coded to 2026 per brand spec; no dynamic year.
})();
