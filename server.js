import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({limit:"50mb"})); // pdf base64

// EMAIL CONFIG (GMAIL)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "TU_CORREO@gmail.com",
    pass: "cyms wxpk imhu whph"
  }
});

// API
app.post("/enviar-pdf", async (req, res) => {
  try {
    const { correo, pdfBase64 } = req.body;

    const buffer = Buffer.from(pdfBase64, "base64");

    await transporter.sendMail({
      from: "CABELAB <TU_CORREO@gmail.com>",
      to: correo,
      subject: "Formato de recepción CABELAB",
      text: "Adjunto su formato de recepción.",
      attachments: [
        {
          filename: "Formato_CABELAB.pdf",
          content: buffer
        }
      ]
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server OK", PORT));
