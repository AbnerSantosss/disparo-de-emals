/* ═══════════════════════════════════════════════
   Editor Module — HTML code editor
   ═══════════════════════════════════════════════ */

const Editor = (() => {
  let editorEl;
  let lineNumbersEl;
  let lineCountEl;
  let charCountEl;

  function getHTML() {
    return editorEl?.value || '';
  }

  function setHTML(html) {
    if (editorEl) {
      editorEl.value = html;
      updateStats();
      updateLineNumbers();
      Preview.update(html);
    }
  }

  function updateStats() {
    const val = editorEl?.value || '';
    const lines = val ? val.split('\n').length : 0;
    const chars = val.length;

    if (lineCountEl) lineCountEl.textContent = `${lines} linha${lines !== 1 ? 's' : ''}`;
    if (charCountEl) charCountEl.textContent = `${chars} caractere${chars !== 1 ? 's' : ''}`;
  }

  function updateLineNumbers() {
    if (!lineNumbersEl || !editorEl) return;

    const lines = editorEl.value.split('\n').length;
    let html = '';
    for (let i = 1; i <= Math.max(lines, 20); i++) {
      html += `<div>${i}</div>`;
    }
    lineNumbersEl.innerHTML = html;
  }

  function syncScroll() {
    if (lineNumbersEl && editorEl) {
      lineNumbersEl.scrollTop = editorEl.scrollTop;
    }
  }

  function init() {
    editorEl = document.getElementById('html-editor');
    lineNumbersEl = document.getElementById('line-numbers');
    lineCountEl = document.getElementById('line-count');
    charCountEl = document.getElementById('char-count');

    if (!editorEl) return;

    // Initial render
    updateStats();
    updateLineNumbers();

    // Input events
    editorEl.addEventListener('input', () => {
      updateStats();
      updateLineNumbers();
      Preview.update(editorEl.value);
    });

    editorEl.addEventListener('scroll', syncScroll);

    // Tab key support
    editorEl.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = editorEl.selectionStart;
        const end = editorEl.selectionEnd;
        editorEl.value = editorEl.value.substring(0, start) + '  ' + editorEl.value.substring(end);
        editorEl.selectionStart = editorEl.selectionEnd = start + 2;
        updateLineNumbers();
      }
    });

    // Paste button
    document.getElementById('btn-paste')?.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          setHTML(text);
          App.toast('HTML colado do clipboard', 'success');
        }
      } catch {
        App.toast('Não foi possível acessar o clipboard', 'error');
      }
    });

    // Copy button
    document.getElementById('btn-copy')?.addEventListener('click', async () => {
      const html = getHTML();
      if (!html) {
        App.toast('Editor vazio', 'warning');
        return;
      }
      try {
        await navigator.clipboard.writeText(html);
        App.toast('HTML copiado para o clipboard', 'success');
      } catch {
        App.toast('Falha ao copiar', 'error');
      }
    });

    // Clear button
    document.getElementById('btn-clear')?.addEventListener('click', () => {
      if (!getHTML()) return;
      setHTML('');
      editorEl.focus();
      App.toast('Editor limpo', 'info');
    });
  }

  return { init, getHTML, setHTML };
})();
