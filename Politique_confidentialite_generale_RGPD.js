import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import archiver from "archiver";
import streamBuffers from "stream-buffers";

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

    // --- PDF ---
    const pdfStream = new streamBuffers.WritableStreamBuffer();
    const pdfDoc = new PDFDocument({ margin: 50 });
    pdfDoc.pipe(pdfStream);
    pdfDoc.fontSize(16).text("Politique de confidentialité RGPD", { align: "center" });
    pdfDoc.moveDown();
    pdfDoc.fontSize(12).text(texte);
    pdfDoc.end();
    await new Promise(res => pdfDoc.on("end", res));
    const pdfBase64 = pdfStream.getContentsAsString("base64");

    // --- DOCX ---
    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({ children: [new TextRun({ text: "Politique de confidentialité RGPD", bold:true, size:36 })], alignment: AlignmentType.CENTER }),
                ...texte.split("\n").map(l => new Paragraph({ text: l }))
            ]
        }]
    });
    const bufferDocx = await Packer.toBuffer(doc);
    const docxBase64 = bufferDocx.toString("base64");

    // --- ZIP ---
    const zipStream = new streamBuffers.WritableStreamBuffer();
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(zipStream);

    archive.append(Buffer.from(pdfBase64, "base64"), { name: "Politique_RGPD.pdf" });
    archive.append(Buffer.from(docxBase64, "base64"), { name: "Politique_RGPD.docx" });
    await archive.finalize();
    await new Promise(res => zipStream.on("finish", res));
    const zipBase64 = zipStream.getContentsAsString("base64");

    return { pdfBase64, docxBase64, zipBase64 };
}
