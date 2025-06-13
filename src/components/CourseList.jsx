import React from "react";
import StreakBadge from "./StreakBadge";
import CourseCard from "./CourseCard";
// import { useNavigate } from "react-router-dom";

const CourseList = ({ courses, streak }) => {
  // const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white font-poppins">Available Courses</h2>
        <StreakBadge streak={streak} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {courses.map((course) => (
          // <div key={course.id} className="flex flex-col content-center items-center w-full m-0 p-0">
          <CourseCard course={course} />
        ))}
      </div>
    </section>
  );
};

export default CourseList;
