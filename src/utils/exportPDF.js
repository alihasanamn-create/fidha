import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import collegeLogo from "../assets/college-logo.png";


/* =========================================================
   HELPERS
========================================================= */

function money(value) {
  return Number(
    value || 0
  ).toLocaleString("en-IN");
}


function getTime(item) {

  if (
    item.createdAt?.toMillis
  ) {
    return item.createdAt.toMillis();
  }


  if (
    item.createdAt?.seconds
  ) {
    return (
      item.createdAt.seconds *
      1000
    );
  }


  if (
    item.date?.seconds
  ) {
    return (
      item.date.seconds *
      1000
    );
  }


  const time =
    new Date(
      item.date || 0
    ).getTime();


  return Number.isNaN(time)
    ? 0
    : time;
}


function formatDate(item) {

  const time =
    getTime(item);


  if (!time) {
    return "--/--/----";
  }


  const date =
    new Date(time);


  const day =
    String(
      date.getDate()
    ).padStart(2, "0");


  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");


  const year =
    date.getFullYear();


  return `${day}/${month}/${year}`;
}


/* =========================================================
   OFFICIAL HEADER
========================================================= */

function drawHeader(
  doc,
  title
) {

  const pageWidth =
    doc.internal.pageSize.getWidth();


  try {

    const logo =
      doc.getImageProperties(
        collegeLogo
      );


    const maxWidth = 48;
    const maxHeight = 28;


    const scale =
      Math.min(
        maxWidth / logo.width,
        maxHeight / logo.height
      );


    const width =
      logo.width * scale;


    const height =
      logo.height * scale;


    const x =
      (pageWidth - width) / 2;


    doc.addImage(
      collegeLogo,
      "PNG",
      x,
      6,
      width,
      height
    );

  } catch (error) {

    console.warn(
      "Logo could not be loaded."
    );

  }


  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.setFontSize(15);


  doc.text(
    "SIDDEEQ MOULA ARABIC COLLEGE",
    pageWidth / 2,
    42,
    {
      align: "center",
    }
  );


  doc.setFont(
    "helvetica",
    "normal"
  );


  doc.setFontSize(9);


  doc.text(
    "Amini Island, Lakshadweep",
    pageWidth / 2,
    48,
    {
      align: "center",
    }
  );


  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.setFontSize(12);


  doc.text(
    title,
    pageWidth / 2,
    59,
    {
      align: "center",
    }
  );


  doc.setDrawColor(
    7,
    149,
    109
  );


  doc.setLineWidth(
    0.8
  );


  doc.line(
    15,
    64,
    pageWidth - 15,
    64
  );

}


/* =========================================================
   FOOTER
========================================================= */

function drawFooter(
  doc
) {

  const pageWidth =
    doc.internal.pageSize.getWidth();


  const pageHeight =
    doc.internal.pageSize.getHeight();


  doc.setFont(
    "helvetica",
    "normal"
  );


  doc.setFontSize(7);


  doc.setTextColor(
    110,
    125,
    128
  );


  doc.text(
    "Fidha Accounts • Siddeeq Moula Arabic College",
    15,
    pageHeight - 10
  );


  doc.text(
    `Page ${doc.internal.getNumberOfPages()}`,
    pageWidth - 15,
    pageHeight - 10,
    {
      align: "right",
    }
  );

}


/* =========================================================
   CLASS BALANCE PDF
========================================================= */

export function exportClassBalancePDF(
  students,
  className
) {

  const doc =
    new jsPDF({
      orientation:
        "portrait",
    });


  drawHeader(
    doc,
    `SMAC ACCOUNTS BALANCE SHEET • ${className}`
  );


  const total =
    students.reduce(
      (sum, student) =>
        sum +
        Number(
          student.balance || 0
        ),
      0
    );


  doc.setFont(
    "helvetica",
    "normal"
  );


  doc.setFontSize(9);


  doc.text(
    `Class: ${className}`,
    15,
    76
  );


  doc.text(
    `Total Students: ${students.length}`,
    15,
    83
  );


  doc.text(
    `Total Class Balance: ${money(total)}`,
    15,
    90
  );


  const rows =
    [...students]
      .sort(
        (a, b) =>
          String(
            a.name || ""
          ).localeCompare(
            String(
              b.name || ""
            )
          )
      )
      .map(
        (student, index) => [
          index + 1,
          student.name || "",
          student.adNo || "",
          student.className || "",
          money(
            student.balance
          ),
        ]
      );


  autoTable(
    doc,
    {
      startY: 98,

      head: [[
        "Sl. No.",
        "Student Name",
        "Admission No",
        "Class",
        "Balance",
      ]],

      body: rows,

      theme:
        "grid",

      styles: {
        font:
          "helvetica",

        fontSize:
          8,

        cellPadding:
          5,

        textColor:
          [35, 55, 60],

        lineColor:
          [220, 232, 228],

        lineWidth:
          0.3,
      },

      headStyles: {
        fillColor:
          [6, 59, 70],

        textColor:
          [255, 255, 255],

        fontStyle:
          "bold",
      },

      columnStyles: {
        0: {
          cellWidth: 18,
        },

        1: {
          cellWidth: 62,
        },

        2: {
          cellWidth: 35,
        },

        3: {
          cellWidth: 25,
        },

        4: {
          cellWidth: 32,

          halign:
            "right",
        },
      },

      didDrawPage: () => {
        drawFooter(doc);
      },
    }
  );


  doc.save(
    `${className}_balance_sheet.pdf`
  );

}


