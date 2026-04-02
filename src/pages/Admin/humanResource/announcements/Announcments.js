"use client";

import { useState, useEffect } from "react";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";

import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import { useNavigate } from "react-router-dom";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchInput from "../../../../components/common/searchField";
import Announcmentform from "./form";
import { supabase } from "../../../../supabaseClient";
import { useUser } from "../../../../context/UserContext";
import { useAnnouncmentsList } from "../../../../utils/hooks/api/announcments";
import toast from "react-hot-toast";
import { isActive } from "../../../../utils/helper";
import AnnouncementModal from "../../../../components/common/Modal/announcement";
import AnnouncementViewsModal from "../../../../components/common/Modal/AnnouncementViews";

const columns = [
  {
    key: "readNew",
    label: "ReadNew",
    type: "badge",
  },
  { key: "reference_no", label: "Reference No.", type: "html" },
  { key: "title", label: "Subject", type: "html" },
  {
    key: "views",
    label: "Views",
    type: "custom",
    render: (row) => <span>{`${row?.views || 0}`}</span>,
  },
  {
    key: "likes",
    label: "Agreed",
    type: "custom",
    render: (row) => <span>{`${row?.likes || 0}`}</span>,
  },
  {
    key: "dislikes",
    label: "Disagreed",
    type: "custom",
    render: (row) => <span>{`${row?.dislikes || 0}`}</span>,
  },
  { key: "status", label: "Status", type: "chip" },
  { key: "active_date", label: "Active Date", type: "date" },
  { key: "expiry_date", label: "Expiry Date", type: "date" },
  { key: "updated_at", label: "Updated On", type: "date" },
  {
    key: "created_by_id",
    label: "Created By",
    type: "custom",
    render: (row) => (
      <span>{`${row?.employee?.candidate?.first_name || ""} ${
        row?.employee?.candidate?.family_name || ""
      }`}</span>
    ),
  },
];

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Human Resource", href: "#" },
  { title: "Announcements" },
];

