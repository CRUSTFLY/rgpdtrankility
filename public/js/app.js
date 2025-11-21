// -------------------- S'INSCRIRE --------------------
import express from "express";
import cors from "cors";
import { Client } from "@neondatabase/serverless";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({ connectionString: process.env.NEON_DATABASE_URL });
await client.connect();

// Route inscription
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await client.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email`,
      [name, email, hashedPassword]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") { // Contrainte unique violation
      res.status(400).json({ error: "Email déjà utilisé" });
    } else {
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
});

// -------------------- GÉNÉRATION DOCUMENTS --------------------
async function generateDocs(formData, documentType) {
  const res = await fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formData, documentType })
  });
  if (!res.ok) throw new Error("Erreur génération document");
  return res.json(); // { pdfBase64, docxBase64, zipBase64 }
}

// -------------------- CHATGPT --------------------
async function sendChatMessage(message) {
  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  if (!res.ok) throw new Error("Erreur ChatGPT");
  const data = await res.json();
  return data.reply;
}

// -------------------- UPLOAD VERS BLOB --------------------
async function uploadToBlob(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      console.error("Erreur réseau API/upload:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    console.log("URL Blob reçue :", data.url);
    return data.url;
  } catch (err) {
    console.error("Erreur fetch upload:", err);
    return null;
  }
}


// -------------------- SAUVEGARDE DANS NEON --------------------
async function saveDocumentInfo(userId, fileName, blobUrl) {
  const res = await fetch("/save-document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, fileName, blobUrl })
  });

  if (!res.ok) throw new Error("Erreur sauvegarde document");
  return res.json(); // Retourne la ligne insérée
}

async function handleFileUpload(file, currentUser) {
  try {
    // 1️⃣ Upload vers Blob
    const blobUrl = await uploadToBlob(file);
    if (!blobUrl) {
      console.error("Erreur lors de l'upload du fichier");
      return;
    }

    // 2️⃣ Sauvegarde dans Neon
    const savedDoc = await saveDocumentInfo(currentUser.id, file.name, blobUrl);
    console.log("Document sauvegardé dans Neon :", savedDoc);
  } catch (err) {
    console.error("Erreur upload/sauvegarde :", err);
  }
}
// -------------------- UTILITAIRES --------------------
function b64toBlob(b64Data, contentType = "", sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = Array.from(slice).map(c => c.charCodeAt(0));
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: contentType });
}
