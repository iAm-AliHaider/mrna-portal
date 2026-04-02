import React from "react";
import { useUser } from "../../../context/UserContext";
import { Avatar } from "@mui/material";

const WelcomeGreetingCard = () => {
    const { user } = useUser();
    const userName = user?.first_name;
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning!";
      if (hour < 17) return "Good Afternoon!";
      return "Good Evening!";
    };
  return (

    <div className="bg-white rounded-xl shadow border w-full text-center">
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Welcome Greeting
      </div>
      <div className="flex flex-col items-center p-4 space-y-2">
      <Avatar
          src={user?.profile_image || '/profile.jpg'}
          sx={{ width: 50, height: 50, border: '2px solid #f16ca4' }}
        />  
          <p className="text-base font-semibold text-gray-800">
          {getGreeting()}
        </p>
        <p className="text-sm text-gray-500">{userName}</p>
      </div>
    </div>
  );
};

export default WelcomeGreetingCard;
