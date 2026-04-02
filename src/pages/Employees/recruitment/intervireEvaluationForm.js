import React, { useMemo, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import FormikInputField from "../../../components/common/FormikInputField";
import FormikCheckbox from "../../../components/common/FormikCheckbox";
import FormikRadioGroup from "../../../components/common/RadioGroup";
import SubmitButton from "../../../components/common/SubmitButton";
import InputField from "../../../components/common/FormikInputField/Input";
import { useBranch } from '../../../utils/hooks/api/branches';

const evaluationFields = [
  { name: "appearance_and_tidy", label: "Appearance and tidiness" },
  { name: "tact_talking_listening", label: "Tact in talking and listening" },
  { name: "leadership_personality", label: "Leadership personality" },
  { name: "english_language", label: "English language" },
  {
    name: "readiness_any_location",
    label: "Readiness to work at any location",
  },
  {
    name: "readiness_another_task",
    label: "Readiness to accept another job's tasks",
  },
  { name: "experience_for_vacant_job", label: "Experience for vacant job" },
  { name: "applicability_vacant_job", label: "Applicability for vacant job" },
  { name: "criticism_acceptance", label: "Criticism reaction acceptance" },
  { name: "self_control", label: "Applicability of self-control" },
];

const recommendationOptions = [
  { label: "Suitable for recruitment", value: "suitable_now" },
  { label: "Suitable in the future", value: "suitable_future" },
  //   { label: "Interviewed, refer to", value: "interviewed_refer" },
  //   { label: "Need another interview", value: "need_another_interview" },
  { label: "Rejected", value: "rejected" },
];

const questions = [
  {
    en: "Tell me about yourself.",
    ar: "تحدث عن نفسك",
  },
  {
    en: "What do you know about our company?",
    ar: "ماذا تعرف عن شركتنا؟",
  },
  {
    en: "Why do you want to work for us?",
    ar: "لماذا ترغب في العمل معنا؟",
  },
  {
    en: "What unique qualities or abilities would you bring to this job?",
    ar: "ما هي المؤهلات أو الإمكانيات المميزة التي ستضيفها لهذه الوظيفة؟",
  },
  {
    en: "What are your major strengths and weaknesses?",
    ar: "ما هي نقاط قوتك وضعفك الرئيسية؟",
  },
  {
    en: "How long do you plan to stay at our company? Where do you see yourself in five years?",
    ar: "إلى متى تخطط أن تبقى في شركتنا؟ وأين ترى نفسك في الخمس سنوات القادمة؟",
  },
  {
    en: "Tell me about a time that you failed at something and what you did afterwards.",
    ar: "احكِ لي عن موقف فشلت فيه، وماذا فعلت بعده؟",
  },
  {
    en: "Describe a time when you worked on a team project. What was your relative position on the team? Were you satisfied with your contribution? How could it have been better?",
    ar: "اذكر موقفًا عملت فيه مع مجموعة ضمن مشروع ما. ما هي وظيفتك في هذه المجموعة؟ هل كنت راضيًا عن دورك في المجموعة؟ كيف يمكن أن يكون أداؤك أفضل؟",
  },
  {
    en: "Why did you choose your school and course of study?",
    ar: "لماذا اخترت هذه المدرسة وهذا التخصص الدراسي؟",
  },
  {
    en: "Think back to a situation in which you had to resolve a conflict. Tell me how you did it.",
    ar: "فكر بموقف كان عليك أن تحل فيه نزاعًا، كيف قمت بذلك؟",
  },
  {
    en: "Tell me about a project that you had either at work or school. Describe in detail how you managed it and what was the outcome.",
    ar: "احكِ لي عن مشروع عملت عليه سواء أثناء الدراسة أو عملك. كيف أدرته وما كانت النتائج؟",
  },
  {
    en: "What salary are you expecting?",
    ar: "ما هو الراتب الذي تتوقعه؟",
  },
  {
    en: "What other types of jobs or companies are you considering?",
    ar: "ما هي الوظائف أو الشركات الأخرى التي تفكر فيها؟",
  },
  {
    en: "Have you any questions for us?",
    ar: "هل لديك أي سؤال لنا؟",
  },
];

const InterviewEvaluationForm = ({
  onSubmit,
  initialValues = {},
  interviewerName,
  readOnly = false,
  interviewType = "",
  interviewUrl = "",
  interviewLocation = ""
}) => {
  const validationSchema = Yup.object({
    ...Object.fromEntries(
      evaluationFields.map((field) => [
        field.name,
        Yup.number().min(0).max(5).required("Required"),
      ])
    ),
    recommendation: Yup.string().required("Required"),
    rejected_reason: Yup.string().when("recommendation", {
      is: "rejected",
      then: (schema) => schema.required("Reason is required"),
      otherwise: (schema) => schema.optional(),
    }),
  });

    const [isJobOffer, setIsJobOffer] = useState(false);


  const defaultValues = useMemo(() => {
    const base = {};
    evaluationFields.forEach(
      (f) => (base[f.name] = initialValues[f.name] || 0)
    );
    return {
      ...base,
      recommendation: initialValues.recommendation || "",
      rejected_reason: initialValues.rejected_reason || "",
      positive_points: initialValues.positive_points || "",
      negative_points: initialValues.negative_points || "",
      remarks: initialValues.remarks || "",
      interviewer: interviewerName || "",
    };
  }, [initialValues, interviewerName]);


  const computeScore = (values) => {
    const total = evaluationFields.reduce(
      (sum, f) => sum + Number(values[f.name] || 0),
      0
    );
    let grade = "Poor";
    if (total >= 46) grade = "Excellent";
    else if (total >= 40) grade = "Very Good";
    else if (total >= 30) grade = "Good";
    else if (total >= 20) grade = "Fair";
    return { total, grade };
  };


  const { data: branchData } = useBranch(interviewType === 'physical' && interviewLocation ? interviewLocation : null);

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={validationSchema}
      onSubmit={(values, actions) => {
        const { total, grade } = computeScore(values);
        const finalNote = {
          ...values,
          total_score: total,
          grade,
        };
        onSubmit(finalNote, actions, isJobOffer);
      }}
    >
      {({ values }) => {
        const { total, grade } = computeScore(values);
        return (
          <Form className="space-y-4 overflow-y-auto max-h-[75vh] pr-2 scrollbar-hide">
            <div className="grid grid-cols-2 gap-4">
              {evaluationFields.map((field) => (
                <FormikInputField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  type="number"
                  min={0}
                  max={5}
                  required
                  readOnly={readOnly}
                />
              ))}
            </div>

            <div className="text-sm font-medium">
              Total Score: <span className="font-bold">{total}</span> | Grade:{" "}
              <span className="font-bold">{grade}</span>
            </div>

            <FormikRadioGroup
              name="recommendation"
              label="Recommendation"
              options={recommendationOptions}
              required
              disabled={readOnly}
            />

            {values.recommendation === "rejected" && (
              <FormikInputField
                name="rejected_reason"
                label="Rejection Reason"
                type="textarea"
                rows={3}
                required
                readOnly={readOnly}
              />
            )}

             
             
          {values.recommendation === "suitable_now" && !readOnly && (
  <FormikCheckbox
    name="isJobOffer"
    label="Create Job Offer Task"
    checked={isJobOffer}
    handleChange={(val) => setIsJobOffer(val)}
  />
)}

            <FormikInputField
              name="positive_points"
              label="Positive Points"
              type="textarea"
              readOnly={readOnly}
            />

            <FormikInputField
              name="negative_points"
              label="Negative Points"
              type="textarea"
              readOnly={readOnly}
            />

            <FormikInputField name="remarks" label="Remarks" type="textarea" />

            <FormikInputField
              name="interviewer"
              label="Interviewer"
              type="text"
              readOnly={readOnly}
            />

            {interviewType && (
                        <div>
              <InputField
              value = {interviewType}
                label="Interview Type"
                type="text"
                readOnly
              />
              </div>
            )}

            {interviewType === 'online' && interviewUrl && (
              <div>
                <InputField
                value = {interviewUrl}
                  label="Interview URL"
                  type="url"
                  readOnly
                />
              </div>
            )}
            
            {interviewType === 'physical' && interviewLocation && (
              <div>
                <InputField
                value={branchData?.name || interviewLocation}
                  label="Interview Location"
                  type="text"
                  readOnly
                />
              </div>
            )}
           


            <div className="p-4 space-y-4 bg-white rounded shadow">
              <h2 className="text-xl font-bold text-center">
                Standard Interview Questions
              </h2>
              <div className="space-y-2">
                {questions?.map((q, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b pb-2"
                  >
                    <div className="w-1/2 text-left text-sm">{`${index + 1}. ${
                      q.en
                    }`}</div>
                    <div className="w-1/2 text-right text-sm font-[Almarai]">
                      {q.ar}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!readOnly && (
              <div className="text-right">
                <SubmitButton label="Submit Evaluation" />
              </div>
            )}
          </Form>
        );
      }}
    </Formik>
  );
};

export default InterviewEvaluationForm;
