import { useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

export default function AdminParentView() {
  const [adNo, setAdNo] = useState("");
  const [student, setStudent] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!adNo.trim()) {
      alert("Enter admission number");
      return;
    }

    try {
      setLoading(true);

      const q = query(
        collection(db, "students"),
        where("adNo", "==", adNo.trim())
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        setStudent(null);
        setTransactions([]);
        alert("Student not found");
        return;
      }

      const studentDoc = snap.docs[0];

      const studentData = {
        id: studentDoc.id,
        ...studentDoc.data(),
      };

      setStudent(studentData);

      const transactionQuery = query(
        collection(db, "payments"),
        where("studentId", "==", studentDoc.id)
      );

      const transactionSnap =
        await getDocs(transactionQuery);

      const transactionData =
        transactionSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      transactionData.sort(
        (a, b) =>
          getTransactionTime(b) -
          getTransactionTime(a)
      );

      setTransactions(transactionData);
    } catch (error) {
      console.error(error);
      alert("Failed to load student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-parent-view">
      <div className="page-header">
        <div>
          <span>ADMIN TOOLS</span>
          <h1>Parent View</h1>
          <p>
            Search a student and preview their account.
          </p>
        </div>
      </div>

      <div className="search-card">
        <input
          value={adNo}
          placeholder="Enter Admission Number"
          onChange={(e) =>
            setAdNo(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              search();
            }
          }}
        />

        <button
          onClick={search}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {student && (
        <>
          <section className="student-summary">
            <div>
              <span>STUDENT</span>
              <h2>{student.name}</h2>

              <p>
                Admission No: {student.adNo}
              </p>

              {student.className && (
                <p>
                  Class: {student.className}
                </p>
              )}
            </div>

            <div className="summary-balance">
              <span>CURRENT BALANCE</span>
              <strong>
                {Number(
                  student.balance || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>
          </section>

          <section className="transactions-card">
            <div className="section-title">
              <div>
                <span>ACCOUNT ACTIVITY</span>
                <h2>Transactions</h2>
              </div>

              <strong>
                {transactions.length}
              </strong>
            </div>

            {transactions.length === 0 ? (
              <div className="empty">
                No transactions found.
              </div>
            ) : (
              <div className="admin-transactions">
                {transactions.map((transaction) => {
                  const credit =
                    transaction.type === "add";

                  return (
                    <div
                      className="admin-transaction"
                      key={transaction.id}
                    >
                      <div
                        className={`transaction-mark ${
                          credit
                            ? "credit"
                            : "debit"
                        }`}
                      >
                        {credit ? "+" : "−"}
                      </div>

                      <div className="transaction-details">
                        <strong>
                          {transaction.reason ||
                            "Transaction"}
                        </strong>

                        <span>
                          {formatDate(transaction)}
                        </span>
                      </div>

                      <div
                        className={`transaction-value ${
                          credit
                            ? "credit"
                            : "debit"
                        }`}
                      >
                        {credit ? "+" : "−"}
                        {Number(
                          transaction.amount || 0
                        ).toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      <style>{`
        .admin-parent-view {
          max-width: 1100px;
          margin: auto;
        }

        .page-header {
          margin-bottom: 25px;
        }

        .page-header span,
        .section-title span,
        .student-summary span {
          color: #07956d;
          font-size: 9px;
          letter-spacing: 1.5px;
          font-weight: 800;
        }

        .page-header h1 {
          margin: 6px 0;
          color: #063b46;
          font-size: 32px;
        }

        .page-header p {
          margin: 0;
          color: #85969a;
          font-size: 13px;
        }

        .search-card {
          display: flex;
          gap: 10px;
          padding: 15px;
          background: white;
          border: 1px solid #e5efec;
          border-radius: 17px;
          box-shadow: 0 10px 30px rgba(6,59,70,.05);
          margin-bottom: 20px;
        }

        .search-card input {
          flex: 1;
          min-width: 0;
          border: 1px solid #dce9e5;
          border-radius: 11px;
          padding: 12px 14px;
          outline: none;
          font-size: 13px;
          transition: border .2s, box-shadow .2s;
        }

        .search-card input:focus {
          border-color: #07956d;
          box-shadow: 0 0 0 3px rgba(7,149,109,.08);
        }

        .search-card button {
          border: 0;
          border-radius: 11px;
          padding: 0 22px;
          background: #063b46;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: transform .2s, background .2s;
        }

        .search-card button:hover {
          transform: translateY(-2px);
          background: #07956d;
        }

        .student-summary {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 24px;
          border-radius: 20px;
          background: linear-gradient(135deg,#063b46,#08705e);
          color: white;
          margin-bottom: 20px;
        }

        .student-summary h2 {
          margin: 6px 0;
          font-size: 25px;
        }

        .student-summary p {
          margin: 3px 0;
          opacity: .65;
          font-size: 11px;
        }

        .summary-balance {
          text-align: right;
        }

        .summary-balance span {
          color: rgba(255,255,255,.65);
        }

        .summary-balance strong {
          display: block;
          margin-top: 8px;
          font-size: 34px;
        }

        .transactions-card {
          background: white;
          border: 1px solid #e5efec;
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 10px 30px rgba(6,59,70,.05);
        }

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .section-title h2 {
          margin: 5px 0 0;
          color: #063b46;
          font-size: 18px;
        }

        .section-title > strong {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: #edf7f4;
          color: #07956d;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 11px;
        }

        .admin-transactions {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .admin-transaction {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px;
          border: 1px solid #edf2f0;
          border-radius: 12px;
          transition: .2s;
        }

        .admin-transaction:hover {
          transform: translateX(3px);
          box-shadow: 0 5px 15px rgba(6,59,70,.06);
        }

        .transaction-mark {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .transaction-mark.credit {
          background: #e7f8f1;
          color: #07956d;
        }

        .transaction-mark.debit {
          background: #fff0ee;
          color: #d95f55;
        }

        .transaction-details {
          flex: 1;
          min-width: 0;
        }

        .transaction-details strong {
          display: block;
          font-size: 12px;
          color: #24454b;
        }

        .transaction-details span {
          display: block;
          margin-top: 3px;
          color: #9aa9ac;
          font-size: 9px;
        }

        .transaction-value {
          font-weight: 800;
          font-size: 12px;
        }

        .transaction-value.credit {
          color: #07956d;
        }

        .transaction-value.debit {
          color: #d95f55;
        }

        .empty {
          padding: 50px;
          text-align: center;
          color: #95a4a7;
          font-size: 12px;
        }

        @media(max-width:600px) {
          .search-card {
            flex-direction: column;
          }

          .search-card button {
            height: 42px;
          }

          .student-summary {
            flex-direction: column;
          }

          .summary-balance {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}

function getTransactionTime(transaction) {
  if (transaction.createdAt?.toMillis) {
    return transaction.createdAt.toMillis();
  }

  if (transaction.createdAt?.seconds) {
    return transaction.createdAt.seconds * 1000;
  }

  if (transaction.date?.seconds) {
    return transaction.date.seconds * 1000;
  }

  const time = new Date(
    transaction.date || 0
  ).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function formatDate(transaction) {
  const time = getTransactionTime(transaction);

  if (!time) {
    return "--/--/----";
  }

  const date = new Date(time);

  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
}