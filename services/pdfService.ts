
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Changed import
import { ExpenseReportEntry, RiskScore, PolicyViolation, Anomaly } from '../types';
import { COMPANY_NAME, COMPANY_LOGO_URL } from '../constants';

// Removed: declare module 'jspdf' { interface jsPDF { autoTable: (options: any) => jsPDF; } }

const addTextWithWrap = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * lineHeight;
};

const generatePdfReport = async (expenses: ExpenseReportEntry[]): Promise<void> => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  let currentY = 15; 
  const leftMargin = 14;
  const contentWidth = pageWidth - (leftMargin * 2);

  try {
    const imgWidth = 15; 
    const imgHeight = 15;
    if (COMPANY_LOGO_URL.startsWith('data:image')) {
         doc.addImage(COMPANY_LOGO_URL, 'PNG', leftMargin, 5 /* Align logo closer to top */, imgWidth, imgHeight);
         currentY = 5 + imgHeight + 5; // currentY starts after logo + padding
    } else {
        // Placeholder for URL loading as it's complex client-side
        console.warn("Company logo is a URL, skipping reliable embedding in PDF for now. Consider using a base64 Data URI for logos.");
        currentY = 15; // Default start if no logo
    }
  } catch (e) {
    console.warn("Could not add company logo to PDF:", e);
    currentY = 15; // Default start if logo fails
  }
  // Adjust Y if logo was shorter or taller than expected space, or if no logo
  currentY = Math.max(currentY, 20);


  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(`${COMPANY_NAME} - Expense Report`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 10; 

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  doc.setFontSize(14);
  doc.setTextColor(0, 128, 128); 
  doc.text("Overall Expense Summary", leftMargin, currentY);
  currentY += 8;

  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const currency = expenses.length > 0 ? expenses[0].currency : 'USD';
  const flaggedExpensesCount = expenses.filter(exp => exp.analysis?.isFlagged).length;
  const highRiskExpensesCount = expenses.filter(exp => exp.analysis?.riskScore === RiskScore.High).length;
  const mediumRiskExpensesCount = expenses.filter(exp => exp.analysis?.riskScore === RiskScore.Medium).length;
  const lowRiskExpensesCount = expenses.filter(exp => exp.analysis?.riskScore === RiskScore.Low).length;
  const pendingAnalysis = expenses.filter(exp => !exp.analysis).length;

  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51); 
  
  const summaryData = [
    { label: "Total Expenses Submitted:", value: totalExpenses.toString() },
    { label: "Total Amount Submitted:", value: `${totalAmount.toLocaleString(undefined, { style: 'currency', currency: currency })}` },
    { label: "Flagged for Review:", value: flaggedExpensesCount.toString() },
    { label: "High Risk:", value: highRiskExpensesCount.toString() },
    { label: "Medium Risk:", value: mediumRiskExpensesCount.toString() },
    { label: "Low Risk:", value: lowRiskExpensesCount.toString() },
  ];
  if (pendingAnalysis > 0) {
    summaryData.push({ label: "Pending Analysis:", value: pendingAnalysis.toString()});
  }

  summaryData.forEach(item => {
    if (currentY > pageHeight - 20) { 
        doc.addPage();
        currentY = 20;
    }
    doc.text(item.label, leftMargin, currentY);
    doc.text(item.value, leftMargin + 70, currentY, {align: 'left'}); // Adjusted X for value
    currentY += 7;
  });
  currentY += 5; 


  doc.setFontSize(14);
  doc.setTextColor(0, 128, 128);
   if (currentY > pageHeight - 40) { 
        doc.addPage();
        currentY = 20;
    }
  doc.text("Detailed Expenses", leftMargin, currentY);
  currentY += 8; // Increased space before table

  const tableColumn = ["Employee", "Date", "Vendor", "Description", "Category", "Amount", "Risk", "AI Summary"];
  const tableRows: any[][] = [];

  expenses.forEach(expense => {
    const expenseData = [
      expense.employeeName,
      new Date(expense.date).toLocaleDateString(),
      expense.vendor,
      expense.description.length > 30 ? expense.description.substring(0, 27) + "..." : expense.description,
      expense.category,
      `${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${expense.currency}`,
      expense.analysis?.riskScore || "N/A",
      expense.analysis?.summary ? (expense.analysis.summary.length > 40 ? expense.analysis.summary.substring(0, 37) + "..." : expense.analysis.summary) : "N/A",
    ];
    tableRows.push(expenseData);
  });

  autoTable(doc, { // Changed to use autoTable function
    head: [tableColumn],
    body: tableRows,
    startY: currentY,
    theme: 'striped', 
    headStyles: { fillColor: [0, 128, 128], textColor: 255 }, 
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
    columnStyles: {
        0: { cellWidth: 25 }, 
        1: { cellWidth: 18 }, 
        2: { cellWidth: 25 }, 
        3: { cellWidth: 35 }, 
        4: { cellWidth: 18 }, 
        5: { cellWidth: 20, halign: 'right' }, 
        6: { cellWidth: 15 }, 
        7: { cellWidth: 'auto' }, 
    },
    didDrawPage: (data) => {
        currentY = data.cursor?.y ? data.cursor.y + 10 : pageHeight - 20; // Add padding after table on new page
    }
  });
  
  // Update currentY after table. autoTable function itself doesn't return the doc instance in a chainable way for .lastAutoTable
  // We rely on didDrawPage or estimate. If didDrawPage was called, currentY is updated.
  // If the table was short and didn't trigger didDrawPage, get finalY.
  // jsPDF-autotable typically adds table data to doc.lastAutoTable.
  const lastTable = (doc as any).lastAutoTable;
  if (lastTable && lastTable.finalY) {
    currentY = lastTable.finalY + 10; // Space after table
  } else {
    // Fallback if finalY isn't available, or if didDrawPage already handled currentY for a new page.
    // If currentY was updated by didDrawPage, it might already include a top margin for the new page.
    // This part can be tricky. Ensure currentY is sensible.
  }


  const flaggedForDetail = expenses.filter(exp => exp.analysis && (exp.analysis.isFlagged || exp.analysis.riskScore === RiskScore.High || exp.analysis.riskScore === RiskScore.Medium));

  if (flaggedForDetail.length > 0) {
    if (currentY > pageHeight - 30) { 
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(14);
    doc.setTextColor(0, 128, 128);
    doc.text("Detailed Analysis for Flagged or High/Medium Risk Items", leftMargin, currentY);
    currentY += 10;

    flaggedForDetail.forEach((expense, index) => {
      if (!expense.analysis) return; 

      if (currentY > pageHeight - 60) { 
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(51,51,51);
      let itemText = `Item ${index + 1}: ${expense.employeeName} - ${expense.vendor} (${expense.amount.toLocaleString(undefined, { style: 'currency', currency: expense.currency })}) - Risk: ${expense.analysis.riskScore}`;
      if(expense.analysis.isFlagged) itemText += " (Flagged)";
      currentY += addTextWithWrap(doc, itemText, leftMargin, currentY, contentWidth, 5);
      currentY += 2; 

      doc.setFontSize(9);
      if (expense.analysis.policyViolations.length > 0) {
        currentY += addTextWithWrap(doc, "Policy Violations:", leftMargin + 5, currentY, contentWidth - 5, 4);
        expense.analysis.policyViolations.forEach(pv => {
          if (currentY > pageHeight - 15) { doc.addPage(); currentY = 20; } // Check space for item
          currentY += addTextWithWrap(doc, `- ${pv.policy}: ${pv.details}`, leftMargin + 10, currentY, contentWidth - 10, 4);
        });
        currentY += 2;
      }

      if (expense.analysis.anomaliesDetected.length > 0) {
         if (currentY > pageHeight - 15) { doc.addPage(); currentY = 20; }
        currentY += addTextWithWrap(doc, "Anomalies Detected:", leftMargin + 5, currentY, contentWidth - 5, 4);
        expense.analysis.anomaliesDetected.forEach(ad => {
          if (currentY > pageHeight - 15) { doc.addPage(); currentY = 20; }
          currentY += addTextWithWrap(doc, `- ${ad.anomaly}: ${ad.details}`, leftMargin + 10, currentY, contentWidth - 10, 4);
        });
        currentY += 2;
      }
      
      if (currentY > pageHeight - 15) { doc.addPage(); currentY = 20; }
      currentY += addTextWithWrap(doc, `Recommended Action: ${expense.analysis.recommendedAction}`, leftMargin + 5, currentY, contentWidth - 5, 4);
      currentY += 7; 
    });
  }
  
  const fileName = `Expense_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export { generatePdfReport };