/* =========================================================
   INDIVIDUAL STUDENT PDF
========================================================= */

export function exportStudentBalancePDF(
  student,
  payments
) {

  const doc =
    new jsPDF();


  drawHeader(
    doc,
    "SMAC STUDENT ACCOUNT STATEMENT"
  );


  const pageWidth =
    doc.internal.pageSize.getWidth();


  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.setFontSize(12);


  doc.text(
    student.name || "",
    15,
    78
  );


  doc.setFont(
    "helvetica",
    "normal"
  );


  doc.setFontSize(9);


  doc.text(
    `Admission No: ${
      student.adNo || ""
    }`,
    15,
    85
  );


  doc.text(
    `Class: ${
      student.className || ""
    }`,
    15,
    91
  );


  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.setFontSize(15);


  doc.text(
    `Current Balance: ${money(
      student.balance
    )}`,
    pageWidth - 15,
    85,
    {
      align: "right",
    }
  );


  const sorted =
    [...payments].sort(
      (a, b) =>
        getTime(a) -
        getTime(b)
    );


  let runningBalance =
    Number(
      student.balance || 0
    );


  const balanceRows = [];


  for (
    let i =
      sorted.length - 1;
    i >= 0;
    i--
  ) {

    const payment =
      sorted[i];


    balanceRows.unshift([
      i + 1,

      formatDate(
        payment
      ),

      payment.reason ||
        "",

      payment.type === "add"
        ? "Added"
        : "Deducted",

      payment.type === "add"
        ? money(
            payment.amount
          )
        : "",

      payment.type === "deduct"
        ? money(
            payment.amount
          )
        : "",

      money(
        runningBalance
      ),
    ]);


    if (
      payment.type ===
      "add"
    ) {

      runningBalance -=
        Number(
          payment.amount || 0
        );

    } else {

      runningBalance +=
        Number(
          payment.amount || 0
        );

    }

  }


  autoTable(
    doc,
    {
      startY: 102,

      head: [[
        "Sl. No.",
        "Date",
        "Reason",
        "Type",
        "Added",
        "Deducted",
        "Balance",
      ]],

      body:
        balanceRows,

      theme:
        "grid",

      styles: {
        font:
          "helvetica",

        fontSize:
          7.5,

        cellPadding:
          4,

        textColor:
          [35,55,60],

        lineColor:
          [220,232,228],

        lineWidth:
          0.3,
      },

      headStyles: {
        fillColor:
          [6,59,70],

        textColor:
          [255,255,255],

        fontStyle:
          "bold",
      },

      columnStyles: {

        0: {
          cellWidth: 16,
        },

        1: {
          cellWidth: 25,
        },

        2: {
          cellWidth: 52,
        },

        3: {
          cellWidth: 25,
        },

        4: {
          cellWidth: 23,
          halign: "right",
        },

        5: {
          cellWidth: 23,
          halign: "right",
        },

        6: {
          cellWidth: 27,
          halign: "right",
        },

      },

      didDrawPage: () => {
        drawFooter(doc);
      },
    }
  );


  doc.save(
    `${student.name}_account_statement.pdf`
  );

}


/* =========================================================
   CLASS CSV
========================================================= */

export function exportClassCSV(
  students,
  className
) {

  const headers = [
    "Sl. No.",
    "Student Name",
    "Admission No",
    "Class",
    "Balance",
  ];


  const rows =
    students.map(
      (student, index) => [
        index + 1,

        student.name || "",

        student.adNo || "",

        student.className || "",

        Number(
          student.balance || 0
        ),
      ]
    );


  const csv =
    [
      headers,
      ...rows,
    ]
      .map(
        (row) =>
          row
            .map(
              (value) =>
                `"${String(
                  value
                ).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(",")
      )
      .join("\n");


  downloadCSV(
    csv,
    `${className}_balance_sheet.csv`
  );

}


/* =========================================================
   STUDENT TRANSACTIONS CSV
========================================================= */

export function exportStudentTransactionsCSV(
  student,
  payments
) {

  const headers = [
    "Sl. No.",
    "Date",
    "Student",
    "Admission No",
    "Class",
    "Reason",
    "Type",
    "Amount",
  ];


  const sorted =
    [...payments].sort(
      (a, b) =>
        getTime(a) -
        getTime(b)
    );


  const rows =
    sorted.map(
      (payment, index) => [

        index + 1,

        formatDate(
          payment
        ),

        student.name || "",

        student.adNo || "",

        student.className || "",

        payment.reason || "",

        payment.type === "add"
          ? "Added"
          : "Deducted",

        Number(
          payment.amount || 0
        ),

      ]
    );


  const csv =
    [
      headers,
      ...rows,
    ]
      .map(
        (row) =>
          row
            .map(
              (value) =>
                `"${String(
                  value
                ).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(",")
      )
      .join("\n");


  downloadCSV(
    csv,
    `${student.name}_transactions.csv`
  );

}


/* =========================================================
   CSV DOWNLOAD
========================================================= */

function downloadCSV(
  csv,
  filename
) {

  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;

  link.download =
    filename;


  document.body.appendChild(
    link
  );


  link.click();


  document.body.removeChild(
    link
  );


  URL.revokeObjectURL(
    url
  );

}