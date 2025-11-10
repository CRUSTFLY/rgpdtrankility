// api/generate.js
import { generateDocuments } from "../generateDocs.js";

export default async function handler(req, res) {
  if(req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { formData, documentType } = req.body;

    const requiredFields = ["nom","prenom","entreprise","sigle","adressesiege","cpsiege","villesiege","numtelsiege"];
    const missingFields = requiredFields.filter(f => !formData[f] || formData[f].trim() === "");
    if(missingFields.length > 0) {
      return res.status(400).json({ error: `Champs manquants: ${missingFields.join(", ")}` });
    }

    const { pdfBase64, docxBase64, zipBase64 } = await generateDocuments(formData, documentType);

    res.status(200).json({ pdfBase64, docxBase64, zipBase64 });

  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
