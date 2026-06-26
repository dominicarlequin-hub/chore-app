import { useState, useEffect, useRef } from "react";
import { triggerConfetti } from "./confetti.js";

const DEFAULT_CHORES = [
  { label: "Wash dishes", emoji: "🍽️", points: 5 },
  { label: "Vacuum", emoji: "🧹", points: 5 },
  { label: "Laundry", emoji: "👕", points: 5 },
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK_EMOJIS = ["🌟", "🛏️", "🐕", "🧹", "🍽️", "🧺", "🪴"];

const MILESTONES = [
  { days: 3,  emoji: "🌱", label: "3 Day Sprout!" },
  { days: 7,  emoji: "🔥", label: "7 Day Flame!" },
  { days: 14, emoji: "⚡", label: "2 Week Spark!" },
  { days: 30, emoji: "👑", label: "30 Day Legend!" },
];

const REWARDS = [
  { emoji: "🍦", name: "Ice Cream", cost: 25 },
  { emoji: "🎮", name: "Game Time", cost: 30 },
  { emoji: "🎬", name: "Movie Night", cost: 50 },
  { emoji: "🧸", name: "New Toy", cost: 100 },
];

function getFlameColor(streak) {
  if (streak >= 30) return "#7C3AED";
  if (streak >= 14) return "#EF4444";
  if (streak >= 7)  return "#F97316";
  if (streak >= 3)  return "#FBBF24";
  return "#A78BFA";
}

function getFlameSize(streak) {
  if (streak >= 30) return 64;
  if (streak >= 14) return 56;
  if (streak >= 7)  return 48;
  if (streak >= 3)  return 40;
  return 32;
}

export default function ChoreList() {
  const [tab, setTab] = useState("home");
  const [chores, setChores] = useState(() => {
    const saved = localStorage.getItem("chores");
    return saved ? JSON.parse(saved) : DEFAULT_CHORES;
  });
  const [done, setDone] = useState(() => {
    const saved = localStorage.getItem("choresDone");
    return saved ? JSON.parse(saved) : {};
  });
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem("chorePoints");
    return saved ? parseInt(saved) : 0;
  });
  const [pointPop, setPointPop] = useState(null);
  const [redeemedReward, setRedeemedReward] = useState(null);
  const [popping, setPopping] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("choreStreak");
    return saved ? parseInt(saved) : 0;
  });
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
  useEffect(() => { localStorage.setItem("chorePoints", points); }, [points]);
  useEffect(() => { localStorage.setItem("streakHistory", JSON.stringify(streakHistory)); }, [streakHistory]);
  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) editInputRef.current.focus();
  }, [editingIndex]);

  const completedCount = Object.keys(done).filter((k) => done[k]).length;
  const total = chores.length;
  const allDone = total > 0 && completedCount === total;
  const flameColor = getFlameColor(streak);
  const flameSize = getFlameSize(streak);
  const currentMilestone = MILESTONES.slice().reverse().find(m => streak >= m.days);

  useEffect(() => {
    if (allDone) {
      const alreadyCounted = localStorage.getItem("streakCountedToday");
      if (!alreadyCounted) {
        setStreak((prev) => {
          const next = prev + 1;
          localStorage.setItem("choreStreak", next);
          const hit = MILESTONES.find(m => m.days === next);
          if (hit) { setMilestone(hit); setTimeout(() => setMilestone(null), 3000); }
          return next;
        });
        setStreakHistory(prev => prev.includes(todayStr) ? prev : [...prev, todayStr]);
        localStorage.setItem("streakCountedToday", "true");
      }
    }
  }, [allDone]);

  const handleChoreClick = (index, event) => {
    if (done[index] || editingIndex === index) return;
    setPopping((prev) => ({ ...prev, [index]: true }));
    const earned = chores[index].points || 5;
    setTimeout(() => {
      setPopping((prev) => ({ ...prev, [index]: false }));
      setDone((prev) => ({ ...prev, [index]: true }));
      setPoints((prev) => prev + earned);
      setPointPop({ index, amount: earned });
      setTimeout(() => setPointPop(null), 1200);
    }, 300);
    const rect = event.currentTarget.getBoundingClientRect();
    triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  const handleRedeem = (reward) => {
    if (points < reward.cost) return;
    setPoints((prev) => prev - reward.cost);
    setRedeemedReward(reward);
    setTimeout(() => setRedeemedReward(null), 3000);
    triggerConfetti(window.innerWidth / 2, window.innerHeight / 3);
  };

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setChores((prev) => [...prev, { label: trimmed, emoji: "📌", points: 5 }]);
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

  const handleReset = () => {
    if (!window.confirm("Reset everything? This clears completed chores, points, and your streak.")) return;
    setStreak(0); setStreakHistory([]); setPoints(0); setDone({});
    localStorage.setItem("choreStreak", 0);
    localStorage.setItem("chorePoints", 0);
    localStorage.setItem("choresDone", JSON.stringify({}));
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
    if (trimmed) setChores((prev) => prev.map((c, i) => i === index ? { ...c, label: trimmed } : c));
    setEditingIndex(null); setEditValue("");
  };

  const handleEditKeyDown = (e, index) => {
    if (e.key === "Enter") handleEditSave(index);
    if (e.key === "Escape") { setEditingIndex(null); setEditValue(""); }
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  return (
    <div style={styles.shell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes pop { 0% { transform: scale(1); } 40% { transform: scale(1.04); } 100% { transform: scale(1); } }
        @keyframes flamePulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px ${flameColor}88); }
          50% { transform: scale(1.2); filter: drop-shadow(0 0 18px ${flameColor}cc); }
        }
        @keyframes milestoneIn {
          0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0; }
          60% { transform: translate(-50%,-50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
        }
        @keyframes pointFloat {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        input:focus { outline: none; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Milestone popup */}
      {milestone && (
        <div style={styles.popup}>
          <div style={{fontSize:64, marginBottom:8}}>{milestone.emoji}</div>
          <div style={styles.popupTitle}>{milestone.label}</div>
          <div style={styles.popupSub}>Keep it up! 🎉</div>
        </div>
      )}
      {redeemedReward && (
        <div style={styles.popup}>
          <div style={{fontSize:64, marginBottom:8}}>{redeemedReward.emoji}</div>
          <div style={styles.popupTitle}>{redeemedReward.name} Unlocked!</div>
          <div style={styles.popupSub}>Go enjoy your reward! 🎉</div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <div style={styles.headerTitle}>
              {tab === "home" && "Today's Chores"}
              {tab === "streak" && "My Streak"}
              {tab === "rewards" && "Rewards Shop"}
              {tab === "calendar" && "This Week"}
            </div>
            <div style={styles.headerSub}>
              {tab === "home" && `${completedCount} of ${total} done`}
              {tab === "streak" && `${streak} day${streak !== 1 ? "s" : ""} strong`}
              {tab === "rewards" && `⭐ ${points} stars to spend`}
              {tab === "calendar" && "Your weekly overview"}
            </div>
          </div>
          <div style={styles.starPill}>⭐ {points}</div>
        </div>
        {tab === "home" && total > 0 && (
          <div style={styles.progressTrack}>
            <div style={{
              ...styles.progressFill,
              width: `${(completedCount / total) * 100}%`,
              background: allDone ? "#34D399" : "rgba(255,255,255,0.9)",
            }} />
          </div>
        )}
      </div>

      {/* Screens */}
      <div style={styles.screen}>

        {/* ── HOME TAB ── */}
        {tab === "home" && (
          <div style={styles.padded}>
            {allDone && total > 0 && (
              <div style={styles.allDoneBanner}>🎉 All done! Amazing job!</div>
            )}
            <div style={styles.choreList}>
              {chores.map((chore, index) => {
                const isDone = done[index];
                const isPop = popping[index];
                const isEditing = editingIndex === index;
                const earned = chore.points || 5;
                return (
                  <div key={index} style={{position:"relative"}}>
                    {pointPop && pointPop.index === index && (
                      <div style={styles.pointFloat}>+{pointPop.amount} ⭐</div>
                    )}
                    <div
                      onClick={(e) => handleChoreClick(index, e)}
                      style={{
                        ...styles.choreCard,
                        ...(isDone ? styles.choreCardDone : {}),
                        ...(isPop ? {animation:"pop 0.3s ease forwards"} : {}),
                        cursor: isDone || isEditing ? "default" : "pointer",
                      }}
                    >
                      <div style={{
                        ...styles.choreIcon,
                        background: isDone
                          ? "linear-gradient(135deg,#A7F3D0,#34D399)"
                          : "linear-gradient(135deg,#DDD6FE,#A78BFA)",
                      }}>{chore.emoji}</div>
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
                          <div style={{...styles.choreName, ...(isDone ? styles.choreNameDone : {})}}>
                            {chore.label}
                          </div>
                        )}
                        <div style={{...styles.chorePoints, color: isDone ? "#34D399" : "#F59E0B"}}>
                          {isDone ? `✓ +${earned} stars earned!` : `⭐ ${earned} stars`}
                        </div>
                      </div>
                      {!isDone && !isEditing && (
                        <button onClick={(e) => handleEditStart(index, e)} style={styles.iconBtn}>✏️</button>
                      )}
                      <button onClick={(e) => handleDelete(index, e)} style={styles.deleteBtn}>✕</button>
                      <div style={{...styles.choreCheck, ...(isDone ? styles.choreCheckDone : {})}}>
                        {isDone ? "✓" : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={styles.inputRow}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Add a chore..."
                style={styles.input}
              />
              <button onClick={handleAdd} style={styles.addBtn}>＋</button>
            </div>
            <button onClick={handleReset} style={styles.resetBtn}>Reset Everything</button>
          </div>
        )}

        {/* ── STREAK TAB ── */}
        {tab === "streak" && (
          <div style={styles.padded}>
            <div style={styles.streakHero}>
              <div style={{
                fontSize: flameSize,
                animation: streak > 0 ? `flamePulse ${streak >= 7 ? "0.8s" : "1.4s"} ease-in-out infinite` : "none",
                lineHeight: 1, marginBottom: 12,
              }}>🔥</div>
              <div style={{...styles.streakNumber, color: flameColor}}>
                {streak} {streak === 1 ? "day" : "days"}
              </div>
              <div style={styles.streakLabel}>
                {streak === 0 ? "Complete all chores to start!" : "Keep it going!"}
              </div>
              {currentMilestone && (
                <div style={{...styles.milestoneBadge, background: flameColor}}>
                  {currentMilestone.emoji} {currentMilestone.label}
                </div>
              )}
            </div>

            <div style={styles.sectionTitle}>Last 7 Days</div>
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
                    boxShadow: `0 3px 0px ${isToday ? flameColor : "#EDE9FE"}`,
                  }}>
                    <div style={{...styles.historyLabel, color: completed ? "white" : "#7C3AED"}}>{label}</div>
                    <div style={{fontSize:18}}>{completed ? "🔥" : isToday ? "⏳" : "○"}</div>
                  </div>
                );
              })}
            </div>

            <div style={styles.sectionTitle}>Milestones</div>
            <div style={styles.milestoneList}>
              {MILESTONES.map((m, i) => {
                const achieved = streak >= m.days;
                return (
                  <div key={i} style={{
                    ...styles.milestoneRow,
                    opacity: achieved ? 1 : 0.4,
                    borderColor: achieved ? flameColor : "#EDE9FE",
                  }}>
                    <div style={{fontSize:28}}>{m.emoji}</div>
                    <div style={styles.milestoneInfo}>
                      <div style={{...styles.milestoneName, color: achieved ? flameColor : "#9CA3AF"}}>{m.label}</div>
                      <div style={styles.milestoneDays}>{m.days} days</div>
                    </div>
                    {achieved && <div style={{fontSize:20}}>✅</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── REWARDS TAB ── */}
        {tab === "rewards" && (
          <div style={styles.padded}>
            <div style={styles.pointsHero}>
              <div style={styles.pointsNumber}>⭐ {points}</div>
              <div style={styles.pointsLabel}>stars available</div>
            </div>
            <div style={styles.rewardGrid}>
              {REWARDS.map((r, i) => {
                const canAfford = points >= r.cost;
                return (
                  <div
                    key={i}
                    onClick={() => handleRedeem(r)}
                    style={{
                      ...styles.rewardCard,
                      opacity: canAfford ? 1 : 0.5,
                      cursor: canAfford ? "pointer" : "not-allowed",
                      borderColor: canAfford ? "#FDE68A" : "#E5E7EB",
                      boxShadow: canAfford ? "0 4px 0px #FDE68A" : "0 4px 0px #E5E7EB",
                    }}
                  >
                    <div style={{fontSize:42, marginBottom:8}}>{r.emoji}</div>
                    <div style={styles.rewardName}>{r.name}</div>
                    <div style={{...styles.rewardCost, color: canAfford ? "#F59E0B" : "#9CA3AF"}}>
                      ⭐ {r.cost} stars
                    </div>
                    {canAfford && <div style={styles.redeemBtn}>Redeem!</div>}
                    {!canAfford && (
                      <div style={styles.needMore}>Need {r.cost - points} more ⭐</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CALENDAR TAB ── */}
        {tab === "calendar" && (
          <div style={styles.padded}>
            <div style={styles.calendarGrid}>
              {WEEK_DAYS.map((day, i) => {
                const isToday = i === todayIndex;
                const isPast = i < todayIndex;
                return (
                  <div key={i} style={{
                    ...styles.calCard,
                    ...(isPast ? styles.calCardDone : {}),
                    ...(isToday ? styles.calCardToday : {}),
                  }}>
                    <div style={{...styles.calDay, color: isToday ? "#F472B6" : "#7C3AED"}}>{day}</div>
                    <div style={{fontSize:32, margin:"8px 0"}}>{WEEK_EMOJIS[i]}</div>
                    <div style={{
                      width:10, height:10, borderRadius:"50%", margin:"0 auto",
                      backgroundColor: isPast ? "#34D399" : isToday ? "#FBBF24" : "#E5E7EB",
                    }} />
                    <div style={{...styles.calStatus, color: isToday ? "#F472B6" : isPast ? "#34D399" : "#D1D5DB"}}>
                      {isPast ? "Done!" : isToday ? "Today" : "Soon"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {[
          { id: "home",     emoji: "🏠", label: "Chores" },
          { id: "streak",   emoji: "🔥", label: "Streak" },
          { id: "rewards",  emoji: "🎁", label: "Rewards" },
          { id: "calendar", emoji: "📅", label: "Calendar" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              ...styles.tabBtn,
              color: tab === t.id ? "#7C3AED" : "#9CA3AF",
            }}
          >
            <div style={{
              ...styles.tabEmoji,
              transform: tab === t.id ? "scale(1.2)" : "scale(1)",
              transition: "transform 0.2s",
            }}>{t.emoji}</div>
            <div style={{
              ...styles.tabLabel,
              fontWeight: tab === t.id ? 800 : 600,
            }}>{t.label}</div>
            {tab === t.id && <div style={styles.tabDot} />}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  shell: {
    maxWidth: 420, margin: "0 auto",
    fontFamily: "'Nunito', sans-serif",
    display: "flex", flexDirection: "column",
    height: "100vh", overflow: "hidden",
  },
  popup: {
    position: "fixed", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    background: "white", borderRadius: 28, padding: "28px 36px",
    textAlign: "center", boxShadow: "0 20px 60px rgba(124,58,237,0.3)",
    border: "3px solid #A78BFA", zIndex: 1000,
    animation: "milestoneIn 0.5s ease forwards",
  },
  popupTitle: { fontFamily: "'Fredoka One', cursive", fontSize: 24, color: "#7C3AED" },
  popupSub: { fontSize: 15, color: "#A78BFA", marginTop: 4, fontWeight: 700 },
  header: {
    background: "linear-gradient(135deg, #C084FC 0%, #F472B6 40%, #FCA5A5 70%, #FDE68A 100%)",
    padding: "20px 20px 14px", flexShrink: 0,
  },
  headerTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  headerTitle: { fontFamily: "'Fredoka One', cursive", fontSize: 26, color: "white", lineHeight: 1 },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 700, marginTop: 2 },
  starPill: {
    background: "rgba(255,255,255,0.25)", borderRadius: 999,
    padding: "6px 14px", fontFamily: "'Fredoka One', cursive",
    fontSize: 16, color: "white", border: "2px solid rgba(255,255,255,0.4)",
  },
  progressTrack: {
    background: "rgba(255,255,255,0.3)", borderRadius: 999,
    height: 8, overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999, transition: "width 0.5s ease" },
  screen: { flex: 1, overflowY: "auto", background: "#D1FAE5",
    backgroundImage: `
      radial-gradient(circle at 10% 15%, #F9A8D4 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, #FDE68A 0%, transparent 40%),
      radial-gradient(circle at 60% 40%, #86EFAC 0%, transparent 35%)
    `,
  },
  padded: { padding: "16px 16px 24px" },
  allDoneBanner: {
    background: "linear-gradient(135deg, #A7F3D0, #34D399)",
    borderRadius: 16, padding: "14px 16px", textAlign: "center",
    fontFamily: "'Fredoka One', cursive", fontSize: 18, color: "white",
    marginBottom: 14, boxShadow: "0 4px 0px #6EE7B7",
  },
  choreList: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 },
  pointFloat: {
    position: "absolute", top: -10, right: 20, zIndex: 10,
    fontFamily: "'Fredoka One', cursive", fontSize: 18, color: "#F59E0B",
    animation: "pointFloat 1.2s ease forwards", pointerEvents: "none",
  },
  choreCard: {
    background: "white", borderRadius: 18, padding: "12px 14px",
    display: "flex", alignItems: "center", gap: 12,
    border: "2.5px solid #EDE9FE", boxShadow: "0 4px 0px #EDE9FE",
    transition: "all 0.2s",
  },
  choreCardDone: { background: "#F5F3FF", borderColor: "#C4B5FD", boxShadow: "0 4px 0px #C4B5FD", opacity: 0.85 },
  choreIcon: {
    width: 44, height: 44, borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 24, flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  choreInfo: { flex: 1 },
  choreName: { fontSize: 15, fontWeight: 800, color: "#3B1FA3" },
  choreNameDone: { textDecoration: "line-through", color: "#A78BFA" },
  chorePoints: { fontSize: 12, fontWeight: 700, marginTop: 2 },
  editInput: {
    fontSize: 15, fontWeight: 700, fontFamily: "'Nunito', sans-serif",
    border: "none", borderBottom: "2px solid #7C3AED",
    background: "transparent", color: "#3B1FA3", outline: "none", width: "100%",
  },
  iconBtn: { background: "none", border: "none", fontSize: 14, cursor: "pointer", padding: "4px", flexShrink: 0 },
  deleteBtn: { background: "none", border: "none", color: "#C4B9A8", fontSize: 13, cursor: "pointer", padding: "4px", flexShrink: 0 },
  choreCheck: {
    width: 28, height: 28, borderRadius: "50%", border: "2.5px solid #C4B5FD",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, flexShrink: 0, background: "white",
  },
  choreCheckDone: { background: "linear-gradient(135deg,#A78BFA,#7C3AED)", borderColor: "#7C3AED", color: "white" },
  inputRow: { display: "flex", gap: 8 },
  input: {
    flex: 1, padding: "12px 14px", fontSize: 15, fontFamily: "'Nunito', sans-serif",
    border: "2.5px solid #EDE9FE", borderRadius: 16,
    background: "white", color: "#3B1FA3", fontWeight: 700,
  },
  addBtn: {
    padding: "12px 18px", fontSize: 20, fontWeight: 800,
    background: "linear-gradient(135deg,#7C3AED,#A78BFA)",
    color: "white", border: "none", borderRadius: 16,
    cursor: "pointer", boxShadow: "0 4px 0px #5B21B6",
  },
  resetBtn: {
    display: "block", margin: "12px auto 0", background: "none",
    border: "1.5px solid #C4B5FD", borderRadius: 10, padding: "6px 16px",
    fontSize: 12, color: "#A78BFA", cursor: "pointer",
    fontFamily: "'Nunito', sans-serif", fontWeight: 700,
  },
  // Streak tab
  streakHero: {
    background: "white", borderRadius: 24, padding: "32px 20px",
    textAlign: "center", border: "2.5px solid #EDE9FE",
    boxShadow: "0 4px 0px #EDE9FE", marginBottom: 20,
  },
  streakNumber: { fontFamily: "'Fredoka One', cursive", fontSize: 48, lineHeight: 1 },
  streakLabel: { fontSize: 14, fontWeight: 700, color: "#9CA3AF", marginTop: 4 },
  milestoneBadge: {
    display: "inline-block", borderRadius: 999, padding: "6px 16px",
    fontSize: 13, fontWeight: 800, color: "white", marginTop: 12,
  },
  sectionTitle: {
    fontFamily: "'Fredoka One', cursive", fontSize: 18, color: "#7C3AED",
    marginBottom: 10,
  },
  historyRow: { display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, scrollbarWidth: "none" },
  historyDay: {
    borderRadius: 14, padding: "10px 8px", textAlign: "center",
    border: "2.5px solid", minWidth: 42, flexShrink: 0,
  },
  historyLabel: { fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginBottom: 4 },
  milestoneList: { display: "flex", flexDirection: "column", gap: 10 },
  milestoneRow: {
    background: "white", borderRadius: 16, padding: "14px 16px",
    display: "flex", alignItems: "center", gap: 14,
    border: "2.5px solid", boxShadow: "0 3px 0px #EDE9FE",
  },
  milestoneInfo: { flex: 1 },
  milestoneName: { fontSize: 15, fontWeight: 800 },
  milestoneDays: { fontSize: 12, color: "#9CA3AF", fontWeight: 600 },
  // Rewards tab
  pointsHero: {
    background: "white", borderRadius: 24, padding: "24px",
    textAlign: "center", border: "2.5px solid #FDE68A",
    boxShadow: "0 4px 0px #FDE68A", marginBottom: 20,
  },
  pointsNumber: { fontFamily: "'Fredoka One', cursive", fontSize: 42, color: "#7C3AED" },
  pointsLabel: { fontSize: 14, fontWeight: 700, color: "#9CA3AF" },
  rewardGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  rewardCard: {
    background: "white", borderRadius: 20, padding: "16px 12px",
    textAlign: "center", border: "2.5px solid", transition: "all 0.2s",
  },
  rewardName: { fontSize: 13, fontWeight: 800, color: "#7C3AED", marginBottom: 4 },
  rewardCost: { fontSize: 12, fontWeight: 700 },
  redeemBtn: {
    marginTop: 8, background: "linear-gradient(135deg,#7C3AED,#A78BFA)",
    color: "white", borderRadius: 999, padding: "5px 12px",
    fontSize: 12, fontWeight: 800, fontFamily: "'Fredoka One', cursive",
  },
  needMore: { marginTop: 8, fontSize: 11, color: "#9CA3AF", fontWeight: 700 },
  // Calendar tab
  calendarGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  calCard: {
    background: "white", borderRadius: 20, padding: "16px 12px",
    textAlign: "center", border: "2.5px solid #D1FAE5",
    boxShadow: "0 4px 0px #D1FAE5",
  },
  calCardDone: { borderColor: "#86EFAC", boxShadow: "0 4px 0px #86EFAC", background: "#F0FDF4" },
  calCardToday: { borderColor: "#F472B6", boxShadow: "0 4px 0px #F472B6", background: "#FFF0F7" },
  calDay: { fontSize: 12, fontWeight: 800, textTransform: "uppercase" },
  calStatus: { fontSize: 11, fontWeight: 800, marginTop: 6 },
  // Tab bar
  tabBar: {
    display: "flex", background: "white", borderTop: "2px solid #EDE9FE",
    padding: "8px 0 12px", flexShrink: 0,
  },
  tabBtn: {
    flex: 1, background: "none", border: "none",
    display: "flex", flexDirection: "column", alignItems: "center",
    cursor: "pointer", padding: "4px 0", position: "relative",
    fontFamily: "'Nunito', sans-serif",
  },
  tabEmoji: { fontSize: 22, lineHeight: 1, marginBottom: 2 },
  tabLabel: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  tabDot: {
    width: 4, height: 4, borderRadius: "50%",
    background: "#7C3AED", marginTop: 3,
  },
};
