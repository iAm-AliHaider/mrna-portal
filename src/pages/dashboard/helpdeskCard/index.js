import React from "react";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";

const HelpDeskCard = ({ extension = "92 32 338889" }) => {
  return (
    <div className="bg-white rounded-xl shadow border w-full">
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Help Desk
      </div>
      <div className="flex items-center gap-4 px-4 py-6">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-indigo-700">
          <LocalPhoneOutlinedIcon fontSize="small" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Call Extension</p>
          <p className="text-sm font-semibold text-gray-800">{extension}</p>
        </div>
      </div>
    </div>
  );
};

export default HelpDeskCard;
