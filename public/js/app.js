/* ═══════════════════════════════════════════════
   App Module — Main controller (with DB persistence)
   ═══════════════════════════════════════════════ */

const App = (() => {
  let cachedSMTP = null; // in-memory cache

  // ──── Toast Notification System ────
  function toast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <span>${message}</span>
    `;

    container.appendChild(el);

    setTimeout(() => {
      el.classList.add('toast-out');
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  // ──── SMTP Config (via backend API) ────
  async function loadSMTP() {
    try {
      const res = await fetch('/api/smtp-config');
      const data = await res.json();
      if (data.exists) {
        cachedSMTP = { email: data.email, password: data.password, subject: data.subject };
        return cachedSMTP;
      }
      cachedSMTP = null;
      return null;
    } catch {
      // Fallback: try localStorage migration
      try {
        const saved = localStorage.getItem('mailforge_smtp');
        if (saved) {
          const config = JSON.parse(saved);
          cachedSMTP = config;
          // Migrate to DB
          await saveSMTP(config);
          localStorage.removeItem('mailforge_smtp');
          return cachedSMTP;
        }
      } catch {}
      return cachedSMTP;
    }
  }

  async function saveSMTP(config) {
    try {
      await fetch('/api/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      cachedSMTP = config;
    } catch (err) {
      console.error('Failed to save SMTP to DB:', err);
    }
  }

  function getCachedSMTP() {
    return cachedSMTP;
  }

  function updateConnectionBadge(connected, message) {
    const badge = document.getElementById('connection-status');
    const text = badge?.querySelector('.status-text');
    const infoCard = document.getElementById('smtp-info-card');
    if (!badge || !text) return;

    if (connected) {
      badge.classList.remove('disconnected');
      badge.classList.add('connected');
      text.textContent = message || 'SMTP conectado';

      // Update info card to configured state
      if (infoCard) {
        infoCard.classList.add('smtp-configured');
        const desc = infoCard.querySelector('.smtp-info-desc');
        const link = infoCard.querySelector('.smtp-configure-link');
        if (desc) desc.textContent = 'SMTP configurado e pronto para envio. Seus dados ficam salvos localmente no servidor.';
        if (link) {
          link.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Alterar configuração
          `;
        }
      }
    } else {
      badge.classList.remove('connected');
      badge.classList.add('disconnected');
      text.textContent = message || 'SMTP não configurado';

      // Reset info card to unconfigured state
      if (infoCard) {
        infoCard.classList.remove('smtp-configured');
        const desc = infoCard.querySelector('.smtp-info-desc');
        const link = infoCard.querySelector('.smtp-configure-link');
        if (desc) desc.textContent = 'O SMTP é o protocolo que permite o envio dos seus e-mails. Configure suas credenciais do Gmail para começar a disparar.';
        if (link) {
          link.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Configurar agora
          `;
        }
      }
    }
  }

  // ──── Tab Navigation ────
  function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const panel = document.getElementById(`panel-${target}`);
        if (panel) panel.classList.add('active');

        // When switching to preview, refresh content
        if (target === 'preview') {
          Preview.update(Editor.getHTML());
        }
      });
    });
  }

  // ──── SMTP Setup Guide Modal ────
  function initGuideModal() {
    const guideModal = document.getElementById('smtp-guide-modal');
    const smtpModal = document.getElementById('smtp-modal');
    const guideClose = document.getElementById('guide-modal-close');
    const guideOpenConfig = document.getElementById('guide-open-config');
    const btnConfigureNow = document.getElementById('btn-configure-now');

    // "Configurar agora" link in sidebar — opens guide if not configured, opens config modal if configured
    btnConfigureNow?.addEventListener('click', (e) => {
      e.preventDefault();
      const config = getCachedSMTP();
      if (config?.email) {
        // Already configured — go straight to config modal
        document.getElementById('btn-settings')?.click();
      } else {
        // Not configured — open the step-by-step guide
        guideModal?.classList.remove('hidden');
      }
    });

    // Close guide modal
    guideClose?.addEventListener('click', () => guideModal?.classList.add('hidden'));
    guideModal?.addEventListener('click', (e) => {
      if (e.target === guideModal) guideModal.classList.add('hidden');
    });

    // "Abrir Configurações SMTP" button inside guide → close guide, open config modal
    guideOpenConfig?.addEventListener('click', () => {
      guideModal?.classList.add('hidden');
      document.getElementById('btn-settings')?.click();
    });
  }

  // ──── Modal ────
  function initModal() {
    const modal = document.getElementById('smtp-modal');
    const btnSettings = document.getElementById('btn-settings');
    const btnClose = document.getElementById('modal-close');
    const btnSave = document.getElementById('save-smtp');
    const btnTest = document.getElementById('test-connection');
    const smtpStatus = document.getElementById('smtp-status');
    const togglePw = document.getElementById('toggle-password');

    // Open
    btnSettings?.addEventListener('click', async () => {
      modal.classList.remove('hidden');
      // Load saved values from DB
      const config = await loadSMTP();
      if (config) {
        document.getElementById('smtp-email').value = config.email || '';
        document.getElementById('smtp-password').value = config.password || '';
        document.getElementById('smtp-subject').value = config.subject || '';
      }
    });

    // Close
    btnClose?.addEventListener('click', () => modal.classList.add('hidden'));
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });

    // Toggle password visibility
    togglePw?.addEventListener('click', () => {
      const input = document.getElementById('smtp-password');
      if (input.type === 'password') {
        input.type = 'text';
      } else {
        input.type = 'password';
      }
    });

    // Save
    btnSave?.addEventListener('click', async () => {
      const email = document.getElementById('smtp-email').value.trim();
      const password = document.getElementById('smtp-password').value.trim();
      const subject = document.getElementById('smtp-subject').value.trim();

      if (!email || !password) {
        showSMTPStatus('Preencha e-mail e senha de app.', 'error');
        return;
      }

      await saveSMTP({ email, password, subject });
      updateConnectionBadge(true, email);
      modal.classList.add('hidden');
      toast('Configuração SMTP salva no banco de dados!', 'success');
      updateSendButton();
    });

    // Test connection
    btnTest?.addEventListener('click', async () => {
      const email = document.getElementById('smtp-email').value.trim();
      const password = document.getElementById('smtp-password').value.trim();

      if (!email || !password) {
        showSMTPStatus('Preencha e-mail e senha de app.', 'error');
        return;
      }

      btnTest.disabled = true;
      btnTest.textContent = 'Testando...';
      smtpStatus?.classList.add('hidden');

      try {
        const res = await fetch('/api/test-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, appPassword: password }),
        });

        const data = await res.json();

        if (data.success) {
          showSMTPStatus('✓ Conexão verificada com sucesso!', 'success');
          // Auto-save upon successful test
          const subject = document.getElementById('smtp-subject').value.trim();
          await saveSMTP({ email, password, subject });
          updateConnectionBadge(true, email);
          updateSendButton();
        } else {
          showSMTPStatus(`✗ ${data.error || 'Falha na conexão'}`, 'error');
        }
      } catch (err) {
        showSMTPStatus('✗ Erro de rede. Verifique se o servidor está rodando.', 'error');
      }

      btnTest.disabled = false;
      btnTest.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Testar Conexão
      `;
    });

    function showSMTPStatus(msg, type) {
      if (!smtpStatus) return;
      smtpStatus.textContent = msg;
      smtpStatus.className = `smtp-status ${type}`;
      smtpStatus.classList.remove('hidden');
    }
  }

  // ──── Send Emails ────
  function initSend() {
    const btnSend = document.getElementById('btn-send');

    btnSend?.addEventListener('click', async () => {
      const config = getCachedSMTP();
      if (!config) {
        toast('Configure o SMTP primeiro (ícone de engrenagem)', 'warning');
        return;
      }

      const html = Editor.getHTML();
      if (!html.trim()) {
        toast('Cole HTML no editor antes de enviar', 'warning');
        return;
      }

      const selected = Contacts.getSelected();
      if (selected.length === 0) {
        toast('Selecione pelo menos um destinatário', 'warning');
        return;
      }

      const subject = config.subject || '[TESTE] HTML Email Template';

      // Confirm
      btnSend.classList.add('sending');
      btnSend.querySelector('span').textContent = `Enviando para ${selected.length}...`;
      btnSend.disabled = true;

      try {
        const res = await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            smtpEmail: config.email,
            smtpPassword: config.password,
            recipients: selected,
            subject,
            htmlContent: html,
          }),
        });

        const data = await res.json();

        if (data.success) {
          toast(`${data.message}`, 'success', 6000);

          // Show individual results
          data.results?.forEach(r => {
            if (!r.success) {
              toast(`Falha para ${r.recipient}: ${r.error}`, 'error', 8000);
            }
          });
        } else {
          toast(data.error || 'Erro ao enviar', 'error');
        }
      } catch (err) {
        toast('Erro de rede. Verifique se o servidor está rodando.', 'error');
      }

      btnSend.classList.remove('sending');
      btnSend.querySelector('span').textContent = 'Enviar Teste';
      btnSend.disabled = false;
      updateSendButton();
    });
  }

  // ──── Send Button State ────
  function updateSendButton() {
    const btn = document.getElementById('btn-send');
    if (!btn) return;

    const config = getCachedSMTP();
    const hasHTML = Editor.getHTML().trim().length > 0;
    const hasRecipients = Contacts.getSelected().length > 0;

    btn.disabled = !(config && hasHTML && hasRecipients);
  }

  // ──── Sidebar Mobile Toggle ────
  function initSidebarToggle() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    toggle?.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        if (!sidebar?.contains(e.target) && !toggle?.contains(e.target)) {
          sidebar?.classList.remove('open');
        }
      }
    });
  }

  // ──── Initialize ────
  async function init() {
    Contacts.init();
    Editor.init();
    Preview.init();
    if (typeof Builder !== 'undefined') Builder.init();

    initTabs();
    initModal();
    initGuideModal();
    initSend();
    initSidebarToggle();

    // Restore SMTP badge from DB
    const config = await loadSMTP();
    if (config?.email) {
      updateConnectionBadge(true, config.email);
    }

    // Listen for editor changes to update send button
    document.getElementById('html-editor')?.addEventListener('input', () => {
      updateSendButton();
    });

    // Initial button state
    updateSendButton();
  }

  // Boot
  document.addEventListener('DOMContentLoaded', init);

  return { toast, updateSendButton };
})();
