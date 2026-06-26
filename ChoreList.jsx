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
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("choreStreak");
    return saved ? parseInt(saved) : 0;
  });
  const [streakPop, setStreakPop] = useState(false);

  useEffect(() => {
    localStorage.setItem("chores", JSON.stringify(chores));
  }, [chores]);

  useEffect(() => {
    localStorage.setItem("choresDone", JSON.stringify(done));
  }, [done]);

  useEffect(() => {
    localStorage.setItem("choreStreak", streak);
  }, [streak]);

  const completedCount = Object.keys(done).filter((k) => done[k]).length;
  const total = chores.length;
  const allDone = total > 0 && completedCount === total;

  useEffect(() => {
    if (allDone) {
      const alreadyCounted = localStorage.getItem("streakCountedToday");
      if (!alreadyCounted) {
        setStreak((prev) => {
          const next = prev + 1;
          localStorage.setItem("choreStreak", next);
          return next;
        });
        localStorage.setItem("streakCountedToday", "true");
        setStreakPop(true);
        setTimeout(() => setStreakPop(false), 600);
      }
    }
  }, [allDone]);

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
    e.stopPropagation();
    setChores((prev) => prev.filter((_, i) => i !== index));
    setDone((prev) => {
      const updated = { ...prev };
      delete updated[index];
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

  const handleReset = () => {
    setStreak(0);
    localStorage.setItem("choreStreak", 0);
    localStorage.removeItem("streakCountedToday");
  };

  const getStreakLabel = () => {
    if (streak === 0) return "Start your streak!";
    if (streak === 1) return "1 day 🔥";
    if (streak >= 7) return `${streak} days 🔥🔥`;
    return `${streak} days 🔥`;
  };

  return (
    <div style={styles.wrapper}>
      {/* Streak banner */}
      <div style={{
        ...styles.streakBanner,
        ...(streakPop ? styles.streakBannerPop : {}),
      }}>
        <div style={styles.streakLeft}>
          <span style={styles.streakIcon}>🏆</span>
          <div>
            <span style={styles.streakTitle}>Streak</span>
            <span style={styles.streakValue}>{getStreakLabel()}</span>
          </div>
        </div>
        <button onClick={handleReset} style={styles.resetBtn} title="Reset streak">
          Reset
        </button>
      </div>

      <div style={styles.header}>
        <span style={styles.eyebrow}>Today's list</span>
        <h2 style={styles.title}>Chores</h2>
        <p style={styles.progress}>
          {total === 0
            ? "No chores yet — add one below"
            : allDone
            ? "✨ All done!"
            : `${completedCount} of ${total} complete`}
        </p>
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div style={styles.progressBarWrapper}>
          <div
            style={{
              ...styles.progressBarFill,
              width: `${(completedCount / total) * 100}%`,
              backgroundColor: allDone ? "#4CAF82" : "#A8DFC5",
            }}
          />
        </div>
      )}

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
              <span style={{
                ...styles.choreLabel,
                ...(isDone ? styles.choreLabelDone : {}),
              }}>
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

      <div style={styles.inputRow}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a chore..."
          style={styles.input}
        />
        <button onClick={handleAdd} style={styles.addBtn}>Add</button>
      </div>

      {allDone && total > 0 && (
        <p style={styles.allDoneBanner}>🎉 You crushed it today!</p>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');

        @keyframes pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.04); background-color: #d4f0e3; }
          100% { transform: scale(1); }
        }

        @keyframes streakPop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(251,191,36,0.25); }
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
  streakBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FEF9EE",
    border: "1.5px solid #F9E4A0",
    borderRadius: "14px",
    padding: "14px 18px",
    marginBottom: "28px",
    transition: "all 0.3s ease",
  },
  streakBannerPop: {
    animation: "streakPop 0.6s ease forwards",
  },
  streakLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  streakIcon: {
    fontSize: "26px",
  },
  streakTitle: {
    display: "block",
    fontSize: "10px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#C9A836",
    marginBottom: "2px",
  },
  streakValue: {
    display: "block",
    fontSize: "16px",
    fontWeight: 600,
    color: "#1A1A1A",
  },
  resetBtn: {
    background: "none",
    border: "1px solid #E8D88A",
    borderRadius: "8px",
    padding: "5px 12px",
    fontSize: "12px",
    color: "#C9A836",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    marginBottom: "16px",
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
  progressBarWrapper: {
    height: "6px",
    backgroundColor: "#E8E0D5",
    borderRadius: "999px",
    marginBottom: "24px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.4s ease, background-color 0.4s ease",
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
