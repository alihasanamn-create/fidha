export const exportAllCSV = (students, payments) => {
  // STUDENTS CSV
  const studentHeaders = ["Name", "Admission No", "Class", "Balance"];

  const studentRows = students.map((s) => [
    s.name,
    s.adNo,
    s.className || "",
    s.balance || 0,
  ]);

  let studentCSV =
    "data:text/csv;charset=utf-8," +
    [studentHeaders, ...studentRows].map((e) => e.join(",")).join("\n");

  const studentLink = document.createElement("a");
  studentLink.setAttribute("href", encodeURI(studentCSV));
  studentLink.setAttribute("download", "students_report.csv");
  document.body.appendChild(studentLink);
  studentLink.click();

  // TRANSACTIONS CSV
  const paymentHeaders = ["Name", "Amount", "Type", "Reason", "Date"];

  const paymentRows = payments.map((p) => [
    p.name,
    p.amount,
    p.type,
    p.reason,
    p.date?.seconds
      ? new Date(p.date.seconds * 1000).toLocaleDateString()
      : "",
  ]);

  let paymentCSV =
    "data:text/csv;charset=utf-8," +
    [paymentHeaders, ...paymentRows].map((e) => e.join(",")).join("\n");

  const paymentLink = document.createElement("a");
  paymentLink.setAttribute("href", encodeURI(paymentCSV));
  paymentLink.setAttribute("download", "transactions_report.csv");
  document.body.appendChild(paymentLink);
  paymentLink.click();
};