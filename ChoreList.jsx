import { useState } from "react";
import { triggerConfetti } from "./confetti.js";

const INITIAL_CHORES = ["Wash dishes", "Vacuum", "Laundry"];

export default function ChoreList() {
  const [done, setDone] = useState({});

  const handleChoreClick = (index, event) => {
    if (done[index]) return;
    setDone((prev) => ({ ...prev, [index]: true }));

    // Grab the position of the clicked row
    const rect = event.currentTarget.getBoundingClientRect();
    triggerConfetti(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );

    console.log(`Finished: ${INITIAL_CHORES[index]}`);
  };

  return (
    <div>
      <h2 className="text-xl mb-2">Today's Chores:</h2>
      <ul>
        {INITIAL_CHORES.map((chore, index) => (
          <li
            key={index}
            onClick={(e) => handleChoreClick(index, e)}
            className={`p-2 border-b cursor-pointer transition-all select-none
              ${done[index]
                ? "line-through text-gray-400 bg-gray-50"
                : "hover:bg-gray-100"
              }`}
          >
            {chore}
          </li>
        ))}
      </ul>
    </div>
  );
}