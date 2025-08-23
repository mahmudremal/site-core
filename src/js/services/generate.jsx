import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { sprintf } from "sprintf-js";

const generate_pdf_agreement = (text = "", client = {
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessIndustry: '',
    signature: null
}, agency = {
    pre: '',
    post: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    background: '',
    agencySignature: '',
    agencyRepresentative: '',
}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pdfDoc = await PDFDocument.create();
            let page = pdfDoc.addPage([595, 842]); // A4
            const { width, height } = page.getSize();

            // Embed fonts
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            // Helper functions
            const drawText = (txt, x, y, size = 12, color = rgb(0, 0, 0), f = font) => {
                page.drawText(txt, { x, y, size, font: f, color });
            };

            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? rgb(
                    parseInt(result[1], 16) / 255,
                    parseInt(result[2], 16) / 255,
                    parseInt(result[3], 16) / 255
                ) : rgb(0.01, 0.26, 0.31); // default color
            };

            const primaryColor = hexToRgb(agency.background || '#02424F');
            const lightGray = rgb(0.95, 0.95, 0.95);
            const darkGray = rgb(0.3, 0.3, 0.3);
            const textColor = rgb(0.2, 0.2, 0.2);

            // ==================== HEADER SECTION ====================
            let currentY = height - 40;

            // Header background
            page.drawRectangle({
                x: 0,
                y: height - 120,
                width: width,
                height: 120,
                color: primaryColor,
            });

            // Agency logo (if provided)
            if (agency.logo) {
                try {
                    // Logo dimensions based on 2048:358 ratio
                    const logoWidth = 140;
                    const logoHeight = logoWidth * (358 / 2048); // approximately 24.4
                    
                    const logoImageBytes = await fetch(agency.logo).then(res => res.arrayBuffer());
                    const logoImage = await pdfDoc.embedPng(logoImageBytes);
                    
                    page.drawImage(logoImage, {
                        x: 50,
                        y: height - 80,
                        width: logoWidth,
                        height: logoHeight,
                    });
                } catch (error) {
                    console.warn('Logo could not be loaded:', error);
                }
            }

            // Agreement title
            let serviceName = agency.taxName || 'Digital';
            if (serviceName.length > 20) {serviceName = 'Business';}
            const title = sprintf('%s service agreement', serviceName).toUpperCase();
            let fontSize = 20;
            switch (true) {
                case title.length >= 23 && title.length <= 28:
                    fontSize = 18;
                    break;
                case title.length > 28 && title.length <= 35:
                    fontSize = 16;
                    break;
                case title.length > 35:
                    fontSize = 14;
                    break;
                default:
                    break;
            }
            drawText(title, 220, height - 55, fontSize, lightGray, boldFont);

            // Agency information in header
            let agencyInfoY = height - 75;
            if (agency.address) {
                drawText(agency.address, 220, agencyInfoY, 10, lightGray);
            }
            if (agency.phone || agency.email || agency.website) {
                const preWrappedInfo = wrapText(sprintf(`Tel: %s Email: %s Web: %s`, agency.phone, agency.email, agency.website), 80, font, 11, 450);
                agencyInfoY -= 5;
                preWrappedInfo.forEach(line => {
                    drawText(line, 220, agencyInfoY - 12, 10, lightGray);
                    agencyInfoY -= 16;
                });
            }

            // Decorative line
            page.drawLine({
                start: { x: 40, y: height - 130 },
                end: { x: width - 40, y: height - 130 },
                color: primaryColor,
                thickness: 2,
            });

            // ==================== CONTENT SECTION ====================
            currentY = height - 160;

            // Client Information Section
            drawText("CLIENT INFORMATION", 50, currentY, 14, primaryColor, boldFont);
            currentY -= 10;
            
            // Underline for section
            page.drawLine({
                start: { x: 50, y: currentY },
                end: { x: 200, y: currentY },
                color: primaryColor,
                thickness: 1,
            });
            currentY -= 25;

            // Client details in two columns
            const leftCol = 60;
            const rightCol = 320;
            
            if (client.fullName) {
                drawText("Full Name:", leftCol, currentY, 11, darkGray, boldFont);
                drawText(client.fullName, leftCol + 80, currentY, 11, textColor);
            }
            if (client.email) {
                drawText("Email:", rightCol, currentY, 11, darkGray, boldFont);
                drawText(client.email, rightCol + 50, currentY, 11, textColor);
            }
            currentY -= 18;

            if (client.phone) {
                drawText("Phone:", leftCol, currentY, 11, darkGray, boldFont);
                drawText(client.phone, leftCol + 80, currentY, 11, textColor);
            }
            if (client.businessName) {
                drawText("Business:", rightCol, currentY, 11, darkGray, boldFont);
                drawText(client.businessName, rightCol + 60, currentY, 11, textColor);
            }
            currentY -= 18;

            if (client.businessIndustry) {
                drawText("Industry:", leftCol, currentY, 11, darkGray, boldFont);
                drawText(client.businessIndustry, leftCol + 80, currentY, 11, textColor);
            }

            currentY -= 40;

            // Agreement Terms Section
            drawText("AGREEMENT TERMS", 50, currentY, 14, primaryColor, boldFont);
            currentY -= 10;
            
            // Underline for section
            page.drawLine({
                start: { x: 50, y: currentY },
                end: { x: 180, y: currentY },
                color: primaryColor,
                thickness: 1,
            });
            currentY -= 25;

            // Pre-agreement content
            if (agency.pre) {
                const preWrapped = wrapText(agency.pre, 80, font, 11, 450);
                preWrapped.forEach(line => {
                    drawText(line, 60, currentY, 11, textColor);
                    currentY -= 16;
                });
                currentY -= 10;
            }

            // Main agreement text
            const agreementText = text || defaultAgreement();
            const wrappedText = wrapText(agreementText, 80, font, 11, 450);
            
            wrappedText.forEach(line => {
                if (currentY < 200) {
                    const newPage = pdfDoc.addPage([595, 842]);
                    page = newPage;
                    currentY = height - 50;
                }
                drawText(line, 60, currentY, 11, textColor);
                currentY -= 16;
            });

            // Post-agreement content
            if (agency.post) {
                currentY -= 10;
                const postWrapped = wrapText(agency.post, 80, font, 11, 450);
                postWrapped.forEach(line => {
                    drawText(line, 60, currentY, 11, textColor);
                    currentY -= 16;
                });
            }

            // ==================== SIGNATURE SECTION ====================
            const signatureY = 150; // Fixed position from bottom

            // Signature section background
            page.drawRectangle({
                x: 40,
                y: signatureY - 25,
                width: width - 80,
                height: 140,
                color: lightGray,
                borderColor: primaryColor,
                borderWidth: 1,
            });

            // Signature title
            drawText("AUTHORIZED SIGNATURES", 50, signatureY + 90, 14, primaryColor, boldFont);

            // Date field
            const today = new Date().toLocaleDateString();
            drawText(`Date: ${today}`, width - 150, signatureY + 90, 11, textColor);

            // Signature boxes in a row
            const sigBoxWidth = 200;
            const sigBoxHeight = 60;
            const leftSigX = 60;
            const rightSigX = width - 260;

            // Agency signature box
            page.drawRectangle({
                x: leftSigX,
                y: signatureY + 10,
                width: sigBoxWidth,
                height: sigBoxHeight,
                color: rgb(1, 1, 1),
                borderColor: darkGray,
                borderWidth: 1,
            });

            // Client signature box
            page.drawRectangle({
                x: rightSigX,
                y: signatureY + 10,
                width: sigBoxWidth,
                height: sigBoxHeight,
                color: rgb(1, 1, 1),
                borderColor: darkGray,
                borderWidth: 1,
            });

            // Agency signature
            if (agency.agencySignature) {
                try {
                    const agencySignImageBytes = await fetch(agency.agencySignature).then(res => res.arrayBuffer());
                    const agencySignImage = await pdfDoc.embedPng(agencySignImageBytes);
                    
                    page.drawImage(agencySignImage, {
                        x: leftSigX + 10,
                        y: signatureY + 20,
                        width: sigBoxWidth - 20,
                        height: sigBoxHeight - 20,
                    });
                } catch (error) {
                    console.warn('Agency signature could not be loaded:', error);
                }
            }

            // Client signature
            if (client.signature) {
                try {
                    const clientSignImageBytes = await fetch(client.signature).then(res => res.arrayBuffer());
                    const clientSignImage = await pdfDoc.embedPng(clientSignImageBytes);
                    
                    page.drawImage(clientSignImage, {
                        x: rightSigX + 10,
                        y: signatureY + 20,
                        width: sigBoxWidth - 20,
                        height: sigBoxHeight - 20,
                    });
                } catch (error) {
                    console.warn('Client signature could not be loaded:', error);
                }
            }

            // Signature labels
            const agencyRep = agency.agencyRepresentative
                ? agency.agencyRepresentative 
                : 'Agency Representative';
            
            drawText(agencyRep, leftSigX, signatureY - 5, 11, darkGray, boldFont);
            drawText('Agency Representative', leftSigX, signatureY - 18, 9, darkGray);
            
            const clientName = client.fullName || 'Client';
            drawText(clientName, rightSigX, signatureY - 5, 11, darkGray, boldFont);
            drawText('Client Signature', rightSigX, signatureY - 18, 9, darkGray);

            // Footer line
            page.drawLine({
                start: { x: 40, y: 40 },
                end: { x: width - 40, y: 40 },
                thickness: 1,
                color: primaryColor,
            });

            // Page number
            drawText('Page 1 of 1', width - 100, 25, 9, darkGray);

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const pdf_url = URL.createObjectURL(blob);
            resolve({url: pdf_url, blob});
            
        } catch (error) {
            reject(error);
        }
    });
};

