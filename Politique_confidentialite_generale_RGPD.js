import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, Footer, PageNumber } from "docx";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PassThrough } from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dossiers publics pour polices et images
const fontsDir = path.join(__dirname, "public", "fonts");
const imagesDir = path.join(__dirname, "public", "images");

const nomFichier = "Politique de confidentialité générale RGPD";

export async function generateRGPDInMemory({ nom, prenom, entreprise, sigle, adressesiege, cpsiege, villesiege, numtelsiege }) {
  // --- PDF ---
  const pdfDoc = new PDFDocument({ margin: 50 });
  const pdfChunks = [];
  pdfDoc.on("data", (chunk) => pdfChunks.push(chunk));

  pdfDoc.registerFont("Calibri Light", path.join(fontsDir, "calibril.ttf"));
  pdfDoc.registerFont("Calibri Bold", path.join(fontsDir, "calibrib.ttf"));

  const clean = (txt) =>
    (txt || "")
      .replace(/[“”«»]/g, '"')
      .replace(/[’‘]/g, "'")
      .replace(/[–—]/g, "-")
      .replace(/[•·‣◦▪]/g, "-")
      .replace(/[^\x09\x0A\x0D\x20-\x7EÀ-ÿ€]/g, "")
      .trim();

  // --- PAGE DE GARDE ---
  const pageWidth = pdfDoc.page.width;
  const pageHeight = pdfDoc.page.height;
  pdfDoc
    .font("Calibri Bold")
    .fontSize(32)
    .fillColor("#ebc015")
    .text(nomFichier, pageWidth / 2 - 250, pageHeight / 2 - 100, {
      width: 500,
      align: "center",
    });

  const logoPath = path.join(imagesDir, "logo_rgpd_trankility.png");
  if (fs.existsSync(logoPath)) pdfDoc.image(logoPath, pageWidth / 2 - 75, pageHeight / 2, { width: 150 });

  // --- CONTENU ---
  pdfDoc.addPage();
  const intro = `Le présent document est établi au nom de la ${entreprise} sus nommée ${sigle}.`;
  pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000").text(clean(intro), { align: "justify" });

  pdfDoc.end();
  const pdfBuffer = await new Promise((resolve) => {
    pdfDoc.on("end", () => resolve(Buffer.concat(pdfChunks)));
  });

  // --- DOCX ---
  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
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
            children: [new TextRun({ text: nomFichier, bold: true, color: "ebc015", size: 64, font: "Calibri Bold" })],
            alignment: "center",
            spacing: { before: 5000, after: 1000 },
          }),
          new Paragraph({
            children: [new ImageRun({ data: fs.readFileSync(logoPath), transformation: { width: 200, height: 200 } })],
            alignment: "center",
            spacing: { after: 5000 },
          }),
          ...intro
            .split("\n")
            .filter((l) => l.trim())
            .map((l) => new Paragraph({ children: [new TextRun({ text: l, font: "Calibri Light", size: 22 })] })),
        ],
      },
    ],
  });

  const docxBuffer = await Packer.toBuffer(doc);

  // --- ZIP ---
  const zipStream = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(zipStream);
  archive.append(pdfBuffer, { name: "Politique_RGPD.pdf" });
  archive.append(docxBuffer, { name: "Politique_RGPD.docx" });
  archive.finalize();

  return zipStream; // Stream prêt à être envoyé directement
}
