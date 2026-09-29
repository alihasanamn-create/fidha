import * as XLSX from "xlsx";

function getDate(payment) {
  if (payment.createdAt?.toDate) {
    return payment.createdAt.toDate();
  }

  if (payment.createdAt instanceof Date) {
    return payment.createdAt;
  }

  if (payment.date) {
    const d = new Date(payment.date);

    if (!Number.isNaN(d.getTime())) {
      return d;
    }
  }

  return null;
}

function getTime(payment) {
  const date = getDate(payment);
  return date ? date.getTime() : 0;
}

function getDateText(payment) {
  const date = getDate(payment);
  return date ? date.toLocaleDateString("en-GB") : "";
}

function getSafeSheetName(workbook, student, index) {
  let base = String(student.name || `Student ${index + 1}`)
    .replace(/[\\/?*\[\]:]/g, "")
    .trim();

  if (!base) {
    base = `Student ${index + 1}`;
  }

  base = base.slice(0, 31);

  let name = base;
  let number = 2;

  while (workbook.SheetNames.includes(name)) {
    const suffix = ` (${number})`;

    name =
      base.slice(0, 31 - suffix.length) +
      suffix;

    number++;
  }

  return name;
}

function createClassWorkbook(
  className,
  students,
  payments
) {
  const workbook = XLSX.utils.book_new();

  // ==========================================
  // SUMMARY
  // ==========================================

  const summaryRows = [
    [
      "Student Name",
      "Admission No",
      "Class",
      "Total Added",
      "Total Deducted",
      "Current Balance",
      "Transactions",
    ],
  ];

  students.forEach((student) => {
    const transactions = payments
      .filter(
        (payment) =>
          payment.studentId === student.id
      )
      .sort(
        (a, b) =>
          getTime(a) - getTime(b)
      );

    const totalAdded = transactions
      .filter(
        (payment) =>
          payment.type === "add"
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

    const totalDeducted = transactions
      .filter(
        (payment) =>
          payment.type === "deduct"
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

    summaryRows.push([
      student.name || "",
      student.adNo || "",
      student.className || className,
      totalAdded,
      totalDeducted,
      Number(student.balance || 0),
      transactions.length,
    ]);
  });

  const summarySheet =
    XLSX.utils.aoa_to_sheet(summaryRows);

  summarySheet["!cols"] = [
    { wch: 28 },
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    summarySheet,
    "Summary"
  );

  // ==========================================
  // STUDENT SHEETS
  // ==========================================

  students.forEach((student, index) => {
    const transactions = payments
      .filter(
        (payment) =>
          payment.studentId === student.id
      )
      .sort(
        (a, b) =>
          getTime(a) - getTime(b)
      );

    const currentBalance =
      Number(student.balance || 0);

    /*
      Reconstruct balances backwards
      from the current balance.
    */

    let runningBalance =
      currentBalance;

    const transactionRows = [
      ...transactions,
    ]
      .reverse()
      .map((payment) => {
        const amount =
          Number(payment.amount || 0);

        const balanceAfter =
          runningBalance;

        let added = "";
        let deducted = "";

        if (payment.type === "add") {
          added = amount;
          runningBalance -= amount;
        }

        if (payment.type === "deduct") {
          deducted = amount;
          runningBalance += amount;
        }

        return [
          getDateText(payment),
          payment.reason || "",
          added,
          deducted,
          balanceAfter,
        ];
      })
      .reverse();

    const totalAdded = transactions
      .filter(
        (payment) =>
          payment.type === "add"
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

    const totalDeducted = transactions
      .filter(
        (payment) =>
          payment.type === "deduct"
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

    const data = [
      ["FIDHA ACCOUNTS - STUDENT STATEMENT"],
      [],
      ["Student Name", student.name || ""],
      ["Admission No", student.adNo || ""],
      [
        "Class",
        student.className || className,
      ],
      ["Current Balance", currentBalance],
      [],
      ["Total Added", totalAdded],
      ["Total Deducted", totalDeducted],
      [
        "Transactions",
        transactions.length,
      ],
      [],
      [
        "Date",
        "Reason",
        "Added",
        "Deducted",
        "Balance After",
      ],
      ...transactionRows,
    ];

    const sheet =
      XLSX.utils.aoa_to_sheet(data);

    sheet["!cols"] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      sheet,
      getSafeSheetName(
        workbook,
        student,
        index
      )
    );
  });

  return workbook;
}

// ==========================================
// DOWNLOAD ONE CLASS
// ==========================================

export function exportDetailedExcelForClass(
  className,
  students,
  payments
) {
  const classStudents = students.filter(
    (student) =>
      String(
        student.className || ""
      ).toLowerCase() ===
      String(className).toLowerCase()
  );

  if (!classStudents.length) {
    alert(
      `No students found in ${className}.`
    );
    return;
  }

  const workbook =
    createClassWorkbook(
      className,
      classStudents,
      payments
    );

  XLSX.writeFile(
    workbook,
    `Fidha_Detailed_${className}.xlsx`
  );
}