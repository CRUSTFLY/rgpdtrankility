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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

