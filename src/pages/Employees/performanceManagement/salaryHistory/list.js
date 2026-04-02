import React, { useState } from "react";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SearchField from "../../../../components/common/searchField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import { useEmployeesForDropdown } from "../../../../utils/hooks/api/companyInfo";
import { supabase } from "../../../../supabaseClient";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Performance Management" },
  { title: "Salary History" },
];

const SalaryHistoryPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { employees } = useEmployeesForDropdown();

  const fetchHistory = async (employeeId) => {
    if (!employeeId) {
      setData([]);
      return;
    }
    setLoading(true);
    try {
      const { data: result } = await supabase
        .from("salary_history")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("is_deleted", false)
        .order("effective_date", { ascending: false });
      setData(result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setPage(0);
    fetchHistory(employeeId);
  };

  const columns = [
    { key: "effective_date", label: "Effective Date", type: "date" },
    { key: "old_salary", label: "Old Salary", render: (row) => row.old_salary ? `$${row.old_salary.toLocaleString()}` : "-" },
    { key: "new_salary", label: "New Salary", render: (row) => row.new_salary ? `$${row.new_salary.toLocaleString()}` : "-" },
    {
      key: "change_pct",
      label: "Change %",
      render: (row) => row.new_salary && row.old_salary
        ? `${(((row.new_salary - row.old_salary) / row.old_salary) * 100).toFixed(1)}%`
        : "-",
    },
    { key: "change_type", label: "Change Type" },
    {
      key: "reason",
      label: "Reason",
      type: "description",
      render: (row) => row?.reason || "-",
    },
  ];

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Salary History"
        items={breadcrumbItems}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="w-[300px]">
            <FormikSelectField
              name="employee"
              label="Select Employee"
              options={employees || []}
              value={selectedEmployeeId || ""}
              onChange={(v) => handleEmployeeChange(v)}
            />
          </div>

          {selectedEmployeeId && (
            <DynamicTable
              columns={columns}
              data={data}
              footerInfo={`Salary History: ${data.length} records`}
              currentPage={page + 1}
              totalPages={Math.ceil(data.length / perPage)}
              perPage={perPage}
              onPageChange={(p) => setPage(p - 1)}
              onPerPageChange={setPerPage}
              loading={loading}
            />
          )}
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  );
};

export default SalaryHistoryPage;
