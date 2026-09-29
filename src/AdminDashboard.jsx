import { useEffect, useMemo, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { db } from "./firebase";

import {
  exportClassBalancePDF,
  exportStudentBalancePDF,
  exportClassCSV,
  exportStudentTransactionsCSV,
} from "./utils/exportPDF";

import {
  exportDetailedExcelForClass,
} from "./utils/exportDetailedExcel";

export default function AdminDashboard({
  classFilter = "",
  downloadMode = false,
}) {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showAddStudent, setShowAddStudent] =
    useState(false);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [transactionAmount, setTransactionAmount] =
    useState("");

  const [transactionReason, setTransactionReason] =
    useState("");

  const [transactionType, setTransactionType] =
    useState("add");

  const [studentName, setStudentName] =
    useState("");

  const [studentAdNo, setStudentAdNo] =
    useState("");

  const [studentClass, setStudentClass] =
    useState("S1");

  const [studentBalance, setStudentBalance] =
    useState("");

  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        const list = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setStudents(list);
        setLoading(false);
      },
      (error) => {
        console.error("Student loading error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // =====================================================
  // LOAD PAYMENTS
  // =====================================================

  async function loadPayments() {
    try {
      const snapshot = await getDocs(
        collection(db, "payments")
      );

      const list = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setPayments(list);
    } catch (error) {
      console.error("Payment loading error:", error);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  // =====================================================
  // FILTER STUDENTS
  // =====================================================

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesClass =
        !classFilter ||
        String(student.className || "").toLowerCase() ===
          String(classFilter).toLowerCase();

      const matchesSearch =
        !query ||
        String(student.name || "")
          .toLowerCase()
          .includes(query) ||
        String(student.adNo || "")
          .toLowerCase()
          .includes(query) ||
        String(student.className || "")
          .toLowerCase()
          .includes(query);

      return matchesClass && matchesSearch;
    });
  }, [students, classFilter, search]);

  // =====================================================
  // TOTAL BALANCE
  // =====================================================

  const totalBalance = useMemo(() => {
    return filteredStudents.reduce(
      (total, student) =>
        total + Number(student.balance || 0),
      0
    );
  }, [filteredStudents]);

  // =====================================================
  // CLASSES
  // =====================================================

  const classes = useMemo(() => {
    const found = new Set();

    students.forEach((student) => {
      if (student.className) {
        found.add(
          String(student.className).toUpperCase()
        );
      }
    });

    ["S1", "S2", "S3", "S4"].forEach((item) =>
      found.add(item)
    );

    return [...found].sort();
  }, [students]);

  // =====================================================
  // ADD STUDENT
  // =====================================================

  async function handleAddStudent(event) {
    event.preventDefault();

    if (!studentName.trim()) {
      alert("Please enter student name.");
      return;
    }

    if (!studentAdNo.trim()) {
      alert("Please enter admission number.");
      return;
    }

    try {
      await addDoc(collection(db, "students"), {
        name: studentName.trim(),
        adNo: studentAdNo.trim(),
        className: studentClass,
        balance: Number(studentBalance || 0),
        password: studentAdNo.trim(),
      });

      setStudentName("");
      setStudentAdNo("");
      setStudentClass("S1");
      setStudentBalance("");
      setShowAddStudent(false);

      alert("Student added successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to add student.");
    }
  }

  // =====================================================
  // DELETE STUDENT
  // =====================================================

  async function handleDeleteStudent(student) {
    const confirmed = window.confirm(
      `Delete ${student.name}?`
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "students", student.id)
      );

      if (selectedStudent?.id === student.id) {
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to delete student.");
    }
  }

  // =====================================================
  // TRANSACTION
  // =====================================================

  async function handleTransaction(event) {
    event.preventDefault();

    if (!selectedStudent) return;

    const amount = Number(transactionAmount);

    if (!amount || amount <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    if (!transactionReason.trim()) {
      alert("Enter a reason.");
      return;
    }

    const oldBalance = Number(
      selectedStudent.balance || 0
    );

    const newBalance =
      transactionType === "add"
        ? oldBalance + amount
        : oldBalance - amount;

    try {
      await updateDoc(
        doc(
          db,
          "students",
          selectedStudent.id
        ),
        {
          balance: newBalance,
        }
      );

      await addDoc(collection(db, "payments"), {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        amount,
        reason: transactionReason.trim(),
        type: transactionType,
        createdAt: new Date(),
      });

      setTransactionAmount("");
      setTransactionReason("");
      setTransactionType("add");
      setSelectedStudent(null);

      await loadPayments();
    } catch (error) {
      console.error(error);
      alert("Transaction failed.");
    }
  }

  // =====================================================
  // CLASS DETAILED EXCEL
  // =====================================================

  function downloadDetailedExcel(className) {
    exportDetailedExcelForClass(
      className,
      students,
      payments
    );
  }

  // =====================================================
  // DOWNLOAD MODE
  // =====================================================

  if (downloadMode) {
    return (
      <DownloadSection
        students={students}
        payments={payments}
        classes={classes}
        onDetailedExcel={downloadDetailedExcel}
      />
    );
  }

  // =====================================================
  // MAIN DASHBOARD
  // =====================================================

  return (
    <div className="admin-dashboard">
      <div className="admin-topbar">
        <div>
          <div className="admin-eyebrow">
            SMAC ACCOUNTS
          </div>

          <h1>
            {classFilter
              ? `${classFilter} Accounts`
              : "Accounts Dashboard"}
          </h1>

          <p>
            Manage students, balances and
            transactions.
          </p>
        </div>

        <button
          className="primary-action"
          onClick={() => setShowAddStudent(true)}
        >
          <Plus size={18} />
          <span>Add Student</span>
        </button>
      </div>

      {/* STATS */}

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="stat-icon">
            <Users size={20} />
          </div>

          <div>
            <span>Students</span>

            <strong>
              {filteredStudents.length}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon balance-icon">
            <Wallet size={20} />
          </div>

          <div>
            <span>Total Balance</span>

            <strong>
              {totalBalance.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon">
            <GraduationCap size={20} />
          </div>

          <div>
            <span>Class</span>

            <strong>
              {classFilter || "All Classes"}
            </strong>
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div className="admin-toolbar">
        <div className="modern-search">
          <Search size={18} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search student, admission no..."
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          className="refresh-button"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* STUDENTS */}

      {loading ? (
        <div className="empty-admin">
          <RefreshCw
            size={25}
            className="spin"
          />

          <span>Loading students...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty-admin">
          <Users size={30} />

          <h3>No students found</h3>

          <p>
            Add a student or change your search.
          </p>
        </div>
      ) : (
        <div className="student-grid">
          {filteredStudents.map((student) => (
            <StudentAdminCard
              key={student.id}
              student={student}
              onTransaction={() =>
                setSelectedStudent(student)
              }
              onDelete={() =>
                handleDeleteStudent(student)
              }
            />
          ))}
        </div>
      )}

      {/* ADD STUDENT */}

      {showAddStudent && (
        <Modal
          title="Add Student"
          icon={<Plus size={20} />}
          onClose={() => setShowAddStudent(false)}
        >
          <form
            onSubmit={handleAddStudent}
            className="modern-form"
          >
            <label>
              Student Name

              <input
                value={studentName}
                onChange={(event) =>
                  setStudentName(event.target.value)
                }
                placeholder="Enter student name"
              />
            </label>

            <label>
              Admission Number

              <input
                value={studentAdNo}
                onChange={(event) =>
                  setStudentAdNo(event.target.value)
                }
                placeholder="Enter admission number"
              />
            </label>

            <label>
              Class

              <select
                value={studentClass}
                onChange={(event) =>
                  setStudentClass(event.target.value)
                }
              >
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
                <option value="S4">S4</option>
              </select>
            </label>

            <label>
              Opening Balance

              <input
                type="number"
                min="0"
                value={studentBalance}
                onChange={(event) =>
                  setStudentBalance(event.target.value)
                }
                placeholder="0"
              />
            </label>

            <button
              type="submit"
              className="primary-action full-width"
            >
              <Plus size={18} />
              Add Student
            </button>
          </form>
        </Modal>
      )}

      {/* TRANSACTION */}

      {selectedStudent && (
        <Modal
          title="New Transaction"
          icon={<Wallet size={20} />}
          onClose={() => setSelectedStudent(null)}
        >
          <div className="transaction-student">
            <div className="student-mini-avatar">
              {String(
                selectedStudent.name || "S"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {selectedStudent.name}
              </strong>

              <span>
                {selectedStudent.adNo} ·{" "}
                {selectedStudent.className}
              </span>
            </div>

            <div className="transaction-current">
              {Number(
                selectedStudent.balance || 0
              ).toLocaleString("en-IN")}
            </div>
          </div>

          <form
            onSubmit={handleTransaction}
            className="modern-form"
          >
            <div className="transaction-type">
              <button
                type="button"
                className={
                  transactionType === "add"
                    ? "active add"
                    : ""
                }
                onClick={() =>
                  setTransactionType("add")
                }
              >
                <ArrowDownToLine size={18} />
                Add
              </button>

              <button
                type="button"
                className={
                  transactionType === "deduct"
                    ? "active deduct"
                    : ""
                }
                onClick={() =>
                  setTransactionType("deduct")
                }
              >
                <ArrowUpFromLine size={18} />
                Deduct
              </button>
            </div>

            <label>
              Amount

              <input
                type="number"
                min="0"
                value={transactionAmount}
                onChange={(event) =>
                  setTransactionAmount(
                    event.target.value
                  )
                }
                placeholder="Enter amount"
              />
            </label>

            <label>
              Reason

              <input
                value={transactionReason}
                onChange={(event) =>
                  setTransactionReason(
                    event.target.value
                  )
                }
                placeholder="e.g. Fee payment, books..."
              />
            </label>

            <button
              type="submit"
              className="primary-action full-width"
            >
              <Wallet size={18} />
              Save Transaction
            </button>
          </form>
        </Modal>
      )}

      <style>{adminStyles}</style>
    </div>
  );
}

// =====================================================
// STUDENT CARD
// =====================================================

function StudentAdminCard({
  student,
  onTransaction,
  onDelete,
}) {
  return (
    <div className="modern-student-card">
      <div className="student-card-top">
        <div className="student-avatar">
          {String(student.name || "S")
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="student-card-info">
          <h3>{student.name}</h3>

          <span>{student.adNo}</span>
        </div>

        <div className="class-pill">
          {student.className}
        </div>
      </div>

      <div className="student-balance">
        <span>Current Balance</span>

        <strong>
          {Number(
            student.balance || 0
          ).toLocaleString("en-IN")}
        </strong>
      </div>

      <div className="student-card-actions">
        <button
          className="transaction-button"
          onClick={onTransaction}
        >
          <Wallet size={16} />
          Transaction
        </button>

        <button
          className="icon-delete"
          onClick={onDelete}
          title="Delete student"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}

// =====================================================
// MODAL
// =====================================================

function Modal({
  title,
  icon,
  children,
  onClose,
}) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="modern-modal">
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">
              {icon}
            </div>

            <h2>{title}</h2>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

// =====================================================
// DOWNLOAD SECTION
// =====================================================

function DownloadSection({
  students,
  payments,
  classes,
  onDetailedExcel,
}) {
  const [studentSearch, setStudentSearch] =
    useState("");

  const filteredStudents = students.filter(
    (student) => {
      const query =
        studentSearch.trim().toLowerCase();

      if (!query) return true;

      return (
        String(student.name || "")
          .toLowerCase()
          .includes(query) ||
        String(student.adNo || "")
          .toLowerCase()
          .includes(query) ||
        String(student.className || "")
          .toLowerCase()
          .includes(query)
      );
    }
  );

  return (
    <div className="download-page">
      {/* HEADER */}

      <div className="download-page-header">
        <div>
          <div className="admin-eyebrow">
            REPORT CENTRE
          </div>

          <h1>Downloads</h1>

          <p>
            Export class and student account
            reports.
          </p>
        </div>

        <div className="download-header-icon">
          <Download size={25} />
        </div>
      </div>

      {/* DETAILED EXCEL */}

      <section className="download-section">
        <div className="download-section-heading">
          <div>
            <h2>Detailed Excel</h2>

            <p>
              Each class downloads as a
              separate Excel file.
            </p>
          </div>

          <FileSpreadsheet size={21} />
        </div>

        <div className="class-excel-grid">
          {classes.map((className) => {
            const count = students.filter(
              (student) =>
                String(
                  student.className || ""
                ).toLowerCase() ===
                String(className).toLowerCase()
            ).length;

            return (
              <div
                className="class-excel-card"
                key={className}
              >
                <div className="class-excel-icon">
                  <GraduationCap size={21} />
                </div>

                <div className="class-excel-info">
                  <strong>{className}</strong>

                  <span>
                    {count} student
                    {count !== 1 ? "s" : ""}
                  </span>
                </div>

                <button
                  className="excel-download-button"
                  onClick={() =>
                    onDetailedExcel(className)
                  }
                  title={`Download ${className} Excel`}
                >
                  <Download size={17} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* CLASS REPORTS */}

      <section className="download-section">
        <div className="download-section-heading">
          <div>
            <h2>Class Reports</h2>

            <p>
              Download class balance reports.
            </p>
          </div>

          <FileText size={21} />
        </div>

        <div className="report-list">
          {classes.map((className) => (
            <div
              className="report-row"
              key={className}
            >
              <div className="report-row-info">
                <div className="report-icon">
                  <GraduationCap size={18} />
                </div>

                <div>
                  <strong>{className}</strong>

                  <span>
                    Class balance report
                  </span>
                </div>
              </div>

              <div className="report-actions">
                <button
                  onClick={() =>
                    exportClassBalancePDF(
                      className,
                      students,
                      payments
                    )
                  }
                  className="small-report-button"
                >
                  <FileText size={15} />
                  PDF
                </button>

                <button
                  onClick={() =>
                    exportClassCSV(
                      className,
                      students,
                      payments
                    )
                  }
                  className="small-report-button"
                >
                  <FileSpreadsheet size={15} />
                  CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STUDENT STATEMENTS */}

      <section className="download-section">
        <div className="download-section-heading">
          <div>
            <h2>Student Statements</h2>

            <p>
              Download individual account
              statements.
            </p>
          </div>

          <Users size={21} />
        </div>

        <div className="download-search">
          <Search size={17} />

          <input
            value={studentSearch}
            onChange={(event) =>
              setStudentSearch(
                event.target.value
              )
            }
            placeholder="Search students..."
          />
        </div>

        <div className="student-download-list">
          {filteredStudents.map((student) => {
            const transactions = payments
              .filter(
                (payment) =>
                  payment.studentId ===
                  student.id
              )
              .sort(
                (a, b) =>
                  getPaymentTime(a) -
                  getPaymentTime(b)
              );

            return (
              <div
                className="report-row"
                key={student.id}
              >
                <div className="report-row-info">
                  <div className="student-list-avatar">
                    {String(
                      student.name || "S"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {student.name}
                    </strong>

                    <span>
                      {student.adNo} ·{" "}
                      {student.className}
                    </span>
                  </div>
                </div>

                <div className="report-actions">
                  <button
                    onClick={() =>
                      exportStudentBalancePDF(
                        student,
                        transactions
                      )
                    }
                    className="small-report-button"
                  >
                    <FileText size={15} />
                    PDF
                  </button>

                  <button
                    onClick={() =>
                      exportStudentTransactionsCSV(
                        student,
                        transactions
                      )
                    }
                    className="small-report-button"
                  >
                    <FileSpreadsheet size={15} />
                    CSV
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// =====================================================
// PAYMENT DATE
// =====================================================

function getPaymentTime(payment) {
  if (payment.createdAt?.toMillis) {
    return payment.createdAt.toMillis();
  }

  if (payment.createdAt?.seconds) {
    return payment.createdAt.seconds * 1000;
  }

  if (payment.date?.seconds) {
    return payment.date.seconds * 1000;
  }

  const time = new Date(
    payment.date || 0
  ).getTime();

  return Number.isNaN(time) ? 0 : time;
}

// =====================================================
// STYLES
// =====================================================

const adminStyles = `
.admin-dashboard,
.download-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.admin-topbar,
.download-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
}

.admin-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .13em;
  color: #0f766e;
  margin-bottom: 5px;
}

.admin-topbar h1,
.download-page-header h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.15;
  color: #102a32;
  letter-spacing: -.03em;
}

.admin-topbar p,
.download-page-header p {
  margin: 7px 0 0;
  color: #71818a;
  font-size: 14px;
}

.primary-action {
  border: 0;
  background: #087f73;
  color: white;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: .2s ease;
  box-shadow: 0 7px 18px rgba(8,127,115,.16);
}

.primary-action:hover {
  background: #066b61;
  transform: translateY(-1px);
}

.full-width {
  width: 100%;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.admin-stat-card {
  background: white;
  border: 1px solid #e4ecee;
  border-radius: 15px;
  padding: 17px;
  display: flex;
  align-items: center;
  gap: 13px;
  box-shadow: 0 5px 20px rgba(18,49,57,.045);
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #087f73;
  background: #e9f7f4;
}

.balance-icon {
  color: #136c50;
  background: #eaf7ef;
}

.admin-stat-card span {
  display: block;
  color: #809097;
  font-size: 12px;
  margin-bottom: 3px;
}

.admin-stat-card strong {
  display: block;
  color: #18343c;
  font-size: 20px;
}

.admin-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.modern-search,
.download-search {
  height: 44px;
  background: white;
  border: 1px solid #dce6e8;
  border-radius: 11px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  color: #8a999f;
}

.modern-search {
  flex: 1;
}

.modern-search input,
.download-search input {
  border: 0;
  outline: 0;
  background: transparent;
  width: 100%;
  color: #243c43;
  font-size: 13px;
}

.clear-search {
  border: 0;
  background: transparent;
  color: #8b9a9f;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.refresh-button {
  height: 44px;
  border: 1px solid #dce6e8;
  background: white;
  border-radius: 11px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #40565d;
  font-weight: 650;
  cursor: pointer;
}

.student-grid {
  display: grid;
  grid-template-columns: repeat(3,minmax(0,1fr));
  gap: 14px;
}

.modern-student-card {
  background: white;
  border: 1px solid #e3ebed;
  border-radius: 16px;
  padding: 16px;
  transition: .2s ease;
  box-shadow: 0 5px 18px rgba(18,49,57,.04);
}

.modern-student-card:hover {
  transform: translateY(-2px);
  border-color: #c7dfdc;
  box-shadow: 0 10px 25px rgba(18,49,57,.08);
}

.student-card-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-avatar,
.student-list-avatar,
.student-mini-avatar {
  flex-shrink: 0;
  background: #e7f6f3;
  color: #087f73;
  font-weight: 800;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 15px;
}

.student-card-info {
  min-width: 0;
  flex: 1;
}

.student-card-info h3 {
  margin: 0;
  color: #19343b;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-card-info span {
  display: block;
  margin-top: 3px;
  color: #8a989d;
  font-size: 11px;
}

.class-pill {
  background: #f0f7f6;
  color: #08766d;
  border-radius: 7px;
  padding: 5px 8px;
  font-size: 10px;
  font-weight: 800;
}

.student-balance {
  padding: 17px 0 14px;
}

.student-balance span {
  display: block;
  color: #8a999f;
  font-size: 11px;
  margin-bottom: 4px;
}

.student-balance strong {
  font-size: 23px;
  color: #18343c;
}

.student-card-actions {
  display: flex;
  gap: 8px;
}

.transaction-button {
  flex: 1;
  height: 37px;
  border: 1px solid #d7e6e4;
  background: #f4faf9;
  color: #08776e;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
}

.icon-delete {
  width: 37px;
  height: 37px;
  border: 1px solid #f0dddd;
  background: #fff8f8;
  color: #bd5656;
  border-radius: 9px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.empty-admin {
  min-height: 260px;
  background: white;
  border: 1px dashed #d7e3e5;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8a999f;
  gap: 7px;
}

.empty-admin h3 {
  margin: 5px 0 0;
  color: #40565d;
}

.empty-admin p {
  margin: 0;
  font-size: 13px;
}

.spin {
  animation: admin-spin 1s linear infinite;
}

@keyframes admin-spin {
  to {
    transform: rotate(360deg);
  }
}

/* MODAL */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(11,32,38,.45);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.modern-modal {
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 36px);
  overflow-y: auto;
  background: white;
  border-radius: 19px;
  box-shadow: 0 25px 70px rgba(0,0,0,.2);
  padding: 20px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title h2 {
  margin: 0;
  font-size: 19px;
  color: #19343b;
}

.modal-title-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: #e8f6f3;
  color: #087f73;
  display: grid;
  place-items: center;
}

.modal-close {
  border: 0;
  background: #f3f6f7;
  color: #65777d;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modern-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #40565d;
  font-size: 12px;
  font-weight: 700;
}

.modern-form input,
.modern-form select {
  width: 100%;
  height: 43px;
  box-sizing: border-box;
  border: 1px solid #dbe5e7;
  border-radius: 10px;
  padding: 0 12px;
  outline: 0;
  background: white;
  color: #213940;
  font-size: 13px;
}

.modern-form input:focus,
.modern-form select:focus {
  border-color: #55a99f;
  box-shadow: 0 0 0 3px rgba(8,127,115,.08);
}

.transaction-student {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5faf9;
  border: 1px solid #e0eeec;
  border-radius: 12px;
  padding: 11px;
  margin-bottom: 16px;
}

.student-mini-avatar {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
}

.transaction-student > div:nth-child(2) {
  min-width: 0;
  flex: 1;
}

.transaction-student strong {
  display: block;
  color: #203b42;
  font-size: 13px;
}

.transaction-student span {
  display: block;
  color: #87969b;
  font-size: 10px;
  margin-top: 3px;
}

.transaction-current {
  font-weight: 800;
  color: #08776e;
  font-size: 14px;
}

.transaction-type {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.transaction-type button {
  height: 42px;
  border: 1px solid #dce6e8;
  border-radius: 10px;
  background: white;
  color: #66777d;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-weight: 750;
  cursor: pointer;
}

.transaction-type button.active.add {
  color: #08776e;
  background: #eaf8f4;
  border-color: #a8dcd4;
}

.transaction-type button.active.deduct {
  color: #b25454;
  background: #fff2f2;
  border-color: #efc2c2;
}

/* DOWNLOADS */

.download-header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #e8f6f3;
  color: #087f73;
  display: grid;
  place-items: center;
}

.download-section {
  background: white;
  border: 1px solid #e2eaec;
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 5px 20px rgba(18,49,57,.035);
}

.download-section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: #087f73;
  margin-bottom: 15px;
}

.download-section-heading h2 {
  margin: 0;
  color: #19343b;
  font-size: 16px;
}

.download-section-heading p {
  margin: 4px 0 0;
  color: #89979c;
  font-size: 12px;
}

.class-excel-grid {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 10px;
}

.class-excel-card {
  border: 1px solid #e1eaea;
  background: #fbfdfd;
  border-radius: 13px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 9px;
  transition: .2s ease;
}

.class-excel-card:hover {
  border-color: #b8d9d5;
  transform: translateY(-1px);
}

.class-excel-icon {
  width: 37px;
  height: 37px;
  border-radius: 10px;
  background: #e8f6f3;
  color: #087f73;
  display: grid;
  place-items: center;
}

.class-excel-info {
  min-width: 0;
  flex: 1;
}

.class-excel-info strong {
  display: block;
  color: #203b42;
  font-size: 13px;
}

.class-excel-info span {
  display: block;
  color: #8a999f;
  font-size: 10px;
  margin-top: 2px;
}

.excel-download-button {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 9px;
  background: #087f73;
  color: white;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.report-list,
.student-download-list {
  display: flex;
  flex-direction: column;
}

.report-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid #edf1f2;
}

.report-row:last-child {
  border-bottom: 0;
}

.report-row-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.report-icon,
.student-list-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.report-icon {
  background: #f0f7f6;
  color: #087f73;
}

.student-list-avatar {
  background: #e7f6f3;
  color: #087f73;
  font-weight: 800;
}

.report-row-info strong {
  display: block;
  color: #274149;
  font-size: 12px;
}

.report-row-info span {
  display: block;
  color: #8c999e;
  font-size: 10px;
  margin-top: 2px;
}

.report-actions {
  display: flex;
  gap: 6px;
}

.small-report-button {
  height: 32px;
  border: 1px solid #dbe6e7;
  background: white;
  border-radius: 8px;
  padding: 0 9px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #496168;
  font-size: 10px;
  font-weight: 750;
  cursor: pointer;
}

.small-report-button:hover {
  border-color: #9ccdc7;
  color: #08776e;
  background: #f5faf9;
}

.download-search {
  margin-bottom: 9px;
}

@media (max-width: 1050px) {
  .student-grid {
    grid-template-columns: repeat(2,1fr);
  }

  .class-excel-grid {
    grid-template-columns: repeat(2,1fr);
  }
}

@media (max-width: 700px) {
  .admin-topbar,
  .download-page-header {
    align-items: flex-start;
  }

  .admin-topbar h1,
  .download-page-header h1 {
    font-size: 23px;
  }

  .admin-stats {
    grid-template-columns: 1fr;
  }

  .student-grid {
    grid-template-columns: 1fr;
  }

  .class-excel-grid {
    grid-template-columns: repeat(2,1fr);
  }

  .admin-toolbar {
    flex-direction: column;
  }

  .refresh-button {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .admin-topbar,
  .download-page-header {
    flex-direction: column;
  }

  .primary-action {
    width: 100%;
  }

  .class-excel-grid {
    grid-template-columns: 1fr;
  }

  .report-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .report-actions {
    width: 100%;
  }

  .small-report-button {
    flex: 1;
    justify-content: center;
  }

  .modern-modal {
    padding: 16px;
  }
}
`;