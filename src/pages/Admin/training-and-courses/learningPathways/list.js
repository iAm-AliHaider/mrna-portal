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
  useLearningPathways,
  useCreateLearningPathway,
  useUpdateLearningPathway,
} from "../../../../utils/hooks/api/useLearningPathways";
import { useUser } from "../../../../context/UserContext";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Training and Courses" },
  { title: "Learning Pathways" },
];

const LearningPathwaysPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { user } = useUser();
  const employeeId = user?.id;

  const { data, totalPages, loading, refetch } = useLearningPathways(
    page,
    searchQuery,
    perPage
  );

  const { create } = useCreateLearningPathway();
  const { update } = useUpdateLearningPathway();

  const levelOptions = [
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
    { label: "Expert", value: "expert" },
  ];

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

  const columns = [
    { key: "name", label: "Pathway Name" },
    { key: "level", label: "Level" },
    { key: "duration_hours", label: "Duration (Hours)" },
    {
      key: "description",
      label: "Description",
      type: "description",
      render: (row) => row?.description || "-",
    },
    { key: "is_active", label: "Active", type: "chip" },
    {
      key: "actions",
      label: "Actions",
      type: "custom",
      render: (row) => (
        <CustomMenu
          items={[
            {
              label: "Edit",
              action: () => handleEdit(row),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Learning Pathways"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="Create Pathway"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <SearchField
            value={searchQuery}
            onChange={(v) => { setSearchQuery(v); setPage(0); }}
            placeholder="Search pathways..."
          />

          <DynamicTable
            columns={columns}
            data={data}
            footerInfo={`Learning Pathways: ${data.length}`}
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
        title={selectedId ? "Edit Learning Pathway" : "Create Learning Pathway"}
        open={modalOpen}
      >
        <Formik
          initialValues={{
            name: selectedId ? (data.find((r) => r.id === selectedId)?.name || "") : "",
            description: selectedId ? (data.find((r) => r.id === selectedId)?.description || "") : "",
            level: selectedId ? (data.find((r) => r.id === selectedId)?.level || "") : "beginner",
            duration_hours: selectedId ? (data.find((r) => r.id === selectedId)?.duration_hours || "") : "",
          }}
          validateOnChange={false}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <FormikInputField
                name="name"
                label="Pathway Name"
                type="text"
                required
              />
              <FormikSelectField
                name="level"
                label="Level"
                options={levelOptions}
                required
              />
              <FormikInputField
                name="duration_hours"
                label="Duration (Hours)"
                type="number"
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
                  title={selectedId ? "Update" : "Create"}
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

export default LearningPathwaysPage;
