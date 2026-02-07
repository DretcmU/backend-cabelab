import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import { Resend } from "resend";

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

// HTML TEMPLATE
function generarHTML(data) {
  return `
  <html>
  <body style="font-family: Arial">
    <h2>CABELAB FORMULARIO</h2>
    <p><b>Cliente:</b> ${data.cliente}</p>
    <p><b>RUC:</b> ${data.ruc}</p>
    <p><b>Correo:</b> ${data.correo}</p>
    <p><b>Teléfono:</b> ${data.telefono}</p>
    <p><b>Fecha:</b> ${new Date().toLocaleString()}</p>

    <h3>Equipos</h3>
    <ul>
      ${data.equipos.map(e => `<li>${e.marca} ${e.modelo} ${e.serie}</li>`).join("")}
    </ul>
  </body>
  </html>
  `;
}

// API
app.post("/generar-enviar-pdf", async (req, res) => {
  try {
    const data = req.body;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(generarHTML(data), { waitUntil: "load" });

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Enviar correo
    await resend.emails.send({
      from: "CABELAB <onboarding@resend.dev>",
      to: data.correo,
      subject: "Formulario CABELAB",
      html: "<p>Adjunto su formulario</p>",
      attachments: [
        {
          filename: "formulario.pdf",
          content: pdfBuffer
        }
      ]
    });

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error PDF");
  }
});

app.listen(process.env.PORT || 3000);
