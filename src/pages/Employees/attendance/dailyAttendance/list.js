// DailyAttendanceTransactionsPage.jsx

import React, { useState, useEffect } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import SearchField from "../../../../components/common/searchField";
import SelectField from "../../../../components/common/SelectField";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import { supabase } from "../../../../supabaseClient";
import { startOfWeek, addDays, format } from "date-fns";
import "./style.css";
import Storage from "../../../../utils/storage";
import { useUser } from "../../../../context/UserContext";
const DailyAttendanceTransactionsPage = () => {
  // --- REPORT TYPE STATE ---
  const [reportType, setReportType] = useState("dateWise");

  // We'll need the dates of the current week if/when we render the "register" tab:
  const thisSunday = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(thisSunday, i));
  const { user} = useUser();
  // --- SEARCH & FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // --- DATE-WISE STATE & LOADING/ERROR ---
  const [dateWiseRows, setDateWiseRows] = useState([]);
  const [loadingDateWise, setLoadingDateWise] = useState(false);
  const [errorDateWise, setErrorDateWise] = useState(null);

  // --- MONTHLY STATE & LOADING/ERROR ---
  const [monthlyRows, setMonthlyRows] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [errorMonthly, setErrorMonthly] = useState(null);

  // --- REGISTER STATE & LOADING/ERROR ---
  const [registerRows, setRegisterRows] = useState([]);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [errorRegister, setErrorRegister] = useState(null);

  // --- PUNCTUALITY STATE & LOADING/ERROR ---
  // Replace the hard-coded array with an empty state that we'll fill by calling the RPC
  const [punctualityRows, setPunctualityRows] = useState([]);
  const [loadingPunctuality, setLoadingPunctuality] = useState(false);
  const [errorPunctuality, setErrorPunctuality] = useState(null);

  // --- SELECTED IDS (for table checkboxes) ---
  const [selectedIds, setSelectedIds] = useState([]);

  // ----------------------------------------------------------------------------
  // 1) Load “Employee Number” dropdown once on mount
  // ----------------------------------------------------------------------------
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

  // ----------------------------------------------------------------------------
  // 2) Fetch “Date Wise” whenever its tab is active or filters change
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (reportType !== "dateWise") return;

    const fetchDateWise = async () => {
      setLoadingDateWise(true);
      setErrorDateWise(null);
      // Logged–in employee from localStorage (or fallback)
      const storedUser = Storage.get("user");
      const loggedEmpId = storedUser ? storedUser.id : null;
      if (!loggedEmpId) {
        setDateWiseRows([]);
        setTotalCount(0);
        setLoadingDateWise(false);
        return;
      }
      // Build RPC parameters:
      const params = {
        p_employee_id: user?.id ? +(user?.id) : null,
        p_code_search: null,
        p_name_search: searchQuery.trim() || null,
        p_limit: perPage,
        p_offset: (currentPage - 1) * perPage,
      };

      const { data, error } = await supabase.rpc(
        "get_daily_attendance_report",
        params
      );

      if (error) {
        console.error("RPC error:", error.message);
        setErrorDateWise(error.message);
        setDateWiseRows([]);
        setTotalCount(0);
      } else {
        // Map each returned row into the shape your <DynamicTable> expects:
        const rows = data.map((r) => ({
          id: `${r.employee_id}_${r.attendance_date}_${r.created_at}`,
          employeeCode: r.employee_code,
          name: r.full_name,
          checkIn: r.check_in_time,
          checkOut: r.check_out_time,
          shiftTime: `${user?.shift_start_time || "-"} - ${
            user?.shift_end_time || "-"
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

        setDateWiseRows(rows);
        setTotalCount(data.length > 0 ? Number(data[0].overall_count) : 0);
      }

      setLoadingDateWise(false);
    };
    if(user){
      fetchDateWise();
    }
    
  }, [reportType, currentPage, perPage, searchQuery, selectedEmployee,user]);

  // ----------------------------------------------------------------------------
  // 3) Fetch “Monthly” whenever its tab is active or filters change
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (reportType !== "monthly") return;

    const fetchMonthly = async () => {
      setLoadingMonthly(true);
      setErrorMonthly(null);

      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      const offset = (currentPage - 1) * perPage;

      const { data, error } = await supabase.rpc(
        "get_monthly_attendance_report",
        {
          p_year: year,
          p_month: month,
          p_employee_id: user?.id ? Number(user?.id) : null,
          p_code_search: searchQuery.trim() || null,
          p_offset: offset,
          p_limit: perPage,
        }
      );

      if (error) {
        console.error("RPC error:", error.message);
        setErrorMonthly(error.message);
        setMonthlyRows([]);
        setTotalCount(0);
      } else {
        // Each `data` row has:
        //   employee_id, employee_code, full_name,
        //   shift_start_time, shift_end_time,
        //   total_time_in_office,
        //   total_break_availed,
        //   total_overtime,
        //   total_dates,
        //   overall_count
        //
        // Map into the shape expected by monthlyColumns:
        const rows = data.map((e) => ({
          id: e.employee_id,
          employeeCode: e.employee_code,
          name: e.full_name,
          shiftTime:
            e.shift_start_time && e.shift_end_time
              ? `${e.shift_start_time} - ${e.shift_end_time}`
              : "-",
          timeInOffice: e.total_time_in_office ?? "-",
          breakAvailed: e.total_break_availed ?? "-",
          onTime: "-", // if you have logic later
          extraTime: "-", // placeholder
          totalTime: e.total_time_in_office ?? "-",
          totalDifference: "-", // placeholder
          overtime: e.total_overtime ?? "-",
          shortExcessHours: "-", // placeholder
          totalDates: e.total_dates ?? 0,
          nights: "-", // placeholder
        }));

        setMonthlyRows(rows);
        setTotalCount(data.length > 0 ? data[0].overall_count : 0);
      }

      setLoadingMonthly(false);
    };
    if(user){
      fetchMonthly();
    }

  }, [reportType, currentPage, perPage, searchQuery,user]);

  // ----------------------------------------------------------------------------
  // 4) Fetch “Attendance Register” whenever its tab is active or filters change
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (reportType !== "register") return;

    const fetchRegister = async () => {
      setLoadingRegister(true);
      setErrorRegister(null);

      const weekStart = null; // let the RPC pick "this week's Sunday" if null
      const offset = (currentPage - 1) * perPage;

      const { data, error } = await supabase.rpc(
        "get_weekly_attendance_register",
        {
          p_employee_id: user?.id ? Number(user?.id) : null,
          p_week_start: weekStart,
          p_code_search: null,
          p_name_search: searchQuery.trim() || null,
          p_limit: perPage,
          p_offset: offset,
        }
      );

      if (error) {
        console.error("RPC error:", error.message);
        setErrorRegister(error.message);
        setRegisterRows([]);
        setTotalCount(0);
      } else {
        // Each `data` row has:
        //   employee_id, employee_code, full_name, designation_name,
        //   sun_col, mon_col, tue_col, wed_col, thu_col, fri_col, sat_col,
        //   overall_count
        const rows = data.map((r) => ({
          id: r.employee_id,
          employee: r.full_name,
          designation: r.designation_name,
          sun: r.sun_col,
          mon: r.mon_col,
          tue: r.tue_col,
          wed: r.wed_col,
          thu: r.thu_col,
          fri: r.fri_col,
          sat: r.sat_col,
        }));

        setRegisterRows(rows);
        setTotalCount(data.length > 0 ? data[0].overall_count : 0);
      }

      setLoadingRegister(false);
    };
    if(user){
      fetchRegister();

    }
  }, [reportType, currentPage, perPage, searchQuery, selectedEmployee,user]);

  // ----------------------------------------------------------------------------
  // 5) Fetch “Punctuality” whenever its tab is active or filters change
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (reportType !== "punctuality") return;

    const fetchPunctuality = async () => {
      setLoadingPunctuality(true);
      setErrorPunctuality(null);

      // Use current year/month by default
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      const offset = (currentPage - 1) * perPage;

      const { data, error } = await supabase.rpc(
        "get_punctuality_report_monthly",
        {
          p_year: null,
          p_month: null,
          p_employee_id: selectedEmployee ? Number(selectedEmployee) : null,
          p_name_search: searchQuery.trim() || null,
          p_limit: perPage,
          p_offset: offset,
        }
      );

      if (error) {
        console.error("RPC error:", error.message);
        setErrorPunctuality(error.message);
        setPunctualityRows([]);
        setTotalCount(0);
      } else {
        const rows = data.map((r, idx) => {
          // compute the S.No. in 2-digit format:
          const serialNum = (currentPage - 1) * perPage + (idx + 1);
          const snoText = String(serialNum).padStart(2, "0");

          return {
            id: r.employee_id, // each row must have a unique `id` prop
            sno: snoText,
            employee: r.full_name,
            score: Number(r.score_out_of_5).toFixed(1),
            totalOnDays: r.total_on_days,
            totalLates: r.total_lates,
            fromDate: r.from_month_year,
            toDate: r.to_month_year,
          };
        });

        setPunctualityRows(rows);
        setTotalCount(data.length > 0 ? Number(data[0].overall_count) : 0);
      }

      setLoadingPunctuality(false);
    };

    fetchPunctuality();
  }, [reportType, currentPage, perPage, searchQuery, selectedEmployee]);

  // ----------------------------------------------------------------------------
  // Pagination handlers (shared by all tabs)
  // ----------------------------------------------------------------------------
  const totalPages = Math.ceil(totalCount / perPage) || 1;
  const handlePageChange = (page) => setCurrentPage(page);
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  // ----------------------------------------------------------------------------
  // 6) Column definitions for each tab
  // ----------------------------------------------------------------------------
  const dateWiseColumns = [
    { key: "employeeCode", label: "Employee ID" },
    { key: "name", label: "Name" },
    { key: "checkIn", label: "Check In" },
    { key: "checkOut", label: "Check Out" },
    { key: "shiftTime", label: "Shift Time" },
    { key: "timeInOffice", label: "Time In Office" },
    { key: "breakAvailed", label: "Break Availed" },
    { key: "workTime", label: "Work Time" },
    { key: "lateTime", label: "Late Time" },
    // { key: "difference", label: "Difference" },
    { key: "overtime", label: "Overtime" },
    { key: "informed", label: "Informed?" },
    { key: "informedEarlyExit", label: "Informed? Early Exit" },
    { key: "overtimeApproved", label: "Overtime Approved" },
    { type: "action_menu" },
  ];

  const monthlyColumns = [
    { key: "employeeCode", label: "Emp ID" },
    { key: "name", label: "Name" },
    { key: "shiftTime", label: "Shift Time" },
    { key: "timeInOffice", label: "Time In Office" },
    { key: "breakAvailed", label: "Break Availed" },
    { key: "onTime", label: "On Time" },
    { key: "extraTime", label: "Extra Time" },
    { key: "totalTime", label: "Total Time" },
    { key: "totalDifference", label: "Total Difference" },
    { key: "overtime", label: "Overtime" },
    { key: "shortExcessHours", label: "Short/Excess Hours" },
    { key: "totalDates", label: "Total Dates" },
    { key: "nights", label: "Nights" },
    { type: "action_menu" },
  ];

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const registerColumns = [
    { key: "employee", label: "Employee" },
    { key: "designation", label: "Designation" },
    ...weekdayLabels.map((dayName, idx) => ({
      key: dayName.toLowerCase(),
      label: (
        <div>
          <div>{dayName}</div>
          <div>{format(weekDates[idx], "d/MM/yyyy")}</div>
        </div>
      ),
    })),
    { type: "action_menu" },
  ];

  const punctualityColumns = [
    { key: "sno", label: "S.No." },
    { key: "employee", label: "Employee" },
    { key: "score", label: "Score(out of 5)" },
    { key: "totalOnDays", label: "Total On Days" },
    { key: "totalLates", label: "Total Lates" },
    { key: "fromDate", label: "From Date" },
    { key: "toDate", label: "To Date" },
  ];

  // ----------------------------------------------------------------------------
  // 7) Decide which columns/data/loading to pass into <DynamicTable>
  // ----------------------------------------------------------------------------
  const getTableData = () => {
    switch (reportType) {
      case "monthly":
        return {
          columns: monthlyColumns,
          data: monthlyRows,
          loading: loadingMonthly,
        };

      case "register":
        return {
          columns: registerColumns,
          data: registerRows,
          loading: loadingRegister,
        };

      // case "punctuality":
      //   return {
      //     columns: punctualityColumns,
      //     data: punctualityRows,
      //     loading: loadingPunctuality,
      //   };

      case "dateWise":
      default:
        return {
          columns: dateWiseColumns,
          data: dateWiseRows,
          loading: loadingDateWise,
        };
    }
  };

  const { columns, data, loading } = getTableData();

  // ----------------------------------------------------------------------------
  // 8) “Tab” toggle handler
  // ----------------------------------------------------------------------------
  const handleToggleChange = (_, newType) => {
    if (newType) {
      setReportType(newType);
      // Reset pagination whenever you switch to a new tab
      setCurrentPage(1);
    }
  };

  // ----------------------------------------------------------------------------
  // 9) Breadcrumbs
  // ----------------------------------------------------------------------------
  const breadcrumbItems = [
    { href: "/home", icon: HomeIcon },
    { title: "Attendance" },
    { title: "Daily Attendance Transactions" },
  ];

  // ----------------------------------------------------------------------------
  // 10) Render component
  // ----------------------------------------------------------------------------
  return (
    <PageWrapperWithHeading
      title="Daily Attendance Transactions"
      items={breadcrumbItems}
    >
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        {/* 1) Tabs */}
        <Box display="flex" justifyContent="flex-end">
          <ToggleButtonGroup
            value={reportType}
            exclusive
            onChange={handleToggleChange}
            size="small"
          >
            <ToggleButton value="dateWise">Date Wise Report</ToggleButton>
            <ToggleButton value="monthly">Monthly Report</ToggleButton>
            <ToggleButton value="register">Attendance Register</ToggleButton>
            {/* <ToggleButton value="punctuality">Punctuality Report</ToggleButton> */}
          </ToggleButtonGroup>
        </Box>

        {/* 2) Filters: Search + Employee dropdown */}
        <div className="flex justify-between items-center w-full">
          {/* <SearchField
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
          /> */}
          {/* <div className="flex gap-4">
            <div className="w-[300px]">
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
          </div> */}
        </div>

        {/* 3) Data Table with Pagination */}
        <DynamicTable
          columns={columns}
          data={data}
          loading={loading}
          showCheckbox={true}
          footerInfo={`${
            reportType === "monthly"
              ? "Monthly"
              : reportType === "register"
              ? "Weekly"
              : reportType === "punctuality"
              ? "Punctuality"
              : "Daily"
          } Attendance Records out of ${totalCount}`}
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / perPage) || 1}
          perPage={perPage}
          onPageChange={handlePageChange}
          onPerPageChange={setPerPage}
          onSelectChange={(ids) => setSelectedIds(ids)}
        />
      </div>
    </PageWrapperWithHeading>
  );
};

export default DailyAttendanceTransactionsPage;
