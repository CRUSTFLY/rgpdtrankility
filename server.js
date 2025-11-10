import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
import { generateDocuments } from "./generateDocs.js";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Dossier temporaire pour générer les fichiers
const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

// POST pour générer un document et le renvoyer
app.post("/generate", async (req, res) => {
  try {
    const { formData, documentType } = req.body;

    // Générer les fichiers dans tmpDir
    const { pdfPath, docxPath, zipPath } = await generateDocuments(formData, documentType, tmpDir);

    // Renvoyer un JSON avec les noms de fichiers temporaires
    res.json({
      pdfName: path.basename(pdfPath),
      docxName: path.basename(docxPath),
      zipName: path.basename(zipPath)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint pour télécharger un fichier spécifique
app.get("/download/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(tmpDir, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) console.error(err);
    });
  } else {
    res.status(404).send("Fichier introuvable !");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur lancé sur http://localhost:${PORT}`));
