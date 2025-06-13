import React from "react";

const ProfileStats = ({ longestStreak, completedCourses }) => (
  <div className="flex-1 bg-[#463DCD] p-6 rounded-xl shadow-md text-white flex flex-col gap-4 max-w-sm">
    <div>
      <span className="font-semibold">Longest Streak: </span>
      <span className="underline text-[#bfc6ff]">{longestStreak}X</span>
    </div>
    <div>
      <span className="font-semibold">Completed Course: </span>
      <span className="underline text-[#bfc6ff]">{completedCourses} Courses</span>
    </div>
  </div>
);

export default ProfileStats;