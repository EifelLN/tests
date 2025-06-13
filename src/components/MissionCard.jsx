import React from "react";

const MissionCard = ({ title, completed, xpReward = 10 }) => (
  <div
    className={`
      relative flex flex-col items-start justify-between p-5 rounded-2xl min-w-[200px] min-h-[120px] 
      bg-white/10 backdrop-blur-lg shadow-lg border border-white/20
      transition-all cursor-pointer hover:scale-105 hover:shadow-2xl
      ${completed ? "opacity-70" : ""}
    `}
  >
    {/* Completed badge */}
    {completed && (
      <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full px-2 py-1 flex items-center gap-1 text-xs font-bold shadow">
        Done
      </div>
    )}

    {/* Icon */}
    <div className="mb-3">
    </div>
    {/* Title */}
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    {/* XP reward */}
    <span className="text-xs bg-[#6e74ff]/80 text-white rounded-full px-3 py-1 font-poppins font-semibold">
      +{xpReward} XP
    </span>
  </div>
);

export default MissionCard;