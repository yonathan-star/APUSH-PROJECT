/* ============================================================
   AMERICA AT WAR WITH ITSELF — Presentation Engine
   APUSH 2026 | Vietnam War Multimedia Presentation
   ============================================================ */

(function () {
  'use strict';

  /* ── State ── */
  const state = {
    current: 0,
    total: 0,
    transitioning: false,
    autoplay: false,
    autoplayTimer: null,
    autoplayDelay: 12000, // ms per scene (12 seconds default)
    fullscreen: false,
  };

  /* ── Scene timing overrides (scene index → ms) ── */
  const sceneTimings = {
    0:  5000,  // Title card — linger
    1:  9000,  // Prologue
    2:  10000, // Lyric intro
    3:  11000, // Draft overview
    4:  11000, // Deferments
    5:  10000, // Statistics
    6:  8000,  // Act II break
    7:  11000, // Vietnam reality
    8:  11000, // Television war
    9:  12000, // Credibility gap
    10: 8000,  // Act III break
    11: 12000, // Tet Offensive
    12: 12000, // Anti-war protests
    13: 12000, // Kent State
    14: 12000, // Pentagon Papers
    15: 8000,  // Act IV break
    16: 12000, // Veterans return
    17: 12000, // National wound
    18: 14000, // Reflection/thesis
    19: 0,     // Credits — stay forever (no auto-advance)
  };

  /* ── DOM references ── */
  let scenes, counter, prevBtn, nextBtn, progressBar, fullscreenBtn;

  /* ── Init ── */
  function init() {
    scenes       = Array.from(document.querySelectorAll('.scene'));
    counter      = document.getElementById('scene-counter');
    prevBtn      = document.getElementById('btn-prev');
    nextBtn      = document.getElementById('btn-next');
    progressBar  = document.getElementById('progress-bar');
    fullscreenBtn = document.getElementById('btn-fullscreen');

    state.total = scenes.length;

    if (state.total === 0) return;

    activateScene(0, false);
    bindEvents();
    updateUI();
  }

  /* ── Navigation ── */
  function goTo(index, direction) {
    if (state.transitioning) return;
    if (index < 0 || index >= state.total) return;
    if (index === state.current) return;

    clearAutoplay();
    state.transitioning = true;

    const outgoing = scenes[state.current];
    const incoming = scenes[index];

    // Fade out current
    outgoing.classList.add('exiting');

    setTimeout(() => {
      outgoing.classList.remove('active', 'exiting');
      state.current = index;
      activateScene(index, true);
      state.transitioning = false;
      updateUI();
      scheduleAutoplay();
    }, 850);
  }

  function next() { goTo(state.current + 1); }
  function prev() { goTo(state.current - 1); }

  /* ── Activate a scene ── */
  function activateScene(index, animate) {
    const scene = scenes[index];
    if (!scene) return;

    scene.classList.add('active');

    // Reset all animated children so they re-trigger
    const animated = scene.querySelectorAll('.animate-fade-up, .animate-fade-in');
    animated.forEach(el => {
      el.style.animation = 'none';
      // Force reflow
      void el.offsetHeight;
      el.style.animation = '';
    });

    // Typewriter elements — reset
    const typewriters = scene.querySelectorAll('.typewriter, .typewriter--slow');
    typewriters.forEach(el => {
      el.style.animation = 'none';
      void el.offsetHeight;
      el.style.animation = '';
    });
  }

  /* ── Autoplay ── */
  function scheduleAutoplay() {
    if (!state.autoplay) return;
    clearAutoplay();

    const delay = sceneTimings[state.current] ?? state.autoplayDelay;
    if (delay === 0) return; // No auto-advance for this scene

    state.autoplayTimer = setTimeout(() => {
      if (state.current < state.total - 1) {
        next();
      } else {
        state.autoplay = false;
        updateUI();
      }
    }, delay);
  }

  function clearAutoplay() {
    if (state.autoplayTimer) {
      clearTimeout(state.autoplayTimer);
      state.autoplayTimer = null;
    }
  }

  function toggleAutoplay() {
    state.autoplay = !state.autoplay;
    if (state.autoplay) {
      scheduleAutoplay();
    } else {
      clearAutoplay();
    }
    updateUI();
  }

  /* ── Fullscreen ── */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      state.fullscreen = true;
    } else {
      document.exitFullscreen().catch(() => {});
      state.fullscreen = false;
    }
    updateUI();
  }

  /* ── Update UI ── */
  function updateUI() {
    if (counter) {
      counter.textContent = `${String(state.current + 1).padStart(2, '0')} / ${String(state.total).padStart(2, '0')}`;
    }

    if (prevBtn) {
      prevBtn.disabled = state.current === 0;
      prevBtn.style.opacity = state.current === 0 ? '0.3' : '';
    }

    if (nextBtn) {
      nextBtn.disabled = state.current === state.total - 1;
      nextBtn.style.opacity = state.current === state.total - 1 ? '0.3' : '';
    }

    if (progressBar) {
      const pct = ((state.current) / (state.total - 1)) * 100;
      progressBar.style.width = `${pct}%`;
    }

    if (fullscreenBtn) {
      fullscreenBtn.textContent = document.fullscreenElement ? '⊠ EXIT' : '⊡ EXPAND';
    }
  }

  /* ── Event Bindings ── */
  function bindEvents() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          prev();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'p':
        case 'P':
          toggleAutoplay();
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(state.total - 1);
          break;
        default:
          // Number keys: jump to scene
          if (e.key >= '1' && e.key <= '9') {
            const idx = parseInt(e.key) - 1;
            if (idx < state.total) goTo(idx);
          }
      }
    });

    // Button clicks
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Autoplay button
    const autoplayBtn = document.getElementById('btn-autoplay');
    if (autoplayBtn) autoplayBtn.addEventListener('click', toggleAutoplay);

    // Touch/swipe support
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      const dy = e.changedTouches[0].screenY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) next();
        else prev();
      }
    }, { passive: true });

    // Fullscreen change listener
    document.addEventListener('fullscreenchange', () => {
      state.fullscreen = !!document.fullscreenElement;
      updateUI();
    });

    // Click on presentation area (right half = forward, left half = back)
    const presentation = document.getElementById('presentation');
    if (presentation) {
      presentation.addEventListener('click', (e) => {
        // Don't fire if clicking a button
        if (e.target.closest('.controls')) return;
        const x = e.clientX;
        const mid = window.innerWidth / 2;
        if (x > mid) next();
        else prev();
      });
    }
  }

  /* ── Film Flicker Effect ── */
  function initFlicker() {
    const grain = document.querySelector('.grain-overlay');
    if (!grain) return;

    // Occasionally add a bright flicker for an old film projector feel
    setInterval(() => {
      if (Math.random() < 0.03) { // 3% chance every interval
        grain.style.opacity = '0.15';
        setTimeout(() => { grain.style.opacity = '0.055'; }, 80);
      }
    }, 500);
  }

  /* ── Horizontal scroll line glitch ── */
  function initScanlineGlitch() {
    const scanlines = document.querySelector('.scanline-overlay');
    if (!scanlines) return;

    setInterval(() => {
      if (Math.random() < 0.02) {
        const y = Math.random() * 100;
        scanlines.style.backgroundPositionY = `${y}px`;
        setTimeout(() => { scanlines.style.backgroundPositionY = '0'; }, 120);
      }
    }, 800);
  }

  /* ── Boot sequence ── */
  document.addEventListener('DOMContentLoaded', () => {
    init();
    initFlicker();
    initScanlineGlitch();

    // Optional: Log keyboard help to console
    console.log(
      '%cAMERICA AT WAR WITH ITSELF\n' +
      '%cKeyboard Controls:\n' +
      '  → / Space    Next scene\n' +
      '  ←            Previous scene\n' +
      '  P            Toggle autoplay\n' +
      '  F            Toggle fullscreen\n' +
      '  Home / End   First / Last scene\n' +
      '  1–9          Jump to scene',
      'color:#c9a84c; font-size:14px; font-weight:bold;',
      'color:#b89c6e; font-size:12px;'
    );
  });

})();
