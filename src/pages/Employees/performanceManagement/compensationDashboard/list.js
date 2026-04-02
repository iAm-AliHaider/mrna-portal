import React from "react";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import CustomTable from "../../../../components/tables/customeTable";
import { useCompensationDashboard } from "../../../../utils/hooks/api/useCompensationDashboard";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Performance Management" },
  { title: "Compensation Dashboard" },
];

const CompensationDashboardPage = () => {
  const { data, loading } = useCompensationDashboard();

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Compensation Dashboard"
        items={breadcrumbItems}
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-blue-600">
                {data.currentSalary ? `$${data.currentSalary.toLocaleString()}` : "$0"}
              </div>
              <div className="text-gray-600 mt-1">Gross Salary</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-green-600">
                {data.bonuses ? `$${data.bonuses.toLocaleString()}` : "$0"}
              </div>
              <div className="text-gray-600 mt-1">Bonuses</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-red-600">
                {data.deductions ? `$${data.deductions.toLocaleString()}` : "$0"}
              </div>
              <div className="text-gray-600 mt-1">Deductions</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-purple-600">
                {data.netPay ? `$${data.netPay.toLocaleString()}` : "$0"}
              </div>
              <div className="text-gray-600 mt-1">Net Pay</div>
            </div>
          </div>

          {/* Salary History */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Salary History</h3>
            {data.salaryHistory?.length > 0 ? (
              <CustomTable
                headers={["Effective Date", "Old Salary", "New Salary", "Change", "Reason"]}
                data={data.salaryHistory.map((h) => ({
                  "Effective Date": h.effective_date || "-",
                  "Old Salary": h.old_salary ? `$${h.old_salary.toLocaleString()}` : "-",
                  "New Salary": h.new_salary ? `$${h.new_salary.toLocaleString()}` : "-",
                  Change: h.new_salary && h.old_salary
                    ? `${(((h.new_salary - h.old_salary) / h.old_salary) * 100).toFixed(1)}%`
                    : "-",
                  Reason: h.reason || "-",
                }))}
                showCheckbox={false}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No salary history available</p>
            )}
          </div>
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  );
};

export default CompensationDashboardPage;
