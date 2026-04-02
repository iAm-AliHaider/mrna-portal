import React from "react";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { useGetTypedTrainingsAndCourses } from "../../../utils/hooks/api/trainingAndDevelopment";
import { Link, useNavigate } from "react-router-dom";

const ELearningCard = () => {
  const navigate = useNavigate;
  const { data: courses, loading, error } = useGetTypedTrainingsAndCourses('course');

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border w-full">
        <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
          E-Learning
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow border w-full">
        <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
          E-Learning
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500">Failed to load courses</p>
        </div>
      </div>
    );
  }

  // Show only first 4 courses
  const displayCourses = courses.slice(0, 4);

  return (
    <div className="bg-white rounded-xl shadow border w-full">
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        E-Learning
      </div>
      <div className="p-4 space-y-4">
        {displayCourses.length > 0 ? (
          displayCourses.map((course, index) => (
            <div key={course.id || index} className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 text-indigo-600">
                <InsertDriveFileOutlinedIcon fontSize="small" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {course.course_name || 'Untitled Course'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {course.publisher || course.description || 'No description'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <div className="text-indigo-600 mb-2">
              <InsertDriveFileOutlinedIcon className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">No courses available</p>
          </div>
        )}
        <div className="pt-4 text-center">
          <button onClick={() => navigate('/admin/training-and-courses/courses')} className="text-indigo-600 text-sm hover:underline">See Listing</button>
        </div>
      </div>
    </div>
  );
};

export default ELearningCard;
