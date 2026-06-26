import { useState, useEffect } from "react";
import { triggerConfetti } from "./confetti.js";

const DEFAULT_CHORES = [
  { label: "Wash dishes", emoji: "🍽️" },
  { label: "Vacuum", emoji: "🧹" },
  { label: "Laundry", emoji: "👕" },
];

export default function ChoreList() {
  const [chores, setChores] = useState(() => {
    const saved = localStorage.getItem("chores");
    return saved ? JSON.parse(saved) : DEFAULT_CHORES;
  });
  const [done, setDone] = useState(() => {
    const saved = localStorage.getItem("choresDone");
    return saved ? JSON.parse(saved) : {};
  });
  const [popping, setPopping] = useState({});
  const [inputValue, setInputValue] = useState("");

  // Save to localStorage whenever chores or done state changes
  useEffect(() => {
    localStorage.setItem("chores", JSON.stringify(chores));
  }, [chores]);

  useEffect(() => {
    localStorage.setItem("choresDone", JSON.stringify(done));
  }, [done]);

  const handleChoreClick = (index, event) => {
    if (done[index]) return;

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

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setChores((prev) => [...prev, { label: trimmed, emoji: "📌" }]);
    setInputValue("");
  };

  const handleDelete = (index, e) => {
    e.stopPropagation(); // don't trigger the chore click
    setChores((prev) => prev.filter((_, i) => i !== index));
    setDone((prev) => {
      const updated = { ...prev };
      delete updated[index];
      // Re-index: shift all keys above deleted index down by 1
      const reindexed = {};
      Object.keys(updated).forEach((key) => {
        const k = parseInt(key);
        if (k > index) reindexed[k - 1] = updated[key];
        else reindexed[k] = updated[key];
      });
      return reindexed;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  const completedCount = Object.keys(done).filter((k) => done[k]).length;
  const total = chores.length;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.eyebrow}>Today's list</span>
        <h2 style={styles.title}>Chores</h2>
        <p style={styles.progress}>
          {total === 0
            ? "No chores yet — add one below"
            : completedCount === total
            ? "✨ All done!"
            : `${completedCount} of ${total} complete`}
        </p>
      </div>

      <ul style={styles.list}>
        {chores.map((chore, index) => {
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
              <button
                onClick={(e) => handleDelete(index, e)}
                style={styles.deleteBtn}
                title="Remove chore"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>

      {/* Add chore input */}
      <div style={styles.inputRow}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a chore..."
          style={styles.input}
        />
        <button onClick={handleAdd} style={styles.addBtn}>
          Add
        </button>
      </div>

      {completedCount === total && total > 0 && (
        <p style={styles.allDoneBanner}>🎉 You crushed it today!</p>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');

        @keyframes pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.04); background-color: #d4f0e3; }
          100% { transform: scale(1); }
        }

        input:focus {
          outline: none;
          border-color: #4CAF82 !important;
          box-shadow: 0 0 0 3px rgba(76,175,130,0.15);
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
    margin: "0 0 16px",
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
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#C4B9A8",
    fontSize: "14px",
    cursor: "pointer",
    padding: "4px 6px",
    borderRadius: "6px",
    lineHeight: 1,
    transition: "color 0.2s ease",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },
  input: {
    flex: 1,
    padding: "13px 16px",
    fontSize: "15px",
    fontFamily: "'DM Sans', sans-serif",
    border: "1.5px solid #D4C5A9",
    borderRadius: "12px",
    backgroundColor: "#F0EBE1",
    color: "#1A1A1A",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  addBtn: {
    padding: "13px 20px",
    fontSize: "15px",
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: "#4CAF82",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
  },
  allDoneBanner: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "15px",
    color: "#4CAF82",
    fontWeight: 600,
  },
};