export default generate_pdf_agreement;


function wrapText(text, maxChars, font, size, maxWidth) {
  // Split text into lines by line breaks
  const paragraphs = text.split(/\r?\n/);
  const lines = [];

  for (let para of paragraphs) {
    const words = para.split(" ");
    let line = "";
    for (let w of words) {
      const testLine = line + w + " ";
      const width = font.widthOfTextAtSize(testLine, size);
      if (width > maxWidth && line !== "") {
        lines.push(line.trim());
        line = w + " ";
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line.trim());
  }
  return lines;
}

const defaultAgreement = () => {
    return `This Digital Marketing Agreement ("Agreement") is entered into between the Agency and the Client for the provision of digital marketing services. The Agency agrees to provide comprehensive digital marketing services including but not limited to social media management, content creation, advertising campaigns, and performance analytics.

The Client agrees to provide necessary access to their digital platforms, brand guidelines, and marketing materials required for the successful execution of the marketing campaigns. Both parties agree to maintain confidentiality of proprietary information shared during the course of this agreement.

This agreement shall remain in effect for the duration specified in the attached service proposal and may be renewed by mutual consent of both parties. Either party may terminate this agreement with 30 days written notice.

By signing below, both parties acknowledge they have read, understood, and agree to be bound by the terms and conditions outlined in this agreement.`;
};

export const conditional_pricing = (selectedServices, config, formData) => {
    const totalPrice = selectedServices.reduce((total, service) => {
        let calculatedPrice = parseFloat(service.pricing?.primary ?? 0);
        
        // Check for conditional pricing
        if (service.pricing?.conditionals) {
            for (const conditional of service.pricing.conditionals) {
                const conditions = conditional.condition;
                let allConditionsMet = true;

                // Check each condition
                for (const condition of conditions) {
                    if (condition.tax_id && condition.tax_id !== formData.tax_id) {
                        allConditionsMet = false;
                        break;
                    }
                    if (condition.single && selectedServices.length !== 1) {
                        allConditionsMet = false;
                        break;
                    }
                    if (condition.minbudget && total <= condition.minbudget) {
                        allConditionsMet = false;
                        break;
                    }
                    if (condition.maxbudget && total >= condition.maxbudget) {
                        allConditionsMet = false;
                        break;
                    }
                    if (condition.itemslength && selectedServices.length !== condition.itemslength) {
                        allConditionsMet = false;
                        break;
                    }
                    if (condition.region && condition.region !== config.region) {
                        allConditionsMet = false;
                        break;
                    }
                    if (condition.industry && condition.industry !== formData.businessIndustry) {
                        allConditionsMet = false;
                        break;
                    }
                }

                // If all conditions are met, use the conditional price
                if (allConditionsMet) {
                    calculatedPrice = parseFloat(conditional.price);
                    break;
                }
            }
        }

        // Add calculated price to total
        total += calculatedPrice;

        service.calculated_amount = calculatedPrice;

        return total;
    }, 0);
    
    return totalPrice;
}
