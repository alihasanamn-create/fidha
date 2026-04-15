import jsPDF from "jspdf";

export const generateReceipt = (t) => {
  const doc = new jsPDF();

  doc.text("Fidha Accounts Receipt", 20, 20);
  doc.text(`Student: ${t.studentName}`, 20, 40);
  doc.text(`Amount: ₹${t.amount}`, 20, 50);
  doc.text(`Type: ${t.type}`, 20, 60);
  doc.text(`Reason: ${t.reason}`, 20, 70);
  doc.text(`Date: ${t.date}`, 20, 80);

  doc.save(`${t.studentName}_receipt.pdf`);
};