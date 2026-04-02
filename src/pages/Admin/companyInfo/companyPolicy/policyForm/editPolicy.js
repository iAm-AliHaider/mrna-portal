import React from "react";
import { useParams } from "react-router-dom";
import { usePolicyById } from "../../../../../utils/hooks/api/policy";
import PolicyForm from "./index";

const EditPolicy = () => {
  const params = useParams();
  const policyId = params.id;
  const { data, loading } = usePolicyById(policyId);

  if (loading) return <div>Loading...</div>;

  return <PolicyForm data={data} />;
};

export default EditPolicy;
