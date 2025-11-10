import path from "path";
import fs from "fs";
import { generateRGPD } from "./Politique_confidentialite_generale_RGPD.js";

// Créer le dossier downloads
const downloadsDir = path.join("/tmp");
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

export async function generateDocuments(data, documentType) {
    switch(documentType) {
        case "Politique de confidentialité RGPD":
            return generateRGPD(
                data.nom,
                data.prenom,
                data.entreprise,
                data.sigle,
                data.adressesiege,
                data.cpsiege,
                data.villesiege,
                data.numtelsiege,
                downloadsDir
            );
        default:
            throw new Error("Type de document inconnu");
    }
}
