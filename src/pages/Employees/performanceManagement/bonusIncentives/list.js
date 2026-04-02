import React, { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SearchField from "../../../../components/common/searchField";
import SelectField from "../../../../components/common/SelectField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import {
  useBonusIncentives,
  useCreateBonusIncentive,
  useUpdateBonusIncentive,
} from "../../../../utils/hooks/api/useBonusIncentives";
import { useEmployeesForDropdown } from "../../../../utils/hooks/api/companyInfo";
import { useUser } from "../../../../context/UserContext";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Performance Management" },
  { title: "Bonus & Incentives" },
];

const BonusIncentivesPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "", bonus_type: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { user } = useUser();
  const employeeId = user?.id;

  const { data, totalPages, loading, refetch } = useBonusIncentives(
    page,
    searchQuery,
    filters,
    perPage
  );

  const { create } = useCreateBonusIncentive();
  const { update } = useUpdateBonusIncentive();
  const { employees } = useEmployeesForDropdown();

  const bonusTypeOptions = [
    { label: "Performance Bonus", value: "performance" },
    { label: "Annual Bonus", value: "annual" },
    { label: "Sales Incentive", value: "sales" },
    { label: "Retention Bonus", value: "retention" },
    { label: "Spot Bonus", value: "spot" },
    { label: "Project Bonus", value: "project" },
  ];

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Paid", value: "paid" },
    { label: "Cancelled", value: "cancelled" },
  ];

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
    { key: "name", label: "Bonus Name" },
    { key: "bonus_type", label: "Type" },
    {
      key: "employee",
      label: "Employee",
      render: (row) => formatEmployeeName(row.employee),
    },
    { key: "amount", label: "Amount", render: (row) => row.amount ? `$${row.amount.toLocaleString()}` : "-" },
    { key: "effective_date", label: "Effective Date", type: "date" },
    { key: "status", label: "Status", type: "chip" },
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
        <Button size="small" onClick={() => handleEdit(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Bonus & Incentives"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="Add Bonus"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            <SearchField
              value={searchQuery}
              onChange={(v) => { setSearchQuery(v); setPage(0); }}
              placeholder="Search bonuses..."
            />
            <div className="flex gap-4">
              <div className="w-[150px]">
                <SelectField
                  options={bonusTypeOptions}
                  placeholder="Type"
                  value={filters.bonus_type}
                  onChange={(v) => { setFilters((p) => ({ ...p, bonus_type: v })); setPage(0); }}
                />
              </div>
              <div className="w-[150px]">
                <SelectField
                  options={statusOptions}
                  placeholder="Status"
                  value={filters.status}
                  onChange={(v) => { setFilters((p) => ({ ...p, status: v })); setPage(0); }}
                />
              </div>
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={data}
            footerInfo={`Bonus & Incentives: ${data.length}`}
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
        title={selectedId ? "Edit Bonus" : "Add Bonus"}
        open={modalOpen}
      >
        <Formik
          initialValues={{
            name: selectedId ? (data.find((r) => r.id === selectedId)?.name || "") : "",
            bonus_type: selectedId ? (data.find((r) => r.id === selectedId)?.bonus_type || "") : "performance",
            employee_id: selectedId ? (data.find((r) => r.id === selectedId)?.employee_id || "") : "",
            amount: selectedId ? (data.find((r) => r.id === selectedId)?.amount || "") : "",
            effective_date: selectedId ? (data.find((r) => r.id === selectedId)?.effective_date || "") : "",
            description: selectedId ? (data.find((r) => r.id === selectedId)?.description || "") : "",
            status: selectedId ? (data.find((r) => r.id === selectedId)?.status || "pending") : "pending",
          }}
          validateOnChange={false}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <FormikInputField name="name" label="Bonus Name" type="text" required />
              <FormikSelectField name="bonus_type" label="Type" options={bonusTypeOptions} required />
              <FormikSelectField name="employee_id" label="Employee" options={employees || []} required />
              <FormikInputField name="amount" label="Amount" type="number" required />
              <FormikInputField name="effective_date" label="Effective Date" type="date" required />
              <FormikSelectField name="status" label="Status" options={statusOptions} />
              <FormikInputField name="description" label="Description" rows={3} />
              <div className="flex justify-end gap-2 mt-4">
                <SubmitButton variant="outlined" title="Cancel" type="button" onClick={handleCloseModal} />
                <SubmitButton title={selectedId ? "Update" : "Create"} type="submit" isLoading={isSubmitting} />
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </React.Fragment>
  );
};

export default BonusIncentivesPage;
