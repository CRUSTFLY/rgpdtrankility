const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const responseDiv = document.getElementById('response');

// Fonction pour afficher la réponse sous le formulaire
function showResponse(text) {
    responseDiv.textContent = text;
}

// Fonction pour appeler l'API OpenAI
async function callChatGPT(message) {
    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer VOTRE_CLE_API_ICI' // Remplace par ta clé
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message }]
            })
        });
        const data = await res.json();
        return data.choices[0].message.content;
    } catch (err) {
        console.error(err);
        return "Erreur lors de la communication avec l'API.";
    }
}

// Événement clic sur le bouton envoyer
sendBtn.addEventListener('click', async () => {
    const message = input.value.trim();
    if (!message) return;

    showResponse("Chargement…"); // message d'attente
    input.value = '';

    const botReply = await callChatGPT(message);
    showResponse(botReply);
});

// Événement Enter pour envoyer le message
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});
