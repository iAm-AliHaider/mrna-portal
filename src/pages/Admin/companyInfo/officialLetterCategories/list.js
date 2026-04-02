import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";
import CustomMenu from "../../../../components/common/CustomMenu";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useOfficialLetterCategories, useDeleteOfficialLetterCategory } from "../../../../utils/hooks/api/officialLetterCategories";
import toast from "react-hot-toast/headless";

const OfficialLetterCategoriesList = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState({});

  const navigate = useNavigate();

  // Fetch official letter categories with search and filters
  const { 
    categoriesData, 
    totalPages, 
    loading, 
    error, 
    count, 
    refetch 
  } = useOfficialLetterCategories(currentPage, searchQuery, filters, perPage);

  // Delete functionality
  const { deleteOfficialLetterCategory, loading: deleteLoading } = useDeleteOfficialLetterCategory();

  const columns = [
    { key: "category", label: "Category" },
    { key: "notes", label: "Notes", type: 'description', render: (row) => row?.notes },
    { key: "created_at", label: "Created At" },
    { key: "updated_at", label: "Updated At" },
    {
        type: 'custom',
        label: 'Actions',
        width: '10%',
        render: row => (
          <CustomMenu
            items={[
              {
                label: 'Edit',
                icon: <EditIcon fontSize='small' />,
                action: () => handleEdit(row),
              },
              {
                label: 'Delete',
                icon: <DeleteIcon fontSize='small' />,
                action: () => handleDelete(row),
                danger: true
              }
            ]}
          />
        )
      }
  ];

  // Transform data for table display
  const transformData = (data) => {
    return data.map(item => ({
      ...item,
      created_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : '-',
      updated_at: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-',
    }));
  };

  const transformedData = transformData(categoriesData || []);

  const breadcrumbItems = [
    { href: "/home", icon: null },
    { title: "Company Info" },
    { title: "Official Letter Categories" },
  ];

  const handleAddForm = () => {
    navigate("/admin/company-info/letters-categories/add");
  };

  const handleEdit = (row) => {
    navigate(`/admin/company-info/letters-categories/edit/${row.id}`);
  };

  const handleDelete = async (row) => {
    try {
      await deleteOfficialLetterCategory(row.id);
      refetch();
    } catch (err) {
      console.error("Delete failed:", err);
    }
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
    toast.error("Failed to load official letter categories");
  }

  return (
    <PageWrapperWithHeading
      title="Official Letter Categories"
      items={breadcrumbItems}
      buttonTitle="Add Category"
      action={handleAddForm}
      Icon={AddIcon}
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        {/* Search */}
        <div className="flex justify-between items-center w-full">
          <SearchField value={searchQuery} onChange={setSearchQuery} />
        </div>

        <DynamicTable
          columns={columns}
          data={transformedData}
          footerInfo={`Categories out of ${count || 0}`}
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

export default OfficialLetterCategoriesList; 