// SalarySlipsPage.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  InputBase,
  Paper,
  TextField,
} from "@mui/material";
import SearchField from "../../../../components/common/searchField";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import "./style.css";

import HomeIcon from "@mui/icons-material/Home";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Salary Slips" },
];

const SalarySlipsPage = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const columns = [
    { key: "payPeriod", label: "Pay Period" },
    { key: "employeeId", label: "Employee ID" },
    { key: "employeeName", label: "Employee Name" },
    { key: "basicSalary", label: "Basic Salary" },
    { key: "allowances", label: "Allowances" },
    { key: "grandSalary", label: "Grand Salary" },
    { key: "deductions", label: "Deductions" },
    { key: "overtime", label: "Overtime" },
    { key: "netSalary", label: "Net Salary" },
    { key: "actions", label: "Actions", type: "button" },
  ];

  const data = [
    {
      id: 1,
      payPeriod: "12/2024",
      employeeId: "409",
      employeeName: "Abdur Raheem",
      basicSalary: "48759.00",
      allowances: "28669.00",
      grandSalary: "77419.00",
      deductions: "3169.35",
      overtime: "0.00",
      netSalary: "74249.65",
      actions: "View Slip",
    },
    {
      id: 2,
      payPeriod: "11/2024",
      employeeId: "409",
      employeeName: "Abdur Raheem",
      basicSalary: "48759.00",
      allowances: "26250.00",
      grandSalary: "77419.00",
      deductions: "750.00",
      overtime: "0.00",
      netSalary: "74250.00",
      actions: "View Slip",
    },
    // more rows...
  ];

  return (
    // <Box className="page-wrapper">
    //   <Typography variant="h5" fontWeight={600}>
    //     Salary Slips
    //   </Typography>

    //   <Box className="breadcrumb-container">
    //     <Breadcrumbs separator=">">
    //       <Link underline="hover" color="inherit" href="#">
    //         Self Service
    //       </Link>
    //       <Typography color="text.primary">Salary Slips</Typography>
    //     </Breadcrumbs>
    //   </Box>

    // <Box className="filter-bar">
    //   <Paper className="search-box">
    //     <SearchIcon />
    //     <InputBase placeholder="Search" fullWidth />
    //   </Paper>
    //   <TextField
    //     type="date"
    //     defaultValue="2023-04-25"
    //     size="small"
    //     className="date-picker"
    //   />
    //   <TextField
    //     type="date"
    //     defaultValue="2023-04-25"
    //     size="small"
    //     className="date-picker"
    //   />
    //   <Box className="filter-buttons">
    //     <Button variant="outlined" disabled={selectedIds.length === 0}>
    //       Delete
    //     </Button>
    //   </Box>
    // </Box>

    //   <DynamicTable
    //     columns={columns}
    //     data={data}
    //     showCheckbox={true}
    //     onSelectChange={(ids) => setSelectedIds(ids)}
    //     onAction={() => {}}
    //     footerInfo="Slips out of 18"
    //     currentPage={2}
    //     totalPages={5}
    //     perPage={8}
    //     onPageChange={() => {}}
    //     onPerPageChange={() => {}}
    //   />
    // </Box>

    <React.Fragment>
      <PageWrapperWithHeading
        title="Salary Slips"
        items={breadcrumbItems}
        // action={handleOpenForm}
        // buttonTitle="Add Leave Request"
        // Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          {/* Filters */}
          <div className="flex justify-between items-center w-full">
            <SearchField value={searchQuery} onChange={setSearchQuery} />
            <div className="flex gap-4">
              <TextField
                type="date"
                defaultValue="2023-04-25"
                size="small"
                className="date-picker"
                max="2100-12-31"
              />
              <TextField
                type="date"
                defaultValue="2023-04-25"
                size="small"
                className="date-picker"
                max="2100-12-31"
              />
              <Box className="filter-buttons">
                <Button variant="outlined" disabled={selectedIds.length === 0}>
                  Delete
                </Button>
              </Box>
            </div>
          </div>
          {/* <Box className="filter-bar"></Box> */}

          <DynamicTable
            columns={columns}
            data={data}
            showCheckbox={true}
            onSelectChange={(ids) => setSelectedIds(ids)}
            onAction={() => {}}
            footerInfo="Leave Requests out of 7"
            currentPage={1}
            totalPages={1}
            perPage={10}
            onPageChange={() => {}}
            onPerPageChange={() => {}}
          />
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  );
};

export default SalarySlipsPage;
