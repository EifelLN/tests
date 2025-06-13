import React from "react";
import MissionCard from "./MissionCard";

const DailyMissions = ({ missions }) => {
  // Calculate completed count
  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-4 mb-2">
        <h2 className="text-2xl font-bold text-white font-poppins">Daily Missions</h2>
        <span className="bg-white/10 text-[#bfc6ff] text-xs px-3 py-1 rounded-full font-poppins">
          Time remaining: 10h 30m
        </span>
      </div>
      <div className="mb-3">
        <span className="bg-[#6e74ff] text-white text-xs px-3 py-1 rounded font-poppins">
          Missions completed: {completedCount}
        </span>
      </div>
      <div className="flex flex-wrap gap-4">
        {missions.map((m) => (
          <MissionCard
            key={m.id}
            title={m.title}
            completed={m.completed}
            xpReward={m.xpReward || 10}
            progress={m.progress || 0}
            amount={m.requirements?.amount || 1}
            action={m.requirements?.action || ""}
            description={m.description}
          />
        ))}
      </div>
    </section>
  );
};

export default DailyMissions;