app.post("/generate", async (req, res) => {
  try {
    const { formData, documentType } = req.body;
    const { pdfBuffer, docxBuffer } = await generateDocuments(formData, documentType);

    const zipStream = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(zipStream);
    archive.append(pdfBuffer, { name: "document.pdf" });
    archive.append(docxBuffer, { name: "document.docx" });
    archive.finalize();

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="documents.zip"',
    });

    zipStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
