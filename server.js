import express from "express";
import cors from "cors";
import { generateRGPD } from "./Politique_confidentialite_generale_RGPD.js";

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

    let files;
    switch(documentType) {
      case "Politique de confidentialité RGPD":
        files = await generateRGPD(
          formData.nom,
          formData.prenom,
          formData.entreprise,
          formData.sigle,
          formData.adressesiege,
          formData.cpsiege,
          formData.villesiege,
          formData.numtelsiege
        );
        break;
      default:
        return res.status(400).json({ error: "Type de document inconnu" });
    }

    res.json({
      pdfBase64: files.pdfBase64,
      docxBase64: files.docxBase64,
      zipBase64: files.zipBase64
    });

  } catch(err) {
    console.error("Erreur serveur :", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur lancé sur http://localhost:${PORT}`));
