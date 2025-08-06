import { PDFDocument, rgb } from "pdf-lib";
import type { Question } from "../types/Question";
import url from "../fonts/AbhayaLibre-Medium.ttf?url"

// adjust import as needed to get ArrayBuffer / Uint8Array

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function generateAnswerKeyPdf(questions: Question[]) {
  const pdfDoc = await PDFDocument.create();
  const fontkit = (await import('@pdf-lib/fontkit')).default 

  pdfDoc.registerFontkit(fontkit)
  const fontBytes = await fetch(url).then((res) => res.arrayBuffer())
  const font = await pdfDoc.embedFont(fontBytes)


  const fontSizeTitle = 18;
  const fontSizeText = 12;
  const lineHeight = 14;

  let page = pdfDoc.addPage();
  const { height } = page.getSize();

  let y = height - 40; // start near top

  // Title
  page.drawText("Answer Key", {
    x: 50,
    y,
    size: fontSizeTitle,
    font: font,
    color: rgb(0, 0, 0),
  });
  y -= fontSizeTitle + 5;

  // Answers
  questions.forEach((q, i) => {
    const correctLetters = q.correctAnswers.join(", ");
    const text = `${i + 1}. ${correctLetters}`;

    // If not enough space, add new page
    if (y < 40) {
      page = pdfDoc.addPage();
      y = height - 40;
    }

    page.drawText(text, {
      x: 50,
      y,
      font: font,
      size: fontSizeText,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  });

  const pdfBytes = await pdfDoc.save();

  download(new Blob([pdfBytes], { type: "application/pdf" }), "answer_key.pdf");
}

export default generateAnswerKeyPdf;
