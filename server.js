import express from "express";
import cors from "cors";
import { Resend } from "resend";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/enviar-pdf", async (req, res) => {
  try {
    const { correo, pdfBase64 } = req.body;
    if (!correo || !pdfBase64) return res.status(400).json({ error: "Faltan datos" });

    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    await resend.emails.send({
      from: "CABELAB <onboarding@resend.dev>", // gratis
      to: correo,
      subject: "Formato de Recepción CABELAB",
      html: "<p>Adjunto su formato.</p>",
      attachments: [
        {
          filename: "Formato_CABELAB.pdf",
          content: pdfBuffer
        }
      ]
    });

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(10000, () => console.log("Server ON"));
