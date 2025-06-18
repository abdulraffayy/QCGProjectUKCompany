import { Content } from '@shared/schema';
import { jsPDF } from 'jspdf';
import { saveContentAsPDF } from './pdfGenerator';

/**
 * Export content as HTML
 * @param content The content to export
 * @returns HTML string
 */
export function exportAsHTML(content: Content): string {
  // Create HTML representation of the content
  const contentHTML = typeof content.content === 'string' 
    ? content.content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/# (.*)/g, '<h1>$1</h1>')
        .replace(/## (.*)/g, '<h2>$1</h2>')
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*)\*/g, '<em>$1</em>')
    : JSON.stringify(content.content);
  
  // Create full HTML document
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        color: #333;
      }
      h1, h2, h3 {
        color: #2563eb;
      }
      h1 {
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 10px;
      }
      .metadata {
        background-color: #f9fafb;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
      }
      .content {
        padding: 15px;
        border: 1px solid #e5e7eb;
        border-radius: 5px;
      }
      .characteristics {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }
      .characteristic {
        background-color: #eff6ff;
        color: #2563eb;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.875rem;
      }
      .footer {
        margin-top: 40px;
        font-size: 0.875rem;
        color: #6b7280;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <h1>${content.title}</h1>
    
    <div class="metadata">
      <p><strong>Module Code:</strong> ${content.moduleCode || 'N/A'}</p>
      <p><strong>QAQF Level:</strong> ${content.qaqfLevel}</p>
      <p><strong>Type:</strong> ${content.type.replace('_', ' ')}</p>
      <p><strong>Created:</strong> ${new Date(content.createdAt).toLocaleDateString()}</p>
      <p><strong>QAQF Characteristics:</strong></p>
      <div class="characteristics">
        ${Array.isArray(content.characteristics) 
          ? content.characteristics.map(id => `<span class="characteristic">Characteristic ${id}</span>`).join('')
          : typeof content.characteristics === 'object'
            ? Object.keys(content.characteristics).map(key => `<span class="characteristic">${key}</span>`).join('')
            : 'None'
        }
      </div>
    </div>
    
    <div class="content">
      <p>${contentHTML}</p>
    </div>
    
    <div class="footer">
      <p>Generated from QAQF Academic Content Platform</p>
      <p>Document ID: ${content.id} | Verification Status: ${content.verificationStatus}</p>
    </div>
  </body>
  </html>
  `;
  
  return html;
}

/**
 * Save content as HTML file
 * @param content The content to export
 */
export function saveAsHTML(content: Content): void {
  const html = exportAsHTML(content);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`);
  link.click();
}

/**
 * Export content as markdown
 * @param content The content to export
 * @returns Markdown string
 */
export function exportAsMarkdown(content: Content): string {
  // Create markdown representation
  const contentText = typeof content.content === 'string' 
    ? content.content
    : JSON.stringify(content.content, null, 2);
  
  // Create full markdown document
  const markdown = `# ${content.title}

## Metadata
- **Module Code:** ${content.moduleCode || 'N/A'}
- **QAQF Level:** ${content.qaqfLevel}
- **Type:** ${content.type.replace('_', ' ')}
- **Created:** ${new Date(content.createdAt).toLocaleDateString()}
- **Verification Status:** ${content.verificationStatus}

## QAQF Characteristics
${Array.isArray(content.characteristics) 
  ? content.characteristics.map(id => `- Characteristic ${id}`).join('\n')
  : typeof content.characteristics === 'object'
    ? Object.keys(content.characteristics).map(key => `- ${key}`).join('\n')
    : '- None'
}

## Content
${contentText}

---
Generated from QAQF Academic Content Platform | Document ID: ${content.id}
`;
  
  return markdown;
}

/**
 * Save content as Markdown file
 * @param content The content to export
 */
export function saveAsMarkdown(content: Content): void {
  const markdown = exportAsMarkdown(content);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`);
  link.click();
}

/**
 * Export content as DOCX format (placeholder)
 * @param content The content to export
 */
export function saveAsDOCX(content: Content): void {
  // In a real implementation, you would use a library like docx.js
  // For now, we're just exporting as HTML and notifying the user
  const html = exportAsHTML(content);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`);
  link.click();
  
  // Alert to inform user about the placeholder implementation
  setTimeout(() => {
    alert("DOCX export is currently exported as HTML. For production use, integrate with a DOCX generation library.");
  }, 1000);
}

/**
 * Export content as JSON
 * @param content The content to export
 */
export function saveAsJSON(content: Content): void {
  // Create a JSON representation with selected fields
  const contentData = {
    id: content.id,
    title: content.title,
    moduleCode: content.moduleCode,
    qaqfLevel: content.qaqfLevel,
    type: content.type,
    characteristics: content.characteristics,
    content: content.content,
    verificationStatus: content.verificationStatus,
    createdAt: content.createdAt
  };
  
  const jsonString = JSON.stringify(contentData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`);
  link.click();
}

/**
 * Export multiple content items to CSV
 * @param contents Array of content items to export
 */
export function exportMultipleToCSV(contents: Content[]): void {
  const headers = "ID,Title,Type,QAQF Level,Verification Status,Module Code,Created At\n";
  const rows = contents.map(content => 
    `${content.id},"${content.title.replace(/"/g, '""')}",${content.type},${content.qaqfLevel},${content.verificationStatus},"${content.moduleCode || ''}","${new Date(content.createdAt).toISOString()}"`
  ).join('\n');
  
  const csvContent = `${headers}${rows}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'qaqf_content_export.csv');
  link.click();
}

/**
 * Export multiple content items as PDF
 * @param contents Array of content items to export
 */
export function exportMultipleToPDF(contents: Content[]): void {
  // For simplicity, we just export each content separately
  contents.forEach(content => {
    setTimeout(() => {
      saveContentAsPDF(content);
    }, 300); // Small delay to prevent browser download issues
  });
}