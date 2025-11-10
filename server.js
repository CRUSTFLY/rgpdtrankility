import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
import { generateDocuments } from "./generateDocs.js";

const app = express();
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/downloads", express.static(path.join(__dirname, "downloads")));

// POST pour générer un document
app.post("/generate", async (req, res) => {
    try {
        const { formData, documentType } = req.body;

        // Vérifier que tous les champs sont présents
        const requiredFields = ["nom","prenom","entreprise","sigle","adressesiege","cpsiege","villesiege","numtelsiege"];
        const missingFields = requiredFields.filter(f => !formData[f] || formData[f].trim() === "");
        if(missingFields.length > 0) {
            return res.status(400).json({ error: `Champs manquants: ${missingFields.join(", ")}` });
        }

        const { pdfPath, docxPath, zipPath } = await generateDocuments(formData, documentType);
        const baseName = path.basename(pdfPath);

        res.json({
            pdfUrl: `/downloads/${baseName}`,
            docxUrl: `/downloads/${path.basename(docxPath)}`,
            zipUrl: `/downloads/${path.basename(zipPath)}`
        });
    } catch(err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Serveur lancé sur http://localhost:${PORT}`));
