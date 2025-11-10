import { generateRGPD } from "./Politique_confidentialite_generale_RGPD.js";

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
                data.numtelsiege
            );
        default:
            throw new Error("Type de document inconnu");
    }
}
