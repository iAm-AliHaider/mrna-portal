import React, { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DynamicTable from "../../../../components/tables/AnnouncementsTable";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import SearchField from "../../../../components/common/searchField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import { supabase } from "../../../../supabaseClient";
import { useUser } from "../../../../context/UserContext";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Performance Management" },
  { title: "Career Development" },
];

const CareerDevelopmentPage = () => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const employeeId = user?.id;

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: result } = await supabase
        .from("career_development")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      setData(result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        employee_id: employeeId,
        created_by: employeeId,
        updated_by: employeeId,
      };
      if (selectedId) {
        await supabase.from("career_development").update(payload).eq("id", selectedId);
      } else {
        await supabase.from("career_development").insert([payload]);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "title", label: "Development Plan Title" },
    { key: "current_position", label: "Current Position" },
    { key: "target_position", label: "Target Position" },
    { key: "target_date", label: "Target Date", type: "date" },
    { key: "status", label: "Status", type: "chip" },
    {
      key: "actions",
      label: "Actions",
      type: "custom",
      render: (row) => (
        <Button size="small" onClick={() => { setSelectedId(row.id); setModalOpen(true); }}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Career Development"
        items={breadcrumbItems}
        action={() => setModalOpen(true)}
        buttonTitle="New Development Plan"
        Icon={AddIcon}
      >
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <SearchField
            value={searchQuery}
            onChange={(v) => setSearchQuery(v)}
            placeholder="Search development plans..."
          />
          <DynamicTable
            columns={columns}
            data={data}
            footerInfo={`Career Development Plans: ${data.length}`}
            currentPage={page + 1}
            totalPages={Math.ceil(data.length / perPage)}
            perPage={perPage}
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>

      <Modal
        onClose={() => setModalOpen(false)}
        title={selectedId ? "Edit Development Plan" : "New Development Plan"}
        open={modalOpen}
      >
        <Formik
          initialValues={{
            title: "",
            current_position: "",
            target_position: "",
            target_date: "",
            status: "planning",
          }}
          validateOnChange={false}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <FormikInputField name="title" label="Plan Title" type="text" required />
              <FormikInputField name="current_position" label="Current Position" type="text" required />
              <FormikInputField name="target_position" label="Target Position" type="text" required />
              <FormikInputField name="target_date" label="Target Date" type="date" required />
              <FormikSelectField
                name="status"
                label="Status"
                options={[
                  { label: "Planning", value: "planning" },
                  { label: "In Progress", value: "in_progress" },
                  { label: "Completed", value: "completed" },
                  { label: "On Hold", value: "on_hold" },
                ]}
              />
              <div className="flex justify-end gap-2 mt-4">
                <SubmitButton variant="outlined" title="Cancel" type="button" onClick={() => setModalOpen(false)} />
                <SubmitButton title={selectedId ? "Update" : "Create"} type="submit" isLoading={isSubmitting} />
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </React.Fragment>
  );
};

export default CareerDevelopmentPage;
