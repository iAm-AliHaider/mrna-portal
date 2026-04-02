import React, { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useMyDocuments } from "../../../utils/hooks/api/documents";
import { useNavigate } from "react-router-dom";

const DocumentLibrary = () => {
    const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  // Use empty filters object and memoize it to prevent infinite loops
  const { documents, loading, error } = useMyDocuments(0, '', React.useMemo(() => ({}), []), 100);

  // Define the document categories based on actual API response
  const documentCategories = [
    { key: "iqama", label: "Iqama" },
    { key: "visa", label: "Visa" },
    { key: "family_visa", label: "Family Visa" },
    { key: "salary_certificate", label: "Salary Certificate" },
    { key: "visa_letter", label: "Visa Letter" },
    { key: "recommendation_letter", label: "Recommendation Letter" },
    { key: "experience_letter", label: "Experience Letter" },
    { key: "travel_expense", label: "Travel Expense" },
    { key: "business_trip", label: "Business Trip" },
    { key: "other_documents", label: "Other Documents" }
  ];

  // Show only first 4 categories initially, or all if showAllCategories is true
  const visibleCategories = showAllCategories ? documentCategories : documentCategories.slice(0, 4);

  // Group documents by type
  const groupedDocuments = React.useMemo(() => {
    const grouped = {};
    
    documentCategories.forEach(category => {
      grouped[category.key] = documents.filter(doc => 
        doc.document_type === category.key
      );
    });

    return grouped;
  }, [documents]);

  const handleToggle = (label) => {
    setOpenCategory((prev) => (prev === label ? null : label));
  };

  const handleShowMore = () => {
    setShowAllCategories(true);
  };

  const handleShowLess = () => {
    setShowAllCategories(false);
    setOpenCategory(null); // Close any open category when collapsing
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border w-full">
        <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
          Document Library
        </div>
        <div className="flex flex-col p-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="mb-2">
              <div className="w-full flex justify-between items-center text-sm px-4 py-2 font-medium text-white bg-indigo-600 rounded-sm">
                <div className="h-4 bg-primary rounded animate-pulse w-24"></div>
                <div className="h-4 bg-primary rounded animate-pulse w-4"></div>
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
          Document Library
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500">Failed to load documents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border w-full">
      {/* Header */}
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Document Library
      </div>

      {/* Category List */}
      <div className="flex flex-col p-4">
        {visibleCategories.map((category, index) => {
          const isOpen = openCategory === category.label;
          const categoryDocuments = groupedDocuments[category.key] || [];
          const documentCount = categoryDocuments.length;

          return (
            <div key={index} className="mb-2 overflow-hidden">
              <button
                onClick={() => handleToggle(category.label)}
                className={`w-full flex justify-between items-center text-sm px-4 py-2 font-medium text-white bg-primary  rounded-sm transition-all duration-300 ease-in-out ${
                  isOpen ? "rounded-b-none" : ""
                }`}
              >
                <span>{category.label}</span>
                <div className="flex items-center space-x-2">
                  {documentCount > 0 && (
                    <span className="text-xs bg-white text-primary px-2 py-1 rounded-full transition-all duration-300 ease-in-out">
                      {documentCount}
                    </span>
                  )}
                  <KeyboardArrowDownIcon
                    fontSize="small"
                    className={`transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              <div 
                className={`bg-white border border-t-0 border-indigo-200 rounded-b-md transition-all duration-300 ease-in-out ${
                  isOpen 
                    ? "max-h-96 opacity-100 transform translate-y-0" 
                    : "max-h-0 opacity-0 transform -translate-y-2 overflow-hidden"
                }`}
              >
                {categoryDocuments.length > 0 ? (
                  <div className="p-3 space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {categoryDocuments.map((doc, docIndex) => (
                      <div key={doc.id || docIndex} className="border-b border-gray-100 pb-2 last:border-b-0 transition-all duration-200 ease-in-out hover:bg-gray-50 rounded p-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {doc.custom_title || 'Untitled Document'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {doc.custom_details || 'No details provided'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(doc.created_on).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 transition-all duration-200 ease-in-out ${
                            doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                            doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {doc.status || 'Unknown'}
                          </span>
                        </div>
                        {doc.file_path && (
                          <div className="mt-2">
                            <a 
                              href={doc.file_path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-800 underline transition-colors duration-200 ease-in-out"
                            >
                              View Document
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" style={{width:24,height:24,margin:'0 auto'}} fill="none" viewBox="0 0 24 24" stroke="#424B9A">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-500 mt-1">No {category.label} documents</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Show More/Less Button */}
        {documentCategories.length > 4 && (
          <div className="text-center mt-3">
            <button 
              onClick={showAllCategories ? handleShowLess : handleShowMore}
              className="text-indigo-600 text-sm hover:underline transition-colors duration-200 ease-in-out font-medium"
            >
              {showAllCategories ? 'Show Less' : `Show ${documentCategories.length - 4} More Categories`}
            </button>
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center mt-3">
          <button className="text-indigo-600 text-sm hover:underline transition-colors duration-200 ease-in-out" onClick={() => navigate('/self/documents-requests')}>See Listing</button>
        </div>
      </div>
    </div>
  );
};

export default DocumentLibrary;
