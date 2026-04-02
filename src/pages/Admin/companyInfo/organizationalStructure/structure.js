import React, { useState } from "react";
import DesignationFormModal from "./form";
import HomeIcon from "@mui/icons-material/Home";
import TreeNode from "./treenode";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import LoadingWrapper from "../../../../components/common/LoadingWrapper";
import {
  useAddOrganizationalUnit,
  useDeleteOrganizationalUnit,
  useGetAllBranches,
  useOrganizationalUnitHierarchy,
  useUpdateOrganizationalUnit,
} from "../../../../utils/hooks/api/organizationalStructure";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Company Info" },
  { title: "Organizational Structure" },
];

const OrganizationalStructure = () => {
  const { structures, loading, refetch } = useOrganizationalUnitHierarchy();
  const { accounts } = useGetAllBranches();

  const { updateOrganizationalUnit, loading: updateLoading } =
    useUpdateOrganizationalUnit();

  const { addOrganizationalUnit, loading: addLoading } =
    useAddOrganizationalUnit();

  const { deleteOrganizationalUnit, loading: deleting } =
    useDeleteOrganizationalUnit();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [parentNode, setParentNode] = useState(null);

  const handleAdd = (parent) => {
    setParentNode(parent);
    setEditingNode(null);
    setModalOpen(true);
  };

  const handleEdit = (node) => {
    setEditingNode(node);
    setParentNode(null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingNode(null);
    setParentNode(null);
  };

  const onDelete = async (node) => {
    await deleteOrganizationalUnit(node.id);
    refetch();
  };

  const handleFormSubmit = async (values) => {
    const { not_active, ...rest } = values;

    const payload = {
      ...rest,
      company_id: editingNode?.company_id || parentNode?.company_id || 1,
      head_id: editingNode?.head_id || parentNode?.head_id || null,
      parent_id: editingNode?.parent_id || parentNode?.id || null,
      status: not_active ? "inactive" : "active",
    };

    if (editingNode && editingNode.id) {
      await updateOrganizationalUnit(editingNode.id, payload);
    } else {
      await addOrganizationalUnit(payload);
    }

    setModalOpen(false);
    setEditingNode(null);
    setParentNode(null);
    refetch();
  };

  const handleAddNew = () => {
    setEditingNode(null);
    setParentNode(null);
    setModalOpen(true);
  };

  return (
    <PageWrapperWithHeading
      title="Organizational Structure"
      items={breadcrumbItems}
      // action={handleAddNew}
      // buttonTitle='+ Add Unit'
      loading={loading}
    >
      <div className="bg-white p-6 rounded-md shadow-sm">
        <LoadingWrapper isLoading={loading}>
          {structures.map((structure) => (
            <TreeNode
              key={structure.id}
              node={structure}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={onDelete}
              deleting={deleting}
            />
          ))}
        </LoadingWrapper>
        <DesignationFormModal
          open={modalOpen}
          handleClose={handleClose}
          initialData={editingNode || {}}
          isEdit={!!editingNode}
          accounts={accounts}
          loading={addLoading || updateLoading}
          handleFormSubmit={handleFormSubmit}
        />
      </div>
    </PageWrapperWithHeading>
  );
};

export default OrganizationalStructure;
