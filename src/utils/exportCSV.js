const escapeCSV = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const downloadCSV = (filename, rows) => {
  const csv = rows.map((row) => row.map(escapeCSV).join(",")).join("\n");

  const blob = new Blob(["\ufeff" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const formatDate = (value) => {
  if (!value) return "";

  if (value?.toDate) {
    value = value.toDate();
  } else if (value?.seconds) {
    value = new Date(value.seconds * 1000);
  } else {
    value = new Date(value);
  }

  if (Number.isNaN(value.getTime())) return "";

  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = value.getFullYear();

  return `${day}/${month}/${year}`;
};

export const exportStudentBalanceCSV = (student, payments = []) => {
  const studentPayments = payments
    .filter((p) => p.studentId === student.id)
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

  const rows = [
    ["Fidha Accounts - Student Balance Statement"],
    [],
    ["Student Name", student.name],
    ["Admission No", student.adNo],
    ["Class", student.className || ""],
    ["Current Balance", `₹${student.balance || 0}`],
    [],
    ["Date", "Type", "Amount", "Reason"],
  ];

  studentPayments.forEach((payment) => {
    rows.push([
      formatDate(payment.createdAt || payment.date),
      payment.type === "add" ? "Added" : "Deducted",
      `₹${payment.amount || 0}`,
      payment.reason || "",
    ]);
  });

  downloadCSV(
    `${student.name.replace(/[^a-z0-9]/gi, "_")}_balance.csv`,
    rows
  );
};

export const exportClassBalanceCSV = (students, payments, className) => {
  const classStudents = students.filter(
    (student) => student.className === className
  );

  const rows = [
    ["Fidha Accounts - Class Balance Sheet"],
    [],
    ["Class", className],
    [],
    ["Student Name", "Admission No", "Class", "Current Balance"],
  ];

  classStudents.forEach((student) => {
    rows.push([
      student.name,
      student.adNo,
      student.className || "",
      `₹${student.balance || 0}`,
    ]);
  });

  const total = classStudents.reduce(
    (sum, student) => sum + Number(student.balance || 0),
    0
  );

  rows.push([]);
  rows.push(["TOTAL CLASS BALANCE", "", "", `₹${total}`]);

  downloadCSV(
    `${className.replace(/[^a-z0-9]/gi, "_")}_balance_sheet.csv`,
    rows
  );
};

export const exportAllCSV = (students, payments) => {
  const studentRows = [
    ["Name", "Admission No", "Class", "Balance"],
    ...students.map((s) => [
      s.name,
      s.adNo,
      s.className || "",
      s.balance || 0,
    ]),
  ];

  downloadCSV("students_report.csv", studentRows);

  const paymentRows = [
    ["Name", "Amount", "Type", "Reason", "Date"],
    ...payments.map((p) => [
      p.name || "",
      p.amount || 0,
      p.type || "",
      p.reason || "",
      formatDate(p.createdAt || p.date),
    ]),
  ];

  downloadCSV("transactions_report.csv", paymentRows);
};