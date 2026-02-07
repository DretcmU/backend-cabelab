import express from "express";
import { Resend } from "resend";
import PDFDocument from "pdfkit";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

// generar pdf en memoria
function generarPDF(data) {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(22).text("FACTURA CABELAB", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Cliente: ${data.nombre}`);
    doc.text(`Servicio: ${data.servicio}`);
    doc.text(`Precio: S/ ${data.precio}`);
    doc.text(`Fecha: ${new Date().toLocaleString()}`);

    doc.end();
  });
}

app.post("/enviar-pdf", async (req, res) => {
  try {
    const { email, nombre, servicio, precio } = req.body;

    const pdfBuffer = await generarPDF({ nombre, servicio, precio });

    await resend.emails.send({
      from: "CABELAB <onboarding@resend.dev>",
      to: email,
      subject: "Tu factura CABELAB 💇‍♂️",
      html: `<h2>Gracias por confiar en CABELAB</h2>
             <p>Adjunto tu comprobante.</p>`,
      attachments: [
        {
          filename: "factura.pdf",
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

app.listen(10000, () => console.log("Servidor listo puerto 10000"));
