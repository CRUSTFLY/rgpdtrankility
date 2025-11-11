import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, Footer, PageNumber } from "docx";
import archiver from "archiver";

/**
 * Génère PDF, DOCX et ZIP pour un document RGPD.
 * Retourne { pdfPath, docxPath, zipPath }
 */
export async function generateDocuments(nom, prenom, entreprise, sigle, adressesiege, cpsiege, villesiege, numtelsiege, downloadsDir) {
  return new Promise(async (resolve, reject) => {
    try {
      // ==== Nom de fichier safe ====
      const timestamp = Date.now();
      const baseName = `${nom}_${prenom}_${timestamp}`.replace(/[^a-zA-Z0-9_-]/g, "_");
      const pdfPath = path.join(downloadsDir, `${baseName}.pdf`);
      const docxPath = path.join(downloadsDir, `${baseName}.docx`);
      const zipPath = path.join(downloadsDir, `${baseName}.zip`);

      // ==== Contenu du document ====
      const titre = "...";
      const introduction = "...";
      const soustitre1 = "...";
      const texte1 = "...";
      const puces1 = ["...", "..."];
      // ... continue avec tous les autres blocs de texte et puces

      const clean = txt =>
        (txt || "")
          .replace(/[“”«»]/g, '"')
          .replace(/[’‘]/g, "'")
          .replace(/[–—]/g, "-")
          .replace(/[•·‣◦▪]/g, "-")
          .replace(/[^\x09\x0A\x0D\x20-\x7EÀ-ÿ€]/g, "")
          .trim();

      // ==== Génération PDF ====
      const pdfDoc = new PDFDocument({ margin: 50 });
      const pdfStream = fs.createWriteStream(pdfPath);
      pdfDoc.pipe(pdfStream);

      // Police (si disponible)
      const fontsDir = path.resolve("public/fonts");
      if (fs.existsSync(path.join(fontsDir, "calibril.ttf"))) pdfDoc.registerFont("Calibri Light", path.join(fontsDir, "calibril.ttf"));
      if (fs.existsSync(path.join(fontsDir, "calibrib.ttf"))) pdfDoc.registerFont("Calibri Bold", path.join(fontsDir, "calibrib.ttf"));

      // PAGE DE GARDE
      pdfDoc.font("Calibri Bold").fontSize(32).fillColor("#ebc015").text(titre, { align: "center", valign: "center" });
      const logoPath = path.resolve("public/images/logo_rgpd_trankility.png");
      if (fs.existsSync(logoPath)) {
        pdfDoc.image(logoPath, { width: 150, align: "center" });
      }

      pdfDoc.addPage();
      pdfDoc.font("Calibri Light").fontSize(11).fillColor("#000").text(clean(introduction), { align: "justify" }).moveDown(1);

      // Exemple bloc
      pdfDoc.font("Calibri Bold").fontSize(13).fillColor("#ebc015").text(clean(soustitre1)).moveDown(1);
      pdfDoc.font("Calibri Light").fontSize(11).text(clean(texte1)).moveDown(1);
      puces1.forEach(p => pdfDoc.text(`• ${p}`, { indent: 20 }).moveDown(0.3));

      // ... continue avec tous les autres blocs

      pdfDoc.end();

      // Attendre que le PDF soit écrit
      await new Promise((res, rej) => {
        pdfStream.on("finish", res);
        pdfStream.on("error", rej);
      });

      // ==== Génération DOCX ====
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
                children: [new TextRun({ text: titre, bold: true, size: 64, font: "Calibri Bold", color: "ebc015" })],
                alignment: "center",
                spacing: { before: 5000, after: 1000 },
              }),
              ...(fs.existsSync(logoPath) ? [new Paragraph({
                children: [new ImageRun({ data: fs.readFileSync(logoPath), transformation: { width: 200, height: 200 } })],
                alignment: "center",
                spacing: { after: 5000 },
              })] : []),
              new Paragraph({ text: clean(introduction), spacing: { after: 200 } }),
              // ... continue avec tous les autres blocs DOCX
            ],
          },
        ],
      });

      const docxBuffer = await Packer.toBuffer(doc);
      fs.writeFileSync(docxPath, docxBuffer);

      // ==== Création ZIP ====
      await new Promise((resZip, rejZip) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip");

        output.on("close", () => resZip());
        archive.on("error", err => rejZip(err));

        archive.pipe(output);
        archive.file(pdfPath, { name: `${baseName}.pdf` });
        archive.file(docxPath, { name: `${baseName}.docx` });
        archive.finalize();
      });

      resolve({ pdfPath, docxPath, zipPath });

    } catch (err) {
      console.error("Erreur generateDocuments:", err);
      reject(err);
    }
  });
}
