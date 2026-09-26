import { useEffect, useMemo, useState } from "react";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { exportStudentBalancePDF } from "../utils/exportPDF";


/*
  Load Outfit font once
*/

if (
  typeof document !== "undefined" &&
  !document.querySelector(
    'link[data-fidha-font="outfit"]'
  )
) {
  const fontLink =
    document.createElement("link");

  fontLink.rel = "stylesheet";

  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";

  fontLink.setAttribute(
    "data-fidha-font",
    "outfit"
  );

  document.head.appendChild(
    fontLink
  );
}


export default function ParentDashboard({
  user,
  setUser,
}) {

  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const student =
    user?.student;


  /*
    Fetch transactions
  */

  useEffect(() => {

    const fetchTransactions =
      async () => {

        if (!user?.id) return;

        try {

          setLoading(true);

          const q =
            query(
              collection(
                db,
                "payments"
              ),

              where(
                "studentId",
                "==",
                user.id
              )
            );

          const snap =
            await getDocs(q);

          const data =
            snap.docs.map(
              (document) => ({
                id:
                  document.id,

                ...document.data(),
              })
            );

          data.sort(
            (a, b) =>
              getTransactionTime(a) -
              getTransactionTime(b)
          );

          setTransactions(data);

        } catch (error) {

          console.error(
            "Failed to load transactions:",
            error
          );

        } finally {

          setLoading(false);

        }

      };

    fetchTransactions();

  }, [user?.id]);


  /*
    Transaction timestamp
  */

  function getTransactionTime(
    transaction
  ) {

    if (
      transaction.createdAt?.toMillis
    ) {
      return transaction.createdAt.toMillis();
    }

    if (
      transaction.createdAt?.seconds
    ) {
      return (
        transaction.createdAt.seconds *
        1000
      );
    }

    if (
      transaction.date?.seconds
    ) {
      return (
        transaction.date.seconds *
        1000
      );
    }

    const time =
      new Date(
        transaction.date || 0
      ).getTime();

    return Number.isNaN(time)
      ? 0
      : time;
  }


  /*
    DD/MM/YYYY
  */

  function formatDate(
    transaction
  ) {

    const time =
      getTransactionTime(
        transaction
      );

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


  /*
    Number formatting
  */

  function formatAmount(
    value
  ) {

    return Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    );
  }


  /*
    Total added
  */

  const totalAdded =
    useMemo(() => {

      return transactions
        .filter(
          (transaction) =>
            transaction.type ===
            "add"
        )
        .reduce(
          (
            total,
            transaction
          ) =>
            total +
            Number(
              transaction.amount ||
                0
            ),
          0
        );

    }, [transactions]);


  /*
    Total deducted
  */

  const totalDeducted =
    useMemo(() => {

      return transactions
        .filter(
          (transaction) =>
            transaction.type ===
            "deduct"
        )
        .reduce(
          (
            total,
            transaction
          ) =>
            total +
            Number(
              transaction.amount ||
                0
            ),
          0
        );

    }, [transactions]);


  /*
    Graph data
  */

  const graphData =
    useMemo(() => {

      if (!student) {
        return [];
      }

      const ordered =
        [...transactions].sort(
          (a, b) =>
            getTransactionTime(a) -
            getTransactionTime(b)
        );

      if (
        ordered.length === 0
      ) {

        return [
          {
            item: "Current",
            balance:
              Number(
                student.balance ||
                  0
              ),
          },
        ];

      }

      let currentBalance =
        Number(
          student.balance || 0
        );

      const result = [];

      for (
        let i =
          ordered.length - 1;

        i >= 0;

        i--
      ) {

        const transaction =
          ordered[i];

        result.unshift({
          item:
            `Item ${i + 1}`,

          balance:
            currentBalance,

          transaction,
        });

        if (
          transaction.type ===
          "add"
        ) {

          currentBalance -=
            Number(
              transaction.amount ||
                0
            );

        } else {

          currentBalance +=
            Number(
              transaction.amount ||
                0
            );

        }

      }

      return result;

    }, [
      transactions,
      student,
    ]);


  /*
    Download full statement
  */

  const handleDownloadStatement =
    () => {

      if (!student) {
        alert(
          "Student information unavailable"
        );

        return;
      }

      exportStudentBalancePDF(
        student,
        transactions
      );

    };


  /*
    Logout
  */

  const handleLogout =
    () => {

      const confirmed =
        window.confirm(
          "Are you sure you want to logout?"
        );

      if (confirmed) {
        setUser(null);
      }

    };


  /*
    Missing student
  */

  if (!student) {

    return (
      <div className="parent-error-page">

        <div className="parent-error-box">

          <div className="error-logo">
            F
          </div>

          <h2>
            Student information unavailable
          </h2>

          <button
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>


        <style>{`

          .parent-error-page {
            min-height: 100vh;

            display: flex;

            align-items: center;
            justify-content: center;

            background:
              #f3faf7;

            font-family:
              "Outfit",
              sans-serif;
          }


          .parent-error-box {
            padding: 35px;

            background:
              white;

            border:
              1px solid #e3eeeb;

            border-radius: 20px;

            text-align: center;

            box-shadow:
              0 15px 40px
              rgba(6,59,70,.07);
          }


          .error-logo {
            width: 48px;
            height: 48px;

            margin: 0 auto 15px;

            display: flex;

            align-items: center;
            justify-content: center;

            border-radius: 14px;

            background:
              #063b46;

            color: white;

            font-size: 21px;

            font-weight: 800;
          }


          .parent-error-box h2 {
            color:
              #063b46;

            font-size:
              18px;
          }


          .parent-error-box button {
            padding:
              10px 20px;

            border: 0;

            border-radius:
              10px;

            background:
              #063b46;

            color:
              white;

            cursor:
              pointer;

            font-family:
              inherit;

            font-weight:
              600;
          }

        `}</style>

      </div>
    );
  }


  return (
    <div className="parent-page">

      {/* ================= TOP BAR ================= */}

      <header className="parent-topbar">

        <div className="brand-area">

          <div className="brand-logo">
            F
          </div>


          <div>

            <h2>
              FIDHA ACCOUNTS
            </h2>

            <span>
              SMAC • Student Account Portal
            </span>

          </div>

        </div>


        <button
          className="logout-btn"
          onClick={handleLogout}
        >

          <span>
            ↪
          </span>

          Logout

        </button>

      </header>


      {/* ================= MAIN ================= */}

      <main className="parent-container">

        {/* ================= STUDENT ================= */}

        <section className="student-header">

          <div className="student-heading">

            <span className="small-label">
              STUDENT ACCOUNT
            </span>


            <h1>
              {student.name}
            </h1>


            <div className="student-details">

              <div className="detail-box">

                <span>
                  ADMISSION NO
                </span>

                <strong>
                  {student.adNo}
                </strong>

              </div>


              <div className="detail-box">

                <span>
                  CLASS
                </span>

                <strong>
                  {student.className ||
                    "Not specified"}
                </strong>

              </div>

            </div>

          </div>


          {/* Balance */}

          <div className="balance-box">

            <span>
              CURRENT BALANCE
            </span>


            <strong>
              {formatAmount(
                student.balance
              )}
            </strong>


            <small>
              Available account balance
            </small>

          </div>

        </section>


        {/* ================= SUMMARY ================= */}

        <section className="summary-grid">

          <div className="summary-card">

            <div className="summary-icon added">
              +
            </div>


            <div>

              <span>
                TOTAL ADDED
              </span>

              <strong>
                {formatAmount(
                  totalAdded
                )}
              </strong>

            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon deducted">
              −
            </div>


            <div>

              <span>
                TOTAL DEDUCTED
              </span>

              <strong>
                {formatAmount(
                  totalDeducted
                )}
              </strong>

            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon transactions">
              #
            </div>


            <div>

              <span>
                TRANSACTIONS
              </span>

              <strong>
                {transactions.length}
              </strong>

            </div>

          </div>

        </section>


        {/* ================= DOWNLOAD STATEMENT ================= */}

        <section className="statement-download-card">

          <div className="statement-download-info">

            <div className="statement-download-icon">
              ↓
            </div>

            <div>

              <span>
                ACCOUNT STATEMENT
              </span>

              <h2>
                Download Full Statement
              </h2>

              <p>
                Download your complete account
                statement as a PDF.
              </p>

            </div>

          </div>


          <button
            className="statement-download-button"
            onClick={
              handleDownloadStatement
            }
          >
            Download PDF
          </button>

        </section>


        {/* ================= GRAPH ================= */}

        <section className="graph-card">

          <div className="section-header">

            <div>

              <span className="small-label">
                ACCOUNT MOVEMENT
              </span>


              <h2>
                Balance History
              </h2>


              <p>
                Your balance after each transaction
              </p>

            </div>

          </div>


          <BalanceGraph
            data={graphData}
            formatAmount={
              formatAmount
            }
          />

        </section>


        {/* ================= TRANSACTIONS ================= */}

        <section className="transactions-card">

          <div className="section-header">

            <div>

              <span className="small-label">
                ACCOUNT ACTIVITY
              </span>


              <h2>
                Transactions
              </h2>


              <p>
                Your recent account records
              </p>

            </div>


            <div className="transaction-total">
              {transactions.length}
            </div>

          </div>


          {loading ? (

            <div className="empty-message">
              Loading transactions...
            </div>

          ) : transactions.length === 0 ? (

            <div className="empty-message">
              No transactions available.
            </div>

          ) : (

            <div className="transaction-list">

              {[...transactions]
                .sort(
                  (a, b) =>
                    getTransactionTime(
                      b
                    ) -
                    getTransactionTime(
                      a
                    )
                )
                .map(
                  (
                    transaction,
                    index
                  ) => (

                    <TransactionCard
                      key={
                        transaction.id
                      }

                      transaction={
                        transaction
                      }

                      index={
                        index
                      }

                      formatAmount={
                        formatAmount
                      }

                      formatDate={
                        formatDate
                      }
                    />

                  )
                )}

            </div>

          )}

        </section>


        {/* ================= FOOTER ================= */}

        <footer className="parent-footer">

          <strong>
            SIDDEEQ MOULA ARABIC COLLEGE
          </strong>


          <span>
            Fidha Accounts • Student Portal
          </span>

        </footer>

      </main>


      {/* ================= STYLES ================= */}

      <style>{`

        * {
          box-sizing:
            border-box;
        }


        .parent-page {
          min-height:
            100vh;

          background:
            linear-gradient(
              135deg,
              #f2faf7 0%,
              #edf7f5 50%,
              #f8fbfa 100%
            );

          color:
            #193c42;

          font-family:
            "Outfit",
            sans-serif;

          letter-spacing:
            .1px;
        }


        .parent-topbar {
          height:
            78px;

          padding:
            0 clamp(
              18px,
              6vw,
              80px
            );

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          background:
            rgba(
              255,
              255,
              255,
              .94
            );

          border-bottom:
            1px solid
            #e2eeea;

          box-shadow:
            0 3px 20px
            rgba(
              6,
              59,
              70,
              .04
            );

          position:
            sticky;

          top:
            0;

          z-index:
            50;

          backdrop-filter:
            blur(15px);
        }


        .brand-area {
          display:
            flex;

          align-items:
            center;

          gap:
            12px;
        }


        .brand-logo {
          width:
            43px;

          height:
            43px;

          border-radius:
            13px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          background:
            linear-gradient(
              135deg,
              #063b46,
              #07956d
            );

          color:
            white;

          font-size:
            19px;

          font-weight:
            800;

          box-shadow:
            0 7px 18px
            rgba(
              6,
              59,
              70,
              .15
            );
        }


        .brand-area h2 {
          margin:
            0;

          color:
            #063b46;

          font-size:
            14px;

          font-weight:
            800;

          letter-spacing:
            .9px;
        }


        .brand-area span {
          display:
            block;

          margin-top:
            3px;

          color:
            #93a4a6;

          font-size:
            9px;

          font-weight:
            400;
        }


        .logout-btn {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            7px;

          padding:
            10px 17px;

          border:
            1px solid
            #dbe8e4;

          border-radius:
            11px;

          background:
            white;

          color:
            #063b46;

          font-family:
            inherit;

          font-size:
            12px;

          font-weight:
            600;

          cursor:
            pointer;

          transition:
            all .2s ease;
        }


        .logout-btn span {
          font-size:
            16px;
        }


        .logout-btn:hover {
          transform:
            translateY(-2px);

          background:
            #063b46;

          color:
            white;

          border-color:
            #063b46;

          box-shadow:
            0 8px 18px
            rgba(
              6,
              59,
              70,
              .18
            );
        }


        .parent-container {
          width:
            min(
              1180px,
              92%
            );

          margin:
            0 auto;

          padding:
            35px 0 50px;
        }


        .student-header {
          display:
            flex;

          justify-content:
            space-between;

          align-items:
            stretch;

          gap:
            20px;

          margin-bottom:
            18px;
        }


        .student-heading {
          flex:
            1;

          padding:
            4px 0;
        }


        .small-label {
          display:
            block;

          color:
            #07956d;

          font-size:
            9px;

          font-weight:
            700;

          letter-spacing:
            1.7px;
        }


        .student-heading h1 {
          margin:
            7px 0 14px;

          color:
            #063b46;

          font-size:
            clamp(
              28px,
              5vw,
              39px
            );

          line-height:
            1.1;

          font-weight:
            700;

          letter-spacing:
            -.7px;
        }


        .student-details {
          display:
            flex;

          gap:
            9px;

          flex-wrap:
            wrap;
        }


        .detail-box {
          min-width:
            145px;

          padding:
            10px 14px;

          background:
            rgba(
              255,
              255,
              255,
              .85
            );

          border:
            1px solid
            #e0ece8;

          border-radius:
            11px;
        }


        .detail-box span {
          display:
            block;

          color:
            #94a4a7;

          font-size:
            8px;

          letter-spacing:
            1px;

          font-weight:
            600;
        }


        .detail-box strong {
          display:
            block;

          margin-top:
            4px;

          color:
            #24464c;

          font-size:
            12px;

          font-weight:
            600;
        }


        .balance-box {
          min-width:
            260px;

          padding:
            20px 23px;

          border-radius:
            19px;

          color:
            white;

          background:
            linear-gradient(
              135deg,
              #063b46,
              #08765f
            );

          box-shadow:
            0 13px 28px
            rgba(
              6,
              59,
              70,
              .12
            );

          display:
            flex;

          flex-direction:
            column;

          justify-content:
            center;
        }


        .balance-box span {
          font-size:
            8px;

          letter-spacing:
            1.5px;

          opacity:
            .65;

          font-weight:
            600;
        }


        .balance-box strong {
          margin:
            6px 0 2px;

          font-size:
            clamp(
              28px,
              4vw,
              38px
            );

          line-height:
            1;

          font-weight:
            700;
        }


        .balance-box small {
          font-size:
            9px;

          opacity:
            .55;

          font-weight:
            300;
        }


        .summary-grid {
          display:
            grid;

          grid-template-columns:
            repeat(
              3,
              1fr
            );

          gap:
            12px;

          margin-bottom:
            18px;
        }


        .summary-card {
          display:
            flex;

          align-items:
            center;

          gap:
            12px;

          padding:
            15px 17px;

          background:
            rgba(
              255,
              255,
              255,
              .92
            );

          border:
            1px solid
            #e3eeeb;

          border-radius:
            15px;

          box-shadow:
            0 7px 22px
            rgba(
              6,
              59,
              70,
              .04
            );

          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }


        .summary-card:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 12px 28px
            rgba(
              6,
              59,
              70,
              .08
            );
        }


        .summary-icon {
          width:
            38px;

          height:
            38px;

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

          font-size:
            19px;

          font-weight:
            700;
        }


        .summary-icon.added {
          color:
            #07956d;

          background:
            #e5f8f0;
        }


        .summary-icon.deducted {
          color:
            #d66056;

          background:
            #fff0ee;
        }


        .summary-icon.transactions {
          color:
            #496b72;

          background:
            #edf4f3;
        }


        .summary-card span {
          display:
            block;

          color:
            #95a5a7;

          font-size:
            8px;

          letter-spacing:
            1px;

          font-weight:
            600;
        }


        .summary-card strong {
          display:
            block;

          margin-top:
            3px;

          color:
            #063b46;

          font-size:
            17px;

          font-weight:
            600;
        }


        /* DOWNLOAD STATEMENT */

        .statement-download-card {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            18px;

          margin-bottom:
            18px;

          padding:
            15px 17px;

          background:
            white;

          border:
            1px solid
            #e2ece9;

          border-radius:
            15px;

          box-shadow:
            0 7px 22px
            rgba(
              6,
              59,
              70,
              .04
            );
        }


        .statement-download-info {
          display:
            flex;

          align-items:
            center;

          gap:
            11px;

          min-width:
            0;
        }


        .statement-download-icon {
          width:
            39px;

          height:
            39px;

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
            #e5f8f0;

          color:
            #07956d;

          font-size:
            20px;

          font-weight:
            700;
        }


        .statement-download-info span {
          display:
            block;

          color:
            #07956d;

          font-size:
            7px;

          letter-spacing:
            1.1px;

          font-weight:
            700;
        }


        .statement-download-info h2 {
          margin:
            3px 0 2px;

          color:
            #063b46;

          font-size:
            14px;

          font-weight:
            600;
        }


        .statement-download-info p {
          margin:
            0;

          color:
            #97a7a9;

          font-size:
            9px;
        }


        .statement-download-button {
          flex-shrink:
            0;

          padding:
            10px 15px;

          border:
            0;

          border-radius:
            10px;

          background:
            #07956d;

          color:
            white;

          font-family:
            inherit;

          font-size:
            10px;

          font-weight:
            700;

          cursor:
            pointer;

          transition:
            all .2s ease;
        }


        .statement-download-button:hover {
          transform:
            translateY(-2px);

          background:
            #063b46;

          box-shadow:
            0 7px 16px
            rgba(
              6,
              59,
              70,
              .15
            );
        }


        .graph-card,
        .transactions-card {
          background:
            rgba(
              255,
              255,
              255,
              .94
            );

          border:
            1px solid
            #e2ece9;

          border-radius:
            19px;

          padding:
            20px;

          box-shadow:
            0 8px 27px
            rgba(
              6,
              59,
              70,
              .04
            );

          margin-bottom:
            18px;
        }


        .section-header {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          margin-bottom:
            15px;
        }


        .section-header h2 {
          margin:
            5px 0 3px;

          color:
            #063b46;

          font-size:
            18px;

          font-weight:
            600;

          letter-spacing:
            -.2px;
        }


        .section-header p {
          margin:
            0;

          color:
            #9aa9ac;

          font-size:
            10px;

          font-weight:
            300;
        }


        .graph-wrapper {
          width:
            100%;

          overflow:
            hidden;

          border-radius:
            13px;

          background:
            linear-gradient(
              180deg,
              #fbfefd,
              #f8fcfa
            );

          border:
            1px solid
            #edf3f1;

          padding:
            5px;
        }


        .balance-chart {
          width:
            100%;

          height:
            310px;

          display:
            block;
        }


        .chart-grid-line {
          stroke:
            #e9f0ee;

          stroke-width:
            1;
        }


        .chart-axis {
          stroke:
            #dce8e5;

          stroke-width:
            1.2;
        }


        .chart-line {
          fill:
            none;

          stroke:
            #07956d;

          stroke-width:
            3.5;

          stroke-linecap:
            round;

          stroke-linejoin:
            round;
        }


        .chart-area {
          fill:
            rgba(
              7,
              149,
              109,
              .07
            );
        }


        .chart-point {
          fill:
            white;

          stroke:
            #07956d;

          stroke-width:
            3;
        }


        .chart-point:hover {
          fill:
            #07956d;
        }


        .chart-label {
          fill:
            #8fa0a3;

          font-size:
            9px;

          font-family:
            "Outfit",
            sans-serif;
        }


        .chart-value {
          fill:
            #063b46;

          font-size:
            9px;

          font-weight:
            600;

          font-family:
            "Outfit",
            sans-serif;
        }


        .chart-y-title {
          fill:
            #07956d;

          font-size:
            8px;

          font-weight:
            700;

          letter-spacing:
            1px;
        }


        .chart-x-title {
          fill:
            #07956d;

          font-size:
            8px;

          font-weight:
            700;

          letter-spacing:
            1px;
        }


        .transaction-total {
          width:
            30px;

          height:
            30px;

          border-radius:
            9px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          background:
            #edf7f4;

          color:
            #07956d;

          font-size:
            10px;

          font-weight:
            700;
        }


        .transaction-list {
          display:
            grid;

          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );

          gap:
            9px;
        }


        .transaction-card {
          display:
            flex;

          align-items:
            center;

          gap:
            10px;

          min-height:
            68px;

          padding:
            10px 12px;

          background:
            #fbfdfc;

          border:
            1px solid
            #e7efed;

          border-radius:
            13px;

          transition:
            transform .18s ease,
            box-shadow .18s ease,
            background .18s ease;
        }


        .transaction-card:hover {
          transform:
            translateY(-2px);

          background:
            white;

          box-shadow:
            0 8px 18px
            rgba(
              6,
              59,
              70,
              .07
            );
        }


        .transaction-number {
          width:
            25px;

          height:
            25px;

          flex-shrink:
            0;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            8px;

          background:
            #f0f5f3;

          color:
            #8c9c9f;

          font-size:
            8px;

          font-weight:
            600;
        }


        .transaction-icon {
          width:
            34px;

          height:
            34px;

          flex-shrink:
            0;

          border-radius:
            10px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          font-size:
            16px;

          font-weight:
            700;
        }


        .transaction-icon.credit {
          background:
            #e4f8ef;

          color:
            #07956d;
        }


        .transaction-icon.debit {
          background:
            #fff0ee;

          color:
            #d66056;
        }


        .transaction-middle {
          min-width:
            0;

          flex:
            1;
        }


        .transaction-middle strong {
          display:
            block;

          color:
            #28474d;

          font-size:
            11px;

          font-weight:
            500;

          white-space:
            nowrap;

          overflow:
            hidden;

          text-overflow:
            ellipsis;
        }


        .transaction-middle span {
          display:
            block;

          margin-top:
            3px;

          color:
            #9aa8aa;

          font-size:
            8px;

          font-weight:
            300;
        }


        .transaction-right {
          text-align:
            right;

          flex-shrink:
            0;
        }


        .transaction-amount {
          font-size:
            12px;

          font-weight:
            700;
        }


        .transaction-amount.credit {
          color:
            #07956d;
        }


        .transaction-amount.debit {
          color:
            #d66056;
        }


        .transaction-type {
          margin-top:
            2px;

          color:
            #a0adaf;

          font-size:
            7px;

          text-transform:
            uppercase;

          letter-spacing:
            .7px;
        }


        .empty-message {
          min-height:
            150px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          color:
            #95a4a7;

          font-size:
            11px;

          font-weight:
            300;
        }


        .parent-footer {
          padding:
            18px 0;

          text-align:
            center;

          color:
            #9aabad;

          font-size:
            8px;

          letter-spacing:
            .5px;

          font-weight:
            300;
        }


        .parent-footer strong {
          display:
            block;

          color:
            #6d8387;

          font-size:
            9px;

          font-weight:
            600;
        }


        .parent-footer span {
          display:
            block;

          margin-top:
            3px;
        }


        @media (max-width: 850px) {

          .student-header {
            flex-direction:
              column;
          }


          .balance-box {
            width:
              100%;

            min-width:
              0;
          }


          .summary-grid {
            grid-template-columns:
              1fr 1fr;
          }


          .summary-card:last-child {
            grid-column:
              span 2;
          }


          .transaction-list {
            grid-template-columns:
              1fr;
          }

        }


        @media (max-width: 600px) {

          .parent-topbar {
            height:
              64px;

            padding:
              0 12px;
          }


          .brand-area {
            gap:
              8px;
          }


          .brand-area span {
            display:
              none;
          }


          .brand-logo {
            width:
              35px;

            height:
              35px;

            border-radius:
              10px;

            font-size:
              16px;
          }


          .brand-area h2 {
            font-size:
              11px;

            letter-spacing:
              .6px;
          }


          .logout-btn {
            padding:
              7px 10px;

            font-size:
              9px;

            border-radius:
              9px;
          }


          .logout-btn span {
            font-size:
              13px;
          }


          .parent-container {
            width:
              calc(
                100% - 20px
              );

            padding:
              20px 0 30px;
          }


          .student-header {
            gap:
              12px;

            margin-bottom:
              12px;
          }


          .student-heading h1 {
            margin:
              5px 0 10px;

            font-size:
              25px;
          }


          .student-details {
            display:
              grid;

            grid-template-columns:
              1fr 1fr;

            gap:
              7px;
          }


          .detail-box {
            min-width:
              0;

            padding:
              8px 10px;

            border-radius:
              9px;
          }


          .detail-box strong {
            font-size:
              10px;
          }


          .balance-box {
            padding:
              15px 17px;

            border-radius:
              15px;
          }


          .balance-box strong {
            margin:
              4px 0 2px;

            font-size:
              27px;
          }


          .summary-grid {
            grid-template-columns:
              1fr;

            gap:
              7px;

            margin-bottom:
              12px;
          }


          .summary-card:last-child {
            grid-column:
              auto;
          }


          .summary-card {
            padding:
              10px 12px;

            border-radius:
              12px;
          }


          .summary-icon {
            width:
              31px;

            height:
              31px;

            border-radius:
              9px;

            font-size:
              15px;
          }


          .summary-card strong {
            font-size:
              14px;
          }


          .statement-download-card {
            align-items:
              stretch;

            flex-direction:
              column;

            gap:
              10px;

            padding:
              12px;

            margin-bottom:
              12px;

            border-radius:
              13px;
          }


          .statement-download-info {
            gap:
              9px;
          }


          .statement-download-icon {
            width:
              34px;

            height:
              34px;

            border-radius:
              9px;

            font-size:
              17px;
          }


          .statement-download-info h2 {
            font-size:
              12px;
          }


          .statement-download-info p {
            font-size:
              8px;
          }


          .statement-download-button {
            width:
              100%;

            padding:
              10px;
          }


          .graph-card,
          .transactions-card {
            padding:
              12px;

            border-radius:
              14px;

            margin-bottom:
              12px;
          }


          .section-header {
            margin-bottom:
              10px;
          }


          .section-header h2 {
            font-size:
              15px;
          }


          .section-header p {
            font-size:
              8px;
          }


          .balance-chart {
            height:
              220px;
          }


          .transaction-card {
            min-height:
              58px;

            padding:
              8px;

            gap:
              7px;

            border-radius:
              10px;
          }


          .transaction-number {
            display:
              none;
          }


          .transaction-icon {
            width:
              29px;

            height:
              29px;

            border-radius:
              8px;

            font-size:
              13px;
          }


          .transaction-middle strong {
            font-size:
              9px;
          }


          .transaction-middle span {
            font-size:
              7px;
          }


          .transaction-amount {
            font-size:
              10px;
          }


          .transaction-type {
            font-size:
              6px;
          }


          .transaction-total {
            width:
              26px;

            height:
              26px;
          }


          .parent-footer {
            padding:
              12px 0;

            font-size:
              7px;
          }

        }

      `}</style>

    </div>
  );
}


