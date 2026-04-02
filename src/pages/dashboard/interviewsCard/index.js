import React, { useState } from "react";
import { useCorporateEventsList } from "../../Employees/corporateEvents/../../../utils/hooks/api/corporateEvents";
import { useUser } from "../../../context/UserContext";
import { useUpcommingInterviewsList } from "../../../utils/hooks/api/recruitment";

const InterviewsCard = () => {
  //   const { user } = useUser();
  const { interviewData = [], loading, error } = useUpcommingInterviewsList();

  return (
    <div className="bg-white rounded-xl shadow border w-full">
      {/* Header */}
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Scheduled Interviews
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-3 p-4">
        {interviewData.length === 0 && !loading && (
          <div className="text-gray-500 text-center">
            No Scheduled Interview.
          </div>
        )}
        {interviewData.map((interview, index) => (
            
          <div
            key={interview.id || index}
            className="bg-gray-50 rounded-md p-3 shadow-sm flex flex-col gap-2"
          >
            <div className="text-sm text-gray-800 leading-snug">
              {interview.candidate_email}
            </div>
            <div className="text-xs text-gray-500">
              {interview.first_interview_date ||
                interview.second_interview_date ||
                interview.third_interview_date} - {interview.first_interview_time ||
                interview.second_interview_time ||
                interview.third_interview_time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewsCard;
