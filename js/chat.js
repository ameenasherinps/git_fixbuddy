/* ===================================================================
   FixBuddy - Follow-up Q&A Chat Logic (Module 7)
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  FixBuddyStore.init();

  const urlParams = new URLSearchParams(window.location.search);
  let repairId = urlParams.get('id') || FixBuddyStore.getActiveRepairId();

  let repair = FixBuddyStore.getRepairById(repairId);
  if (!repair) {
    const all = FixBuddyStore.getRepairs();
    if (all.length > 0) {
      repair = all[0];
      repairId = repair.id;
    } else {
      window.location.href = 'repair.html';
      return;
    }
  }

  FixBuddyStore.setActiveRepairId(repair.id);

  // Render Sidebar Ticket Context
  renderSidebarContext(repair);

  // Render Existing Messages
  renderMessages(repair);

  // Chat Elements
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const typingIndicator = document.getElementById('chatTypingIndicator');
  const messagesContainer = document.getElementById('chatMessagesContainer');

  // Suggested Prompts Chips
  const suggestionChips = document.querySelectorAll('.suggestion-chip');
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      if (promptText && chatInput) {
        chatInput.value = promptText;
        chatInput.focus();
      }
    });
  });

  // Handle Send Message
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      // Add user message
      const userMsg = {
        sender: 'user',
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (!repair.messages) repair.messages = [];
      repair.messages.push(userMsg);
      FixBuddyStore.saveRepair(repair);

      appendMessageToUI(userMsg);
      chatInput.value = '';
      scrollToBottom();

      // Simulate AI Assistant Thinking & Typing
      if (typingIndicator) typingIndicator.classList.add('active');
      scrollToBottom();

      // Delay for realistic typing
      const thinkingDelay = Math.min(1800, Math.max(900, text.length * 25));
      setTimeout(() => {
        if (typingIndicator) typingIndicator.classList.remove('active');

        const aiResponseText = AIDiagnostics.answerFollowUp(text, repair);
        const aiMsg = {
          sender: 'ai',
          text: aiResponseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        repair.messages.push(aiMsg);
        FixBuddyStore.saveRepair(repair);

        appendMessageToUI(aiMsg);
        scrollToBottom();
      }, thinkingDelay);
    });
  }

  function renderSidebarContext(r) {
    const elDevice = document.getElementById('chatTicketDevice');
    const elCategory = document.getElementById('chatTicketCategory');
    const elProblem = document.getElementById('chatTicketProblem');
    const elDifficulty = document.getElementById('chatTicketDifficulty');
    const elStatus = document.getElementById('chatTicketStatus');
    const elThumb = document.getElementById('chatTicketThumb');

    if (elDevice) elDevice.textContent = r.deviceName || r.category;
    if (elCategory) elCategory.textContent = r.category;
    if (elProblem) elProblem.textContent = r.identifiedProblem;
    if (elDifficulty) elDifficulty.textContent = r.difficulty;
    if (elStatus) {
      elStatus.textContent = r.status;
      elStatus.className = `badge ${r.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`;
    }

    if (elThumb) {
      if (r.imageUrl) {
        elThumb.innerHTML = `<img src="${r.imageUrl}" alt="Device">`;
        elThumb.style.display = 'block';
      } else {
        elThumb.style.display = 'none';
      }
    }
  }

  function renderMessages(r) {
    if (!messagesContainer) return;
    messagesContainer.innerHTML = '';

    if (!r.messages || r.messages.length === 0) {
      // Default greeting
      r.messages = [{
        sender: 'ai',
        text: `Hello! I am FixBuddy, your electronics repair assistant. I have reviewed the technical specifications and symptoms for your ${r.category}. How can I help you proceed?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];
      FixBuddyStore.saveRepair(r);
    }

    r.messages.forEach(msg => appendMessageToUI(msg));
    scrollToBottom();
  }

  function appendMessageToUI(msg) {
    if (!messagesContainer) return;

    const isAI = msg.sender === 'ai';
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${isAI ? 'msg-ai' : 'msg-user'}`;

    const formattedText = escapeHtml(msg.text).replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
      <div class="msg-avatar">
        ${isAI ? '🤖' : '👤'}
      </div>
      <div class="msg-bubble">
        <div>${formattedText}</div>
        <div class="msg-time">${msg.time}</div>
      </div>
    `;

    messagesContainer.appendChild(msgDiv);
  }

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
