import React from "react";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import { useAssetReport } from "../../../../utils/hooks/api/useAssetReport";
import CustomTable from "../../../../components/tables/customeTable";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Reports" },
  { title: "Asset Report" },
];

const AssetReportPage = () => {
  const { summary, loading } = useAssetReport();

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Asset Report"
        items={breadcrumbItems}
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-blue-600">{summary.totalAssets}</div>
              <div className="text-gray-600 mt-1">Total Assets</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-green-600">{summary.byCategory?.length || 0}</div>
              <div className="text-gray-600 mt-1">Categories</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-orange-600">{summary.byStatus?.length || 0}</div>
              <div className="text-gray-600 mt-1">Status Types</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-purple-600">{summary.byEmployee?.length || 0}</div>
              <div className="text-gray-600 mt-1">Employees with Assets</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Category */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Assets by Category</h3>
              {summary.byCategory?.length > 0 ? (
                <CustomTable
                  headers={["Category", "Count"]}
                  data={summary.byCategory.map((c) => ({
                    Category: c.name,
                    Count: c.count,
                  }))}
                  showCheckbox={false}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>

            {/* By Status */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Assets by Status</h3>
              {summary.byStatus?.length > 0 ? (
                <CustomTable
                  headers={["Status", "Count"]}
                  data={summary.byStatus.map((s) => ({
                    Status: s.status,
                    Count: s.count,
                  }))}
                  showCheckbox={false}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </div>

          {/* By Employee */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Top Employees with Assets</h3>
            {summary.byEmployee?.length > 0 ? (
              <CustomTable
                headers={["Employee", "Assets Assigned"]}
                data={summary.byEmployee.map((e) => ({
                  Employee: e.name,
                  "Assets Assigned": e.count,
                }))}
                showCheckbox={false}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  );
};

export default AssetReportPage;
