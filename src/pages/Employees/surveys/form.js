import React, { useEffect, useState } from "react";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import FormikSelectField from "../../../components/common/FormikSelectField";
import FormikInputField from "../../../components/common/FormikInputField";
import { useUser } from "../../../context/UserContext";
import { supabase } from "../../../supabaseClient";
import PageWrapperWithHeading from "../../../components/common/PageHeadSection";
import FormikCheckbox from "../../../components/common/FormikCheckbox";
import {
  SURVEY_PRIORITY,
  SURVEY_TYPES,
  SURVEYS_OPTIONS,
} from "../../../utils/constants";
import CheckboxField from "../../../components/common/FormikCheckbox/CheckboxField";

const SurveyForm = ({ data, isView, handleClose, modalView = false }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const isEditMode = data && data.id;

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const initialValues = {
    survey_name: data?.survey_name || "",
    survey_type: data?.survey_type || "",
    priority: data?.priority || "",
    status: data?.status || "",
    department_id: String(data?.department_id) || "",
    created_by_id: user?.id,
    group_by: data?.group_by || "",
    questions: isView
      ? data?.survey_assignments?.[0]?.survey_response?.map((q) => ({
          question: q?.question || q?.question_text,
          options: Array.isArray(q.options)
            ? q.options.map((opt) =>
                typeof opt === "string"
                  ? { title: opt, selection: false }
                  : {
                      title: opt.title || "",
                      selection: opt.selection || false,
                    }
              )
            : [{ title: "", selection: false }],
        })) || [
          {
            question: "",
            options: [
              { title: "", selection: false },
              { title: "", selection: false },
            ],
          },
        ]
      : data?.survey_questions?.map((q) => ({
          question: q.question_text,
          options: Array.isArray(q.options)
            ? q.options.map((opt) =>
                typeof opt === "string"
                  ? { title: opt, selection: false }
                  : {
                      title: opt.title || "",
                      selection: opt.selection || false,
                    }
              )
            : [{ title: "", selection: false }],
        })) || [
          {
            question: "",
            options: [
              { title: "", selection: false },
              { title: "", selection: false },
            ],
          },
        ],
  };

  const validationSchema = Yup.object().shape({
    survey_name: Yup.string().required("Name is required"),
    survey_type: Yup.string().required("Survey type is required"),
    priority: Yup.string().required("Priority is required"),
    department_id: Yup.string().required("Department is required"),
    status: Yup.string().required("Status is required"),
    questions: Yup.array()
      .of(
        Yup.object().shape({
          question: Yup.string().required("Question is required"),
          options: Yup.array()
            .of(
              Yup.object().shape({
                title: Yup.string().required("Option is required"),
                selection: Yup.boolean(),
              })
            )
            .min(2, "At least two option is required")
            .max(10, "Maximum 10 options allowed")
            .test(
              "at-least-one-selected",
              "At least one option must be selected",
              (options) => options.some((option) => option.selection)
            ),
        })
      )
      .min(1, "At least one question is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    const { created_by_id, questions, ...rest } = values;

    setSubmitting(true);
    try {
      // Check if validation has failed manually
      const hasSelectionError = values.questions.some(
        (q) => !q.options.some((opt) => opt.selection)
      );

      if (hasSelectionError) {
        toast.error("Please select at least one option for each question.");
        setSubmitting(false);
        return;
      }
      const payload = {
        employee_id: values.created_by_id,
        survey_id: isEditMode,
        assigned_date: new Date().toISOString(),
        response_status: "assigned",
        survey_response: questions.map((q) => ({
          question: q.question,
          options: q.options.map((opt) => ({
            title: opt.title,
            selection: !!opt.selection,
          })),
        })),
      };

      const { error } = await supabase
        .from("survey_assignments")
        .insert([payload]);

      if (error) throw new Error("Survey created failed: " + error.message);

      toast.success("Survey created successfully!");
      if(modalView) {
        handleClose();
      } else {
        navigate(-1);
      }
    } catch (err) {
      toast.error("Survey created error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      const { data, error } = await supabase
        .from("organizational_units")
        .select("id, name")
        .order("name", { ascending: true });

      if (!error && data) {
        setDepartments(
          data.map((d) => ({ label: d.name, value: d.id.toString() }))
        );
      } else {
        toast.error("Failed to load departments: " + error?.message);
      }
      setLoadingDepartments(false);
    };

    fetchDepartments();
  }, []);

  const breadcrumbItems = [
    { href: "/home", icon: HomeIcon },
    { title: "Company Info", href: "#" },
    { title: "Surveys" },
  ];

  return (
    <PageWrapperWithHeading title="Surveys" items={breadcrumbItems}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form className="flex flex-col gap-4 mt-4">
            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
              <div className="grid grid-cols-3 gap-4">
                <FormikInputField
                  label="Name"
                  name="survey_name"
                  required={!isEditMode}
                  disabled={isEditMode}
                />
                <FormikSelectField
                  label="Survey Type"
                  name="survey_type"
                  options={SURVEY_TYPES}
                  required={!isEditMode}
                  disabled={isEditMode}
                />
                <FormikSelectField
                  label="Priority"
                  name="priority"
                  options={SURVEY_PRIORITY}
                  required={!isEditMode}
                  disabled={isEditMode}
                />
                <FormikSelectField
                  label="Department"
                  name="department_id"
                  options={departments}
                  required={!isEditMode}
                  disabled={isEditMode || loadingDepartments}
                />
                <FormikSelectField
                  label="Status"
                  name="status"
                  options={SURVEYS_OPTIONS}
                  required={!isEditMode}
                  disabled={isEditMode}
                />
              </div>

              <hr className="my-4" />

              <FieldArray name="questions">
                {({ push: pushQuestion, remove: removeQuestion }) => (
                  <>
                    {!isEditMode && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Questions</span>
                        <Button
                          variant="outlined"
                          size="small"
                          type="button"
                          onClick={() =>
                            pushQuestion({
                              question: "",
                              options: [
                                { title: "", selection: false },
                                { title: "", selection: false },
                              ],
                            })
                          }
                        >
                          Add Question
                        </Button>
                      </div>
                    )}

                    {values.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="mb-4 p-3 bg-white rounded shadow-sm border"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            Question {idx + 1}
                          </span>
                          {!isEditMode && values.questions.length > 1 && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              type="button"
                              onClick={() => removeQuestion(idx)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <FormikInputField
                          label={!isView && !isEditMode ? "Question text" : ""}
                          name={`questions[${idx}].question`}
                          required={!isEditMode}
                          disabled={isEditMode}
                        />

                        <FieldArray name={`questions[${idx}].options`}>
                          {({ push: pushOption, remove: removeOption }) => (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {q?.options?.map((_, optIdx) => {
                                return (
                                  <div
                                    key={optIdx}
                                    className="flex items-center gap-4"
                                  >
                                    <div
                                      className="w-full"
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "8% 92%",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div style={{ marginTop: "-5px" }}>
                                        <CheckboxField
                                          name={`questions[${idx}].options[${optIdx}].selection`}
                                          checked={
                                            !!q.options[optIdx].selection
                                          }
                                          onChange={(e, checked) => {
                                            // set only the clicked one to true; all others false
                                            q.options.forEach((_, i) => {
                                              setFieldValue(
                                                `questions[${idx}].options[${i}].selection`,
                                                i === optIdx ? checked : false
                                              );
                                            });
                                          }}
                                          className="w-20 mt-0"
                                          disabled={isView}
                                        />
                                      </div>
                                      <FormikInputField
                                        name={`questions[${idx}].options[${optIdx}].title`}
                                        placeholder={`Option ${optIdx + 1}`}
                                        disabled={isEditMode}
                                        className="flex-1"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                              {!isEditMode && q.options.length < 10 && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  type="button"
                                  onClick={() =>
                                    pushOption({ title: "", selection: false })
                                  }
                                >
                                  Add Option
                                </Button>
                              )}
                            </div>
                          )}
                        </FieldArray>
                      </div>
                    ))}
                  </>
                )}
              </FieldArray>
            </div>

            {isEditMode && !isView && (
              <div className="mt-4 sticky bottom-0 flex justify-end">
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  Submit
                </Button>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </PageWrapperWithHeading>
  );
};

export default SurveyForm;
