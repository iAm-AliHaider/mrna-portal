import React from 'react';

const tabs = [
  'Education',
  'Certifications',
  'Experiences',
  'Languages',
  'Skills',
  'Relatives',
];

const TabBar = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden w-fit">
      {tabs.map(tab => (
        <span
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-3 text-sm font-medium transition-all duration-150 cursor-pointer ${
            activeTab === tab
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {tab}
        </span>
      ))}
    </div>
  );
};

export default TabBar;
