const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { DOMParser, XMLSerializer } = require('xmldom');
const xpath = require('xpath');

// Function to transform fields into text wrapped in square brackets
function transformFieldsToText(documentContent) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(documentContent, 'text/xml');

  // Define used namespaces
  const select = xpath.useNamespaces({
    text: 'urn:oasis:names:tc:opendocument:xmlns:text:1.0',
    office: 'urn:oasis:names:tc:opendocument:xmlns:office:1.0',
  });

  // Transform user-field-get nodes
  const userFieldGetNodes = select('//text:user-field-get', xmlDoc);
  userFieldGetNodes.forEach((node) => {
    const fieldName = node.getAttribute('text:name');
    const textNode = xmlDoc.createTextNode(`[${fieldName}]`);
    node.parentNode.replaceChild(textNode, node);
  });

  // Transform user-field-decl nodes
  const userFieldDeclNodes = select('//text:user-field-decl', xmlDoc);
  userFieldDeclNodes.forEach((node) => {
    const fieldName = node.getAttribute('text:name');
    const textNode = xmlDoc.createTextNode(`[${fieldName}]`);
    node.parentNode.replaceChild(textNode, node);
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(xmlDoc);
}

// Main function to modify the ODT file
function modifyOdtFile(inputOdt, outputOdt) {
  const zip = new AdmZip(inputOdt);
  const contentXmlEntry = zip.getEntry('content.xml');

  if (!contentXmlEntry) {
    throw new Error('content.xml file not found in the ODT archive.');
  }

  // Read XML content and transform fields
  const contentXml = zip.readAsText(contentXmlEntry);
  const modifiedContentXml = transformFieldsToText(contentXml);

  // Update content.xml with modifications
  zip.updateFile('content.xml', Buffer.from(modifiedContentXml, 'utf-8'));
  zip.writeZip(outputOdt);
}

const directoryPath = path.resolve(__dirname, 'odt_files');

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.error(`Error reading directory: ${err.message}`);
  }

  // Filter .odt files
  const odtFiles = files.filter((file) => path.extname(file).toLowerCase() === '.odt');

  let count = 0;

  odtFiles.forEach((file) => {
    const inputOdtPath = path.join(directoryPath, file);
    // Note: If you want to save to a different file, change the outputOdtPath
    // For in-place modification, it's the same as inputOdtPath
    const outputOdtPath = path.join(directoryPath, `${file}`);

    // Asynchronous processing (Note: AdmZip methods are synchronous, so this is sequential processing)
    try {
      console.log(`Processing file: ${file}`);
      modifyOdtFile(inputOdtPath, outputOdtPath);
      count++;
    } catch (error) {
      console.error(`❌ Error modifying ${file}:`, error.message);
    }
  });
  console.log(`✅ ${count} file(s) modified successfully.`);
});
