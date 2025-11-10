// Politique_confidentialite_generale_RGPD.js
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, Footer, PageNumber } from "docx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Pour les chemins images/polices
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fontsDir = path.join(__dirname, "public", "fonts");
const imagesDir = path.join(__dirname, "public", "images");

const nomFichier = "Politique de confidentialité générale RGPD";

// --- Fonction principale ---
export async function generateRGPD(nom, prenom, entreprise, sigle, adressesiege, cpsiege, villesiege, numtelsiege) {
    // --- TEXTE ---
    const titre = nomFichier;
    const introduction = `Le présent document est établi au nom de la ${entreprise} sus nommée ${sigle}.`;
    const soustitre1 = `1. Politique de confidentialité`;
    const texte1 = `${entreprise} s’engage fermement à protéger votre sphère privée. La présente politique de confidentialité (la Politique) s’applique au traitement de vos données personnelles en relation avec l’utilisation de nos services et à l’exécution de nos prestations.`;
    
    // (Ajoute ici tous les autres sous-titres et textes que tu avais définis, comme soustitre2, texte2, puces3, etc.)

    // --- Génération PDF en mémoire ---
    const pdfDoc = new PDFDocument({ margin: 50 });
    const pdfChunks = [];
    pdfDoc.on("data", (chunk) => pdfChunks.push(chunk));
    pdfDoc.font("Helvetica-Bold").fontSize(32).fillColor("#ebc015").text(titre, { align: "center" });
    pdfDoc.moveDown(2);
    pdfDoc.font("Helvetica").fontSize(12).fillColor("#000000").text(introduction, { align: "justify" });
    pdfDoc.addPage();
    pdfDoc.font("Helvetica-Bold").fontSize(14).fillColor("#ebc015").text(soustitre1, { align: "left" });
    pdfDoc.font("Helvetica").fontSize(12).fillColor("#000000").text(texte1, { align: "justify" });
    pdfDoc.end();
    await new Promise((resolve) => pdfDoc.on("end", resolve));
    const pdfBuffer = Buffer.concat(pdfChunks);

    // --- Génération DOCX en mémoire ---
    const doc = new Document({
        sections: [
            {
                properties: {
                    page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [
                                    new TextRun({ text: "Page ", font: "Calibri Light", size: 18, color: "A0A0A0" }),
                                    new TextRun({ children: [PageNumber.CURRENT], font: "Calibri Light", size: 18, color: "A0A0A0" }),
                                ],
                            }),
                        ],
                    }),
                },
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: titre, bold: true, color: "ebc015", size: 64, font: "Calibri Bold" })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 5000, after: 1000 },
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        children: [new TextRun({ text: introduction, font: "Calibri Light", size: 22 })],
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: soustitre1, bold: true, color: "ebc015", size: 26, font: "Calibri Bold" })],
                        spacing: { before: 200 },
                    }),
                    new Paragraph({ children: [new TextRun({ text: texte1, font: "Calibri Light", size: 22 })] }),
                    // Ajoute ici tous les autres blocs et puces de manière similaire
                ],
            },
        ],
    });

    const docxBuffer = await Packer.toBuffer(doc);

    // --- Retour des buffers PDF et DOCX ---
    return { pdfBuffer, docxBuffer };
}
