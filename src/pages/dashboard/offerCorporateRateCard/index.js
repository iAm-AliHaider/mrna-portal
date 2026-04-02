import React, { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const OffersCorporateRatesCard = () => {
  const [openCategory, setOpenCategory] = useState(null);

  const categories = [
    {
      label: "Category 1",
      content: (
        <div className="text-center py-4">
          <div className="text-indigo-600 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="font-medium text-sm text-gray-800">Executive Class</div>
          <div className="text-xs text-gray-500">Explore Rates?</div>
        </div>
      ),
    },
    {
      label: "Category 2",
      content: (
        <div className="text-center py-4 text-sm text-gray-600">Category 2 Offer Details...</div>
      ),
    },
    {
      label: "Category 3",
      content: (
        <div className="text-center py-4 text-sm text-gray-600">Category 3 Offer Details...</div>
      ),
    },
    {
      label: "Category 4",
      content: (
        <div className="text-center py-4 text-sm text-gray-600">Category 4 Offer Details...</div>
      ),
    },
    {
      label: "Category 5",
      content: (
        <div className="text-center py-4 text-sm text-gray-600">Category 5 Offer Details...</div>
      ),
    },
  ];

  const handleToggle = (label) => {
    setOpenCategory((prev) => (prev === label ? null : label));
  };

  return (
    <div className="bg-white rounded-xl shadow border w-full">
      {/* Header */}
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Offers & Corporate Rates
      </div>

      {/* Category List */}
      <div className="flex flex-col p-4">
        {categories.map((cat, index) => {
          const isOpen = openCategory === cat.label;

          return (
            <div key={index} className="mb-2">
              <button
                onClick={() => handleToggle(cat.label)}
                className={`w-full flex justify-between items-center text-sm px-4 py-2 font-medium text-white bg-primary rounded-sm ${
                  isOpen ? "rounded-b-none" : ""
                }`}
              >
                <span>{cat.label}</span>
                <KeyboardArrowDownIcon
                  fontSize="small"
                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="bg-white border border-t-0 border-indigo-200 rounded-b-md">
                  {cat.content}
                </div>
              )}
            </div>
          );
        })}
        {/* Footer */}
      <div className="text-center mt-3">
        <button className="text-primary text-sm hover:underline">See Listing</button>
      </div>
      </div>
    </div>
  );
};

export default OffersCorporateRatesCard;
