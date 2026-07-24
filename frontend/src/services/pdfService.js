import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const pdfService = {
  // Generate monthly statement PDF - BANKING THEME
  generateStatement: (user, transactions, month, year) => {
    const doc = new jsPDF();
    
    // Bank Header (remove ElectroKart branding)
    doc.setFontSize(24);
    doc.setTextColor(0, 40, 80); // Dark blue - banking color
    doc.text('CREDIT CARD STATEMENT', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Monthly Account Statement', 14, 28);
    
    // Bank Details
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text('Issuer: ElectroKart Financial Services', 14, 38);
    doc.text('Customer Service: 1800-123-4567', 14, 44);
    doc.text('Email: support@electrokart.finance', 14, 50);
    
    // Statement Period
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('STATEMENT PERIOD', 140, 38);
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`${month} ${year}`, 140, 46);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 140, 54);
    
    // Horizontal line
    doc.setDrawColor(200);
    doc.line(14, 60, 196, 60);
    
    // Customer Details Section
    doc.setFontSize(12);
    doc.setTextColor(0, 40, 80);
    doc.text('CARDHOLDER INFORMATION', 14, 72);
    
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(`Name: ${user?.businessName || 'N/A'}`, 14, 82);
    doc.text(`Email: ${user?.email || 'N/A'}`, 14, 90);
    doc.text(`GST: ${user?.gstNumber || 'N/A'}`, 14, 98);
    
    // Account Summary Box
    doc.setFillColor(245, 245, 250);
    doc.rect(130, 70, 66, 35, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text('ACCOUNT SUMMARY', 135, 78);
    
    // Calculate totals
    const totalPurchases = transactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalPayments = transactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalInterest = transactions
      .filter(t => t.type === 'interest')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentBalance = totalPurchases - totalPayments + totalInterest;
    
    doc.setFontSize(8);
    doc.setTextColor(60);
    doc.text('Previous Balance:', 135, 86);
    doc.text('₹0.00', 185, 86, { align: 'right' });
    
    doc.text('Purchases:', 135, 94);
    doc.text(`₹${totalPurchases.toFixed(2)}`, 185, 94, { align: 'right' });
    
    doc.text('Payments:', 135, 102);
    doc.text(`-₹${totalPayments.toFixed(2)}`, 185, 102, { align: 'right' });
    
    doc.text('Interest:', 135, 110);
    doc.text(`₹${totalInterest.toFixed(2)}`, 185, 110, { align: 'right' });
    
    doc.setDrawColor(0, 40, 80);
    doc.line(135, 115, 190, 115);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('CURRENT BALANCE:', 135, 122);
    doc.text(`₹${currentBalance.toFixed(2)}`, 185, 122, { align: 'right' });
    
    // Payment Due Info
    doc.setFillColor(255, 240, 240);
    doc.rect(14, 115, 100, 20, 'F');
    
    const minPayment = Math.max(500, currentBalance * 0.05);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(150, 0, 0);
    doc.text('PAYMENT DUE BY:', 18, 124);
    doc.setFont(undefined, 'normal');
    doc.text(dueDate.toLocaleDateString('en-IN'), 60, 124);
    
    doc.text('MINIMUM PAYMENT:', 18, 132);
    doc.setFont(undefined, 'bold');
    doc.text(`₹${minPayment.toFixed(2)}`, 60, 132);
    
    // Credit Limit Info
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Credit Limit: ₹100,000 | Available: ₹${(100000 - currentBalance).toFixed(2)}`, 14, 145);
    
    // Transactions Table
    doc.setFontSize(12);
    doc.setTextColor(0, 40, 80);
    doc.text('TRANSACTION DETAILS', 14, 160);
    
    autoTable(doc, {
      startY: 168,
      head: [['Date', 'Description', 'Type', 'Amount (₹)', 'Status']],
      body: transactions.map(t => [
        new Date(t.createdAt).toLocaleDateString('en-IN'),
        t.description.substring(0, 30),
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        t.type === 'payment' ? `-${t.amount.toFixed(2)}` : t.amount.toFixed(2),
        t.paymentStatus || 'Completed'
      ]),
      theme: 'striped',
      headStyles: { 
        fillColor: [0, 40, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        3: { halign: 'right' }
      }
    });
    
    // Interest Rate Disclosure
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      'Interest is charged at 3% per month (36% APR) on unpaid balances after the due date.',
      14,
      finalY
    );
    doc.text(
      'Minimum payment is 5% of total outstanding or ₹500, whichever is higher.',
      14,
      finalY + 5
    );
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount} - This is a computer generated statement. No signature required.`,
        14,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Statement Date: ${new Date().toLocaleDateString()}`,
        14,
        doc.internal.pageSize.height - 5
      );
    }
    
    return doc;
  },

  // Download PDF
  downloadStatement: (user, transactions, month, year) => {
    const doc = pdfService.generateStatement(user, transactions, month, year);
    doc.save(`Credit_Card_Statement_${month}_${year}.pdf`);
  },

  // View PDF in new tab
  viewStatement: (user, transactions, month, year) => {
    const doc = pdfService.generateStatement(user, transactions, month, year);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  }
};

export default pdfService;