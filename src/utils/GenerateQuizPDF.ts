import { PDFDocument, PDFFont, rgb } from "pdf-lib";
import type { Question } from "../types/Question";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function splitTextToLines(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

async function generateQuizOnlyPdf(questions: Question[]) {
  const pdfDoc = await PDFDocument.create();
  const url = (await import('../fonts/AbhayaLibre-Medium.ttf?url')).default
  const fontkit = (await import('@pdf-lib/fontkit')).default 
  pdfDoc.registerFontkit(fontkit)
  const fontBytes = await fetch(url).then((res) => res.arrayBuffer())
  const font = await pdfDoc.embedFont(fontBytes)
  const fontSizeText = 12;
  const lineHeight = 16;

  const pageWidth = 595.28;  // A4 width in points
  const pageHeight = 841.89; // A4 height in points
  const leftMargin = 50;
  const rightMargin = 50;
  const maxTextWidth = pageWidth - leftMargin - rightMargin;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - 50;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    // Split question text into lines
    const questionText = `${i + 1}. ${q.question}`;
    const questionLines = splitTextToLines(questionText, font, fontSizeText, maxTextWidth);

    // Check if enough space for question + some answers, else new page
    if (y - questionLines.length * lineHeight < 50) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - 50;
    }

    // Draw question lines
    questionLines.forEach(line => {
      page.drawText(line, {
        x: leftMargin,
        y,
        font: font,
        size: fontSizeText,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    });

    // Draw choices
    const sortedLetters = Object.keys(q.answers).sort();
    for (const letter of sortedLetters) {
      const choiceText = `   ${letter}. ${q.answers[letter]}`;
      const choiceLines = splitTextToLines(choiceText, font, fontSizeText, maxTextWidth);

      // If not enough space, add page
      if (y - choiceLines.length * lineHeight < 50) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - 50;
      }

      choiceLines.forEach(line => {
        page.drawText(line, {
          x: leftMargin + 15,
          y,
          font: font,
          size: fontSizeText,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;
      });
    }

    y -= lineHeight; // Add some spacing after each question
  }

  const pdfBytes = await pdfDoc.save();
  download(new Blob([pdfBytes], { type: "application/pdf" }), "quiz.pdf");
}

export default generateQuizOnlyPdf;
