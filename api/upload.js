import { uploadFile } from "@vercel/blob";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) return res.status(400).json({ error: "Fichier manquant" });

  try {
    const url = await uploadFile({
      file: file.stream(),          // stream du fichier
      name: file.name,              // nom du fichier
      token: process.env.VERCEL_BLOB_TOKEN
    });

    res.status(200).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
