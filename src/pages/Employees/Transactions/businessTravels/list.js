import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filter";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { useUser } from '../../../../context/UserContext';
import { useBusinessTravels, useDeleteBusinessTravel } from "../../../../utils/hooks/api/businessTravels";
import toast from "react-hot-toast/headless";
import SelectField from "../../../../components/common/SelectField";

const BusinessTravelsPage = () => {
  const { user } = useUser();
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: "",
  });

  const navigate = useNavigate();

  // Fetch business travels with search and filters
  const { 
    businessTravelData, 
    totalPages, 
    loading, 
    error, 
    count, 
    refetch 
  } = useBusinessTravels(currentPage, searchQuery, filters, perPage);

  // Delete functionality
  const { deleteBusinessTravel, loading: deleteLoading } = useDeleteBusinessTravel();

  const columns = [
    { key: "country", label: "Country" },
    { key: "city", label: "City" },
    { key: "from_date", label: "From Date" },
    { key: "to_date", label: "To Date" },
    { key: "amount_due", label: "Amount Due" },
    { key: "status", label: "Status", type: "chip" },
    { key: "created_at", label: "Created At" },
  ];

  // Transform data for table display
  const transformData = (data) => {
    return data.map(item => ({
      ...item,
      from_date: item.from_date ? new Date(item.from_date).toLocaleDateString() : '-',
      to_date: item.to_date ? new Date(item.to_date).toLocaleDateString() : '-',
      amount_due: item.amount_due ? `${item.amount_due}` : '-',
      created_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : '-',
    }));
  };

  const transformedData = transformData(businessTravelData || []);

  // Get unique values for filter options
  const employeeOptions = Array.from(new Set(transformedData.map((row) => row.employee_name))).map(
    (name) => ({ value: name, label: name })
  );

  const countryOptions = Array.from(new Set(transformedData.map((row) => row.country).filter(Boolean))).map(
    (country) => ({ value: country, label: country })
  );

  const cityOptions = Array.from(new Set(transformedData.map((row) => row.city).filter(Boolean))).map(
    (city) => ({ value: city, label: city })
  );

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Declined', value: 'declined' },
  ];

  const breadcrumbItems = [
    { href: "/home", icon: null },
    { title: "Transactions" },
    { title: "Business Travels" },
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
    });
    setCurrentPage(0);
  };

  const handleAddForm = () => {
    navigate("/transactions/travels/businessTravelForm");
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      await deleteBusinessTravel(selectedIds);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
    }
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
    toast.error("Failed to load business travels");
  }

  return (
    <PageWrapperWithHeading
      title="Business Travels"
      items={breadcrumbItems}
      buttonTitle="Add Business Travel"
      action={handleAddForm}
      Icon={AddIcon}
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        {/* Filters */}
        <div className="flex justify-between items-center w-full">
          <SearchField value={searchQuery} onChange={setSearchQuery} placeholder="Search by country or city..." />
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
          footerInfo={`Travels out of ${count || 0}`}
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

export default BusinessTravelsPage;
