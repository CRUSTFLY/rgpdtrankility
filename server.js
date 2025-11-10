import express from "express";
import cors from "cors";
import { generateRGPDInMemory } from "./Politique_confidentialite_generale_RGPD.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
  try {
    const zipStream = await generateRGPDInMemory(req.body);

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="Politique_RGPD.zip"',
    });

    zipStream.pipe(res);
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur lancé sur http://localhost:${PORT}`));
