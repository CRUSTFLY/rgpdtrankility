import express from "express";
import cors from "cors";
import { generateDocuments } from "./generateDocs.js";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

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

        // Générer les documents
        const { pdfPath, docxPath, zipPath } = await generateDocuments(formData, documentType);

        // Lire les fichiers et les encoder en base64
        const pdfData = fs.readFileSync(pdfPath).toString("base64");
        const docxData = fs.readFileSync(docxPath).toString("base64");
        const zipData = fs.readFileSync(zipPath).toString("base64");

        // Supprimer les fichiers temporaires après lecture
        [pdfPath, docxPath, zipPath].forEach(f => fs.unlinkSync(f));

        // Retourner les fichiers encodés
        res.json({
            pdf: pdfData,
            docx: docxData,
            zip: zipData,
            filenames: {
                pdf: "Politique_de_confidentialite_RGPD.pdf",
                docx: "Politique_de_confidentialite_RGPD.docx",
                zip: "Politique_de_confidentialite_RGPD.zip"
            }
        });

    } catch(err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ error: err.message });
    }
});

export default app;
