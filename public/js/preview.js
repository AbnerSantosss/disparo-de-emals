/* ═══════════════════════════════════════════════
   Preview Module — Renderização de HTML em iframe
   ═══════════════════════════════════════════════ */

const Preview = (() => {
  let iframeEl;
  let frameEl;
  let emptyEl;
  let currentViewport = 'desktop';

  const viewportLabels = {
    desktop: 'Desktop — 100%',
    tablet: 'Tablet — 768px',
    'mobile-lg': 'Mobile Grande — 412px',
    mobile: 'Mobile Padrão — 390px',
    'mobile-sm': 'Mobile Pequeno — 360px',
  };

  function update(html) {
    if (!iframeEl || !emptyEl) return;

    if (!html || !html.trim()) {
      emptyEl.classList.remove('hidden');
      // Clear the iframe
      const doc = iframeEl.contentDocument || iframeEl.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write('');
        doc.close();
      }
      return;
    }

    emptyEl.classList.add('hidden');

    const doc = iframeEl.contentDocument || iframeEl.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }

  function setViewport(viewport) {
    currentViewport = viewport;

    if (frameEl) {
      frameEl.setAttribute('data-viewport', viewport);
    }

    // Update label
    const label = document.getElementById('viewport-label');
    if (label) label.textContent = viewportLabels[viewport] || '';

    // Update buttons
    document.querySelectorAll('.viewport-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.viewport === viewport);
    });
  }

  function init() {
    iframeEl = document.getElementById('preview-iframe');
    frameEl = document.getElementById('preview-frame');
    emptyEl = document.getElementById('empty-preview');

    if (!iframeEl) return;

    // Set default viewport
    setViewport('desktop');

    // Viewport buttons
    document.querySelectorAll('.viewport-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setViewport(btn.dataset.viewport);
      });
    });
  }

  return { init, update, setViewport };
})();
