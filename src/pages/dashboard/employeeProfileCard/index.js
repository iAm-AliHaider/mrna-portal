import React, { useState } from "react";
import { Avatar } from "@mui/material";
import Modal from "../../../components/common/Modal";

const EmployeeProfileCard = ({ employees = [], loading = false }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border w-full">
        <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
          Employee Profile
        </div>
        <div className="flex flex-col gap-3 p-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex flex-col gap-1">
                  <div className="w-20 h-3 bg-gray-200 animate-pulse rounded"></div>
                  <div className="w-16 h-2 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
              <div className="w-12 h-6 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state
  if (!employees || employees.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow border w-full">
        <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
          Employee Profile
        </div>
        <div className="p-4 text-center">
          <div className="text-gray-500 text-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p>No employees available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border w-full">
      {/* Header */}
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Employee Profile
      </div>

      {/* Profile List */}
      <div className="flex flex-col gap-3 p-4">
        {employees.map((emp, index) => {
          return (
          <div key={emp.id || index} className="flex items-center justify-between">
            {/* Left: Avatar + Info */}
            <div className="flex items-center gap-3">
            <Avatar
          src={emp?.profile_image || '/profile.jpg'}
          sx={{ width: 30, height: 30, border: '2px solid #f16ca4' }}
        />
              <div className="flex flex-col text-sm">
                <span className="font-medium text-gray-800">{emp?.name}</span>
                <span className="text-xs text-gray-500 truncate max-w-[90px] inline-block">
  {emp?.email}
</span>
              </div>
            </div>

            {/* Right: View Button */}
            <button
              className="bg-primary text-white text-xs px-4 py-1 rounded-md  transition"
              onClick={() => {
                setSelectedEmployee(emp);
                setIsModalOpen(true);
              }}
            >
              View
            </button>
          </div>
        )})}

        {/* Modal for employee details */}
        {isModalOpen && (
          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="p-6 bg-white rounded-xl w-full mx-auto">
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src='/profile.jpg'
                  sx={{ width: 50, height: 50, border: '2px solid #f16ca4' }}
                />
                <div className="text-lg font-semibold text-gray-800">{selectedEmployee?.name}</div>
                <div className="text-sm text-gray-500">{selectedEmployee?.email}</div>
                {/* Add more fields as needed */}
                <button
                  className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Footer */}
        {/* <div className="text-center mt-4">
          <button className="text-indigo-600 text-sm hover:underline">See Listing</button>
        </div> */}
      </div>
    </div>
  );
};

export default EmployeeProfileCard;
