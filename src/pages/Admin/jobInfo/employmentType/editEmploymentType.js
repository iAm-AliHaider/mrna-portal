import React from "react";
import { useParams } from "react-router-dom";
import { useEmploymentTasksById, useEmploymentTypesById } from "../../../../utils/hooks/api/employmentType";
import EmploymentTypeForm from "./form";

const EditEmploymentType = () => {
  const params = useParams();
  const employementId = params?.id;
    const { data, loading } = useEmploymentTypesById(employementId);

  if (loading) return <div>Loading...</div>;

  return <EmploymentTypeForm data={data} />;
};

export default EditEmploymentType;
