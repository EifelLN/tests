import React from "react";

const ProfileHeader = ({ name, level }) => (
  <div className="flex flex-col items-center mb-6">
    <div className="bg-white rounded-full h-20 w-20 flex items-center justify-center mb-3">
      <span className="text-4xl text-[#16172B]">👤</span>
    </div>
    <div className="text-white font-bold text-2xl">{name}</div>
    <div className="text-white/80 font-medium text-lg">Level {level}</div>
  </div>
);

export default ProfileHeader;