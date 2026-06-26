import { useState } from "react";
import { triggerConfetti } from "./confetti.js";

const INITIAL_CHORES = [
  { label: "Wash dishes", emoji: "🍽️" },
  { label: "Vacuum", emoji: "🧹" },
  { label: "Laundry", emoji: "👕" },
];

export default function ChoreList() {
  const [done, setDone] = useState({});
  const [popping, setPopping] = useState({});

  const handleChoreClick = (index, event) => {
    if (done[index]) return;

    // Trigger pop animation
    setPopping((prev) => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setPopping((prev) => ({ ...prev, [index]: false }));
      setDone((prev) => ({ ...prev, [index]: true }));
    }, 300);

    const rect = event.currentTarget.getBoundingClientRect();
    triggerConfetti(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
  };

  const completedCount = Object.keys(done).length;
  const total = INITIAL_CHORES.length;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.eyebrow}>Today's list</span>
        <h2 style={styles.title}>Chores</h2>
        <p style={styles.progress}>
          {completedCount === total
            ? "✨ All done!"
            : `${completedCount} of ${total} complete`}
        </p>
      </div>

      <ul style={styles.list}>
        {INITIAL_CHORES.map((chore, index) => {
          const isDone = done[index];
          const isPop = popping[index];

          return (
            <li
              key={index}
              onClick={(e) => handleChoreClick(index, e)}
              style={{
                ...styles.card,
                ...(isDone ? styles.cardDone : {}),
                ...(isPop ? styles.cardPop : {}),
                cursor: isDone ? "default" : "pointer",
              }}
            >
              <span style={styles.emoji}>{chore.emoji}</span>
              <span
                style={{
                  ...styles.choreLabel,
                  ...(isDone ? styles.choreLabelDone : {}),
                }}
              >
                {chore.label}
              </span>
              <span style={styles.check}>
                {isDone ? "✓" : ""}
              </span>
            </li>
          );
        })}
      </ul>

      {completedCount === total && (
        <p style={styles.allDoneBanner}>🎉 You crushed it today!</p>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');

        @keyframes pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.04); background-color: #d4f0e3; }
          100% { transform: scale(1); }
        }

        .chore-card:hover {
          background-color: #EDE8DE !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important;
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: "420px",
    margin: "0 auto",
    fontFamily: "'DM Sans', sans-serif",
    padding: "0 16px 40px",
  },
  header: {
    marginBottom: "24px",
  },
  eyebrow: {
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#9A8F80",
    display: "block",
    marginBottom: "4px",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "36px",
    fontWeight: 700,
    color: "#1A1A1A",
    margin: "0 0 6px",
    lineHeight: 1.1,
  },
  progress: {
    fontSize: "14px",
    color: "#9A8F80",
    margin: 0,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    backgroundColor: "#F0EBE1",
    border: "1.5px solid #D4C5A9",
    borderRadius: "14px",
    padding: "16px 18px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    userSelect: "none",
    className: "chore-card",
  },
  cardDone: {
    backgroundColor: "#EAF7F0",
    borderColor: "#A8DFC5",
    opacity: 0.75,
  },
  cardPop: {
    animation: "pop 0.3s ease forwards",
  },
  emoji: {
    fontSize: "22px",
    flexShrink: 0,
  },
  choreLabel: {
    flex: 1,
    fontSize: "16px",
    fontWeight: 500,
    color: "#1A1A1A",
    transition: "all 0.3s ease",
  },
  choreLabelDone: {
    textDecoration: "line-through",
    color: "#9A8F80",
  },
  check: {
    fontSize: "18px",
    color: "#4CAF82",
    fontWeight: 700,
    width: "20px",
    textAlign: "center",
  },
  allDoneBanner: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "15px",
    color: "#4CAF82",
    fontWeight: 600,
  },
};
