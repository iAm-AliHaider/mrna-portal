import React from "react";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import CustomTable from "../../../../components/tables/customeTable";
import { useTrainingReport } from "../../../../utils/hooks/api/useTrainingReport";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Reports" },
  { title: "Training Report" },
];

const TrainingReportPage = () => {
  const { data, loading } = useTrainingReport();

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Training Report"
        items={breadcrumbItems}
      >
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-blue-600">{data.totalTrainings}</div>
              <div className="text-gray-600 mt-1">Total Trainings</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-green-600">{data.completedTrainings}</div>
              <div className="text-gray-600 mt-1">Completed</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-orange-600">{data.scheduledTrainings}</div>
              <div className="text-gray-600 mt-1">Scheduled</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-purple-600">{data.employeesTrained}</div>
              <div className="text-gray-600 mt-1">Employees Trained</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Month */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Trainings by Month</h3>
              {data.byMonth?.length > 0 ? (
                <CustomTable
                  headers={["Month", "Count"]}
                  data={data.byMonth.map((m) => ({
                    Month: m.month,
                    Count: m.count,
                  }))}
                  showCheckbox={false}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>

            {/* By Category */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Trainings by Category</h3>
              {data.byCategory?.length > 0 ? (
                <CustomTable
                  headers={["Category", "Count"]}
                  data={data.byCategory.map((c) => ({
                    Category: c.name,
                    Count: c.count,
                  }))}
                  showCheckbox={false}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </div>
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  );
};

export default TrainingReportPage;
