import { useEffect, useMemo, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

import {
  exportClassBalancePDF,
  exportStudentBalancePDF,
  exportClassCSV,
  exportStudentTransactionsCSV,
} from "./utils/exportPDF";


export default function AdminDashboard({
  classFilter = "",
  downloadMode = false,
}) {

  const [students, setStudents] = useState([]);

  const [payments, setPayments] = useState([]);

  const [form, setForm] = useState({});

  const [search, setSearch] = useState("");

  const [name, setName] = useState("");

  const [adNo, setAdNo] = useState("");

  const [className, setClassName] =
    useState("");

  const [balance, setBalance] =
    useState("");


  /*
    Load students
  */

  useEffect(() => {

    const unsubscribe = onSnapshot(
      collection(db, "students"),
      (snapshot) => {

        const data =
          snapshot.docs.map(
            (document) => ({
              id: document.id,
              ...document.data(),
            })
          );

        setStudents(data);
      }
    );

    return () => unsubscribe();

  }, []);


  /*
    Load all payments.

    Used by Downloads.
  */

  useEffect(() => {

    const loadPayments = async () => {

      try {

        const snapshot =
          await getDocs(
            collection(db, "payments")
          );

        const data =
          snapshot.docs.map(
            (document) => ({
              id: document.id,
              ...document.data(),
            })
          );

        setPayments(data);

      } catch (error) {

        console.error(
          "Payment loading error:",
          error
        );

      }

    };

    loadPayments();

  }, []);


  /*
    Add student
  */

  const handleAdd = async () => {

    if (
      !name.trim() ||
      !adNo.trim()
    ) {
      alert(
        "Name and Admission No are required"
      );

      return;
    }


    try {

      await addDoc(
        collection(db, "students"),
        {
          name: name.trim(),

          adNo: adNo.trim(),

          className:
            className.trim(),

          balance:
            Number(balance || 0),

          password:
            adNo.trim(),
        }
      );


      alert(
        `Student added successfully.\n\nLogin:\n${adNo} / ${adNo}`
      );


      setName("");

      setAdNo("");

      setClassName("");

      setBalance("");

    } catch (error) {

      console.error(error);

      alert(
        "Failed to add student"
      );

    }

  };


  /*
    Delete student
  */

  const deleteStudent = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this student?"
      );

    if (!confirmed) return;


    try {

      await deleteDoc(
        doc(db, "students", id)
      );

    } catch (error) {

      console.error(error);

      alert(
        "Failed to delete student"
      );

    }

  };


  /*
    Form change
  */

  const handleChange = (
    id,
    field,
    value
  ) => {

    setForm((previous) => ({
      ...previous,

      [id]: {
        ...previous[id],

        [field]: value,
      },
    }));

  };


  /*
    Add / deduct transaction
  */

  const handleTransaction = async (
    student
  ) => {

    const data =
      form[student.id] || {};


    const amount =
      Number(data.amount);


    const reason =
      data.reason?.trim();


    const type =
      data.type || "add";


    if (
      !amount ||
      amount <= 0 ||
      !reason
    ) {

      alert(
        "Enter a valid amount and reason"
      );

      return;
    }


    const currentBalance =
      Number(
        student.balance || 0
      );


    const newBalance =
      type === "add"
        ? currentBalance + amount
        : currentBalance - amount;


    try {

      await updateDoc(
        doc(
          db,
          "students",
          student.id
        ),
        {
          balance: newBalance,
        }
      );


      await addDoc(
        collection(db, "payments"),
        {
          studentId:
            student.id,

          studentName:
            student.name,

          amount,

          reason,

          type,

          createdAt:
            new Date(),
        }
      );


      /*
        Immediately update local payment data
      */

      setPayments((previous) => [
        ...previous,

        {
          id:
            `local-${Date.now()}`,

          studentId:
            student.id,

          studentName:
            student.name,

          amount,

          reason,

          type,

          createdAt:
            new Date(),
        },
      ]);


      setForm((previous) => ({
        ...previous,

        [student.id]: {},
      }));

    } catch (error) {

      console.error(error);

      alert(
        "Transaction failed"
      );

    }

  };


  /*
    CSV import
  */

  const handleCSVUpload = (
    event
  ) => {

    const file =
      event.target.files?.[0];

    if (!file) return;


    const reader =
      new FileReader();


    reader.onload = async (
      loadEvent
    ) => {

      try {

        const text =
          loadEvent.target.result;


        const rows =
          text
            .split(/\r?\n/)
            .slice(1)
            .filter(Boolean);


        for (
          const row of rows
        ) {

          const values =
            row
              .split(",")
              .map((value) =>
                value
                  .trim()
                  .replace(
                    /^"|"$/g,
                    ""
                  )
              );


          const [
            csvName,
            csvAdNo,
            csvClass,
          ] = values;


          if (
            !csvName ||
            !csvAdNo
          ) {
            continue;
          }


          await addDoc(
            collection(
              db,
              "students"
            ),
            {
              name:
                csvName,

              adNo:
                csvAdNo,

              className:
                csvClass || "",

              balance: 0,

              password:
                csvAdNo,
            }
          );

        }


        alert(
          "CSV imported successfully"
        );

      } catch (error) {

        console.error(error);

        alert(
          "CSV import failed"
        );

      }

    };


    reader.readAsText(file);

    event.target.value = "";

  };


  /*
    Apply class filter
  */

  const classStudents =
    classFilter
      ? students.filter(
          (student) =>
            student.className
              ?.trim()
              .toLowerCase() ===
            classFilter
              .trim()
              .toLowerCase()
        )
      : students;


  /*
    Apply search
  */

  const filteredStudents =
    useMemo(() => {

      const searchText =
        search
          .toLowerCase()
          .trim();


      if (!searchText) {
        return classStudents;
      }


      return classStudents.filter(
        (student) =>
          student.name
            ?.toLowerCase()
            .includes(
              searchText
            ) ||

          student.adNo
            ?.toLowerCase()
            .includes(
              searchText
            ) ||

          student.className
            ?.toLowerCase()
            .includes(
              searchText
            )
      );

    }, [
      classStudents,
      search,
    ]);


  /*
    Class balance
  */

  const totalBalance =
    useMemo(() => {

      return classStudents.reduce(
        (total, student) =>
          total +
          Number(
            student.balance || 0
          ),
        0
      );

    }, [classStudents]);


  /*
    Get payments of student
  */

  const getStudentPayments = (
    studentId
  ) => {

    return payments
      .filter(
        (payment) =>
          payment.studentId ===
          studentId
      )
      .sort(
        (a, b) =>
          getPaymentTime(b) -
          getPaymentTime(a)
      );

  };


  /*
    Download individual PDF
  */

  const downloadStudentPDF =
    (student) => {

      const studentPayments =
        getStudentPayments(
          student.id
        );


      exportStudentBalancePDF(
        student,
        studentPayments
      );

    };


  /*
    Download individual CSV
  */

  const downloadStudentCSV =
    (student) => {

      const studentPayments =
        getStudentPayments(
          student.id
        );


      exportStudentTransactionsCSV(
        student,
        studentPayments
      );

    };


  /*
    Download class PDF
  */

  const downloadClassPDF =
    (classNameToDownload) => {

      const classData =
        students.filter(
          (student) =>
            student.className
              ?.trim()
              .toLowerCase() ===
            classNameToDownload
              .trim()
              .toLowerCase()
        );


      exportClassBalancePDF(
        classData,
        classNameToDownload
      );

    };


  /*
    Download class CSV
  */

  const downloadClassCSV =
    (classNameToDownload) => {

      const classData =
        students.filter(
          (student) =>
            student.className
              ?.trim()
              .toLowerCase() ===
            classNameToDownload
              .trim()
              .toLowerCase()
        );


      exportClassCSV(
        classData,
        classNameToDownload
      );

    };


  /*
    DOWNLOAD PAGE
  */

  if (downloadMode) {

    return (
      <DownloadSection
        students={students}
        payments={payments}
        downloadStudentPDF={
          downloadStudentPDF
        }
        downloadStudentCSV={
          downloadStudentCSV
        }
        downloadClassPDF={
          downloadClassPDF
        }
        downloadClassCSV={
          downloadClassCSV
        }
      />
    );

  }


  /*
    NORMAL DASHBOARD
  */

  const title =
    classFilter
      ? `${classFilter} Accounts`
      : "Accounts Dashboard";


  return (
    <div className="admin-dashboard">

      {/* Header */}

      <header className="dashboard-heading">

        <div>

          <span>
            SMAC • FIDHA ACCOUNTS
          </span>

          <h1>
            {title}
          </h1>

          <p>
            {classFilter
              ? `Viewing only ${classFilter} students`
              : "Manage students, balances and transactions."}
          </p>

        </div>


        <div className="dashboard-stats">

          <div>

            <small>
              STUDENTS
            </small>

            <strong>
              {classStudents.length}
            </strong>

          </div>


          <div>

            <small>
              TOTAL BALANCE
            </small>

            <strong>
              {totalBalance.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </div>

      </header>


      {/* Add Student only on main dashboard */}

      {!classFilter && (
        <section className="add-student-card">

          <div className="section-heading">

            <div>

              <span>
                STUDENT MANAGEMENT
              </span>

              <h2>
                Add Student
              </h2>

            </div>

          </div>


          <div className="student-form">

            <input
              placeholder="Student Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />


            <input
              placeholder="Admission No"
              value={adNo}
              onChange={(e) =>
                setAdNo(e.target.value)
              }
            />


            <input
              placeholder="Class"
              value={className}
              onChange={(e) =>
                setClassName(
                  e.target.value
                )
              }
            />


            <input
              type="number"
              placeholder="Opening Balance"
              value={balance}
              onChange={(e) =>
                setBalance(
                  e.target.value
                )
              }
            />


            <button
              className="primary-button"
              onClick={handleAdd}
            >
              + Add Student
            </button>

          </div>

        </section>
      )}


      {/* Search */}

      <section className="tools-row">

        <div className="search-box">

          <span>
            ⌕
          </span>

          <input
            placeholder={
              classFilter
                ? `Search ${classFilter} students...`
                : "Search by name, admission no or class..."
            }
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        {!classFilter && (
          <label className="csv-button">

            Import CSV

            <input
              type="file"
              accept=".csv"
              onChange={
                handleCSVUpload
              }
            />

          </label>
        )}

      </section>


      {/* Students */}

      <section className="students-section">

        <div className="section-heading">

          <div>

            <span>
              {classFilter
                ? `${classFilter} ACCOUNT LIST`
                : "ACCOUNT LIST"}
            </span>

            <h2>
              Students
            </h2>

          </div>


          <strong className="student-count">
            {filteredStudents.length}
          </strong>

        </div>


        {filteredStudents.length === 0 ? (

          <div className="empty-students">
            No students found in{" "}
            {classFilter || "the database"}.
          </div>

        ) : (

          <div className="students-grid">

            {filteredStudents.map(
              (student) => {

                const studentForm =
                  form[
                    student.id
                  ] || {};


                return (
                  <div
                    className="student-card"
                    key={student.id}
                  >

                    <div className="student-top">

                      <div className="student-avatar">
                        {student.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>


                      <div className="student-info">

                        <h3>
                          {student.name}
                        </h3>

                        <p>
                          {student.adNo}

                          {student.className &&
                            ` • ${student.className}`}
                        </p>

                      </div>


                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteStudent(
                            student.id
                          )
                        }
                      >
                        ×
                      </button>

                    </div>


                    <div className="student-balance">

                      <small>
                        CURRENT BALANCE
                      </small>

                      <strong>
                        {Number(
                          student.balance ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>


                    <div className="transaction-form">

                      <div className="transaction-title">
                        Update Account
                      </div>


                      <input
                        type="number"
                        placeholder="Amount"
                        value={
                          studentForm.amount ||
                          ""
                        }
                        onChange={(e) =>
                          handleChange(
                            student.id,
                            "amount",
                            e.target.value
                          )
                        }
                      />


                      <input
                        placeholder="Reason"
                        value={
                          studentForm.reason ||
                          ""
                        }
                        onChange={(e) =>
                          handleChange(
                            student.id,
                            "reason",
                            e.target.value
                          )
                        }
                      />


                      <select
                        value={
                          studentForm.type ||
                          "add"
                        }
                        onChange={(e) =>
                          handleChange(
                            student.id,
                            "type",
                            e.target.value
                          )
                        }
                      >

                        <option value="add">
                          Add
                        </option>

                        <option value="deduct">
                          Deduct
                        </option>

                      </select>


                      <button
                        className="update-button"
                        onClick={() =>
                          handleTransaction(
                            student
                          )
                        }
                      >
                        Update Balance
                      </button>


                      <button
                        className="download-student-button"
                        onClick={() =>
                          downloadStudentPDF(
                            student
                          )
                        }
                      >
                        Download Account
                      </button>

                    </div>

                  </div>
                );

              }
            )}

          </div>

        )}

      </section>


      <style>{`

        .admin-dashboard {
          max-width:
            1250px;

          margin:
            auto;
        }


        .dashboard-heading {
          display:
            flex;

          justify-content:
            space-between;

          gap:
            20px;

          margin-bottom:
            25px;
        }


        .dashboard-heading
        > div:first-child
        > span,
        .section-heading span {
          color:
            #07956d;

          font-size:
            9px;

          letter-spacing:
            1.5px;

          font-weight:
            800;
        }


        .dashboard-heading h1 {
          margin:
            6px 0;

          color:
            #063b46;

          font-size:
            32px;
        }


        .dashboard-heading p {
          margin:
            0;

          color:
            #8a9a9d;

          font-size:
            13px;
        }


        .dashboard-stats {
          display:
            flex;

          gap:
            10px;
        }


        .dashboard-stats > div {
          min-width:
            115px;

          padding:
            13px;

          border:
            1px solid #e2ece9;

          border-radius:
            14px;

          background:
            white;
        }


        .dashboard-stats small {
          display:
            block;

          color:
            #94a4a7;

          font-size:
            8px;

          letter-spacing:
            1px;
        }


        .dashboard-stats strong {
          display:
            block;

          margin-top:
            5px;

          color:
            #063b46;

          font-size:
            18px;
        }


        .add-student-card,
        .students-section {
          background:
            white;

          border:
            1px solid #e4eeeb;

          border-radius:
            20px;

          padding:
            22px;

          margin-bottom:
            18px;

          box-shadow:
            0 10px 30px
            rgba(6,59,70,.04);
        }


        .section-heading {
          display:
            flex;

          justify-content:
            space-between;

          align-items:
            center;

          margin-bottom:
            17px;
        }


        .section-heading h2 {
          margin:
            5px 0 0;

          color:
            #063b46;

          font-size:
            18px;
        }


        .student-form {
          display:
            grid;

          grid-template-columns:
            1.4fr 1fr 1fr .8fr auto;

          gap:
            9px;
        }


        .student-form input,
        .transaction-form input,
        .transaction-form select {
          width:
            100%;

          border:
            1px solid #dfeae7;

          border-radius:
            10px;

          padding:
            11px 12px;

          outline:
            none;

          font-size:
            12px;

          background:
            #fbfdfc;
        }


        .student-form input:focus,
        .transaction-form input:focus,
        .transaction-form select:focus {
          border-color:
            #07956d;

          box-shadow:
            0 0 0 3px
            rgba(7,149,109,.07);
        }


        .primary-button,
        .update-button,
        .download-student-button,
        .csv-button {
          border:
            0;

          border-radius:
            10px;

          cursor:
            pointer;

          font-size:
            11px;

          font-weight:
            700;

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            background .2s ease;
        }


        .primary-button {
          background:
            #063b46;

          color:
            white;

          padding:
            0 17px;
        }


        .primary-button:hover,
        .update-button:hover {
          transform:
            translateY(-2px);

          background:
            #07956d;

          box-shadow:
            0 7px 16px
            rgba(7,149,109,.18);
        }


        .tools-row {
          display:
            flex;

          gap:
            10px;

          margin-bottom:
            18px;
        }


        .search-box {
          flex:
            1;

          display:
            flex;

          align-items:
            center;

          gap:
            8px;

          background:
            white;

          border:
            1px solid #e4eeeb;

          border-radius:
            13px;

          padding:
            0 13px;
        }


        .search-box span {
          color:
            #07956d;

          font-size:
            20px;
        }


        .search-box input {
          flex:
            1;

          border:
            0;

          outline:
            0;

          padding:
            13px 0;

          font-size:
            12px;
        }


        .csv-button {
          display:
            flex;

          align-items:
            center;

          padding:
            0 18px;

          background:
            white;

          color:
            #063b46;

          border:
            1px solid #dfeae7;
        }


        .csv-button:hover {
          transform:
            translateY(-2px);

          background:
            #063b46;

          color:
            white;
        }


        .csv-button input {
          display:
            none;
        }


        .student-count {
          width:
            30px;

          height:
            30px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            9px;

          background:
            #edf7f4;

          color:
            #07956d;

          font-size:
            11px;
        }


        .students-grid {
          display:
            grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap:
            13px;
        }


        .student-card {
          padding:
            16px;

          border:
            1px solid #e7efed;

          border-radius:
            17px;

          background:
            #fcfefd;

          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }


        .student-card:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 12px 25px
            rgba(6,59,70,.07);
        }


        .student-top {
          display:
            flex;

          align-items:
            center;

          gap:
            10px;
        }


        .student-avatar {
          width:
            40px;

          height:
            40px;

          flex-shrink:
            0;

          border-radius:
            12px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          background:
            #e3f6f0;

          color:
            #07956d;

          font-weight:
            800;
        }


        .student-info {
          min-width:
            0;

          flex:
            1;
        }


        .student-info h3 {
          margin:
            0;

          color:
            #063b46;

          font-size:
            14px;
        }


        .student-info p {
          margin:
            3px 0 0;

          color:
            #91a0a3;

          font-size:
            9px;
        }


        .delete-button {
          width:
            28px;

          height:
            28px;

          border:
            0;

          border-radius:
            8px;

          background:
            #fff0ee;

          color:
            #d95f55;

          cursor:
            pointer;

          font-size:
            17px;
        }


        .student-balance {
          margin:
            14px 0;

          padding:
            13px;

          border-radius:
            12px;

          background:
            #f1f8f5;
        }


        .student-balance small {
          display:
            block;

          color:
            #91a0a3;

          font-size:
            8px;

          letter-spacing:
            1px;
        }


        .student-balance strong {
          display:
            block;

          margin-top:
            4px;

          color:
            #063b46;

          font-size:
            22px;
        }


        .transaction-form {
          display:
            grid;

          grid-template-columns:
            .7fr 1.4fr .7fr;

          gap:
            7px;
        }


        .transaction-title {
          grid-column:
            1 / -1;

          color:
            #61777b;

          font-size:
            10px;

          font-weight:
            700;
        }


        .update-button {
          background:
            #07956d;

          color:
            white;

          padding:
            10px;
        }


        .download-student-button {
          grid-column:
            1 / -1;

          padding:
            9px;

          background:
            white;

          color:
            #063b46;

          border:
            1px solid #dce9e5;
        }


        .download-student-button:hover {
          transform:
            translateY(-2px);

          background:
            #edf7f4;

          border-color:
            #07956d;
        }


        .empty-students {
          padding:
            50px;

          text-align:
            center;

          color:
            #95a4a7;

          font-size:
            12px;
        }


        @media(max-width:1000px) {

          .student-form {
            grid-template-columns:
              1fr 1fr;
          }

          .primary-button {
            padding:
              11px;
          }

        }


        @media(max-width:750px) {

          .dashboard-heading {
            flex-direction:
              column;
          }

          .students-grid {
            grid-template-columns:
              1fr;
          }

        }


        @media(max-width:550px) {

          .student-form {
            grid-template-columns:
              1fr;
          }

          .tools-row {
            flex-direction:
              column;
          }

          .csv-button {
            min-height:
              42px;

            justify-content:
              center;
          }

          .transaction-form {
            grid-template-columns:
              1fr;
          }

          .transaction-title {
            grid-column:
              auto;
          }

          .download-student-button {
            grid-column:
              auto;
          }

          .dashboard-stats {
            width:
              100%;
          }

          .dashboard-stats > div {
            flex:
              1;
          }

        }

      `}</style>

    </div>
  );
}


/* =========================================================
   DOWNLOAD SECTION
========================================================= */

function DownloadSection({
  students,
  payments,
  downloadStudentPDF,
  downloadStudentCSV,
  downloadClassPDF,
  downloadClassCSV,
}) {

  const [search, setSearch] =
    useState("");


  const filteredStudents =
    students.filter((student) => {

      const text =
        search
          .toLowerCase()
          .trim();

      if (!text) return true;

      return (
        student.name
          ?.toLowerCase()
          .includes(text) ||

        student.adNo
          ?.toLowerCase()
          .includes(text) ||

        student.className
          ?.toLowerCase()
          .includes(text)
      );

    });


  const classes = [
    ...new Set(
      students
        .map(
          (student) =>
            student.className?.trim()
        )
        .filter(Boolean)
    ),
  ].sort();


  return (
    <div className="download-page">

      <div className="download-heading">

        <span>
          REPORT CENTER
        </span>

        <h1>
          Downloads
        </h1>

        <p>
          Download individual student
          records or complete class
          balance sheets.
        </p>

      </div>


      {/* Class downloads */}

      <section className="download-panel">

        <div className="download-panel-heading">

          <div>

            <span>
              CLASS REPORTS
            </span>

            <h2>
              Class Balance Sheets
            </h2>

          </div>

        </div>


        {classes.length === 0 ? (

          <div className="download-empty">
            No classes found.
          </div>

        ) : (

          <div className="class-download-grid">

            {classes.map(
              (className) => {

                const classStudents =
                  students.filter(
                    (student) =>
                      student.className
                        ?.trim()
                        .toLowerCase() ===
                      className
                        .trim()
                        .toLowerCase()
                  );


                const balance =
                  classStudents.reduce(
                    (total, student) =>
                      total +
                      Number(
                        student.balance ||
                          0
                      ),
                    0
                  );


                return (
                  <div
                    className="class-download-card"
                    key={className}
                  >

                    <div className="class-download-top">

                      <div className="class-badge">
                        {className}
                      </div>

                      <div>

                        <strong>
                          {className}
                        </strong>

                        <span>
                          {
                            classStudents.length
                          }{" "}
                          students
                        </span>

                      </div>

                    </div>


                    <div className="class-total">

                      <small>
                        TOTAL BALANCE
                      </small>

                      <strong>
                        {balance.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>


                    <div className="download-buttons">

                      <button
                        onClick={() =>
                          downloadClassPDF(
                            className
                          )
                        }
                      >
                        PDF
                      </button>

                      <button
                        onClick={() =>
                          downloadClassCSV(
                            className
                          )
                        }
                      >
                        CSV
                      </button>

                    </div>

                  </div>
                );

              }
            )}

          </div>

        )}

      </section>


      {/* Individual downloads */}

      <section className="download-panel">

        <div className="download-panel-heading">

          <div>

            <span>
              STUDENT REPORTS
            </span>

            <h2>
              Individual Accounts
            </h2>

          </div>

        </div>


        <div className="download-search">

          <span>
            ⌕
          </span>

          <input
            placeholder="Search student, admission no or class..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        <div className="individual-download-list">

          {filteredStudents.length === 0 ? (

            <div className="download-empty">
              No students found.
            </div>

          ) : (

            filteredStudents.map(
              (student) => {

                const transactionCount =
                  payments.filter(
                    (payment) =>
                      payment.studentId ===
                      student.id
                  ).length;


                return (
                  <div
                    className="individual-download-card"
                    key={student.id}
                  >

                    <div className="download-student-avatar">
                      {student.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>


                    <div className="individual-student-info">

                      <strong>
                        {student.name}
                      </strong>

                      <span>
                        {student.adNo}
                        {" • "}
                        {student.className ||
                          "No Class"}
                      </span>

                    </div>


                    <div className="individual-balance">

                      <small>
                        BALANCE
                      </small>

                      <strong>
                        {Number(
                          student.balance ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>


                    <div className="individual-transactions">

                      <small>
                        TRANSACTIONS
                      </small>

                      <strong>
                        {transactionCount}
                      </strong>

                    </div>


                    <div className="individual-download-buttons">

                      <button
                        onClick={() =>
                          downloadStudentPDF(
                            student
                          )
                        }
                      >
                        PDF
                      </button>

                      <button
                        onClick={() =>
                          downloadStudentCSV(
                            student
                          )
                        }
                      >
                        CSV
                      </button>

                    </div>

                  </div>
                );

              }
            )

          )}

        </div>

      </section>


      <style>{`

        .download-page {
          max-width:
            1200px;

          margin:
            auto;
        }


        .download-heading {
          margin-bottom:
            25px;
        }


        .download-heading > span,
        .download-panel-heading span {
          color:
            #07956d;

          font-size:
            9px;

          font-weight:
            800;

          letter-spacing:
            1.6px;
        }


        .download-heading h1 {
          margin:
            6px 0;

          color:
            #063b46;

          font-size:
            32px;
        }


        .download-heading p {
          margin:
            0;

          color:
            #8b9b9e;

          font-size:
            13px;
        }


        .download-panel {
          padding:
            22px;

          margin-bottom:
            18px;

          background:
            white;

          border:
            1px solid #e4eeeb;

          border-radius:
            20px;

          box-shadow:
            0 10px 30px
            rgba(6,59,70,.04);
        }


        .download-panel-heading {
          display:
            flex;

          justify-content:
            space-between;

          margin-bottom:
            18px;
        }


        .download-panel-heading h2 {
          margin:
            5px 0 0;

          color:
            #063b46;

          font-size:
            18px;
        }


        .class-download-grid {
          display:
            grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0,1fr)
            );

          gap:
            12px;
        }


        .class-download-card {
          padding:
            16px;

          border:
            1px solid #e6efed;

          border-radius:
            16px;

          background:
            #fbfdfc;

          transition:
            transform .2s,
            box-shadow .2s;
        }


        .class-download-card:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 10px 22px
            rgba(6,59,70,.07);
        }


        .class-download-top {
          display:
            flex;

          align-items:
            center;

          gap:
            10px;
        }


        .class-badge {
          width:
            43px;

          height:
            43px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            12px;

          background:
            #e4f7ef;

          color:
            #07956d;

          font-size:
            12px;

          font-weight:
            800;
        }


        .class-download-top strong {
          display:
            block;

          color:
            #063b46;

          font-size:
            13px;
        }


        .class-download-top span {
          display:
            block;

          margin-top:
            3px;

          color:
            #95a5a7;

          font-size:
            9px;
        }


        .class-total {
          margin:
            14px 0;

          padding:
            11px;

          border-radius:
            11px;

          background:
            #f1f8f5;
        }


        .class-total small {
          display:
            block;

          color:
            #91a1a4;

          font-size:
            8px;

          letter-spacing:
            1px;
        }


        .class-total strong {
          display:
            block;

          margin-top:
            3px;

          color:
            #063b46;

          font-size:
            20px;
        }


        .download-buttons {
          display:
            grid;

          grid-template-columns:
            1fr 1fr;

          gap:
            7px;
        }


        .download-buttons button,
        .individual-download-buttons button {
          border:
            1px solid #dce9e5;

          background:
            white;

          color:
            #063b46;

          padding:
            9px;

          border-radius:
            9px;

          cursor:
            pointer;

          font-size:
            10px;

          font-weight:
            800;

          transition:
            all .2s;
        }


        .download-buttons button:hover,
        .individual-download-buttons button:hover {
          background:
            #063b46;

          color:
            white;

          border-color:
            #063b46;

          transform:
            translateY(-2px);
        }


        .download-search {
          display:
            flex;

          align-items:
            center;

          gap:
            8px;

          padding:
            0 13px;

          margin-bottom:
            12px;

          border:
            1px solid #e2ece9;

          border-radius:
            12px;

          background:
            #fbfdfc;
        }


        .download-search span {
          color:
            #07956d;

          font-size:
            19px;
        }


        .download-search input {
          flex:
            1;

          border:
            0;

          outline:
            0;

          padding:
            12px 0;

          background:
            transparent;

          font-size:
            11px;
        }


        .individual-download-list {
          display:
            flex;

          flex-direction:
            column;

          gap:
            7px;
        }


        .individual-download-card {
          display:
            flex;

          align-items:
            center;

          gap:
            12px;

          padding:
            10px;

          border:
            1px solid #e7efed;

          border-radius:
            13px;

          background:
            #fcfefd;

          transition:
            transform .18s,
            box-shadow .18s;
        }


        .individual-download-card:hover {
          transform:
            translateX(3px);

          box-shadow:
            0 7px 18px
            rgba(6,59,70,.06);
        }


        .download-student-avatar {
          width:
            37px;

          height:
            37px;

          flex-shrink:
            0;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            11px;

          background:
            #e4f7ef;

          color:
            #07956d;

          font-weight:
            800;

          font-size:
            12px;
        }


        .individual-student-info {
          flex:
            1;

          min-width:
            160px;
        }


        .individual-student-info strong {
          display:
            block;

          color:
            #063b46;

          font-size:
            12px;
        }


        .individual-student-info span {
          display:
            block;

          margin-top:
            3px;

          color:
            #96a5a7;

          font-size:
            8px;
        }


        .individual-balance,
        .individual-transactions {
          min-width:
            90px;
        }


        .individual-balance small,
        .individual-transactions small {
          display:
            block;

          color:
            #9aa8aa;

          font-size:
            7px;

          letter-spacing:
            .8px;
        }


        .individual-balance strong,
        .individual-transactions strong {
          display:
            block;

          margin-top:
            3px;

          color:
            #063b46;

          font-size:
            12px;
        }


        .individual-download-buttons {
          display:
            flex;

          gap:
            5px;
        }


        .download-empty {
          padding:
            40px;

          text-align:
            center;

          color:
            #96a5a7;

          font-size:
            11px;
        }


        @media(max-width:900px) {

          .class-download-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .individual-download-card {
            flex-wrap:
              wrap;
          }

        }


        @media(max-width:600px) {

          .class-download-grid {
            grid-template-columns:
              1fr;
          }

          .individual-balance,
          .individual-transactions {
            min-width:
              70px;
          }

          .individual-download-buttons {
            width:
              100%;
          }

          .individual-download-buttons button {
            flex:
              1;
          }

        }

      `}</style>

    </div>
  );
}


/* =========================================================
   DATE HELPER
========================================================= */

function getPaymentTime(payment) {

  if (
    payment.createdAt?.toMillis
  ) {
    return payment.createdAt.toMillis();
  }


  if (
    payment.createdAt?.seconds
  ) {
    return (
      payment.createdAt.seconds *
      1000
    );
  }


  if (
    payment.date?.seconds
  ) {
    return (
      payment.date.seconds *
      1000
    );
  }


  const time =
    new Date(
      payment.date || 0
    ).getTime();


  return Number.isNaN(time)
    ? 0
    : time;
}