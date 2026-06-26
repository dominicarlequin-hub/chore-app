import { useState, useEffect, useRef } from "react";
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
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chores", JSON.stringify(chores));
  }, [chores]);

  useEffect(() => {
    localStorage.setItem("choresDone", JSON.stringify(done));
  },
