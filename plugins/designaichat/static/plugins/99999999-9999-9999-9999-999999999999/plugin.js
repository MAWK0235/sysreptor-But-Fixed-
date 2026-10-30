export default function (options) {
  console.log("Design AI Chat script initialized", options);
  
  if (typeof document === 'undefined') return;

  const initChat = () => {
    if (document.getElementById('design-ai-chat-btn')) return;

    const btn = document.createElement('div');
    btn.id = 'design-ai-chat-btn';
    btn.style.position = 'fixed';
    btn.style.bottom = '20px';
    btn.style.right = '20px';
    btn.style.width = '50px';
    btn.style.height = '50px';
    btn.style.backgroundColor = '#1fa669';
    btn.style.color = 'white';
    btn.style.borderRadius = '50%';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.cursor = 'pointer';
    btn.style.zIndex = '9999';
    btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    btn.innerHTML = '<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C10.73,22 9.5,21.76 8.39,21.34L2.81,22.86C2.63,22.91 2.44,22.88 2.3,22.77C2.15,22.65 2.08,22.47 2.11,22.28L3.2,17.47C2.44,15.86 2,13.97 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12C4,13.62 4.47,15.13 5.3,16.39L5.53,16.74L4.65,20.6L8.64,19.53L9.04,19.74C10.03,20.25 11.08,20 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" /></svg>';

    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.bottom = '80px';
    panel.style.right = '20px';
    panel.style.width = '350px';
    panel.style.height = '500px';
    panel.style.backgroundColor = 'var(--v-theme-surface, white)';
    panel.style.color = 'var(--v-theme-on-surface, black)';
    panel.style.border = '1px solid var(--v-theme-border-color, #ccc)';
    panel.style.borderRadius = '8px';
    panel.style.display = 'none';
    panel.style.flexDirection = 'column';
    panel.style.zIndex = '9999';
    panel.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
    
    panel.innerHTML = `
      <div style="padding: 10px; background: #1fa669; color: white; border-top-left-radius: 8px; border-top-right-radius: 8px; font-weight: bold;">
        Design AI Assistant
      </div>
      <div id="design-ai-chat-messages" style="flex: 1; padding: 10px; overflow-y: auto; font-size: 14px; display: flex; flex-direction: column; gap: 8px;">
      </div>
      <div style="padding: 10px; border-top: 1px solid #ccc; display: flex;">
        <input id="design-ai-chat-input" type="text" placeholder="Ask about design..." style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; outline: none;">
        <button id="design-ai-chat-send" style="margin-left: 8px; padding: 8px 12px; background: #1fa669; color: white; border: none; border-radius: 4px; cursor: pointer;">Send</button>
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    let isOpen = false;
    btn.onclick = () => {
      isOpen = !isOpen;
      panel.style.display = isOpen ? 'flex' : 'none';
    };

    const messages = panel.querySelector('#design-ai-chat-messages');
    const input = panel.querySelector('#design-ai-chat-input');
    const sendBtn = panel.querySelector('#design-ai-chat-send');

    const addMsg = (text, isUser) => {
      const el = document.createElement('div');
      el.style.padding = '8px';
      el.style.borderRadius = '4px';
      el.style.maxWidth = '85%';
      el.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
      el.style.backgroundColor = isUser ? '#1fa669' : 'rgba(128, 128, 128, 0.2)';
      el.style.color = isUser ? 'white' : 'inherit';
      el.textContent = text;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
      return el;
    };

    const send = async () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      addMsg(text, true);

      const aiMsgEl = addMsg('...', false);

      try {
        const res = await fetch('/api/plugins/99999999-9999-9999-9999-999999999999/api/chat/chat/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1]
          },
          body: JSON.stringify({ prompt: text })
        });
        
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'text') {
                  fullText += data.content;
                  aiMsgEl.textContent = fullText;
                  messages.scrollTop = messages.scrollHeight;
                }
              } catch (e) {}
            }
          }
        }
      } catch (err) {
        aiMsgEl.textContent = 'Error: ' + err.message;
      }
    };

    sendBtn.onclick = send;
    input.onkeypress = (e) => { if (e.key === 'Enter') send(); };
  };

  const checkRoute = () => {
    // Show everywhere while testing, to ensure JS is actually injecting it
    initChat();
    const btn = document.getElementById('design-ai-chat-btn');
    if (window.location.hash.includes('/designs/') || window.location.pathname.includes('/designs/')) {
      if (btn) btn.style.display = 'flex';
    } else {
      const panel = btn?.nextElementSibling;
      if (btn) btn.style.display = 'none';
      if (panel) panel.style.display = 'none';
    }
  };

  window.addEventListener('hashchange', checkRoute);
  
  if (options.nuxtApp && options.nuxtApp.$router) {
    options.nuxtApp.$router.afterEach(() => {
      setTimeout(checkRoute, 100);
    });
  }
  
  setTimeout(checkRoute, 500);
}
