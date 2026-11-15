/* ==========================================================================
   Fluid Directional Arrow Cursor (Inspired by arunnm.com / The Ride)
   ==========================================================================
   A single-element fluid arrow cursor that points in the direction of mouse
   movement and elastically stretches along the velocity vector using Math.atan2.
   Over interactive elements, it smoothly morphs into an expanded circle.
   ========================================================================== */

(function () {
  'use strict';

  // Guard: Touchscreen / mobile devices have no mouse hover; bail out cleanly
  if (window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches) {
    return;
  }

  var root = document.documentElement;

  // Create cursor DOM elements
  var wrap = document.createElement('div');
  wrap.className = 'custom-cursor__ring-wrap';
  wrap.setAttribute('aria-hidden', 'true');

  var ring = document.createElement('div');
  ring.className = 'custom-cursor__ring';
  wrap.appendChild(ring);

  // Soft, subtle trail dot pool (fixed pool of 14 elements for 60fps GPU smoothness)
  var TRAIL_COUNT = 14;
  var trailDots = [];
  var trailWrap = document.createElement('div');
  trailWrap.className = 'custom-cursor__trail-wrap';
  trailWrap.setAttribute('aria-hidden', 'true');

  for (var i = 0; i < TRAIL_COUNT; i++) {
    var dotEl = document.createElement('div');
    dotEl.className = 'custom-cursor__trail-dot';
    trailWrap.appendChild(dotEl);
    trailDots.push({ el: dotEl, x: -100, y: -100, alpha: 0, size: 2.2 });
  }

  function mount() {
    if (!document.body.contains(trailWrap)) {
      document.body.appendChild(trailWrap);
    }
    if (!document.body.contains(wrap)) {
      document.body.appendChild(wrap);
      root.classList.add('has-custom-cursor');
    }
    tick();
  }

  // Mouse & Ring Physics State
  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var ringPos = { x: mouse.x, y: mouse.y };
  var hasFirstMove = false;
  var dotIdx = 0;
  var lastEmitX = mouse.x;
  var lastEmitY = mouse.y;

  // Spring & Elasticity Tuning (matched to arunnm.com)
  var LERP_RING = 0.18;
  var MAX_GAP = 120;
  var MAX_STRETCH = 0.38;
  var MAX_SQUISH = 0.20;
  var lastAngle = 0;

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Pointer position tracking
  document.addEventListener('pointermove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!hasFirstMove) {
      ringPos.x = mouse.x;
      ringPos.y = mouse.y;
      lastEmitX = mouse.x;
      lastEmitY = mouse.y;
      hasFirstMove = true;
      document.body.classList.remove('cursor-hidden');
    }
  }, { passive: true });

  // Interactive Elements Selector for Hover Morph (Clickable items only)
  var HOVER_SELECTOR = [
    'a[href]',
    'button',
    '[role="button"]',
    '[role="tab"]',
    '.folder-item',
    '.taskbar-start-btn',
    '.win-btn',
    '.your-move-send-btn',
    '.search-result-item',
    '.category-item-card',
    '.outputs-card',
    '.outputs-scroll-cue',
    '.category-back-btn',
    '.category-close-x',
    '.start-pill-btn',
    '.details-link-pill',
    'label[for]',
    'input[type="submit"]',
    'input[type="button"]',
    '[data-cursor="hover"]'
  ].join(',');

  function isInteractive(el) {
    if (!el || !el.closest) return false;
    // Don't trigger on scroll containers or explicitly excluded items
    if (el.closest('.window-viewport-body, .start-menu-scrollable, [data-cursor="none"]') === el) {
      return false;
    }
    var interactive = el.closest(HOVER_SELECTOR);
    if (!interactive) return false;
    // Extra safety: if matched element is a scrollable viewport container, do not treat as interactive
    if (interactive.id === 'outputs-viewport' || interactive.classList.contains('outputs-viewport-body') || interactive.classList.contains('start-menu-scrollable')) {
      return false;
    }
    return true;
  }

  function isTextField(el) {
    if (!el || !el.closest) return false;
    return !!el.closest('input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]');
  }

  document.addEventListener('pointerover', function (e) {
    document.body.classList.remove('cursor-hidden');
    if (isInteractive(e.target)) {
      ring.classList.add('is-hovering');
    }
    if (isTextField(e.target)) {
      ring.classList.add('is-typing');
    }
  });

  document.addEventListener('pointerout', function (e) {
    var from = e.target;
    var to = e.relatedTarget;
    if (isInteractive(from) && !isInteractive(to)) {
      ring.classList.remove('is-hovering');
    }
    if (isTextField(from) && !isTextField(to)) {
      ring.classList.remove('is-typing');
    }
  });

  // Window Visibility & Mouse Boundary Handling
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      document.body.classList.add('cursor-hidden');
    } else {
      document.body.classList.remove('cursor-hidden');
    }
  });

  document.addEventListener('mouseleave', function () {
    document.body.classList.add('cursor-hidden');
  });

  document.addEventListener('mouseenter', function () {
    document.body.classList.remove('cursor-hidden');
  });

  // RAF Animation Loop
  function tick() {
    // Spring-lerp cursor position toward target mouse coordinates
    ringPos.x += (mouse.x - ringPos.x) * LERP_RING;
    ringPos.y += (mouse.y - ringPos.y) * LERP_RING;

    wrap.style.transform = 'translate3d(' + ringPos.x + 'px,' + ringPos.y + 'px,0)';

    if (!prefersReducedMotion) {
      var dx = mouse.x - ringPos.x;
      var dy = mouse.y - ringPos.y;
      var gap = Math.hypot(dx, dy);

      // Only update angle when moving with a noticeable threshold to avoid micro-jitter
      if (gap > 1.2) {
        lastAngle = Math.atan2(dy, dx);
      }

      var t = Math.min(gap / MAX_GAP, 1);
      var stretch = 1 + t * MAX_STRETCH;
      var squish = 1 - t * MAX_SQUISH;

      ring.style.transform = 'rotate(' + lastAngle + 'rad) scale(' + stretch + ',' + squish + ')';

      // Soft, subtle trail emission & decay (never distracting, noticeable only when focused)
      var isHovering = ring.classList.contains('is-hovering');
      var isTyping = ring.classList.contains('is-typing');
      var isHidden = document.body.classList.contains('cursor-hidden');

      if (!isHovering && !isTyping && !isHidden && hasFirstMove) {
        var emitDist = Math.hypot(ringPos.x - lastEmitX, ringPos.y - lastEmitY);
        if (emitDist > 6 && gap > 1.8) {
          // Emit from the tail of the arrow
          var tailOffset = 5;
          var spawnX = ringPos.x - Math.cos(lastAngle) * tailOffset;
          var spawnY = ringPos.y - Math.sin(lastAngle) * tailOffset;

          var dot = trailDots[dotIdx];
          dot.x = spawnX;
          dot.y = spawnY;
          // Very soft subtle opacity: 0.22 max
          dot.alpha = 0.22;
          dot.size = 2.2;
          dotIdx = (dotIdx + 1) % TRAIL_COUNT;

          lastEmitX = ringPos.x;
          lastEmitY = ringPos.y;
        }
      }

      // Smooth decay of trail dots (dissolves cleanly in ~200ms when mouse stops)
      for (var d = 0; d < TRAIL_COUNT; d++) {
        var td = trailDots[d];
        if (td.alpha > 0.005) {
          td.alpha *= 0.85;
          td.size *= 0.95;
          td.el.style.transform = 'translate3d(' + (td.x - td.size / 2).toFixed(1) + 'px,' + (td.y - td.size / 2).toFixed(1) + 'px,0)';
          td.el.style.opacity = td.alpha.toFixed(3);
          td.el.style.width = td.size.toFixed(1) + 'px';
          td.el.style.height = td.size.toFixed(1) + 'px';
        } else if (td.alpha > 0) {
          td.alpha = 0;
          td.el.style.opacity = '0';
        }
      }
    } else {
      ring.style.transform = '';
    }

    requestAnimationFrame(tick);
  }

  // Mount when document is ready
  if (document.body) {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount);
  }
})();

