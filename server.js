import express from "express";
import cors from "cors";
import { chromium } from "playwright";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ====== TEST ======
app.get("/", (req, res) => {
  res.send("CABELAB Backend funcionando 🚀");
});

app.listen(PORT, () => {
  console.log("Servidor en puerto", PORT);
});


app.post("/enviar-pdf", async (req, res) => {
  try {
    const { email, html } = req.body;

    if (!email) return res.send("No email");

    // generar PDF
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: "A4" });
    await browser.close();

    // enviar correo
    await resend.emails.send({
      from: "CABELAB <onboarding@resend.dev>",
      to: email,
      subject: "Formato de Recepción CABELAB",
      html: "<p>Adjunto su formato en PDF</p>",
      attachments: [
        {
          filename: "formato.pdf",
          content: pdf.toString("base64"),
        }
      ]
    });

    res.send("Correo enviado");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});