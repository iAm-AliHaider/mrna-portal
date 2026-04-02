import React from "react";
import ApartmentIcon from "@mui/icons-material/Apartment";
import OrganizationalStructure from "../../Admin/companyInfo/organizationalStructure/structure";
import TreeNode from "../../Admin/companyInfo/organizationalStructure/treenode";
import LoadingWrapper from "../../../components/common/LoadingWrapper";
import { useOrganizationalUnitHierarchy } from "../../../utils/hooks/api/organizationalStructure";
import { useNavigate } from "react-router-dom";

const OrganizationalCard = () => {
  const navigate = useNavigate();
  const { structures, loading, refetch } = useOrganizationalUnitHierarchy()
  return (
    <div className="bg-white rounded-xl shadow border w-full">
      {/* Header */}
      <div className="bg-primary px-4 py-3 rounded-t-lg text-center text-white text-sm font-semibold mb-3">
        Organizational Structure
      </div>

      {/* Body */}
      <div className="py-5 px-2">
      <LoadingWrapper isLoading={loading}>
          {structures.map(structure => (
            <TreeNode
              key={structure.id}
              node={structure}
              isDashboardView
            />
          ))}
        </LoadingWrapper>
      <div className="pt-3 text-center">
          <button onClick={() => navigate('/admin/company-info/org-structure')} className="text-indigo-600 text-sm hover:underline">See Listing</button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationalCard;