/* =========================================================
   TRANSACTION CARD
========================================================= */

function TransactionCard({
  transaction,
  index,
  formatAmount,
  formatDate,
}) {

  const isCredit =
    transaction.type === "add";


  return (
    <div className="transaction-card">

      <div className="transaction-number">
        {index + 1}
      </div>


      <div
        className={`transaction-icon ${
          isCredit
            ? "credit"
            : "debit"
        }`}
      >
        {isCredit ? "+" : "−"}
      </div>


      <div className="transaction-middle">

        <strong>
          {transaction.reason ||
            "Account transaction"}
        </strong>


        <span>
          {formatDate(
            transaction
          )}
        </span>

      </div>


      <div className="transaction-right">

        <div
          className={`transaction-amount ${
            isCredit
              ? "credit"
              : "debit"
          }`}
        >

          {isCredit
            ? "+"
            : "−"}

          {formatAmount(
            transaction.amount
          )}

        </div>


        <div className="transaction-type">

          {isCredit
            ? "Added"
            : "Deducted"}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   BALANCE GRAPH
========================================================= */

function BalanceGraph({
  data,
  formatAmount,
}) {

  if (
    !data ||
    data.length === 0
  ) {

    return (
      <div className="empty-message">
        No balance data available.
      </div>
    );

  }


  const width =
    900;

  const height =
    310;

  const left =
    65;

  const right =
    30;

  const top =
    35;

  const bottom =
    55;


  const chartWidth =
    width -
    left -
    right;


  const chartHeight =
    height -
    top -
    bottom;


  const values =
    data.map(
      (item) =>
        Number(
          item.balance || 0
        )
    );


  let maxValue =
    Math.max(...values);


  let minValue =
    Math.min(...values);


  if (
    maxValue ===
    minValue
  ) {

    maxValue += 100;

    minValue -= 100;

  }


  const paddingValue =
    (maxValue -
      minValue) *
    0.12;


  maxValue +=
    paddingValue;

  minValue -=
    paddingValue;


  const range =
    maxValue -
      minValue ||
    1;


  const points =
    data.map(
      (
        item,
        index
      ) => {

        const x =
          data.length === 1
            ? left +
              chartWidth /
                2
            : left +
              (index /
                (data.length -
                  1)) *
                chartWidth;


        const y =
          top +
          chartHeight -
          (
            (
              Number(
                item.balance ||
                  0
              ) -
              minValue
            ) /
            range
          ) *
            chartHeight;


        return {
          ...item,
          x,
          y,
        };

      }
    );


  const linePoints =
    points
      .map(
        (point) =>
          `${point.x},${point.y}`
      )
      .join(" ");


  const areaPoints =
    [
      `${points[0].x},${
        height - bottom
      }`,

      ...points.map(
        (point) =>
          `${point.x},${point.y}`
      ),

      `${
        points[
          points.length - 1
        ].x
      },${
        height - bottom
      }`,
    ].join(" ");


  const gridCount =
    4;


  return (
    <div className="graph-wrapper">

      <svg
        className="balance-chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >

        <text
          x="15"
          y={height / 2}
          className="chart-y-title"
          transform={`rotate(-90 15 ${
            height / 2
          })`}
        >
          TOTAL BALANCE
        </text>


        {Array.from(
          {
            length:
              gridCount + 1,
          },
          (_, index) => {

            const ratio =
              index /
              gridCount;


            const y =
              top +
              ratio *
                chartHeight;


            const value =
              maxValue -
              ratio *
                (
                  maxValue -
                  minValue
                );


            return (
              <g key={index}>

                <line
                  x1={left}
                  y1={y}
                  x2={
                    width -
                    right
                  }
                  y2={y}
                  className="chart-grid-line"
                />


                <text
                  x={
                    left - 9
                  }
                  y={
                    y + 3
                  }
                  textAnchor="end"
                  className="chart-label"
                >
                  {formatAmount(
                    Math.round(
                      value
                    )
                  )}
                </text>

              </g>
            );

          }
        )}


        <line
          x1={left}
          y1={
            height -
            bottom
          }
          x2={
            width -
            right
          }
          y2={
            height -
            bottom
          }
          className="chart-axis"
        />


        <line
          x1={left}
          y1={top}
          x2={left}
          y2={
            height -
            bottom
          }
          className="chart-axis"
        />


        <polygon
          points={
            areaPoints
          }
          className="chart-area"
        />


        <polyline
          points={
            linePoints
          }
          className="chart-line"
        />


        {points.map(
          (
            point,
            index
          ) => (

            <g
              key={
                `${point.item}-${index}`
              }
            >

              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                className="chart-point"
              />


              <text
                x={point.x}
                y={
                  point.y -
                  10
                }
                textAnchor="middle"
                className="chart-value"
              >
                {formatAmount(
                  Math.round(
                    point.balance
                  )
                )}
              </text>


              <text
                x={point.x}
                y={
                  height -
                  bottom +
                  18
                }
                textAnchor="middle"
                className="chart-label"
              >
                {point.item}
              </text>

            </g>

          )
        )}


        <text
          x={
            width / 2
          }
          y={
            height - 8
          }
          textAnchor="middle"
          className="chart-x-title"
        >
          TRANSACTIONS
        </text>

      </svg>

    </div>
  );
}