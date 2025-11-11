// api/generate.js
import { buffer } from "stream/consumers";
import { generateDocuments } from "../generateDocs.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { formData, documentType } = req.body;

    // validations côté serveur
    const required = ["nom","prenom","entreprise","sigle","adressesiege","cpsiege","villesiege","numtelsiege"];
    const missing = required.filter(f => !formData?.[f] || String(formData[f]).trim() === "");
    if (missing.length) return res.status(400).json({ error: `Champs manquants: ${missing.join(", ")}` });

    // generateDocuments renvoie { pdfBase64, docxBase64, zipBase64 }
    const result = await generateDocuments(formData, documentType);

    return res.status(200).json(result);
  } catch (err) {
    console.error("api/generate error:", err);
    return res.status(500).json({ error: err?.message || "Erreur serveur" });
  }
}
