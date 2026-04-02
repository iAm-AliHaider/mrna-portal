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
  useCertifications,
  useCreateCertification,
} from "../../../../utils/hooks/api/useCertifications";
import { useUser } from "../../../../context/UserContext";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Admin" },
  { title: "Training and Courses" },
  { title: "Certifications" },
];

const CertificationsPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ certificate_type: "" });
  const [modalOpen, setModalOpen] = useState(false);

  const { user } = useUser();
  const employeeId = user?.id;

  const { data, totalPages, loading, refetch } = useCertifications(
    page,
    searchQuery,
    filters,
    perPage
  );

  const { create } = useCreateCertification();

  const certificateTypeOptions = [
    { label: "Technical", value: "technical" },
    { label: "Professional", value: "professional" },
    { label: "Compliance", value: "compliance" },
    { label: "Safety", value: "safety" },
    { label: "Leadership", value: "leadership" },
    { label: "Other", value: "other" },
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

  const formatEmployeeName = (emp) => {
    if (!emp?.candidates) return "-";
    const c = emp.candidates;
    return `${emp.employee_code || ""} - ${c.first_name || ""} ${c.second_name || ""}`.trim();
  };

  const columns = [
    { key: "name", label: "Certification Name" },
    { key: "certificate_type", label: "Type" },
    { key: "validity_period", label: "Validity (Months)" },
    { key: "expiry_date", label: "Expiry Date", type: "date" },
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
              label: "View Earners",
              action: () => console.log("View earners", row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Certifications & Achievements"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="Add Certification"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(v) => { setSearchQuery(v); setPage(0); }}
              placeholder="Search certifications..."
            />
            <div className="w-[180px]">
              <FormikSelectField
                name="certificate_type"
                label=""
                options={[{ label: "All Types", value: "" }, ...certificateTypeOptions]}
                value={filters.certificate_type}
                onChange={(v) => { setFilters((p) => ({ ...p, certificate_type: v })); setPage(0); }}
              />
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={data}
            footerInfo={`Certifications: ${data.length}`}
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
        title="Add Certification"
        open={modalOpen}
      >
        <Formik
          initialValues={{
            name: "",
            certificate_type: "technical",
            validity_period: "",
            expiry_date: "",
            description: "",
          }}
          validateOnChange={false}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <FormikInputField
                name="name"
                label="Certification Name"
                type="text"
                required
              />
              <FormikSelectField
                name="certificate_type"
                label="Type"
                options={certificateTypeOptions}
                required
              />
              <FormikInputField
                name="validity_period"
                label="Validity Period (Months)"
                type="number"
              />
              <FormikInputField
                name="expiry_date"
                label="Expiry Date"
                type="date"
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

export default CertificationsPage;
