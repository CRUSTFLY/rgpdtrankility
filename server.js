import express from "express";
import cors from "cors";
import { generateDocuments } from "./generateDocs.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
    try {
        const { formData, documentType } = req.body;

        // Vérification champs
        const requiredFields = ["nom","prenom","entreprise","sigle","adressesiege","cpsiege","villesiege","numtelsiege"];
        const missingFields = requiredFields.filter(f => !formData[f] || formData[f].trim() === "");
        if(missingFields.length > 0) return res.status(400).json({ error: `Champs manquants: ${missingFields.join(", ")}` });

        const { pdfBase64, docxBase64, zipBase64 } = await generateDocuments(formData, documentType);

        res.json({ pdfBase64, docxBase64, zipBase64 });

    } catch(err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ error: err.message });
    }
});

// -------------------- ROUTE CHATGPT / IARGPD --------------------
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Message manquant" });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.error("Erreur : la variable d'environnement OPENAI_API_KEY n'est pas définie !");
    return res.status(500).json({ reply: "Clé API OpenAI manquante côté serveur." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();
    console.log("Réponse OpenAI brute :", JSON.stringify(data, null, 2));

    const reply = data?.choices?.[0]?.message?.content || "Pas de réponse reçue.";
    res.json({ reply });
  } catch (err) {
    console.error("Erreur ChatGPT :", err);
    res.status(500).json({ reply: "Erreur lors de la communication avec l'API OpenAI." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

