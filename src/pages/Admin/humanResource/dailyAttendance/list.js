"use client";

import React, { useEffect, useState } from "react";

import "./style.css";
import { Button } from "@mui/material";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SelectField from "../../../../components/common/SelectField";
import SearchField from "../../../../components/common/searchField";
import FiltersWrapper from "../../../../components/common/FiltersWrapper";
import ListFilter from "./filters";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "../../../../supabaseClient";
import Storage from "../../../../utils/storage"

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Attendance" },
  { title: "Daily Attendance" },
];

const DailyAttendance = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFormModal, setOpenFormModal] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [filters, setFilters] = useState({
    is_start_half_day: false,
    is_end_half_day: false,
    status: "",
    type: "",
    leave_from: "",
    leave_to: "",
  });

  const [data, setDateData] = useState([]);
  const [loadingDateWise, setLoadingDateWise] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [errorDateWise, setErrorDateWise] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const columns = [
    { key: "employeeCode", label: "Employee Number" },
    { key: "name", label: "Name" },
    { key: "checkIn", label: "Check In" },
    { key: "checkOut", label: "Check Out" },
    { key: "shiftTime", label: "Shift Time" },
    { key: "timeInOffice", label: "Time In Office" },
    { key: "breakTime", label: "Break Time" },
    { key: "workTime", label: "Work Time" },
    { key: "lateTime", label: "Late Time" },
    { key: "difference", label: "Difference" },
    { key: "overtime", label: "Overtime" },
    { key: "informed", label: "Informed?" },
    { key: "informedEarlyExit", label: "Informed? Early Exit" },
    { key: "overtimeApproved", label: "Overtime Approved" },
  ];

  const handleOpenForm = () => setOpenFormModal(true);
  const handleCloseForm = () => setOpenFormModal(false);
  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = (newValues) => {};
  const resetFilters = () => {
    setFilters({
      is_start_half_day: false,
      is_end_half_day: false,
      status: "",
      type: "",
      leave_from: "",
      leave_to: "",
    });
  };

  const handlePageChange = (page) => setCurrentPage(page);

  useEffect(() => {
    const fetchDateWise = async () => {
      setLoadingDateWise(true);
      setErrorDateWise(null);

      // Logged–in employee from localStorage (or fallback)
      const storedUser = Storage.get("user");
      const loggedEmpId = storedUser ? storedUser.id : null;
      if (!loggedEmpId) {
        setDateData([]);
        setTotalCount(0);
        setLoadingDateWise(false);
        return;
      }
      // Build RPC parameters:
      const params = {
        p_employee_id: selectedEmployee ? Number(selectedEmployee) : null,
        p_code_search: null,
        p_name_search: searchQuery.trim() || null,
        p_limit: perPage,
        p_offset: (currentPage - 1) * perPage,
      };

      const { data, error } = await supabase.rpc(
        "get_date_wise_attendance_transactions",
        params
      );

      if (error) {
        console.error("RPC error:", error.message);
        setErrorDateWise(error.message);
        setDateData([]);
        setTotalCount(0);
      } else {
        // Map each returned row into the shape your <DynamicTable> expects:
        const rows = data.map((r) => ({
          id: `${r.employee_id}_${r.attendance_date}_${r.created_at}`,
          employeeCode: r.employee_code,
          name: r.full_name,
          checkIn: r.check_in_time,
          checkOut: r.check_out_time,
          shiftTime: `${r.shift_start_time || "-"} - ${
            r.shift_end_time || "-"
          }`,
          timeInOffice: r.time_in_office ?? "-",
          breakAvailed: r.break_availed ?? "-",
          workTime: r.work_time ?? "-",
          lateTime: r.late_time ?? "-",
          overtime: r.overtime ?? "-",
          informed: r.informed ? "Yes" : "No",
          informedEarlyExit: r.informed_early_exit ? "Yes" : "No",
          overtimeApproved: r.overtime_approved ? "Yes" : "No",
          attendanceDate: r.attendance_date, // if you need to display it
          createdAt: r.created_at,
        }));

        setDateData(rows);
        setTotalCount(data.length > 0 ? Number(data[0].overall_count) : 0);
      }

      setLoadingDateWise(false);
    };
    fetchDateWise();
  }, [currentPage, perPage, searchQuery, selectedEmployee]);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      const { data, error } = await supabase
        .from("employees")
        .select("id, employee_code")
        .order("employee_code", { ascending: true });

      if (!error && data) {
        setEmployeeOptions(
          data.map((row) => ({
            label: row.employee_code,
            value: row.id.toString(),
          }))
        );
      }
      setLoadingEmployees(false);
    };
    fetchEmployees();
  }, []);

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Daily Attendance"
        items={breadcrumbItems}
      >
        <div className="bg-white rounded-lg shadow-md flex flex-col gap-4">
          <div className="p-4">
            {/* Search and Filters */}
            <div className="flex justify-between items-center w-full mb-4">
              <SearchField
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name..."
              />
              <div className="flex gap-2">
                <div className="w-[200px]">
                  <SelectField
                    options={employeeOptions}
                    placeholder="Employee Number"
                    disabled={loadingEmployees}
                    value={selectedEmployee || ""}
                    onChange={(val) => {
                      setSelectedEmployee(val || null);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                {/* Filters Wrapper */}
                {/* <FiltersWrapper
                  onApplyFilters={handleApplyFilter}
                  resetFilters={resetFilters}
                  open={openFilters}
                  setOpen={setOpenFilters}
                >
                  <ListFilter
                    values={filters}
                    label="Status"
                    options={[]}
                    handleChange={handleChangeFilter}
                    placeholder="Select Status"
                  />
                </FiltersWrapper>
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  disabled={selectedIds.length === 0}
                  style={{
                    textTransform: "none",
                    fontSize: "14px",
                  }}
                >
                  Delete
                </Button> */}
              </div>
            </div>

            <DynamicTable
              columns={columns}
              data={data}
              loading={loadingDateWise}
              showCheckbox={true}
              footerInfo={`${"Daily"} Attendance Records out of ${totalCount}`}
              currentPage={currentPage}
              totalPages={Math.ceil(totalCount / perPage) || 1}
              perPage={perPage}
              onPageChange={handlePageChange}
              onPerPageChange={setPerPage}
              onSelectChange={(ids) => setSelectedIds(ids)}
            />
          </div>
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  );
};

export default DailyAttendance;
