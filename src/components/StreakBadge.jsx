import React from "react";

const StreakBadge = ({ streak }) => (
  <div className="flex items-center gap-1 text-white font-poppins text-base font-medium">
    <span role="img" aria-label="streak" className="text-orange-400 text-lg">🔥</span>
    Streak {streak}x
  </div>
);

export default StreakBadge;