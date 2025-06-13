import React from "react";

const ProfileStats = ({ longestStreak, completedCourses }) => {
  const courseLabel = completedCourses === 1 ? "Course" : "Courses";
  return (
    <div className="flex-1 bg-[#463DCD] p-6 rounded-xl shadow-md text-white flex flex-col gap-4 max-w-sm">
      <div>
        <span className="font-semibold">Longest Streak: </span>
        <span className="underline text-[#bfc6ff]">{longestStreak}x</span>
      </div>
      <div>
        <span className="font-semibold">Completed {courseLabel}: </span>
        <span className="underline text-[#bfc6ff]">{completedCourses} {courseLabel}</span>
      </div>
    </div>
  );
};

export default ProfileStats;