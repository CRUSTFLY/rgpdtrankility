const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const contentDiv = document.getElementById('IARGPDContent');

// Crée un conteneur pour l'historique des messages
const chatHistoryDiv = document.createElement('div');
chatHistoryDiv.id = 'chatHistory';
chatHistoryDiv.style.marginTop = '20px';
contentDiv.appendChild(chatHistoryDiv);

// Fonction pour ajouter un message à l'historique
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.style.marginBottom = '10px';
    messageDiv.style.padding = '8px';
    messageDiv.style.borderRadius = '6px';
    messageDiv.style.fontFamily = 'Calibri Light, sans-serif';
    messageDiv.style.fontSize = '1rem';

    if (sender === 'user') {
        messageDiv.style.backgroundColor = '#f4f4f4';
        messageDiv.style.textAlign = 'right';
        messageDiv.textContent = `Vous : ${text}`;
    } else {
        messageDiv.style.backgroundColor = '#fffdf0';
        messageDiv.style.border = '1px solid #e5d87f';
        messageDiv.textContent = `IA : ${text}`;
    }

    chatHistoryDiv.appendChild(messageDiv);
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
}

// Fonction pour appeler l'API backend
async function callChatGPT(message) {
    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("Erreur serveur:", errText);
            return "Erreur serveur : " + res.status;
        }

        const data = await res.json();
        return data.reply || "Pas de réponse reçue.";
    } catch (err) {
        console.error("Erreur fetch:", err);
        return "Erreur lors de la communication avec le serveur.";
    }
}

// Gestion clic sur le bouton envoyer
sendBtn.addEventListener("click", async () => {
    const message = input.value.trim();
    if (!message) return;

    addMessage('user', message);
    input.value = '';

    addMessage('bot', 'Chargement…');

    const botReply = await callChatGPT(message);

    // Remplace le dernier message "Chargement…" par la vraie réponse
    const lastMessage = chatHistoryDiv.lastChild;
    if (lastMessage && lastMessage.textContent.startsWith('IA : Chargement')) {
        lastMessage.textContent = `IA : ${botReply}`;
    }
});

// Gestion Enter pour envoyer le message
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
});
