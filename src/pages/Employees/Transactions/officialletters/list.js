// OfficialLettersPage.js
import React, { useState, useEffect } from "react";
  
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";

import SelectField from "../../../../components/common/SelectField";  
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { useUser } from '../../../../context/UserContext';
import { useOfficialLetters } from "../../../../utils/hooks/api/officialLetters";
import toast from "react-hot-toast/headless";

const OfficialLettersPage = () => {
  const { user } = useUser();
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: "",
   
  });

  const navigate = useNavigate();

  // Fetch official letters with search and filters
  const { 
    officialLettersData, 
    totalPages, 
    loading, 
    error, 
    count, 
    refetch 
  } = useOfficialLetters(currentPage, searchQuery, filters, perPage, user?.id);



  const columns = [
    { key: "letter_type", label: "Letter Type" },
    { key: "reference_number", label: "Reference Number" },
    { key: "letter_date", label: "Letter Date" },
    // { key: "letter_destination", label: "Destination" },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status", type: "chip" },
    { key: "created_at", label: "Created At" },
  ];

  // Transform data for table display
  const transformData = (data) => {
    return data.map(item => ({
      ...item,
      letter_date: item.letter_date ? new Date(item.letter_date).toLocaleDateString() : '-',
      created_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : '-',
    }));
  };

  const transformedData = transformData(officialLettersData || []);

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Declined', value: 'declined' },
  ];

  const breadcrumbItems = [
    { href: "/home", icon: null },
    { title: "Transactions" },
    { title: "Official Letters" },
  ];

  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      category: "",
      letter_type: "",
      letter_date: "",
      letter_destination: "",
      reason: "",
      reference_number: "",
      notes: "",
    });
    setCurrentPage(0);
  };

  const handleAddForm = () => {
    navigate("/transactions/letters/officialLetterForm");
  };

 

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(0);
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (error) {
    toast.error("Failed to load official letters");
  }

  return (
    <PageWrapperWithHeading
      title="Official Letters"
      items={breadcrumbItems}
      buttonTitle="Add Official Letter"
      action={handleAddForm}
      Icon={AddIcon}
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        {/* Filters */}
        <div className="flex justify-between items-center w-full">
          <SearchField value={searchQuery} onChange={setSearchQuery} placeholder="Search by reason..." />
          <div className="flex gap-4">
            <div className="w-[300px]">
              <SelectField 
                options={statusOptions} 
                placeholder="Status" 
                value={filters.status}
                onChange={handleStatusChange}
              />
            </div>
          </div>
        </div>

        <DynamicTable
          columns={columns}
          data={transformedData}
          footerInfo={`Letters out of ${count || 0}`}
          currentPage={currentPage}
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={handlePageChange}
          onPerPageChange={setPerPage}
          loading={loading}
        />
      </div>
    </PageWrapperWithHeading>
  );
};

export default OfficialLettersPage;
