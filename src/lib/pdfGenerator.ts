import { jsPDF } from 'jspdf';
import { Content } from '@shared/schema';
import { QAQFLevels, QAQFCharacteristics } from './qaqf';

/**
 * Generates a PDF document from a content object
 * @param content The content object to export
 * @returns The generated PDF document
 */
export function generateContentPDF(content: Content): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Set up fonts
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  
  // Title
  doc.text(content.title, margin, 20);
  
  // Module code and QAQF level
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Module: ${content.moduleCode || 'N/A'}`, margin, 30);
  doc.text(`QAQF Level: ${content.qaqfLevel}`, margin, 38);
  
  // Find QAQF level name
  const qaqfLevel = QAQFLevels.find(level => level.id === content.qaqfLevel);
  if (qaqfLevel) {
    doc.text(`(${qaqfLevel.name})`, margin + 50, 38);
  }
  
  // Status and dates
  doc.text(`Status: ${content.verificationStatus}`, margin, 46);
  doc.text(`Created: ${new Date(content.createdAt).toLocaleDateString()}`, margin, 54);
  
  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, 60, pageWidth - margin, 60);
  
  // QAQF Characteristics
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("QAQF Characteristics", margin, 70);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  let characteristicsY = 80;
  
  if (content.characteristics && Array.isArray(content.characteristics)) {
    content.characteristics.forEach((charId: number, index: number) => {
      const char = QAQFCharacteristics.find(c => c.id === charId);
      if (char) {
        doc.text(`• ${char.name}: ${char.description}`, margin, characteristicsY);
        characteristicsY += 8;
      } else {
        doc.text(`• Characteristic ${charId}`, margin, characteristicsY);
        characteristicsY += 8;
      }
    });
  } else if (content.characteristics && typeof content.characteristics === 'object') {
    Object.entries(content.characteristics).forEach(([key, value], index) => {
      doc.text(`• ${key}`, margin, characteristicsY);
      characteristicsY += 8;
    });
  }
  
  // Add some space
  characteristicsY += 10;
  
  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, characteristicsY - 5, pageWidth - margin, characteristicsY - 5);
  
  // Content
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Content", margin, characteristicsY + 5);
  
  // Content body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  
  // Handle content parsing (try to detect markdown or just use the plain text)
  let contentText = '';
  
  if (typeof content.content === 'string') {
    contentText = content.content;
  } else {
    try {
      contentText = JSON.stringify(content.content, null, 2);
    } catch {
      contentText = String(content.content);
    }
  }
  
  // Split content text into lines to fit page width
  const splitText = doc.splitTextToSize(contentText, contentWidth);
  
  // Check if we need a new page
  if (characteristicsY + 15 + (splitText.length * 7) > doc.internal.pageSize.getHeight() - margin) {
    doc.addPage();
    characteristicsY = margin;
  } else {
    characteristicsY += 15;
  }
  
  // Add the content text
  doc.text(splitText, margin, characteristicsY);
  
  // Add footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`QAQF Content | Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }
  
  return doc;
}

/**
 * Saves a content object as a PDF file
 * @param content The content object to export
 */
export function saveContentAsPDF(content: Content): void {
  const doc = generateContentPDF(content);
  doc.save(`QAQF_Content_${content.id}_${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
}