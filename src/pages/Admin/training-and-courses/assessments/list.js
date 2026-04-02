import React, { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SearchField from "../../../../components/common/searchField";
import CustomMenu from "../../../../components/common/CustomMenu";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import {
  useAssessments,
  useCreateAssessment,
} from "../../../../utils/hooks/api/useAssessments";
import { useUser } from "../../../../context/UserContext";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Training and Courses" },
  { title: "Assessments" },
];

const AssessmentsPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ assessment_type: "" });
  const [modalOpen, setModalOpen] = useState(false);

  const { user } = useUser();
  const employeeId = user?.id;

  const { data, totalPages, loading, refetch } = useAssessments(
    page,
    searchQuery,
    filters,
    perPage
  );

  const { create } = useCreateAssessment();

  const assessmentTypeOptions = [
    { label: "Pre-Training", value: "pre_training" },
    { label: "Post-Training", value: "post_training" },
    { label: "Certification", value: "certification" },
    { label: "Quiz", value: "quiz" },
    { label: "Exam", value: "exam" },
  ];

  const handleCreate = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      ...values,
      created_by: employeeId,
      updated_by: employeeId,
    };

    try {
      await create(payload);
      handleCloseModal();
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "title", label: "Assessment Title" },
    { key: "assessment_type", label: "Type" },
    { key: "duration_minutes", label: "Duration (Min)" },
    { key: "passing_score", label: "Passing Score (%)" },
    { key: "total_questions", label: "Questions" },
    {
      key: "description",
      label: "Description",
      type: "description",
      render: (row) => row?.description || "-",
    },
    {
      key: "actions",
      label: "Actions",
      type: "custom",
      render: (row) => (
        <CustomMenu
          items={[
            {
              label: "View Questions",
              action: () => console.log("View questions", row.id),
            },
            {
              label: "View Results",
              action: () => console.log("View results", row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Assessment & Testing"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="Create Assessment"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(v) => { setSearchQuery(v); setPage(0); }}
              placeholder="Search assessments..."
            />
            <div className="w-[180px]">
              <FormikSelectField
                name="assessment_type"
                label=""
                options={[{ label: "All Types", value: "" }, ...assessmentTypeOptions]}
                value={filters.assessment_type}
                onChange={(v) => { setFilters((p) => ({ ...p, assessment_type: v })); setPage(0); }}
              />
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={data}
            footerInfo={`Assessments: ${data.length}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>

      <Modal
        onClose={handleCloseModal}
        title="Create Assessment"
        open={modalOpen}
      >
        <Formik
          initialValues={{
            title: "",
            assessment_type: "quiz",
            duration_minutes: 30,
            passing_score: 70,
            total_questions: 10,
            description: "",
          }}
          validateOnChange={false}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <FormikInputField
                name="title"
                label="Assessment Title"
                type="text"
                required
              />
              <FormikSelectField
                name="assessment_type"
                label="Type"
                options={assessmentTypeOptions}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <FormikInputField
                  name="duration_minutes"
                  label="Duration (Minutes)"
                  type="number"
                  required
                />
                <FormikInputField
                  name="passing_score"
                  label="Passing Score (%)"
                  type="number"
                  required
                />
              </div>
              <FormikInputField
                name="total_questions"
                label="Number of Questions"
                type="number"
                required
              />
              <FormikInputField
                name="description"
                label="Description"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-4">
                <SubmitButton
                  variant="outlined"
                  title="Cancel"
                  type="button"
                  onClick={handleCloseModal}
                />
                <SubmitButton
                  title="Create"
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

export default AssessmentsPage;
