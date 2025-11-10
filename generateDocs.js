import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, Footer, PageNumber } from "docx";
import archiver from "archiver";
import { PassThrough } from "stream";
import fs from "fs";
import path from "path";

const __dirname = path.resolve();
const fontsDir = path.join(__dirname, "public", "fonts");
const imagesDir = path.join(__dirname, "public", "images");

export async function generateDocuments(data, documentType) {
    if (documentType !== "Politique de confidentialité RGPD") {
        throw new Error("Type de document inconnu");
    }

    const { pdfBuffer, docxBuffer } = await generateRGPD(data);

    // Génération du ZIP en mémoire
    const zipStream = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(zipStream);
    archive.append(pdfBuffer, { name: "document.pdf" });
    archive.append(docxBuffer, { name: "document.docx" });
    archive.finalize();

    return zipStream;
}

async function generateRGPD(data) {
    const { nom, prenom, entreprise, sigle, adressesiege, cpsiege, villesiege, numtelsiege } = data;

    // ===== PDF =====
    const pdfDoc = new PDFDocument({ margin: 50 });
    const pdfChunks = [];
    pdfDoc.on("data", (chunk) => pdfChunks.push(chunk));
    const pdfEnd = new Promise((res) => pdfDoc.on("end", res));

    // Polices
    if (fs.existsSync(path.join(fontsDir, "calibril.ttf"))) {
        pdfDoc.registerFont("Calibri Light", path.join(fontsDir, "calibril.ttf"));
    }
    if (fs.existsSync(path.join(fontsDir, "calibrib.ttf"))) {
        pdfDoc.registerFont("Calibri Bold", path.join(fontsDir, "calibrib.ttf"));
    }

    // Contenu simplifié pour l’exemple
    pdfDoc.font("Calibri Bold").fontSize(32).fillColor("#ebc015")
        .text("Politique de confidentialité RGPD", { align: "center" });
    const logoPath = path.join(imagesDir, "logo_rgpd_trankility.png");
    if (fs.existsSync(logoPath)) pdfDoc.image(logoPath, { width: 150, align: "center" });

    pdfDoc.addPage();
    pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000000")
        .text(`Le présent document est établi au nom de la ${entreprise} (${sigle})`);

    pdfDoc.end();
    await pdfEnd;
    const pdfBuffer = Buffer.concat(pdfChunks);

    // ===== DOCX =====
    const doc = new Document({
        sections: [
            {
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Politique de confidentialité RGPD", bold: true, color: "ebc015", size: 64, font: "Calibri Bold" }),
                        ],
                        alignment: AlignmentType.CENTER,
                    }),
                    ...(fs.existsSync(logoPath)
                        ? [new Paragraph({ children: [new ImageRun({ data: fs.readFileSync(logoPath), transformation: { width: 200, height: 200 } })], alignment: AlignmentType.CENTER })]
                        : []),
                    new Paragraph({ text: "" }),
                    new Paragraph({ children: [new TextRun({ text: `Le présent document est établi au nom de la ${entreprise} (${sigle})`, size: 22, font: "Calibri Light" })] })
                ],
            },
        ],
    });
    const docxBuffer = await Packer.toBuffer(doc);

    return { pdfBuffer, docxBuffer };
}
