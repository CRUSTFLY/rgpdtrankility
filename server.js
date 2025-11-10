import express from "express";
import cors from "cors";
import { generateDocuments } from "./generateDocs.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
    try {
        const { formData, documentType } = req.body;
        const zipStream = await generateDocuments(formData, documentType);

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
