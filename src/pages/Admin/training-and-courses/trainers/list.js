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
  useTrainers,
  useCreateTrainer,
  useUpdateTrainer,
} from "../../../../utils/hooks/api/useTrainers";
import { useDepartmentEmployees } from "../../../../utils/hooks/api/departmentEmployees";
import { useUser } from "../../../../context/UserContext";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Training and Courses" },
  { title: "Trainers" },
];

const TrainersPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { user } = useUser();
  const employeeId = user?.id;

  const { data, totalPages, loading, refetch } = useTrainers(
    page,
    searchQuery,
    perPage
  );

  const { create } = useCreateTrainer();
  const { update } = useUpdateTrainer();
  const { departmentEmployees } = useDepartmentEmployees();

  const formatEmployeeName = (emp) => {
    if (!emp?.candidates) return "-";
    const c = emp.candidates;
    return `${emp.employee_code || ""} - ${c.first_name || ""} ${c.second_name || ""}`.trim();
  };

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
    {
      key: "employee",
      label: "Trainer",
      render: (row) => formatEmployeeName(row.employee),
    },
    { key: "specialization", label: "Specialization" },
    { key: "years_experience", label: "Years Experience" },
    { key: "certifications", label: "Certifications" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "bio",
      label: "Bio",
      type: "description",
      render: (row) => row?.bio || "-",
    },
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
            {
              label: "View Sessions",
              action: () => console.log("View sessions", row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Trainer Management"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="Add Trainer"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <SearchField
            value={searchQuery}
            onChange={(v) => { setSearchQuery(v); setPage(0); }}
            placeholder="Search trainers..."
          />

          <DynamicTable
            columns={columns}
            data={data}
            footerInfo={`Trainers: ${data.length}`}
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
        title={selectedId ? "Edit Trainer" : "Add Trainer"}
        open={modalOpen}
      >
        <Formik
          initialValues={{
            employee_id: selectedId ? (data.find((r) => r.id === selectedId)?.employee_id || "") : "",
            specialization: selectedId ? (data.find((r) => r.id === selectedId)?.specialization || "") : "",
            years_experience: selectedId ? (data.find((r) => r.id === selectedId)?.years_experience || "") : "",
            certifications: selectedId ? (data.find((r) => r.id === selectedId)?.certifications || "") : "",
            email: selectedId ? (data.find((r) => r.id === selectedId)?.email || "") : "",
            phone: selectedId ? (data.find((r) => r.id === selectedId)?.phone || "") : "",
            bio: selectedId ? (data.find((r) => r.id === selectedId)?.bio || "") : "",
          }}
          validateOnChange={false}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <FormikSelectField
                name="employee_id"
                label="Select Employee"
                options={departmentEmployees || []}
                placeholder="Select Employee"
                required
              />
              <FormikInputField
                name="specialization"
                label="Specialization"
                type="text"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <FormikInputField
                  name="years_experience"
                  label="Years Experience"
                  type="number"
                />
                <FormikInputField
                  name="certifications"
                  label="Certifications"
                  type="text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormikInputField
                  name="email"
                  label="Email"
                  type="email"
                />
                <FormikInputField
                  name="phone"
                  label="Phone"
                  type="text"
                />
              </div>
              <FormikInputField
                name="bio"
                label="Bio"
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

export default TrainersPage;
