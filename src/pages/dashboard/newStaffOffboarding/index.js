import React from "react";
import { useDashboardRecentEmployees } from "../../../utils/hooks/api/dashboard";
import { Avatar } from "@mui/material";

const NewStaffOnboardingCard = () => {
  const { recentEmployees, loading, error } = useDashboardRecentEmployees(5);
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border w-full">
        <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
          New Staff Onboarding
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
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

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow border w-full">
        <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
          New Staff Onboarding
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 text-center">Failed to load recent employees</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border w-full">
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        New Staff Onboarding
      </div>
      <div className="p-4 space-y-4">
        {recentEmployees.length > 0 ? (
          recentEmployees.map((person, index) => {
            const name = `${person.candidates?.full_name || ""} `;
            const title = person.candidates?.email ;
           

            return (
              <div key={person.id || index} className="flex items-center space-x-3">
                <Avatar
          src={person?.profile_image || '/profile.jpg'}
          sx={{ width: 30, height: 30, border: '2px solid #f16ca4' }}
        />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                  <p className="text-xs text-gray-500 truncate">{title}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No recent employees found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewStaffOnboardingCard;
