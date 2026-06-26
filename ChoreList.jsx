import { useState, useEffect, useRef } from "react";
import { triggerConfetti } from "./confetti.js";

const DEFAULT_CHORES = [
  { label: "Wash dishes", emoji: "🍽️" },
  { label: "Vacuum", emoji: "🧹" },
  { label: "Laundry", emoji: "👕" },
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK_EMOJIS = ["🌟", "🛏️", "🐕", "🧹", "🍽️", "🧺", "🪴"];

const MILESTONES = [
  { days: 3,  emoji: "🌱", label: "3 Day Sprout!" },
  { days: 7,  emoji: "🔥", label: "7 Day Flame!" },
  { days: 14, emoji: "⚡", label: "2 Week Spark!" },
  { days: 30, emoji: "👑", label: "30 Day Legend!" },
];

function getFlameSize(streak) {
  if (streak >= 30) return 52;
  if (streak >= 14) return 44;
  if (streak >= 7)  return 38;
  if (streak >= 3)  return 32;
  return 26;
}

function getFlameColor(streak) {
  if (streak >= 30) return "#7C3AED";
  if (streak >= 14) return "#EF4444";
  if (streak >= 7)  return "#F97316";
  if (streak >= 3)  return "#FBBF24";
  return "#A78BFA";
}

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
  const [milestone, setMilestone] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [streakHistory, setStreakHistory] = useState(() => {
    const saved = localStorage.getItem("streakHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const editInputRef = useRef(null);
  const todayIndex = new Date().getDay();
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => { localStorage.setItem("chores", JSON.stringify(chores)); }, [chores]);
  useEffect(() => { localStorage.setItem("choresDone", JSON.stringify(done)); }, [done]);
  useEffect(() => { localStorage.setItem("choreStreak", streak); }, [streak]);
  useEffect(() => { localStorage.setItem("streakHistory", JSON.stringify(streakHistory)); }, [streakHistory]);

  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingIndex]);

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
          // Check milestones
          const hit = MILESTONES.find(m => m.days === next);
          if (hit) {
            setMilestone(hit);
            setTimeout(() => setMilestone(null), 3000);
          }
          return next;
        });
        // Save today to history
        setStreakHistory(prev => {
          if (prev.includes(todayStr)) return prev;
          return [...prev, todayStr];
        });
        localStorage.setItem("streakCountedToday", "true");
        setStreakPop(true);
        setTimeout(() => setStreakPop(false), 600);
      }
    }
  }, [allDone]);

  const handleChoreClick = (index, event) => {
    if (done[index] || editingIndex === index) return;
    setPopping((prev) => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setPopping((prev) => ({ ...prev, [index]: false }));
      setDone((prev) => ({ ...prev, [index]: true }));
    }, 300);
    const rect = event.currentTarget.getBoundingClientRect();
    triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
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

  const handleKeyDown = (e) => { if (e.key === "Enter") handleAdd(); };

  const handleReset = () => {
    setStreak(0);
    setStreakHistory([]);
    localStorage.setItem("choreStreak", 0);
    localStorage.removeItem("streakCountedToday");
    localStorage.removeItem("streakHistory");
  };

  const handleEditStart = (index, e) => {
    e.stopPropagation();
    setEditingIndex(index);
    setEditValue(chores[index].label);
  };

  const handleEditSave = (index) => {
    const trimmed = editValue.trim();
    if (trimmed) {
      setChores((prev) => prev.map((chore, i) => i === index ? { ...chore, label: trimmed } : chore));
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const handleEditKeyDown = (e, index) => {
    if (e.key === "Enter") handleEditSave(index);
    if (e.key === "Escape") { setEditingIndex(null); setEditValue(""); }
  };

  // Build last 7 days for history calendar
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const flameSize = getFlameSize(streak);
  const flameColor = getFlameColor(streak);
  const currentMilestone = MILESTONES.slice().reverse().find(m => streak >= m.days);

  return (
    <div style={styles.wrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

        @keyframes pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        @keyframes flamePulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px ${flameColor}88); }
          50%       { transform: scale(1.15); filter: drop-shadow(0 0 14px ${flameColor}cc); }
        }
        @keyframes milestoneIn {
          0%   { transform: scale(0.5) translateY(20px); opacity: 0; }
          60%  { transform: scale(1.1) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shimmer {
          to { left: 200%; }
        }
        input:focus { outline: none; }
      `}</style>

      {/* Milestone popup */}
      {milestone && (
        <div style={styles.milestonePopup}>
          <div style={styles.milestoneEmoji}>{milestone.emoji}</div>
          <div style={styles.milestoneLabel}>{milestone.label}</div>
          <div style={styles.milestoneSub}>Keep it up! 🎉</div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerStickers}>⭐ 🌈 ✨ 🎀 ⭐</div>
        <h1 style={styles.headerTitle}>My <span style={{color:"#FDE68A"}}>Chore</span> Chart!</h1>
        <div style={styles.headerSub}>Today's Mission</div>
      </div>

      {/* Streak Banner */}
      <div style={{
        ...styles.streakBanner,
        borderColor: flameColor,
        boxShadow: `0 4px 0px ${flameColor}44`,
      }}>
        <div style={styles.streakLeft}>
          <div style={{
            fontSize: flameSize,
            animation: streak > 0 ? `flamePulse ${streak >= 7 ? "0.8s" : "1.4s"} ease-in-out infinite` : "none",
            lineHeight: 1,
          }}>🔥</div>
          <div>
            <div style={styles.streakTitle}>Current Streak</div>
            <div style={{...styles.streakValue, color: flameColor}}>
              {streak === 0 ? "Start today!" : `${streak} day${streak !== 1 ? "s" : ""}`}
            </div>
            {currentMilestone && (
              <div style={{...styles.milestoneBadge, background: flameColor}}>
                {currentMilestone.emoji} {currentMilestone.label}
              </div>
            )}
          </div>
        </div>
        <button onClick={handleReset} style={{...styles.resetBtn, borderColor: flameColor, color: flameColor}}>
          Reset
        </button>
      </div>

      {/* Streak History Calendar */}
      <div style={styles.sectionTitle}>📅 Streak History</div>
      <div style={styles.historyRow}>
        {last7Days.map((dateStr, i) => {
          const isToday = dateStr === todayStr;
          const completed = streakHistory.includes(dateStr);
          const d = new Date(dateStr);
          const label = WEEK_DAYS[d.getDay()];
          return (
            <div key={i} style={{
              ...styles.historyDay,
              background: completed ? flameColor : "white",
              borderColor: isToday ? flameColor : "#EDE9FE",
              boxShadow: isToday ? `0 3px 0px ${flameColor}` : "0 3px 0px #EDE9FE",
            }}>
              <div style={{
                ...styles.historyLabel,
                color: completed ? "white" : "#7C3AED",
              }}>{label}</div>
              <div style={{fontSize: 16}}>{completed ? "🔥" : isToday ? "⏳" : "○"}</div>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div style={styles.progressWrap}>
        <div style={styles.progressLabel}>
          <span>Today's progress</span>
          <span>{completedCount} / {total} done</span>
        </div>
        <div style={styles.progressTrack}>
          <div style={{
            ...styles.progressFill,
            width: total > 0 ? `${(completedCount / total) * 100}%` : "0%",
            backgroundColor: allDone ? "#34D399" : "#7C3AED",
          }} />
        </div>
      </div>

      {/* Confetti dots */}
      <div style={styles.dotsRow}>
        {["#F87171","#FBBF24","#34D399","#60A5FA","#A78BFA","#F472B6"].map((color, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: "50%",
            backgroundColor: color,
            animation: `bounce 1.2s ease-in-out ${i * 0.1}s infinite`,
          }} />
        ))}
      </div>

      {/* Chore Cards */}
      <div style={styles.choreList}>
        {chores.map((chore, index) => {
          const isDone = done[index];
          const isPop = popping[index];
          const isEditing = editingIndex === index;
          return (
            <div
              key={index}
              onClick={(e) => handleChoreClick(index, e)}
              style={{
                ...styles.choreCard,
                ...(isDone ? styles.choreCardDone : {}),
                ...(isPop ? { animation: "pop 0.3s ease forwards" } : {}),
                cursor: isDone || isEditing ? "default" : "pointer",
              }}
            >
              <div style={{
                ...styles.choreIcon,
                background: isDone
                  ? "linear-gradient(135deg, #A7F3D0, #34D399)"
                  : "linear-gradient(135deg, #DDD6FE, #A78BFA)",
              }}>
                {chore.emoji}
              </div>
              <div style={styles.choreInfo}>
                {isEditing ? (
                  <input
                    ref={editInputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleEditSave(index)}
                    onKeyDown={(e) => handleEditKeyDown(e, index)}
                    onClick={(e) => e.stopPropagation()}
                    style={styles.editInput}
                  />
                ) : (
                  <div style={{
                    ...styles.choreName,
                    ...(isDone ? styles.choreNameDone : {}),
                  }}>{chore.label}</div>
                )}
                <div style={styles.chorePoints}>⭐ 5 stars</div>
              </div>
              {!isDone && !isEditing && (
                <button onClick={(e) => handleEditStart(index, e)} style={styles.iconBtn}>✏️</button>
              )}
              <button onClick={(e) => handleDelete(index, e)} style={styles.deleteBtn}>✕</button>
              <div style={{
                ...styles.choreCheck,
                ...(isDone ? styles.choreCheckDone : {}),
              }}>{isDone ? "✓" : ""}</div>
            </div>
          );
        })}
      </div>

      {/* Weekly Calendar */}
      <div style={styles.sectionTitle}>📆 This Week</div>
      <div style={styles.weekCalendar}>
        {WEEK_DAYS.map((day, i) => {
          const isToday = i === todayIndex;
          const isPast = i < todayIndex;
          return (
            <div key={i} style={{
              ...styles.dayCard,
              ...(isPast ? styles.dayCardDone : {}),
              ...(isToday ? styles.dayCardToday : {}),
            }}>
              <div style={{
                ...styles.dayLabel,
                color: isToday ? "#F472B6" : "#7C3AED",
              }}>{day}</div>
              <div style={styles.dayEmoji}>{WEEK_EMOJIS[i]}</div>
              <div style={{
                ...styles.dayDot,
                backgroundColor: isPast ? "#34D399" : isToday ? "#FBBF24" : "#E5E7EB",
              }} />
            </div>
          );
        })}
      </div>

      {/* Rewards */}
      <div style={styles.sectionTitle}>🎁 Rewards Shop</div>
      <div style={styles.rewardShelf}>
        {[
          { emoji: "🍦", name: "Ice Cream", cost: 25 },
          { emoji: "🎮", name: "Game Time", cost: 30 },
          { emoji: "🎬", name: "Movie Night", cost: 50 },
          { emoji: "🧸", name: "New Toy", cost: 100 },
        ].map((r, i) => (
          <div key={i} style={styles.rewardCard}>
            <span style={styles.rewardEmoji}>{r.emoji}</span>
            <div style={styles.rewardName}>{r.name}</div>
            <div style={styles.rewardCost}>⭐ {r.cost} stars</div>
          </div>
        ))}
      </div>

      {/* Add input */}
      <div style={styles.inputRow}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a chore..."
          style={styles.input}
        />
        <button onClick={handleAdd} style={styles.addBtn}>＋ Add</button>
      </div>

      <button onClick={handleReset} style={styles.resetBtn2}>Reset Streak</button>

      {allDone && total > 0 && (
        <p style={styles.allDoneBanner}>🎉 You crushed it today!</p>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: "420px",
    margin: "0 auto",
    fontFamily: "'Nunito', sans-serif",
    paddingBottom: "40px",
  },
  // Milestone popup
  milestonePopup: {
    position: "fixed", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    background: "white",
    borderRadius: 28,
    padding: "28px 36px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(124,58,237,0.3)",
    border: "3px solid #A78BFA",
    zIndex: 1000,
    animation: "milestoneIn 0.5s ease forwards",
  },
  milestoneEmoji: { fontSize: 64, marginBottom: 8 },
  milestoneLabel: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: 26, color: "#7C3AED",
  },
  milestoneSub: { fontSize: 16, color: "#A78BFA", marginTop: 4, fontWeight: 700 },
  // Header
  header: {
    background: "linear-gradient(135deg, #C084FC 0%, #F472B6 40%, #FCA5A5 70%, #FDE68A 100%)",
    borderBottom: "3px dashed #F472B6",
    padding: "20px 20px 16px",
    textAlign: "center",
  },
  headerStickers: { fontSize: 22, letterSpacing: 6, marginBottom: 4 },
  headerTitle: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: 32, color: "white", margin: 0, lineHeight: 1,
    textShadow: "0 2px 8px rgba(124,58,237,0.25)",
  },
  headerSub: {
    fontSize: 13, fontWeight: 700,
    color: "rgba(255,255,255,0.85)", marginTop: 2,
    textTransform: "uppercase", letterSpacing: 1,
  },
  // Streak banner
  streakBanner: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "white", borderRadius: 20, padding: "16px 20px",
    margin: "16px 20px 0", border: "2.5px solid",
    transition: "all 0.4s ease",
  },
  streakLeft: { display: "flex", alignItems: "center", gap: 14 },
  streakTitle: {
    fontSize: 11, fontWeight: 800, color: "#A78BFA",
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2,
  },
  streakValue: { fontFamily: "'Fredoka One', cursive", fontSize: 22 },
  milestoneBadge: {
    display: "inline-block", borderRadius: 999,
    padding: "2px 10px", fontSize: 11, fontWeight: 800,
    color: "white", marginTop: 4,
  },
  resetBtn: {
    background: "none", border: "1.5px solid",
    borderRadius: 10, padding: "6px 14px",
    fontSize: 12, cursor: "pointer",
    fontFamily: "'Nunito', sans-serif", fontWeight: 700,
  },
  // Streak history
  historyRow: {
    display: "flex", gap: 8, padding: "0 20px",
    overflowX: "auto", scrollbarWidth: "none",
  },
  historyDay: {
    borderRadius: 14, padding: "10px 8px", textAlign: "center",
    border: "2.5px solid", minWidth: 42, flexShrink: 0,
    transition: "all 0.3s ease",
  },
  historyLabel: {
    fontSize: 10, fontWeight: 800,
    textTransform: "uppercase", marginBottom: 4,
  },
  // Progress
  progressWrap: { padding: "16px 20px 0" },
  progressLabel: {
    display: "flex", justifyContent: "space-between",
    fontSize: 12, fontWeight: 800, color: "#7C3AED",
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6,
  },
  progressTrack: {
    background: "#EDE9FE", borderRadius: 999, height: 14,
    overflow: "hidden", border: "2px solid white",
    boxShadow: "0 2px 6px rgba(124,58,237,0.1)",
  },
  progressFill: {
    height: "100%", borderRadius: 999,
    transition: "width 0.5s ease, background-color 0.4s ease",
  },
  dotsRow: {
    display: "flex", justifyContent: "center", gap: 4,
    padding: "10px 20px 0", flexWrap: "wrap",
  },
  // Chore list
  choreList: { padding: "16px 20px 0", display: "flex", flexDirection: "column", gap: 12 },
  choreCard: {
    background: "white", borderRadius: 20, padding: "14px 16px",
    display: "flex", alignItems: "center", gap: 14,
    border: "2.5px solid #EDE9FE", boxShadow: "0 4px 0px #EDE9FE",
    transition: "all 0.2s", position: "relative", overflow: "hidden",
  },
  choreCardDone: {
    background: "#F5F3FF", borderColor: "#C4B5FD",
    boxShadow: "0 4px 0px #C4B5FD", opacity: 0.85,
  },
  choreIcon: {
    width: 48, height: 48, borderRadius: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 26, flexShrink: 0,
    border: "2px solid rgba(255,255,255,0.8)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  choreInfo: { flex: 1 },
  choreName: { fontSize: 16, fontWeight: 800, color: "#3B1FA3", lineHeight: 1.2 },
  choreNameDone: { textDecoration: "line-through", color: "#A78BFA" },
  chorePoints: { fontSize: 12, fontWeight: 700, color: "#F59E0B", marginTop: 2 },
  editInput: {
    flex: 1, fontSize: 16, fontWeight: 700,
    fontFamily: "'Nunito', sans-serif",
    border: "none", borderBottom: "2px solid #7C3AED",
    backgroundColor: "transparent", color: "#3B1FA3",
    padding: "2px 0", outline: "none", width: "100%",
  },
  iconBtn: {
    background: "none", border: "none", fontSize: 15,
    cursor: "pointer", padding: "4px 6px", borderRadius: 6, lineHeight: 1, flexShrink: 0,
  },
  deleteBtn: {
    background: "none", border: "none", color: "#C4B9A8",
    fontSize: 14, cursor: "pointer", padding: "4px 6px",
    borderRadius: 6, lineHeight: 1, flexShrink: 0,
  },
  choreCheck: {
    width: 30, height: 30, borderRadius: "50%",
    border: "2.5px solid #C4B5FD",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, flexShrink: 0, background: "white", transition: "all 0.2s",
  },
  choreCheckDone: {
    background: "linear-gradient(135deg, #A78BFA, #7C3AED)",
    borderColor: "#7C3AED", color: "white",
  },
  sectionTitle: {
    fontFamily: "'Fredoka One', cursive", fontSize: 20, color: "#7C3AED",
    padding: "20px 20px 10px", display: "flex", alignItems: "center", gap: 8,
  },
  weekCalendar: {
    display: "flex", gap: 8, padding: "0 20px",
    overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none",
  },
  dayCard: {
    background: "white", borderRadius: 16, padding: "10px 8px", textAlign: "center",
    border: "2.5px solid #D1FAE5", boxShadow: "0 3px 0px #D1FAE5",
    minWidth: 44, flexShrink: 0,
  },
  dayCardDone: { borderColor: "#86EFAC", boxShadow: "0 3px 0px #86EFAC", background: "#F0FDF4" },
  dayCardToday: { borderColor: "#F472B6", boxShadow: "0 3px 0px #F472B6", background: "#FFF0F7" },
  dayLabel: { fontSize: 11, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 },
  dayEmoji: { fontSize: 20, marginBottom: 6 },
  dayDot: { width: 8, height: 8, borderRadius: "50%", margin: "0 auto" },
  rewardShelf: {
    display: "flex", gap: 12, padding: "0 20px",
    overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none",
  },
  rewardCard: {
    background: "white", borderRadius: 20, padding: "14px 16px", textAlign: "center",
    border: "2.5px solid #FDE68A", boxShadow: "0 4px 0px #FDE68A",
    minWidth: 100, flexShrink: 0, cursor: "pointer",
  },
  rewardEmoji: { fontSize: 32, display: "block", marginBottom: 4 },
  rewardName: { fontSize: 12, fontWeight: 800, color: "#7C3AED", lineHeight: 1.2 },
  rewardCost: { fontSize: 11, fontWeight: 700, color: "#F59E0B", marginTop: 4 },
  inputRow: { display: "flex", gap: 8, padding: "20px 20px 0" },
  input: {
    flex: 1, padding: "13px 16px", fontSize: 15,
    fontFamily: "'Nunito', sans-serif",
    border: "2.5px solid #EDE9FE", borderRadius: 18,
    backgroundColor: "white", color: "#3B1FA3",
    transition: "border-color 0.2s ease", fontWeight: 700,
  },
  addBtn: {
    padding: "13px 20px", fontSize: 15, fontWeight: 800,
    fontFamily: "'Fredoka One', cursive",
    background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
    color: "white", border: "none", borderRadius: 18,
    cursor: "pointer", boxShadow: "0 4px 0px #5B21B6", whiteSpace: "nowrap",
  },
  resetBtn2: {
    display: "block", margin: "12px auto 0",
    background: "none", border: "1.5px solid #C4B5FD",
    borderRadius: 10, padding: "6px 16px",
    fontSize: 12, color: "#A78BFA", cursor: "pointer",
    fontFamily: "'Nunito', sans-serif", fontWeight: 700,
  },
  allDoneBanner: {
    textAlign: "center", marginTop: 24, fontSize: 16,
    color: "#7C3AED", fontWeight: 800,
    fontFamily: "'Fredoka One', cursive",
  },
};
