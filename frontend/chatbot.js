// ==========================================================================
// AMAUTA MED - CHATBOT INTERACTIVE LOGIC
// ==========================================================================

// ==========================================================================
// CONFIGURACIÓN DE LA CONEXIÓN
// ==========================================================================
// Usar el backend seguro local (FastAPI) para consumir Groq y la base de datos RAG médica.
const USE_BACKEND = true;
// Variable para almacenar el ID de la sesión actual
let currentSessionId = sessionStorage.getItem('amauta_session_id') || null;

document.addEventListener('DOMContentLoaded', () => {
  const chatContainer = document.querySelector('.chat-container');
  const chatInput = document.querySelector('textarea');
  const sendBtn = document.querySelector('.btn-send');

  chatInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

  sendBtn.addEventListener('click', handleSendMessage);

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendUserMessage(text);

    chatInput.value = '';
    chatInput.style.height = 'auto';
    scrollToBottom();

    if (USE_BACKEND) {
      callRealAIResponse(text);
    } else {
      simulateAIResponse(text);
    }
  }

  function appendUserMessage(text) {
    const userMsgHTML = `
      <div class="message user-message" style="animation: fadeIn 0.3s ease;">
        <div class="message-content user-content">
          <p>${escapeHTML(text)}</p>
        </div>
      </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', userMsgHTML);
  }

  function simulateAIResponse(userText) {
    const typingID = 'typing-' + Date.now();
    const typingHTML = `
      <div class="message ai-message" id="${typingID}" style="animation: fadeIn 0.3s ease;">
        <div class="ai-avatar">
          <img src="assets/amauta-logo.png" alt="AI">
        </div>
        <div class="message-content ai-content" style="padding: 16px;">
          <p style="margin: 0; color: var(--text-muted);"><em>Consultando base de conocimientos médicos (KB Fabrizzio)...</em></p>
        </div>
      </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', typingHTML);
    scrollToBottom();

    setTimeout(() => {
      const typingIndicator = document.getElementById(typingID);
      if (typingIndicator) typingIndicator.remove();

      // Simulated aligned KB response
      const aiResponseHTML = `
        <div class="message ai-message" style="animation: fadeIn 0.3s ease;">
          <div class="ai-avatar">
            <img src="assets/amauta-logo.png" alt="AI">
          </div>
          <div class="message-content ai-content">
            <div class="ai-header-title">AMAUTA ANALYSIS</div>
            <p>De acuerdo a la consulta: "<em>${escapeHTML(userText)}</em>", he revisado nuestra base de conocimientos (KB).</p>
            <p><strong>Alineamiento con guías clínicas:</strong></p>
            <ul class="clinical-list">
              <li>Identificación de factores de riesgo según protocolos vigentes.</li>
              <li>Elaboración de diagnóstico diferencial priorizado.</li>
              <li>Recomendación terapéutica basada en medicina basada en evidencia (MBE).</li>
            </ul>
            <p><em>(Nota: Esta es una máscara visual de prueba para experimentar la fluidez de la interfaz antes de conectar la API final).</em></p>
            <div class="ai-footer-tags">
              <span class="tag"><span class="material-symbols-outlined">menu_book</span> KB: Fabrizzio Medical DB</span>
              <span class="tag"><span class="material-symbols-outlined">verified</span> Fluidez de UI probada</span>
            </div>
          </div>
        </div>
      `;

      chatContainer.insertAdjacentHTML('beforeend', aiResponseHTML);
      scrollToBottom();
    }, 1500);
  }

  // ==========================================================================
  // CONEXIÓN SEGURA CON EL BACKEND LOCAL (FastAPI + Groq + RAG)
  // ==========================================================================
  async function callRealAIResponse(userText) {
    // 1. Mostrar indicador de "Escribiendo..."
    const typingID = 'typing-' + Date.now();
    const typingHTML = `
      <div class="message ai-message" id="${typingID}" style="animation: fadeIn 0.3s ease;">
        <div class="ai-avatar">
          <img src="assets/amauta-logo.png" alt="AI">
        </div>
        <div class="message-content ai-content" style="padding: 16px;">
          <p style="margin: 0; color: var(--text-muted);"><em>AMAUTA MED está procesando tu consulta clínica (vía backend)...</em></p>
        </div>
      </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', typingHTML);
    scrollToBottom();

    try {
      // 2. Hacer la petición al backend local de FastAPI
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: "doctor_sergio",
          message: userText,
          session_id: currentSessionId
        })
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor backend");

      const data = await response.json();

      // Guardar el session_id para mantener el hilo de la conversación (historial)
      if (data.session_id) {
        currentSessionId = data.session_id;
        sessionStorage.setItem('amauta_session_id', data.session_id);
      }

      let aiText = data.reply;

      // Reemplazo básico de Markdown a HTML (negritas, cursivas, saltos de línea) para que se vea bien
      aiText = escapeHTML(aiText);
      aiText = aiText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      aiText = aiText.replace(/\*(.*?)\*/g, '<em>$1</em>');
      aiText = aiText.replace(/\n/g, '<br>');

      // 3. Remover indicador de escribiendo de forma segura
      const typingIndicator = document.getElementById(typingID);
      if (typingIndicator) typingIndicator.remove();

      // 4. Inyectar respuesta real en la interfaz
      const aiResponseHTML = `
        <div class="message ai-message" style="animation: fadeIn 0.3s ease;">
          <div class="ai-avatar">
            <img src="assets/amauta-logo.png" alt="AI">
          </div>
          <div class="message-content ai-content">
            <div class="ai-header-title">AMAUTA ANALYSIS</div>
            <p>${aiText}</p>
            <div class="ai-footer-tags">
              <span class="tag"><span class="material-symbols-outlined">shield</span> Backend Seguro (Groq Llama-3.3)</span>
            </div>
          </div>
        </div>
      `;
      chatContainer.insertAdjacentHTML('beforeend', aiResponseHTML);
      scrollToBottom();

    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      const typingIndicator = document.getElementById(typingID);
      if (typingIndicator) typingIndicator.remove();

      const errorHTML = `
        <div class="message ai-message" style="animation: fadeIn 0.3s ease;">
          <div class="ai-avatar" style="background: #ef4444;">
            <span class="material-symbols-outlined" style="color:white; font-size: 20px;">error</span>
          </div>
          <div class="message-content ai-content" style="border-color: #fca5a5;">
              <p style="color: #b91c1c;"><strong>Error de conexión con el backend:</strong> No se pudo contactar al servidor clínico en <code>/chat</code>.</p>
            <p style="color: var(--text-secondary); margin-top: 8px; font-size: 0.85rem;">
              Asegúrate de:
              <br>1. Haber configurado tu API Key de Groq en <code>backend/.env</code>.
              <br>2. Iniciar el servidor ejecutando <code>python run.py</code> en la carpeta <code>backend</code>.
            </p>
          </div>
        </div>
      `;
      chatContainer.insertAdjacentHTML('beforeend', errorHTML);
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: 'smooth'
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});

const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
