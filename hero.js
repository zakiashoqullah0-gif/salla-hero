(function () {
  "use strict";

  var TARGET = ".cinematic-hero";
  var MOUNTED_FLAG = "data-adh-mounted";

  // === ASSET URLS ===
  var ASSETS = {
    printer: "https://cdn.jsdelivr.net/gh/zakiashoqullah0-gif/salla-hero@main/assets/printer.png",
    logo: "https://cdn.jsdelivr.net/gh/zakiashoqullah0-gif/salla-hero@main/assets/logo.png"
  };

  // === ACT 1 COPY ===
  var SCENE = {
    eyebrow: "الطباعة الاحترافية",
    headline: "اطبع أفكارك بدقة لا مثيل لها",
    sub: "طابعات إبسون الأصلية بأحبار EcoTank، جودة استوديو في منزلك أو مشروعك.",
    ctaText: "تسوق الطابعات",
    ctaHref: "/categories"
  };

  function buildHTML() {
    return (
      '<div class="adh-root">' +
        '<div class="adh-wrapper">' +
          '<img class="adh-logo" src="' + ASSETS.logo + '" alt="ADOOSH">' +
          '<div class="adh-glow"></div>' +
          '<div class="adh-stage">' +
            '<img class="adh-product" src="' + ASSETS.printer + '" alt="Epson Printer">' +
          '</div>' +
          '<div class="adh-floor-shadow"></div>' +
          '<div class="adh-content">' +
            '<p class="adh-eyebrow">' + SCENE.eyebrow + '</p>' +
            '<h1 class="adh-headline">' + SCENE.headline + '</h1>' +
            '<p class="adh-sub">' + SCENE.sub + '</p>' +
            '<a class="adh-cta" href="' + SCENE.ctaHref + '">' + SCENE.ctaText + '</a>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function loadGSAP() {
    return new Promise(function (resolve, reject) {
      if (window.gsap && window.ScrollTrigger) return resolve();
      var s1 = document.createElement('script');
      s1.src = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
      s1.onload = function () {
        var s2 = document.createElement('script');
        s2.src = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js';
        s2.onload = resolve;
        s2.onerror = reject;
        document.head.appendChild(s2);
      };
      s1.onerror = reject;
      document.head.appendChild(s1);
    });
  }

  function injectRoot(el) {
    var existing = el.querySelector(':scope > .adh-root');
    if (existing) existing.remove();

    Array.prototype.forEach.call(el.children, function (child) {
      if (!child.classList.contains('adh-root')) {
        child.style.display = 'none';
      }
    });

    el.insertAdjacentHTML('beforeend', buildHTML());
    return el.querySelector(':scope > .adh-root');
  }

  function mount(el) {
    if (el.hasAttribute(MOUNTED_FLAG)) return;
    el.setAttribute(MOUNTED_FLAG, 'true');

    console.log('[adh] mounting onto', el);
    var root = injectRoot(el);

    var watcher = new MutationObserver(function () {
      if (!el.querySelector(':scope > .adh-root')) {
        console.warn('[adh] content wiped, re-injecting');
        var newRoot = injectRoot(el);
        loadGSAP().then(function () { init(el, newRoot); });
      }
    });
    watcher.observe(el, { childList: true });

    loadGSAP().then(function () {
      init(el, root);
    }).catch(function (err) {
      console.error('[adh] GSAP failed:', err);
    });
  }

  function init(el, root) {
    if (root.hasAttribute('data-adh-init')) return;
    root.setAttribute('data-adh-init', 'true');

    gsap.registerPlugin(ScrollTrigger);

    var wrapper = root.querySelector('.adh-wrapper');
    var logo = root.querySelector('.adh-logo');
    var glow = root.querySelector('.adh-glow');
    var product = root.querySelector('.adh-product');
    var floorShadow = root.querySelector('.adh-floor-shadow');
    var eyebrow = root.querySelector('.adh-eyebrow');
    var headline = root.querySelector('.adh-headline');
    var sub = root.querySelector('.adh-sub');
    var cta = root.querySelector('.adh-cta');

    console.log('[adh] init complete, wrapper:', wrapper.offsetWidth, 'x', wrapper.offsetHeight);

    // === Initial state (everything hidden, product slightly below + scaled) ===
    gsap.set(product, { y: 80, scale: 0.85, rotateY: -15, opacity: 0 });
    gsap.set(glow, { scale: 0.6, opacity: 0 });
    gsap.set(floorShadow, { scaleX: 0.5, opacity: 0 });
    gsap.set(logo, { y: -20, opacity: 0 });
    gsap.set([eyebrow, headline, sub, cta], { y: 30, opacity: 0, filter: 'blur(8px)' });

    // === Entry animation timeline ===
    function playEntry() {
      var tl = gsap.timeline();

      tl.to(logo, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power2.out'
      }, 0);

      tl.to(glow, {
        opacity: 1, scale: 1, duration: 1.6, ease: 'power2.out'
      }, 0.1);

      tl.to(floorShadow, {
        opacity: 1, scaleX: 1, duration: 1.4, ease: 'power3.out'
      }, 0.3);

      tl.to(product, {
        y: 0, scale: 1, rotateY: 0, opacity: 1,
        duration: 1.6, ease: 'power3.out'
      }, 0.2);

      tl.to(eyebrow, {
        y: 0, opacity: 1, filter: 'blur(0px)',
        duration: 0.9, ease: 'power2.out'
      }, 0.9);

      tl.to(headline, {
        y: 0, opacity: 1, filter: 'blur(0px)',
        duration: 1, ease: 'power2.out'
      }, 1.05);

      tl.to(sub, {
        y: 0, opacity: 1, filter: 'blur(0px)',
        duration: 0.9, ease: 'power2.out'
      }, 1.25);

      tl.to(cta, {
        y: 0, opacity: 1,
        duration: 0.8, ease: 'power2.out'
      }, 1.45);

      // Continuous floating motion on product (after entry)
      tl.add(function () {
        gsap.to(product, {
          y: -12,
          duration: 3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1
        });
        gsap.to(floorShadow, {
          scaleX: 0.85,
          opacity: 0.7,
          duration: 3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1
        });
      }, 1.6);
    }

    setTimeout(playEntry, 200);

    // === Scroll-driven scene exit (prep for Act 2) ===
    // For now, the scene just pins for one viewport then releases
    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: '+=100%',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      onUpdate: function (self) {
        var p = self.progress;

        // Product drifts up + fades + scales as user scrolls
        gsap.set(product, {
          y: -p * 100,
          scale: 1 - p * 0.15,
          opacity: 1 - p * 0.6
        });

        // Glow expands + fades
        gsap.set(glow, {
          scale: 1 + p * 0.5,
          opacity: 1 - p * 0.7
        });

        // Floor shadow shrinks + fades
        gsap.set(floorShadow, {
          scaleX: 1 - p * 0.4,
          opacity: 0.7 * (1 - p)
        });

        // Text drifts down + fades
        gsap.set([eyebrow, headline, sub, cta], {
          y: p * 40,
          opacity: 1 - p * 0.8
        });
      }
    });

    console.log('[adh] act 1 ready');
  }

  function scan() {
    document.querySelectorAll(TARGET).forEach(mount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  }
  setTimeout(scan, 100);
  setTimeout(scan, 500);
  setTimeout(scan, 1500);

  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      muts[i].addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.matches && n.matches(TARGET)) mount(n);
        if (n.querySelectorAll) n.querySelectorAll(TARGET).forEach(mount);
      });
    }
  }).observe(document.body, { childList: true, subtree: true });

  console.log('[adh] act-1 v1 loaded');
})();
