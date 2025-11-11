// Politique_confidentialite_generale_RGPD.js
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import archiver from "archiver";
import { PassThrough } from "stream";

/**
 * Retourne { pdfBase64, docxBase64, zipBase64 }.
 */
export async function generateRGPD(nom, prenom, entreprise, sigle, adressesiege, cpsiege, villesiege, numtelsiege) {

  const texte = `
POLITIQUE DE CONFIDENTIALITÉ RGPD

1. Collecte des données
- Nom et prénom
- Coordonnées professionnelles
- Informations sur l’entreprise

2. Utilisation des données
- Gestion administrative
- Communication client/partenaire
- Conformité légale

3. Partage des données
- Seulement aux autorités légales si requis
- Prestataires techniques respectant la confidentialité

4. Sécurité et conservation
- Mesures techniques et organisationnelles mises en place

5. Vos droits
- Accéder, rectifier ou supprimer vos données
- Vous opposer à leur traitement

Contact : ${entreprise} (${sigle})
Adresse : ${adressesiege}, ${cpsiege} ${villesiege}
Téléphone : ${numtelsiege}
Nom du responsable : ${nom} ${prenom}
`;

  // --- Génération PDF dans un buffer ---
  const pdfDoc = new PDFDocument({ margin: 50 });
  const pdfStream = new PassThrough();
  const pdfChunks = [];
  pdfStream.on("data", chunk => pdfChunks.push(chunk));
  const pdfFinished = new Promise((resolve, reject) => {
    pdfStream.on("end", resolve);
    pdfStream.on("error", reject);
  });
  pdfDoc.pipe(pdfStream);
  pdfDoc.fontSize(16).text("Politique de confidentialité RGPD", { align: "center" });
  pdfDoc.moveDown();
  pdfDoc.fontSize(12).text(texte);
  pdfDoc.end();
  await pdfFinished;
  const pdfBuffer = Buffer.concat(pdfChunks);
  const pdfBase64 = pdfBuffer.toString("base64");

  // --- DOCX ---
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [ new TextRun({ text: "Politique de confidentialité RGPD", bold: true, size: 36 }) ],
          alignment: AlignmentType.CENTER
        }),
        ...texte.split("\n").map(line => new Paragraph({ children: [ new TextRun({ text: line }) ] }))
      ]
    }]
  });
  const docxBuffer = await Packer.toBuffer(doc);
  const docxBase64 = docxBuffer.toString("base64");

  // --- ZIP (archive en mémoire via archiver) ---
  const zipStream = new PassThrough();
  const zipChunks = [];
  zipStream.on("data", c => zipChunks.push(c));
  const zipFinished = new Promise((resolve, reject) => {
    zipStream.on("end", resolve);
    zipStream.on("error", reject);
  });

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(zipStream);
  archive.append(pdfBuffer, { name: "Politique_RGPD.pdf" });
  archive.append(docxBuffer, { name: "Politique_RGPD.docx" });
  await archive.finalize();
  await zipFinished;
  const zipBuffer = Buffer.concat(zipChunks);
  const zipBase64 = zipBuffer.toString("base64");

  return { pdfBase64, docxBase64, zipBase64 };
}
