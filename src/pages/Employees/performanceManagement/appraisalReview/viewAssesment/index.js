import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetAppraisalsById } from "../../../../../utils/hooks/api/appraisal";

const PRIMARY = {
  gradient: "from-primary to-primary/70",
  text: "text-primary",
  bg: "bg-primary/10",
};

const StatusBadge = ({ status }) => {
  let cls = "bg-gray-100 text-gray-600";
  if (status === "Reviewed") cls = `${PRIMARY.bg} ${PRIMARY.text}`;
  if (status === "Cancelled") cls = "bg-yellow-100 text-yellow-800";
  return (
    <span
      className={`${cls} px-3 py-1 rounded-full text-sm font-medium uppercase`}
    >
      {status}
    </span>
  );
};

const ScoreSummary = ({ overallScore }) => (
  <div className="flex items-center gap-2">
    <div className="text-gray-600">Total Score:</div>
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full font-semibold ${PRIMARY.text} ${PRIMARY.bg}`}
    >
      {overallScore?.toFixed(1)}%
    </span>
  </div>
);

const ObjectiveCard = ({ obj }) => {
  const [open, setOpen] = useState(true);
  const pct = (obj?.reviewer_score / obj?.score) * 100;
  const weighted = (pct * obj?.weight) / 100;

  return (
    <div className="border border-indigo-200 rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">{obj?.objective_title}</span>
          <span className="text-xs text-gray-500">({obj?.type})</span>
        </div>
        <span className="inline-flex items-center text-sm font-medium px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
          {obj?.weight}%
        </span>
      </button>

      {open && (
        <div className="p-4 bg-white space-y-3">
          <div className="flex justify-between text-sm text-gray-700">
            <div>
              Score:{" "}
              <span className="font-semibold">{obj?.reviewer_score}</span> /{" "}
              {obj?.score}
            </div>
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded-full bg-gradient-to-r ${PRIMARY.gradient}`}
            >
              {pct?.toFixed(1)}%
            </span>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${PRIMARY?.gradient}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="text-xs text-gray-500">
            Weighted: {weighted.toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default function ReviewAssessmentPage() {
  const { id } = useParams();
  const appraisalId = Number(id);
  const { appraisal: data, loading } = useGetAppraisalsById(appraisalId);

  const companyObjs = useMemo(
    () => data?.assessment?.filter((o) => o.type === "company") || [],
    [data]
  );
  const employeeObjs = useMemo(
    () => data?.assessment?.filter((o) => o.type === "employee") || [],
    [data]
  );

  const overallScore = useMemo(() => {
    const all = [...companyObjs, ...employeeObjs];
    if (!all.length) return 0;
    const totalW = all?.reduce((s, o) => s + o?.weight, 0);
    const sumW = all?.reduce((s, o) => {
      const pct = (o?.reviewer_score / o?.score) * 100;
      return s + (pct * o?.weight) / 100;
    }, 0);
    return totalW ? (sumW / totalW) * 100 : 0;
  }, [companyObjs, employeeObjs]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {data?.type ? `(${data?.type}) ` : null}Review #
            {data?.employee?.employee_code} —{" "}
            {data?.employee?.candidates?.first_name}{" "}
            {data?.employee?.candidates?.family_name}
          </h1>
          <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
            <StatusBadge status={data?.status} />
            <div>
              Reviewed by: {data?.reviewer?.candidates?.first_name}{" "}
              {data?.reviewer?.candidates?.family_name}
            </div>
          </div>
        </div>
        <ScoreSummary overallScore={overallScore} />
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Company Objectives
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {companyObjs
            .filter((objective) => {
              // console.log("appraisal data", data);  
              if (
                objective?.score === 5 &&
                data?.employee?.employment_type_id !== 24
              ) {
                return false;
              }
              return true;
            })
            .map((objective) => (
              <ObjectiveCard
                key={objective.id}
                obj={objective}
              />
            ))}
          {/* {companyObjs?.map((o) => {
            return <ObjectiveCard key={o?.objective_id} obj={o} />;
          })} */}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Employee Objectives
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {employeeObjs?.map((o) => (
            <ObjectiveCard key={o?.objective_id} obj={o} />
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Employee's Appraisal
        </h3>
        <div className="flex justify-between mb-2">
          <p className="text-gray-700">
            <strong>Appraisal Rate Type: </strong>
            {data?.appraisal_method.charAt(0).toUpperCase() +
              data?.appraisal_method.slice(1) || "No comments provided."}
          </p>
          <p className="text-gray-700">
            <strong>Appraisal Rate: </strong>
            {data?.appraisal_method === "amount"
              ? data?.appraisal_amount
              : data?.appraisal_percentage + "%"}
          </p>
        </div>
      </section>
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Reviewer's Comments
        </h3>
        <p className="text-gray-700">
          {data?.comments || "No comments provided."}
        </p>
      </section>
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Employees's Response
        </h3>
        <p className="text-gray-700">
          {data?.response || "No comments provided."}
        </p>
      </section>
    </div>
  );
}
