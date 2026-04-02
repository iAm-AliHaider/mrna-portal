import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  useCompanyObjectives,
  useEmployeeObjectives,
  useSubmitAppraisal,
} from "../../../../../utils/hooks/api/appraisal";
import FormikInputField from "../../../../../components/common/FormikInputField";
import SubmitButton from "../../../../../components/common/SubmitButton";
import {
  TrendingUp as TrendingUpIcon,
  Business as BuildingOfficeIcon,
  Person as UserIcon,
  ChatBubbleOutline as ChatBubbleLeftRightIcon,
} from "@mui/icons-material";
import ScoreCalculator from "./scoreCalculator";
import ObjectiveCard from "./objectiveCard";
import FormikSelectField from "../../../../../components/common/FormikSelectField";
import { useGenericFlowEmployees } from "../../../../../utils/hooks/api/genericApprovalFlow";

const appraisalMethods = [
  {
    value: "percentage",
    label: "Percentage",
  },
  {
    value: "amount",
    label: "Amount",
  },
];

const AppraisalsReviewPage = () => {
  const { id } = useParams();
  const appraisalId = Number(id);
  const navigate = useNavigate();

  const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();

  const { objectives: compObjs, loading: compLoading } = useCompanyObjectives();
  const {
    objectives: empObjs,
    appraisal,
    loading: empLoading,
  } = useEmployeeObjectives(appraisalId);
  const { submit, loading: subLoading } = useSubmitAppraisal();
  // const [appraisalRate, setAppraisalRate] = useState("amount");

  const loadingAll = compLoading || empLoading;

  // Memoized objectives transformation
  // const allObjectives = useMemo(
  //   () => [
  //     ...compObjs?.map((o) => ({
  //       id: o.id,
  //       objective_title: o.objective_title,
  //       weight: o.weight,
  //       score: o.score,
  //       type: "company",
  //     })),
  //     ...empObjs?.map((o) => ({
  //       id: o.id,
  //       objective_title: o.objective_title,
  //       weight: o.weight,
  //       score: o.score,
  //       type: "employee",
  //     })),
  //   ],
  //   [compObjs, empObjs]
  // );
  const allObjectives = useMemo(
    () => [
      ...compObjs?.map((o) => ({
        id: o.id,
        objective_title: o.objective_title,
        weight: o.weight,
        score: o.score,
        type: "company",
        is_probation: o.is_probation, // 👈 include this
      })),
      ...empObjs?.map((o) => ({
        id: o.id,
        objective_title: o.objective_title,
        weight: o.weight,
        score: o.score,
        type: "employee",
        is_probation: o.is_probation, // 👈 include this
      })),
    ],
    [compObjs, empObjs]
  );

  // Memoized form configuration
  const { initialValues, validationSchema } = useMemo(() => {
    const filteredObjectives = allObjectives.filter((objective) => {
      if (
        objective?.is_probation &&
        appraisal?.employees?.employment_type_id !== 24
      ) {
        return false;
      }
      return true;
    });

    const scores = filteredObjectives?.reduce(
      (acc, o) => ({ ...acc, [o.id]: "" }),
      {}
    );

    const scoreValidation = filteredObjectives?.reduce((shape, o) => {
      const maxScore = o.score || 100;
      shape[o.id] = Yup.number()
        .typeError("Must be a number")
        .required("Score is required")
        .min(0, "Minimum score is 0")
        .max(maxScore, `Maximum score is ${maxScore}`);
      return shape;
    }, {});

    return {
      initialValues: {
        scores,
        comments: "",
        appraisal_method: appraisal?.appraisal_method || "",
        appraisal_percentage: appraisal?.appraisal_percentage || "",
        appraisal_amount: appraisal?.appraisal_amount || "",
      },
      validationSchema: Yup.object({
        scores: Yup.object(scoreValidation),
        comments: Yup.string()
          .max(1000, "Comments must be less than 1000 characters")
          .required("Comments are required"),

        appraisal_method: Yup.string()
          .oneOf(["percentage", "amount"], "Invalid appraisal method")
          .required("Appraisal method is required"),

        appraisal_percentage: Yup.number()
          .nullable()
          .when("appraisal_method", {
            is: "percentage",
            then: (schema) =>
              schema
                .typeError("Percentage must be a number")
                .required("Percentage is required")
                .min(1, "Minimum is 1%")
                .max(100, "Maximum is 100%"),
            otherwise: (schema) => schema.notRequired(),
          }),

        appraisal_amount: Yup.number()
          .nullable()
          .when("appraisal_method", {
            is: "amount",
            then: (schema) =>
              schema
                .typeError("Amount must be a number")
                .required("Amount is required")
                .min(1, "Minimum amount must be greater than 0"),
            otherwise: (schema) => schema.notRequired(),
          }),
      }),
    };
  }, [allObjectives, appraisal]);

  if (loadingAll) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
        <p className="text-gray-600">Loading objectives...</p>
      </div>
    );
  }

  const handleSubmit = async (values) => {
    try {
      const assessment = allObjectives?.map((objective) => ({
        objective_id: objective?.id,
        type: objective?.type,
        weight: objective?.weight,
        objective_title: objective?.objective_title,
        reviewer_score: Number(values?.scores[objective.id]),
        score: objective?.score || 100,
        weighted_score:
          (Number(values?.scores[objective?.id]) * objective?.weight) /
          objective?.score
      }));

      await submit(
        appraisalId,
        assessment,
        values.comments,
        values.appraisal_method,
        values.appraisal_percentage,
        values.appraisal_amount,
        workflow_employees
      );
      navigate(-1);
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUpIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 capitalize">
            Performance Review {appraisal?.type ? `(${appraisal?.type})` : null}
          </h1>
        </div>
        <p className="text-gray-600">
          Employee ID: #{`${appraisal?.employees?.employee_code || "N/A"}`}
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isValid, dirty, values }) => (
          <Form className="space-y-8">
            <ScoreCalculator objectives={allObjectives} />

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Company Objectives
                </h2>
                <span className="text-sm text-gray-500">
                  ({compObjs.length} objectives)
                </span>
              </div>

              <div className="space-y-4">
                {compObjs
                  .filter((objective) => {
                    // Only show probation objectives if employee is probationary
                    // console.log("objective", objective);  
                    if (
                      objective?.is_probation &&
                      appraisal?.employees?.employment_type_id !== 24
                    ) {
                      return false;
                    }
                    return true;
                  })
                  .map((objective) => {
                    
                    return <ObjectiveCard
                      key={`company-${objective.id}`}
                      objective={objective}
                      type="company"
                    />;
                  })}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <UserIcon className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Employee Objectives
                </h2>
                <span className="text-sm text-gray-500">
                  ({empObjs.length} objectives)
                </span>
              </div>

              <div className="space-y-4">
                {empObjs.map((objective) => (
                  <ObjectiveCard
                    key={`employee-${objective.id}`}
                    objective={objective}
                    type="employee"
                  />
                ))}
              </div>
              <div className="mt-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormikSelectField
                    name="appraisal_method"
                    label="Rate of Appraisal"
                    options={appraisalMethods}
                    placeholder="Select Appraisal Rate"
                    type="text"
                  />

                  {values?.appraisal_method === "percentage" ? (
                    <FormikInputField
                      name="appraisal_percentage"
                      label="Percentage"
                      type="text"
                    />
                  ) : (
                    <FormikInputField
                      name="appraisal_amount"
                      label="Amount"
                      type="text"
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Reviewer Comments
                </h2>
              </div>

              <FormikInputField
                name="comments"
                rows={4}
                placeholder="Provide detailed feedback, areas of improvement, and recognition..."
                required
              />
            </section>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {!isValid && dirty && (
                    <span className="text-red-600">
                      Please complete all required fields
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <SubmitButton
                    title={"Submit Review"}
                    type="submit"
                    isLoading={subLoading}
                    className="px-8 py-2"
                  />
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AppraisalsReviewPage;
