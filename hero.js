(function () {
  "use strict";

  var TARGET = ".cinematic-hero";
  var MOUNTED_FLAG = "data-adh-mounted";

  var BASE = "https://cdn.jsdelivr.net/gh/zakiashoqullah0-gif/salla-hero@main/assets/";

  var LOGO = BASE + "logo.png";

  // === All 3 scenes defined here ===
  var SCENES = [
    {
      productSrc: BASE + "printer.png",
      productAlt: "Epson Printer",
      eyebrow: "الطباعة الاحترافية",
      headline: "اطبع أفكارك بدقة لا مثيل لها",
      sub: "طابعات إبسون الأصلية بأحبار إيكوتانك، جودة استوديو في منزلك أو مشروعك.",
      ctaText: "تسوق الطابعات",
      ctaHref: "/categories"
    },
    {
      productSrc: BASE + "heatpress.png",
      productAlt: "Heat Press",
      eyebrow: "النقل الحراري",
      headline: "صمّم. اضغط. ارتدِ.",
      sub: "مكابس حرارية احترافية لطباعة التيشيرتات والأكواب والإكسسوارات بنتائج تدوم.",
      ctaText: "تسوق المكابس الحرارية",
      ctaHref: "/categories"
    },
    {
      productSrc: BASE + "cameo.png",
      productAlt: "Silhouette Cameo",
      eyebrow: "القص الذكي",
      headline: "إبداعك يتشكّل بضغطة واحدة",
      sub: "قاطعات سيلويت كاميو 5 لتنفيذ مشاريعك الإبداعية بدقة احترافية.",
      ctaText: "تسوق قاطعات كاميو",
      ctaHref: "/categories"
    }
  ];

  function buildSceneHTML(scene, index) {
    return (
      '<div class="adh-scene" data-scene="' + (index + 1) + '">' +
        '<div class="adh-glow"></div>' +
        '<div class="adh-stage">' +
          '<img class="adh-product" src="' + scene.productSrc + '" alt="' + scene.productAlt + '">' +
        '</div>' +
        '<div class="adh-floor-shadow"></div>' +
        '<div class="adh-content">' +
          '<p class="adh-eyebrow">' + scene.eyebrow + '</p>' +
          '<h1 class="adh-headline">' + scene.headline + '</h1>' +
          '<p class="adh-sub">' + scene.sub + '</p>' +
          '<a class="adh-cta" href="' + scene.ctaHref + '">' + scene.ctaText + '</a>' +
        '</div>' +
      '</div>'
    );
  }

  function buildHTML() {
    var bgs = '';
    var scenes = '';
    var dots = '';

    for (var i = 0; i < SCENES.length; i++) {
      bgs += '<div class="adh-bg" data-scene="' + (i + 1) + '"></div>';
      scenes += buildSceneHTML(SCENES[i], i);
      dots += '<div class="adh-progress-dot' + (i === 0 ? ' is-active' : '') + '"></div>';
    }

    return (
      '<div class="adh-root">' +
        '<div class="adh-wrapper">' +
          bgs +
          '<img class="adh-logo" src="' + LOGO + '" alt="ADOOSH">' +
          scenes +
          '<div class="adh-progress">' + dots + '</div>' +
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
    var progress = root.querySelector('.adh-progress');
    var bgs = Array.prototype.slice.call(root.querySelectorAll('.adh-bg'));
    var scenes = Array.prototype.slice.call(root.querySelectorAll('.adh-scene'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.adh-progress-dot'));

    console.log('[adh] init complete, scenes:', scenes.length);

    // Collect per-scene refs
    var sceneRefs = scenes.map(function (sceneEl) {
      return {
        el: sceneEl,
        glow: sceneEl.querySelector('.adh-glow'),
        product: sceneEl.querySelector('.adh-product'),
        floorShadow: sceneEl.querySelector('.adh-floor-shadow'),
        eyebrow: sceneEl.querySelector('.adh-eyebrow'),
        headline: sceneEl.querySelector('.adh-headline'),
        sub: sceneEl.querySelector('.adh-sub'),
        cta: sceneEl.querySelector('.adh-cta')
      };
    });

    // === Initial state for all scenes ===
    sceneRefs.forEach(function (s, i) {
      gsap.set(s.product, { y: 80, scale: 0.85, rotateY: -15, opacity: 0 });
      gsap.set(s.glow, { scale: 0.6, opacity: 0 });
      gsap.set(s.floorShadow, { scaleX: 0.5, opacity: 0 });
      gsap.set([s.eyebrow, s.headline, s.sub, s.cta], { y: 30, opacity: 0, filter: 'blur(8px)' });
    });
    gsap.set(logo, { y: -20, opacity: 0 });
    gsap.set(progress, { opacity: 0 });

    // Show scene 1 by default
    gsap.set(scenes[0], { opacity: 1 });

    var floatingTweens = [];

    // === Per-scene entry choreography ===
    function playSceneEntry(index) {
      var s = sceneRefs[index];
      var tl = gsap.timeline();

      tl.to(s.glow, { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0);
      tl.to(s.floorShadow, { opacity: 1, scaleX: 1, duration: 1.2, ease: 'power3.out' }, 0.2);
      tl.to(s.product, {
        y: 0, scale: 1, rotateY: 0, opacity: 1,
        duration: 1.4, ease: 'power3.out'
      }, 0.1);
      tl.to(s.eyebrow, {
        y: 0, opacity: 1, filter: 'blur(0px)',
        duration: 0.8, ease: 'power2.out'
      }, 0.7);
      tl.to(s.headline, {
        y: 0, opacity: 1, filter: 'blur(0px)',
        duration: 0.9, ease: 'power2.out'
      }, 0.85);
      tl.to(s.sub, {
        y: 0, opacity: 1, filter: 'blur(0px)',
        duration: 0.8, ease: 'power2.out'
      }, 1);
      tl.to(s.cta, {
        y: 0, opacity: 1,
        duration: 0.7, ease: 'power2.out'
      }, 1.15);

      // Continuous float
      tl.add(function () {
        var floatT = gsap.to(s.product, {
          y: -12, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1
        });
        var shadowT = gsap.to(s.floorShadow, {
          scaleX: 0.85, opacity: 0.7, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1
        });
        floatingTweens[index] = [floatT, shadowT];
      }, 1.3);
    }

    // Logo + progress fade-in (always visible)
    function playInitial() {
      gsap.to(logo, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.2 });
      gsap.to(progress, { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.4 });
      playSceneEntry(0);
    }

    setTimeout(playInitial, 200);

    // === Master scroll: 3 viewports total ===
    var currentScene = 0;

    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: '+=300%',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      onUpdate: function (self) {
        var p = self.progress; // 0 to 1
        var localProgress = (p * SCENES.length) % 1; // progress within current scene 0..1
        var sceneIndex = Math.min(Math.floor(p * SCENES.length), SCENES.length - 1);

        // Crossfade backgrounds
        bgs.forEach(function (bg, i) {
          var dist = Math.abs((p * (SCENES.length - 1)) - i);
          var opacity = Math.max(0, 1 - dist);
          gsap.set(bg, { opacity: opacity });
        });

        // Update active scene visibility (with crossfade)
        scenes.forEach(function (sc, i) {
          var dist = Math.abs((p * SCENES.length) - (i + 0.5));
          var visibility = i === sceneIndex ? 1 : (dist < 0.7 ? 1 - dist : 0);
          gsap.set(sc, { opacity: Math.max(0, Math.min(1, visibility)) });
        });

        // Update active dot
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === sceneIndex);
        });

        // Detect scene change → trigger entry animation for new scene
        if (sceneIndex !== currentScene) {
          currentScene = sceneIndex;

          // Reset incoming scene to entry state
          var s = sceneRefs[sceneIndex];
          gsap.set(s.product, { y: 80, scale: 0.85, rotateY: -15, opacity: 0 });
          gsap.set(s.glow, { scale: 0.6, opacity: 0 });
          gsap.set(s.floorShadow, { scaleX: 0.5, opacity: 0 });
          gsap.set([s.eyebrow, s.headline, s.sub, s.cta], { y: 30, opacity: 0, filter: 'blur(8px)' });

          // Stop float on previous scene
          if (floatingTweens[sceneIndex]) {
            floatingTweens[sceneIndex].forEach(function (t) { t.kill(); });
          }

          playSceneEntry(sceneIndex);
        }

        // Within-scene scroll-driven exit on the OUTGOING scene
        // (subtle drift as user scrolls past mid-point of scene)
        if (sceneIndex < SCENES.length - 1) {
          var nextSceneTransition = localProgress; // 0 = scene start, 1 = scene end
          if (nextSceneTransition > 0.5) {
            var exitProgress = (nextSceneTransition - 0.5) * 2; // 0..1
            var s = sceneRefs[sceneIndex];
            gsap.set(s.product, { y: -exitProgress * 60, scale: 1 - exitProgress * 0.1 });
            gsap.set([s.eyebrow, s.headline, s.sub, s.cta], { y: exitProgress * 30 });
          }
        }
      }
    });

    console.log('[adh] all 3 acts ready');
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

  console.log('[adh] 3-act v1 loaded');
})();
