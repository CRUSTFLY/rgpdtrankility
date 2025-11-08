import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import fs from "fs";

import { generateDocuments } from "./generateDocs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use("/downloads", express.static(path.join(__dirname, "downloads")));

// Crée le dossier downloads si nécessaire
const downloadsDir = path.join("/tmp", "downloads");
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

app.post("/generate", async (req, res) => {
  try {
    const { nom, prenom, entreprise, sigle, adressesiege, cpsiege, villesiege, numtelsiege } = req.body;
    if (!nom || !prenom || !entreprise || !adressesiege || !cpsiege || !villesiege || !numtelsiege)
      return res.status(400).json({ error: "Champs manquants" });

    const { pdfPath, docxPath, zipPath } = await generateDocuments(
      nom, prenom, entreprise, sigle, adressesiege, cpsiege, villesiege, numtelsiege, downloadsDir
    );

    const baseName = path.basename(pdfPath, ".pdf");

    res.json({
      pdfUrl: `/downloads/${baseName}.pdf`,
      docxUrl: `/downloads/${baseName}.docx`,
      zipUrl: `/downloads/${baseName}.zip`,
    });
  } catch (err) {
    console.error("Erreur serveur :", err);
    res.status(500).json({ error: err.message || "Erreur lors de la génération des fichiers." });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Serveur lancé sur http://localhost:${PORT}`));
