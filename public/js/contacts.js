/* ═══════════════════════════════════════════════
   Contacts Module — Gerenciamento de destinatários (with DB persistence)
   ═══════════════════════════════════════════════ */

const Contacts = (() => {
  let contacts = []; // { email, selected }

  // DOM refs
  const listEl = () => document.getElementById('contact-list');
  const inputEl = () => document.getElementById('new-email');
  const countEl = () => document.getElementById('contact-count');
  const emptyEl = () => document.getElementById('empty-contacts');
  const addBtn = () => document.getElementById('btn-add-email');
  const selectAllBtn = () => document.getElementById('btn-select-all');
  const clearBtn = () => document.getElementById('btn-clear-contacts');

  // ──── Database sync ────
  async function loadFromDB() {
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      if (Array.isArray(data)) {
        contacts = data;
      }
    } catch {
      // Fallback: try localStorage migration
      try {
        const saved = localStorage.getItem('mailforge_contacts');
        if (saved) {
          contacts = JSON.parse(saved);
          await saveToDB();
          localStorage.removeItem('mailforge_contacts');
        }
      } catch {}
    }
  }

  async function saveToDB() {
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts }),
      });
    } catch (err) {
      console.error('Failed to save contacts to DB:', err);
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function add(email) {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return false;

    if (!isValidEmail(trimmed)) {
      App.toast('E-mail inválido', 'error');
      return false;
    }

    if (contacts.some(c => c.email === trimmed)) {
      App.toast('E-mail já existe na lista', 'warning');
      return false;
    }

    contacts.push({ email: trimmed, selected: true });
    saveToDB();
    render();
    App.toast(`${trimmed} adicionado`, 'success');
    return true;
  }

  function remove(email) {
    contacts = contacts.filter(c => c.email !== email);
    saveToDB();
    render();
  }

  function toggle(email) {
    const contact = contacts.find(c => c.email === email);
    if (contact) {
      contact.selected = !contact.selected;
      saveToDB();
      render();
    }
  }

  function selectAll() {
    const allSelected = contacts.every(c => c.selected);
    contacts.forEach(c => c.selected = !allSelected);
    saveToDB();
    render();
  }

  function clearAll() {
    if (contacts.length === 0) return;
    contacts = [];
    saveToDB();
    render();
    App.toast('Lista de contatos limpa', 'info');
  }

  function getSelected() {
    return contacts.filter(c => c.selected).map(c => c.email);
  }

  function getAll() {
    return contacts;
  }

  function render() {
    const list = listEl();
    const empty = emptyEl();
    const count = countEl();

    if (!list || !empty || !count) return;

    count.textContent = contacts.length;

    if (contacts.length === 0) {
      list.innerHTML = '';
      empty.classList.remove('hidden');
      list.classList.add('hidden');
    } else {
      empty.classList.add('hidden');
      list.classList.remove('hidden');

      list.innerHTML = contacts.map(c => `
        <li class="contact-item" data-email="${c.email}">
          <div class="checkbox ${c.selected ? 'checked' : ''}" data-action="toggle" data-email="${c.email}"></div>
          <span class="contact-email">${c.email}</span>
          <div class="contact-remove" data-action="remove" data-email="${c.email}" title="Remover">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
        </li>
      `).join('');
    }

    // Update send button state
    if (typeof App !== 'undefined' && App.updateSendButton) {
      App.updateSendButton();
    }
  }

  async function init() {
    await loadFromDB();
    render();

    // Add button
    addBtn()?.addEventListener('click', () => {
      const input = inputEl();
      if (add(input.value)) {
        input.value = '';
        input.focus();
      }
    });

    // Enter key on input
    inputEl()?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const input = inputEl();
        if (add(input.value)) {
          input.value = '';
        }
      }
    });

    // Select all
    selectAllBtn()?.addEventListener('click', selectAll);

    // Clear all
    clearBtn()?.addEventListener('click', clearAll);

    // Delegated click on list
    listEl()?.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;
      const email = target.dataset.email;

      if (action === 'toggle') toggle(email);
      if (action === 'remove') remove(email);
    });
  }

  return { init, getSelected, getAll, render, add, remove };
})();
