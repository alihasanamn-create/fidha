import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportStudentsPDF = (students) => {
  const doc = new jsPDF();

  doc.text("Fidha Accounts - Student Report", 14, 15);

  const tableData = students.map((s) => [
    s.name,
    s.adNo,
    s.className,
    s.balance,
  ]);

  autoTable(doc, {
    head: [["Name", "Admission No", "Class", "Balance"]],
    body: tableData,
    startY: 20,
  });

  doc.save("students_report.pdf");
};