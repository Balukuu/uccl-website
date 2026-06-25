/* ============================================================
   UCCL — slider.js
   Hero image slider: autoplay, crossfade, arrows, dots,
   swipe support, Ken Burns, word-split stagger
   ============================================================ */
(function () {
  "use strict";

  function HeroSlider(root) {
    this.root = root;
    this.slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    this.dotsWrap = root.querySelector(".hero-dots");
    this.prevBtn = root.querySelector(".hero-arrow--prev");
    this.nextBtn = root.querySelector(".hero-arrow--next");
    this.index = 0;
    this.timer = null;
    this.delay = 5000;
    this.touchX = null;

    if (this.slides.length === 0) return;

    this.buildDots();
    this.splitWords();
    this.bind();
    this.show(0);
    this.start();
  }

  HeroSlider.prototype.buildDots = function () {
    if (!this.dotsWrap) return;
    var self = this;
    this.slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Go to slide " + (i + 1));
      b.addEventListener("click", function () { self.goTo(i); });
      self.dotsWrap.appendChild(b);
    });
    this.dots = Array.prototype.slice.call(this.dotsWrap.children);
  };

  HeroSlider.prototype.splitWords = function () {
    this.slides.forEach(function (slide) {
      var title = slide.querySelector(".hero-title");
      if (!title || title.dataset.split) return;
      var words = title.textContent.trim().split(/\s+/);
      title.textContent = "";
      words.forEach(function (w, i) {
        var span = document.createElement("span");
        span.className = "word";
        span.textContent = w;
        span.style.animationDelay = (0.15 + i * 0.08) + "s";
        title.appendChild(span);
        title.appendChild(document.createTextNode(" "));
      });
      title.dataset.split = "1";
    });
  };

  HeroSlider.prototype.replayWords = function (slide) {
    var words = slide.querySelectorAll(".hero-title .word");
    words.forEach(function (w) {
      w.style.animation = "none";
      // force reflow
      void w.offsetWidth;
      w.style.animation = "";
    });
  };

  HeroSlider.prototype.show = function (i) {
    var self = this;
    this.slides.forEach(function (s, n) {
      s.classList.toggle("active", n === i);
      if (self.dots) self.dots[n].classList.toggle("active", n === i);
    });
    this.replayWords(this.slides[i]);
    this.index = i;
  };

  HeroSlider.prototype.goTo = function (i) {
    var len = this.slides.length;
    this.show(((i % len) + len) % len);
    this.restart();
  };

  HeroSlider.prototype.next = function () { this.goTo(this.index + 1); };
  HeroSlider.prototype.prev = function () { this.goTo(this.index - 1); };

  HeroSlider.prototype.start = function () {
    var self = this;
    this.stop();
    this.timer = setInterval(function () { self.next(); }, this.delay);
  };
  HeroSlider.prototype.stop = function () {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  };
  HeroSlider.prototype.restart = function () { this.start(); };

  HeroSlider.prototype.bind = function () {
    var self = this;
    if (this.nextBtn) this.nextBtn.addEventListener("click", function () { self.next(); });
    if (this.prevBtn) this.prevBtn.addEventListener("click", function () { self.prev(); });

    this.root.addEventListener("mouseenter", function () { self.stop(); });
    this.root.addEventListener("mouseleave", function () { self.start(); });

    // Touch swipe
    this.root.addEventListener("touchstart", function (e) {
      self.touchX = e.changedTouches[0].clientX;
      self.stop();
    }, { passive: true });
    this.root.addEventListener("touchend", function (e) {
      if (self.touchX === null) return;
      var dx = e.changedTouches[0].clientX - self.touchX;
      if (Math.abs(dx) > 50) { dx < 0 ? self.next() : self.prev(); }
      self.touchX = null;
      self.start();
    }, { passive: true });

    // Pause when tab hidden
    document.addEventListener("visibilitychange", function () {
      document.hidden ? self.stop() : self.start();
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    var hero = document.querySelector(".hero");
    if (hero) new HeroSlider(hero);
  });
})();
