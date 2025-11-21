import express from "express";
import cors from "cors";
import multer from "multer";
import Blob from "@vercel/blob";
import { Client } from "@neondatabase/serverless";
import { generateDocuments } from "./generateDocs.js";
import jwt from "jsonwebtoken";

const app = express();
const upload = multer(); // pour gérer l'upload de fichiers
const JWT_SECRET = process.env.JWT_SECRET || "secret_super_sécurisé";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- NEON --------------------
const client = new Client({ connectionString: process.env.NEON_DATABASE_URL });
await client.connect();

// -------------------- ROUTES --------------------

// Génération documents
app.post("/generate", async (req, res) => {
  try {
    const { formData, documentType } = req.body;

    const requiredFields = [
      "nom","prenom","entreprise","sigle","adressesiege","cpsiege","villesiege","numtelsiege"
    ];
    const missingFields = requiredFields.filter(f => !formData[f] || formData[f].trim() === "");
    if(missingFields.length > 0) return res.status(400).json({ error: `Champs manquants: ${missingFields.join(", ")}` });

    const { pdfBase64, docxBase64, zipBase64 } = await generateDocuments(formData, documentType);

    res.json({ pdfBase64, docxBase64, zipBase64 });

  } catch(err) {
    console.error("Erreur serveur :", err);
    res.status(500).json({ error: err.message });
  }
});

// ChatGPT
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Message manquant" });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ reply: "Clé API OpenAI manquante côté serveur." });

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
    const reply = data?.choices?.[0]?.message?.content || "Pas de réponse reçue.";
    res.json({ reply });
  } catch (err) {
    console.error("Erreur ChatGPT :", err);
    res.status(500).json({ reply: "Erreur lors de la communication avec l'API OpenAI." });
  }
});

// Route login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis" });

    const result = await client.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) return res.status(400).json({ error: "Utilisateur non trouvé" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) return res.status(400).json({ error: "Mot de passe incorrect" });

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// -------------------- UPLOAD VERS BLOB --------------------
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Fichier manquant" });

  try {
    const blobUrl = await Blob.upload({
      file: req.file.buffer,
      name: req.file.originalname,
      token: process.env.VERCEL_BLOB_TOKEN
    });

    res.json({ url: blobUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// -------------------- SAUVEGARDE DANS NEON --------------------
app.post("/save-document", async (req, res) => {
  const { userId, fileName, blobUrl } = req.body;
  if (!userId || !fileName || !blobUrl) return res.status(400).json({ error: "Champs manquants" });

  try {
    const result = await client.query(
      "INSERT INTO documents(user_id, file_name, blob_url) VALUES($1, $2, $3) RETURNING *",
      [userId, fileName, blobUrl]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- FRONTEND STATIQUE --------------------
app.use(express.static("public"));

// -------------------- SERVER --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
