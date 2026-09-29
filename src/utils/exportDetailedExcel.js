import * as XLSX from "xlsx";

function getTransactionDate(transaction) {
  if (transaction.createdAt?.toDate) {
    return transaction.createdAt.toDate();
  }

  if (transaction.createdAt instanceof Date) {
    return transaction.createdAt;
  }

  if (transaction.date) {
    const parsed = new Date(transaction.date);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

function formatDate(transaction) {
  const date = getTransactionDate(transaction);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-GB");
}

function getTimestamp(transaction) {
  const date = getTransactionDate(transaction);

  return date ? date.getTime() : 0;
}

function safeSheetName(name, index) {
  let sheetName = String(name || `Student ${index + 1}`)
    .replace(/[\\/?*[\]:]/g, "")
    .trim();

  if (!sheetName) {
    sheetName = `Student ${index + 1}`;
  }

  // Excel sheet names cannot exceed 31 characters
  sheetName = sheetName.substring(0, 31);

  return sheetName;
}

function makeUniqueSheetName(workbook, name, index) {
  const base = safeSheetName(name, index);

  let finalName = base;
  let counter = 2;

  while (workbook.SheetNames.includes(finalName)) {
    const suffix = ` (${counter})`;
    finalName =
      base.substring(0, 31 - suffix.length) + suffix;

    counter++;
  }

  return finalName;
}

export function exportDetailedStudentExcel(
  students,
  payments
) {
  if (!students || students.length === 0) {
    alert("No students available to export.");
    return;
  }

  const workbook = XLSX.utils.book_new();

  /*
   * ========================================================
   * SUMMARY SHEET
   * ========================================================
   */

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
    const studentPayments = payments
      .filter(
        (payment) =>
          payment.studentId === student.id
      )
      .sort(
        (a, b) =>
          getTimestamp(a) - getTimestamp(b)
      );

    const totalAdded = studentPayments
      .filter(
        (payment) =>
          payment.type === "add"
      )
      .reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      );

    const totalDeducted = studentPayments
      .filter(
        (payment) =>
          payment.type === "deduct"
      )
      .reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      );

    summaryRows.push([
      student.name || "",
      student.adNo || "",
      student.className || "",
      totalAdded,
      totalDeducted,
      Number(student.balance || 0),
      studentPayments.length,
    ]);
  });

  const summarySheet =
    XLSX.utils.aoa_to_sheet(summaryRows);

  summarySheet["!cols"] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 12 },
    { wch: 15 },
    { wch: 16 },
    { wch: 17 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    summarySheet,
    "Summary"
  );

  /*
   * ========================================================
   * INDIVIDUAL STUDENT SHEETS
   * ========================================================
   */

  students.forEach((student, studentIndex) => {
    const studentPayments = payments
      .filter(
        (payment) =>
          payment.studentId === student.id
      )
      .sort(
        (a, b) =>
          getTimestamp(a) - getTimestamp(b)
      );

    const currentBalance =
      Number(student.balance || 0);

    const totalAdded = studentPayments
      .filter(
        (payment) =>
          payment.type === "add"
      )
      .reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      );

    const totalDeducted = studentPayments
      .filter(
        (payment) =>
          payment.type === "deduct"
      )
      .reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      );

    /*
     * Calculate running balance backwards
     * from the student's current balance.
     */
    let runningBalance = currentBalance;

    const transactionRows = [];

    const newestFirst = [
      ...studentPayments,
    ].reverse();

    newestFirst.forEach((payment) => {
      const amount =
        Number(payment.amount || 0);

      const balanceAfter =
        runningBalance;

      let added = "";
      let deducted = "";

      if (payment.type === "add") {
        added = amount;
        runningBalance -= amount;
      } else {
        deducted = amount;
        runningBalance += amount;
      }

      transactionRows.unshift([
        formatDate(payment),
        payment.reason || "",
        added,
        deducted,
        balanceAfter,
      ]);
    });

    const rows = [
      ["FIDHA ACCOUNTS - STUDENT STATEMENT"],
      [],
      ["Student Name", student.name || ""],
      ["Admission No", student.adNo || ""],
      ["Class", student.className || ""],
      ["Current Balance", currentBalance],
      [],
      ["Total Added", totalAdded],
      ["Total Deducted", totalDeducted],
      ["Transactions", studentPayments.length],
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
      XLSX.utils.aoa_to_sheet(rows);

    /*
     * Column widths
     */
    sheet["!cols"] = [
      { wch: 15 },
      { wch: 35 },
      { wch: 15 },
      { wch: 16 },
      { wch: 18 },
    ];

    /*
     * Freeze transaction header
     */
    sheet["!freeze"] = {
      xSplit: 0,
      ySplit: 12,
    };

    const sheetName =
      makeUniqueSheetName(
        workbook,
        student.name,
        studentIndex
      );

    XLSX.utils.book_append_sheet(
      workbook,
      sheet,
      sheetName
    );
  });

  /*
   * ========================================================
   * DOWNLOAD
   * ========================================================
   */

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  XLSX.writeFile(
    workbook,
    `Fidha_Detailed_Accounts_${today}.xlsx`
  );
}