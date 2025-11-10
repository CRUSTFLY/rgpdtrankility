import express from "express";
import cors from "cors";
import { generateDocuments } from "./generateDocs.js";

const app = express();
app.use(cors());
app.use(express.json());

// POST pour générer un ZIP contenant PDF + DOCX
app.post("/generate", async (req, res) => {
  try {
    const { formData, documentType } = req.body;

    // Génération des fichiers en mémoire
    const { pdfBuffer, docxBuffer } = await generateDocuments(formData, documentType);

    // Génération du ZIP en mémoire
    import archiver from "archiver";
    import { PassThrough } from "stream";

    const zipStream = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(zipStream);
    archive.append(pdfBuffer, { name: "document.pdf" });
    archive.append(docxBuffer, { name: "document.docx" });
    archive.finalize();

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="documents.zip"',
    });

    zipStream.pipe(res);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur lancé sur http://localhost:${PORT}`));
