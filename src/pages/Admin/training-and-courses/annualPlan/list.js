import React, { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import {
  useAnnualTrainingPlan,
  useCreateAnnualPlanItem,
  useUpdateAnnualPlanItem,
} from "../../../../utils/hooks/api/useAnnualTrainingPlan";
import { useGetTrainingsAndCourses } from "../../../../utils/hooks/api/trainingAndDevelopment";
import { useUser } from "../../../../context/UserContext";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Training and Courses" },
  { title: "Annual Plan" },
];

const AnnualPlanPage = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { user } = useUser();
  const employeeId = user?.id;

  const { data, loading, refetch } = useAnnualTrainingPlan(year);
  const { data: courses = [] } = useGetTrainingsAndCourses();
  const { create } = useCreateAnnualPlanItem();
  const { update } = useUpdateAnnualPlanItem();

  const quarterOptions = [
    { label: "Q1", value: 1 },
    { label: "Q2", value: 2 },
    { label: "Q3", value: 3 },
    { label: "Q4", value: 4 },
  ];

  const monthOptions = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const courseOptions = (courses || []).map((c) => ({
    label: c.name || `Course ${c.id}`,
    value: c.id,
  }));

  const handleCreate = () => {
    setSelectedId(null);
    setModalOpen(true);
  };

  const handleEdit = (row) => {
    setSelectedId(row.id);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      ...values,
      year,
      created_by: employeeId,
      updated_by: employeeId,
    };

    try {
      if (selectedId) {
        await update(selectedId, payload);
      } else {
        await create(payload);
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const quarterNames = { 1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4" };

  // Group by quarter
  const byQuarter = {};
  (data || []).forEach((item) => {
    const q = item.quarter || 1;
    if (!byQuarter[q]) byQuarter[q] = [];
    byQuarter[q].push(item);
  });

  const columns = [
    { key: "course", label: "Training/Course", render: (row) => row.course?.name || "-" },
    { key: "month", label: "Month", render: (row) => monthOptions.find((m) => m.value === row.month)?.label || "-" },
    { key: "target_participants", label: "Target Participants" },
    { key: "budget", label: "Budget" },
    { key: "status", label: "Status", type: "chip" },
    {
      key: "actions",
      label: "Actions",
      type: "custom",
      render: (row) => (
        <Button size="small" onClick={() => handleEdit(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Annual Training Plan"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="Add Plan Item"
        Icon={AddIcon}
      >
        <div className="space-y-6">
          {/* Year Selector */}
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
            <label className="font-semibold">Year:</label>
            <FormikSelectField
              name="year"
              label=""
              options={[
                { label: String(currentYear - 1), value: currentYear - 1 },
                { label: String(currentYear), value: currentYear },
                { label: String(currentYear + 1), value: currentYear + 1 },
              ]}
              value={year}
              onChange={(v) => setYear(v)}
            />
          </div>

          {/* Quarterly breakdown */}
          {[1, 2, 3, 4].map((q) => (
            <div key={q} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 p-4 border-b font-semibold text-lg">
                {quarterNames[q]} {year}
              </div>
              <DynamicTable
                columns={columns}
                data={byQuarter[q] || []}
                footerInfo={`${quarterNames[q]} Items: ${(byQuarter[q] || []).length}`}
                loading={loading}
              />
            </div>
          ))}
        </div>
      </PageWrapperWithHeading>

      <Modal
        onClose={handleCloseModal}
        title={selectedId ? "Edit Plan Item" : "Add Plan Item"}
        open={modalOpen}
      >
        <Formik
          initialValues={{
            course_id: selectedId ? (data.find((r) => r.id === selectedId)?.course_id || "") : "",
            quarter: selectedId ? (data.find((r) => r.id === selectedId)?.quarter || 1) : 1,
            month: selectedId ? (data.find((r) => r.id === selectedId)?.month || 1) : 1,
            target_participants: selectedId ? (data.find((r) => r.id === selectedId)?.target_participants || "") : "",
            budget: selectedId ? (data.find((r) => r.id === selectedId)?.budget || "") : "",
            status: selectedId ? (data.find((r) => r.id === selectedId)?.status || "planned") : "planned",
          }}
          validateOnChange={false}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <FormikSelectField
                name="course_id"
                label="Select Course"
                options={courseOptions}
                placeholder="Select Course"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <FormikSelectField
                  name="quarter"
                  label="Quarter"
                  options={quarterOptions}
                  required
                />
                <FormikSelectField
                  name="month"
                  label="Month"
                  options={monthOptions}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormikInputField
                  name="target_participants"
                  label="Target Participants"
                  type="number"
                />
                <FormikInputField
                  name="budget"
                  label="Budget"
                  type="number"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <SubmitButton
                  variant="outlined"
                  title="Cancel"
                  type="button"
                  onClick={handleCloseModal}
                />
                <SubmitButton
                  title={selectedId ? "Update" : "Add"}
                  type="submit"
                  isLoading={isSubmitting}
                />
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </React.Fragment>
  );
};

export default AnnualPlanPage;
