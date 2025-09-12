// Logique du chat pour l’interface Citoyen‑AI

(() => {
  const chatContainer = document.getElementById('chat-container');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const langSelect = document.getElementById('lang-select');

  // Historique local des messages pour le backend
  const history = [];

  // Mettre à jour la direction d’écriture selon la langue sélectionnée
  langSelect.addEventListener('change', () => {
    const dir = langSelect.value;
    input.setAttribute('dir', dir);
  });

  /**
   * Ajoute un message dans la zone de chat.
   * @param {string} role - 'user' ou 'assistant'
   * @param {string} text - contenu du message
   * @param {string} dirAttr - direction (ltr ou rtl) à appliquer au contenu
   */
  function addMessage(role, text, dirAttr = 'ltr') {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role);
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.setAttribute('dir', dirAttr);
    // Préserver le formatage (sauts de ligne)
    bubble.textContent = text;
    msgDiv.appendChild(bubble);
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const dir = langSelect.value;
    // Afficher le message de l’utilisateur
    addMessage('user', text, dir);
    history.push({ role: 'user', content: text });

    input.value = '';
    input.focus();

    // Afficher un indicateur de saisie pour l’assistant
    addMessage('assistant', '…', 'ltr');
    const typingIndicator = chatContainer.lastChild;

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      // Supprimer l’indicateur de saisie
      chatContainer.removeChild(typingIndicator);
      const answer = data.answer || '';
      addMessage('assistant', answer, 'ltr');
      history.push({ role: 'assistant', content: answer });
      if (data.sources && data.sources.length) {
        const sourcesText = 'Sources:\n' + data.sources.join('\n');
        addMessage('assistant', sourcesText, 'ltr');
        history.push({ role: 'assistant', content: sourcesText });
      }
    } catch (err) {
      chatContainer.removeChild(typingIndicator);
      const errorMessage = err.message || String(err);
      addMessage('assistant', 'Erreur : ' + errorMessage, 'ltr');
      history.push({ role: 'assistant', content: 'Erreur : ' + errorMessage });
    }
  });
})();