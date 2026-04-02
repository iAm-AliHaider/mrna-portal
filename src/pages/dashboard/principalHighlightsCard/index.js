import React from "react";

const PrincipleHighlightsCard = ({ highlight }) => {
  return (
    <div className="bg-white rounded-xl shadow border w-full">
      {/* Header */}
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Principle Highlights
      </div>

      {/* Highlight Item */}
      <div className=" rounded-md p-4 mb-3 ">
        <div className="bg-gray-100 p-3 rounded-md">
        <div className="text-xs text-gray-500 mb-1">{highlight.time}</div>
        <div className="text-sm font-medium text-gray-800">{highlight.title}</div>
        </div>
          {/* Footer */}
      <div className="text-center">
        <button className="text-indigo-600 text-sm hover:underline">View All</button>
      </div>
      </div>

    
    </div>
  );
};

export default PrincipleHighlightsCard;
