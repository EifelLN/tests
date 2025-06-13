import React from "react";
import { Link } from "react-router-dom";

const CourseCard = ({ course = {} }) => {
  const progress = course.progress || 0;

  return (
    <Link to={`/courses/${course.id || ""}`}>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-5 flex flex-col 
        items-start justify-between min-h-[180px] relative overflow-hidden
        cursor-pointer transition-all hover:scale-105 hover:shadow-2xl border border-white/20">
        {/* {course.image && (
          <img 
            src={course.image} 
            alt={course.title} 
            className="rounded mb-2 h-28 object-cover" 
          />
        )} */}
        <h3 className="text-xl font-bold text-white font-poppins">
          {course.title || "Untitled"}
        </h3>
        <div className="text-white/80 text-sm mb-2">
          {course.description || ""}
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 mb-2">
          <div
            className="bg-[#6e74ff] h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-white text-xs">
          {progress}% complete
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;