const Announcements = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(4);
  const { announcmentsData, totalPages, count, loading, refetch } =
    useAnnouncmentsList(currentPage - 1, perPage, searchQuery);
  const [summary, setSummary] = useState([
    { category: "active", general_count: 0, mandatory_count: 0 },
    { category: "upcoming", general_count: 0, mandatory_count: 0 },
    { category: "expired", general_count: 0, mandatory_count: 0 },
  ]);

  const [openForm, setOpenForm] = useState(false);
  const onSelectChange = (ids) => setSelectedIds(ids);
  const [currentData, setCurrentData] = useState(null);

  const [selectedID, setSelectedID] = useState(null);

  const handleAddAnnouncement = () => {
    setOpenForm(true);
  };

  const fetchSummary = async () => {
    const { data, error } = await supabase.rpc("get_announcement_summary", {
      p_created_by_id: user?.id,
    });
    if (error) {
      toast.error("Failed to fetch announcement summary", error);
    } else {
      const byCat = data.reduce((acc, r) => {
        acc[r.category] = r;
        return acc;
      }, {});
      setSummary([
        byCat.active || {
          category: "active",
          general_count: 0,
          mandatory_count: 0,
        },
        byCat.upcoming || {
          category: "upcoming",
          general_count: 0,
          mandatory_count: 0,
        },
        byCat.expired || {
          category: "expired",
          general_count: 0,
          mandatory_count: 0,
        },
      ]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSummary();
    }
  }, [user?.id]);

  // const handleSubmit = async (values, { setSubmitting }) => {
  //   try {
  //     const newRow = {
  //       is_mandatory: values?.is_mandatory || false,
  //       active_date: values?.active_date || "",
  //       expiry_date: values?.expiry_date || "",
  //       description: values?.description || "",
  //       title: values?.title || "",
  //       attachment_path: values?.attachment_path || "",
  //       for_organization: values.for_organization ?? false,
  //       reference_no: values.reference_no ?? "",
  //       company_id: 1,
  //       created_by_id: user?.id,
  //       branch_id:
  //         values.branch_id || values.branch_id !== ""
  //           ? Number(values.branch_id)
  //           : null,
  //     };

  //     const { data: insertData, error: insertError } = await supabase
  //       .from("announcements")
  //       .insert([newRow])
  //       .select("id")
  //       .single();

  //     if (insertError || !insertData) {
  //       throw new Error(
  //         "Error creating announcement: " +
  //           (insertError?.message || "Unknown error")
  //       );
  //     }

  //     const announcementId = insertData.id;

  //     // Only insert if not org-wide
  //     if (!values.for_organization && Array.isArray(values.department_id)) {
  //       const departmentRows = values.department_id.map((deptId) => ({
  //         department_id: parseInt(deptId),
  //         announcement_id: announcementId,
  //       }));

  //       const { error: deptInsertError } = await supabase
  //         .from("department_announcement")
  //         .insert(departmentRows);

  //       if (deptInsertError) {
  //         throw new Error(
  //           "Error linking departments: " + deptInsertError.message
  //         );
  //       }
  //     }
  //     toast.success("Announcement created successfully!");
  //     refetch();
  //     fetchSummary();
  //     setOpenForm(false);
  //   } catch (err) {
  //     toast.error(err.message || "Something went wrong. Please try again.");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };


  const handleSubmit = async (values, { setSubmitting }) => {
  try {
    const isMandatory =
      values?.is_mandatory === true || values?.is_mandatory === "true";

    const hasEmployees = Array.isArray(values?.employee_id) && values.employee_id.length > 0;
    const hasDepartments = Array.isArray(values?.department_id) && values.department_id.length > 0;
    const hasBranch = values?.branch_id && String(values.branch_id).trim().length > 0;
    const isOrgWide = values?.for_organization === true;

    // Build the base announcement row
    const newRow = {
      is_mandatory: isMandatory,
      active_date: values?.active_date || "",
      expiry_date: values?.expiry_date || "",
      description: values?.description || "",
      title: values?.title || "",
      attachment_path: values?.attachment_path || "",
      for_organization: !!values?.for_organization,
      reference_no: values?.reference_no ?? "",
      company_id: 1,
      created_by_id: user?.id,
      // Only persist branch_id if NOT org-wide and no employees selected
      // (since employees selection overrides org/branch/dept targeting)
      branch_id: !isOrgWide && !hasEmployees && hasBranch ? Number(values.branch_id) : null,
    };

    const { data: insertData, error: insertError } = await supabase
      .from("announcements")
      .insert([newRow])
      .select("id")
      .single();

    if (insertError || !insertData) {
      throw new Error("Error creating announcement: " + (insertError?.message || "Unknown error"));
    }

    const announcementId = insertData.id;

    // If org-wide, we're done
    if (!isOrgWide) {
      if (hasEmployees) {
        // ✅ Link selected employees (adjust table name/columns if yours differ)
        const employeeRows = values.employee_id.map((eid) => ({
          employee_id: Number(eid),
          announcement_id: announcementId,
        }));

        const { error: empLinkErr } = await supabase
          .from("employee_announcement")
          .insert(employeeRows);

        if (empLinkErr) {
          throw new Error("Error linking employees: " + empLinkErr.message);
        }
      } else if (hasDepartments) {
        // ✅ Link selected departments (existing behavior)
        const departmentRows = values.department_id.map((deptId) => ({
          department_id: parseInt(deptId, 10),
          announcement_id: announcementId,
        }));

        const { error: deptInsertError } = await supabase
          .from("department_announcement")
          .insert(departmentRows);

        if (deptInsertError) {
          throw new Error("Error linking departments: " + deptInsertError.message);
        }
      }
      // else: only branch_id persisted on announcement row, no extra linking needed
    }

    toast.success("Announcement created successfully!");
    refetch();
    fetchSummary();
    setOpenForm(false);
  } catch (err) {
    toast.error(err.message || "Something went wrong. Please try again.");
  } finally {
    setSubmitting(false);
  }
};


  const onRowClick = async (id) => {
    try {
      const getSingleData = await supabase
        .from("announcements")
        .select("*")
        .eq("id", id)
        .single();
      if (!getSingleData?.data?.id) {
        toast.error("can not found data");
        return;
      }
      setCurrentData(getSingleData?.data);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  const onViewClick = async (id) => {
    try {
      const getSingleData = await supabase
        .from("announcements")
        .select("*")
        .eq("id", id)
        .single();
      if (!getSingleData?.data?.id) {
        toast.error("can not found data");
        return;
      }
      setCurrentData(getSingleData?.data);
    } catch (err) {
      toast.error("Failed to load data");
    }
  };

  return (
    <PageWrapperWithHeading
      title="Announcements"
      items={breadcrumbItems}
      action={handleAddAnnouncement}
    >
      {/* Status Cards Section */}
      {/*       
      <div className='grid grid-cols-3 gap-4 mb-6'>
        <div className='shadow-md rounded-lg'>
          <div className='bg-primary text-center py-2 rounded-t-lg'>
            <div className='text-sm font-semibold text-white'>Active</div>
          </div>
          <div className='py-4 px-8 flex justify-between items-center'>
            <div className='text-center'>
              <div className='text-xl text-black font-medium'>
                {summary[0]?.general_count}
              </div>
              <div className='text-xs text-gray-500'>General</div>
            </div>
            <div className='h-8 w-px bg-black'></div>
            <div className='text-center'>
              <div className='text-xl text-black font-medium'>
                {summary[0]?.mandatory_count}
              </div>
              <div className='text-xs text-gray-500'>Mandatory</div>
            </div>
          </div>
        </div>

        

        <div className='shadow-md rounded-lg'>
          <div className='bg-primary text-center py-2 rounded-t-lg'>
            <div className='text-sm font-semibold text-white'>Upcoming</div>
          </div>
          <div className='py-4 px-8 flex justify-between items-center'>
            <div className='text-center'>
              <div className='text-xl text-black font-medium'>
                {summary[1]?.general_count}
              </div>
              <div className='text-xs text-gray-500'>General</div>
            </div>
            <div className='h-8 w-px bg-black'></div>
            <div className='text-center'>
              <div className='text-xl text-black font-medium'>
                {summary[1]?.mandatory_count}
              </div>

              <div className='text-xs text-gray-500'>Mandatory</div>
            </div>
          </div>
        </div>


        <div className='shadow-md rounded-lg'>
          <div className='bg-primary text-center py-2 rounded-t-lg'>
            <div className='text-sm font-semibold text-white'>Expired</div>
          </div>
          <div className='py-4 px-8 flex justify-between items-center'>
            <div className='text-center'>
              <div className='text-xl text-black font-medium'>
                {summary[2]?.general_count}
              </div>
              <div className='text-xs text-gray-500'>General</div>
            </div>
            <div className='h-8 w-px bg-black'></div>
            <div className='text-center'>
              <div className='text-xl text-black font-medium'>
                {summary[2]?.mandatory_count}
              </div>

              <div className='text-xs text-gray-500'>Mandatory</div>
            </div>
          </div>
        </div>
      </div> */}

      {/* All Announcements Section */}
      <div className="bg-primary text-white p-3 text-center rounded-t-lg">
        <h1 className="text-lg font-semibold text-center">All Announcements</h1>
      </div>

      <div className="bg-white p-4 rounded-b-lg shadow-md flex flex-col gap-4">
        {/* Search and Filter Bar */}
        <div className="flex justify-between items-center w-full">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title..."
          />
          {/* <div className="flex gap-4 items-center">
            <div className="text-sm">Status</div>
            <select className="border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div> */}
        </div>

        {/* Table */}
        <DynamicTable
          columns={columns}
          data={announcmentsData}
          onSelectChange={onSelectChange}
          currentPage={currentPage}
          totalPages={totalPages || 1}
          perPage={perPage}
          onPageChange={(p) => setCurrentPage(p)}
          onPerPageChange={setPerPage}
          onRowClick={onRowClick}
          onLikesClick={(row) => {
            onViewClick(row.id);
            setSelectedID(row.id);
          }}
          rowCursor={true}
          loading={loading}
          footerInfo={`Showing ${announcmentsData.length} of ${announcmentsData.length} announcements out of ${count}`}
        />

        {selectedID ? (
          <AnnouncementViewsModal
            selectedID={selectedID}
            title={currentData?.title}
            setSelectedID={setSelectedID}
            setCurrentData={setCurrentData}
          />
        ) : null}

        {!selectedID && currentData?.id ? (
          <AnnouncementModal
            currentData={currentData}
            setCurrentData={setCurrentData}
            isAdmin={true}
          />
        ) : null}
      </div>
      {openForm && (
        <Announcmentform
          open={openForm}
          onClose={() => setOpenForm(false)}
          showPriority={true}
          handleSubmit={handleSubmit}
        />
      )}
    </PageWrapperWithHeading>
  );
};

export default Announcements;
