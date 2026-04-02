import React, { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useGetUnitChildrens } from "../../../../utils/hooks/api/organizationalStructure";
import { supabase } from "../../../../supabaseClient";

const TreeNode = ({
  node,
  onAdd,
  onEdit,
  onDelete,
  deleting,
  isDashboardView = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { childrens, loading, fetchChildrens } = useGetUnitChildrens();
  const [candidates, setCandidates] = useState([]);

  const handleToggle = async (e) => {
    e.stopPropagation();

    if (!expanded && !childrens && fetchChildrens) {
      // try {
      // console.log("hello------ id", node.id);
      await fetchChildrens(node.id);
      // console.log("hello------data", childrens);
      // } catch (error) {
      //   console.error("Failed to fetch children:", error);
      // }
    }

    setExpanded(!expanded);
  };

  const getCandidateName = (candidate) => {
    // console.log("candidate names", candidate);
    if (!candidate) return "No Name";
    return [
      candidate.first_name,
      candidate.second_name,
      candidate.third_name,
      candidate.forth_name,
      candidate.family_name,
    ]
      .filter(Boolean) // remove null/empty
      .join(" ");
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select(
          "id, first_name, second_name, third_name, forth_name, family_name"
        )
        .eq("is_deleted", false)
        .eq("is_employee", true);

      if (error) {
        console.error("Error fetching candidates:", error);
        return;
      }
      // console.log("data check manager=====", data);
      setCandidates(data);
    };

    fetchCandidates();
  }, []);

  useEffect(() => {
  }, [childrens]);

  const childrenArray = Array.isArray(childrens) ? childrens : [];

  const sortedChildren = [...childrenArray].sort((a, b) => {
    const aIsManager = a.role_columns?.roles?.includes("manager");
    const bIsManager = b.role_columns?.roles?.includes("manager");

    if (aIsManager && !bIsManager) return -1;
    if (!aIsManager && bIsManager) return 1;
    return 0;
  });

  return (
    <div className="ml-4 mt-2">
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={handleToggle}
          className="mr-1 h-6 w-6 rounded border flex items-center justify-center"
          disabled={loading}
        >
          {loading ? "…" : expanded ? "−" : "+"}
        </button>

        <span className="font-medium text-gray-800 group-hover:text-primary transition">
          {node.name}
        </span>

        {/* {hovered && !isDashboardView && (
          <div className='flex gap-2 ml-2 text-gray-500'>
            <button onClick={() => onAdd(node)}>
              <AddIcon sx={{ fontSize: 16 }} />
            </button>
            <button onClick={() => onEdit(node)}>
              <EditIcon sx={{ fontSize: 16 }} />
            </button>
            <button onClick={() => onDelete(node)} disabled={deleting}>
              {deleting ? '…' : <DeleteIcon sx={{ fontSize: 16 }} />}
            </button>
          </div>
        )} */}
      </div>

      {expanded && childrens && (
        // <div className="mt-1 ml-4 border-l border-gray-300 pl-2">
        //   {childrens.map((child) => (
        //     <>
        //       <TreeNode
        //         key={child.id}
        //         node={child}
        //         onAdd={onAdd}
        //         onEdit={onEdit}
        //         onDelete={onDelete}
        //         deleting={deleting}
        //         isDashboardView={isDashboardView}
        //       />
        //     </>
        //   ))}
        // </div>
        <div className="pl-8">
          {sortedChildren.some((c) =>
            c.role_columns?.roles?.includes("admin")
          ) && (
            <div>
              <strong className="text-[14px]">Admin</strong>
              <ul className="ml-4">
                {sortedChildren
                  .filter((c) => c.role_columns?.roles?.includes("admin"))
                  .map((c) => {
                    const candidate = candidates.find(
                      (can) => can.id === c.candidate_id
                    );
                    return (
                      <li key={c.id} className="text-[14px]">
                        {c.employee_code} - {getCandidateName(candidate)}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
          {sortedChildren.some((c) =>
            c.role_columns?.roles?.includes("hr_manager")
          ) && (
            <div>
              <strong className="text-[14px]">HR Manager</strong>
              <ul className="ml-4">
                {sortedChildren
                  .filter((c) => c.role_columns?.roles?.includes("hr_manager"))
                  .map((c) => {
                    const candidate = candidates.find(
                      (can) => can.id === c.candidate_id
                    );
                    return (
                      <li key={c.id} className="text-[14px]">
                        {c.employee_code} - {getCandidateName(candidate)}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          {sortedChildren.some((c) =>
            c.role_columns?.roles?.includes("hr")
          ) && (
            <div>
              <strong className="text-[14px]">HR</strong>
              <ul className="ml-4">
                {sortedChildren
                  .filter((c) => c.role_columns?.roles?.includes("hr"))
                  .map((c) => {
                    const candidate = candidates.find(
                      (can) => can.id === c.candidate_id
                    );
                    return (
                      <li key={c.id} className="text-[14px]">
                        {c.employee_code} - {getCandidateName(candidate)}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          {/* Managers */}
          {sortedChildren.some((c) =>
            c.role_columns?.roles?.includes("manager")
          ) && (
            <div>
              <strong className="text-[14px]">Manager</strong>
              <ul className="ml-4">
                {sortedChildren
                  .filter((c) => c.role_columns?.roles?.includes("manager"))
                  .map((c) => {
                    const candidate = candidates.find(
                      (can) => can.id === c.candidate_id
                    );
                    return (
                      <li key={c.id} className="text-[14px]">
                        {c.employee_code} - {getCandidateName(candidate)}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          {/* Employees */}
          {sortedChildren.some(
            (c) =>
              c.role_columns?.roles?.includes("employee") &&
              !c.role_columns?.roles?.includes("manager") &&
              !c.role_columns?.roles?.includes("hr_manager") &&
              !c.role_columns?.roles?.includes("hr") &&
              !c.role_columns?.roles?.includes("admin")
          ) && (
            <div className="mt-2">
              <strong className="text-[14px]">Employee</strong>
              <ul className="ml-4">
                {sortedChildren
                  .filter(
                    (c) =>
                      c.role_columns?.roles?.includes("employee") &&
                      !c.role_columns?.roles?.includes("manager") &&
                      !c.role_columns?.roles?.includes("hr_manager") &&
                      !c.role_columns?.roles?.includes("hr") &&
                      !c.role_columns?.roles?.includes("admin")
                  )
                  .map((c) => {
                    const candidate = candidates.find(
                      (can) => can.id === c.candidate_id
                    );
                    return (
                      <li key={c.id} className="text-[14px]">
                        {c.employee_code} - {getCandidateName(candidate)}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
