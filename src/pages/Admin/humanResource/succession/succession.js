import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Box, Button } from "@mui/material";
import FormikInputField from "../../../../components/common/FormikInputField";
import HomeIcon from "@mui/icons-material/Home";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import { useCreateSuccessionPlanning } from "../../../../utils/hooks/api/successionPlanning";
import { useDesignations } from "../../../../utils/hooks/api/useDesignations";
import {
  useCompanyEmployeesWithoutMyId,
  useCompanyManagers,
} from "../../../../utils/hooks/api/emplyees";
import { useSuccessionPlanningTasks } from "../../../../utils/hooks/api/hiringTasks";
import { useAssignSuccessionTasks } from "../../../../utils/hooks/api/useAssignedTasks";
import { useEmployeesData } from "../../../../utils/hooks/api/emplyees";
import { useUser } from "../../../../context/UserContext";
import toast from "react-hot-toast";
import { supabase } from "../../../../supabaseClient";
import { useNavigate } from "react-router-dom";
import FormikCheckbox from "../../../../components/common/FormikCheckbox";

const initialValues = {
  position: "",
  succession_to: "",
  annual_evaluation_score: "",
  gap_analysis_and_assesment: false,
  skill_and_qualification: false,
  successor_selection: false,
  training_plan_development: false,
  course_application_and_approval: false,
  performance_review: false,
  final_certification: false,
  direct_manager_recommendation: "",
  chro_approval: "",
  md_approval: "",
};

const validationSchema = Yup.object().shape({
  position: Yup.string().required("Required"),
  succession_to: Yup.string().required("Required"),
  annual_evaluation_score: Yup.string().required("Required"),
  gap_analysis_and_assesment: Yup.boolean().required("Required"),
  skill_and_qualification: Yup.boolean().required("Required"),
  successor_selection: Yup.boolean().required("Required"),
  training_plan_development: Yup.boolean().required("Required"),
  course_application_and_approval: Yup.boolean().required("Required"),
  performance_review: Yup.boolean().required("Required"),
  final_certification: Yup.boolean().required("Required"),
  direct_manager_recommendation: Yup.string().required("Required"),
  chro_approval: Yup.string(),
  md_approval: Yup.string(),
});

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Human Resource", href: "#" },
  { title: "Succession Planing" },
];

const SuccessionPlanningForm = () => {
  const navigate = useNavigate();
  const { createSuccessionPlanning } = useCreateSuccessionPlanning();
  const stableFilters = React.useMemo(() => ({}), []);
  const { designationNames: designations } = useDesignations(
    0,
    "",
    stableFilters,
    1000
  );

  const { employees } = useCompanyEmployeesWithoutMyId();
  const { managers } = useCompanyManagers();
  const { tasks: successionTasks } = useSuccessionPlanningTasks();
  const { assignSuccessionTasks } = useAssignSuccessionTasks();
  const { data: employeesData } = useEmployeesData();
  const { user } = useUser();

  const employeeOptions = React.useMemo(() => {
    const nameCount = {};
    (employees || []).forEach((emp) => {
      const name = `${emp?.employee_code || ""} - ${
        emp.candidates?.first_name || ""
      } ${emp.candidates?.second_name || ""} ${
        emp.candidates?.third_name || ""
      } ${emp.candidates?.forth_name || ""} ${
        emp.candidates?.family_name || ""
      }`.trim();
      nameCount[name] = (nameCount[name] || 0) + 1;
    });
    return (employees || []).map((emp) => {
      let label = `${emp?.employee_code || ""} - ${
        emp.candidates?.first_name || ""
      } ${emp.candidates?.second_name || ""} ${
        emp.candidates?.third_name || ""
      } ${emp.candidates?.forth_name || ""} ${
        emp.candidates?.family_name || ""
      }`.trim();
      if (nameCount[label] > 1) label += ` (#${emp.id})`;
      return {
        label: label || `#${emp.id}`,
        value: emp.id,
        created_at: emp.created_at,
      };
    });
  }, [employees]);

  const calculateOneYearService = (employeeId) => {
    if (!employeeId) return false;
    const selectedEmployee = employeeOptions.find(
      (emp) => emp.value === employeeId
    );
    if (!selectedEmployee || !selectedEmployee.created_at) return false;
    const createdDate = new Date(selectedEmployee.created_at);
    const today = new Date();
    const oneYearAgo = new Date(
      today.getFullYear() - 1,
      today.getMonth(),
      today.getDate()
    );
    return createdDate <= oneYearAgo;
  };

  // Helper to generate initial values for dynamic tasks
  const generateInitialValues = (tasks) => {
    const values = { ...initialValues };
    (tasks || []).forEach((task) => {
      values[task.id] = "";
    });
    return values;
  };

  // Helper to generate validation schema for dynamic tasks
  const generateValidationSchema = (tasks) => {
    const shape = { ...validationSchema.fields };
    (tasks || []).forEach((task) => {
      shape[task.id] = Yup.string().required(
        "This task assignment is required"
      );
    });
    return Yup.object().shape(shape);
  };

  // Generate initial values and validation schema dynamically
  const dynamicInitialValues = React.useMemo(
    () => generateInitialValues(successionTasks),
    [successionTasks]
  );
  const dynamicValidationSchema = React.useMemo(
    () => generateValidationSchema(successionTasks),
    [successionTasks]
  );

  // Generate assignments payload using backend task IDs
  const generateSuccessionAssignedTasksPayloads = function (
    tasks,
    values,
    employeeId
  ) {
    const payloads = [];
    (tasks || []).forEach((task) => {
      const assignedToId = values[task.id];
      if (assignedToId) {
        payloads.push({
          task_id: Number(task.id),
          assigned_to_id: Number(assignedToId),
          employee_id: Number(employeeId),
          status: "assigned",
        });
      }
    });
    return payloads;
  };

  // Define implementation process task names and their static IDs
  const implementationProcessTaskNames = [
    {
      name: "gap_analysis_and_assesment_task",
      label: "Gap Analysis and Assessment",
      id: 186,
    },
    {
      name: "skill_and_qualification_task",
      label: "Skill and Qualification",
      id: 187,
    },
    { name: "successor_selection_task", label: "Successor Selection", id: 188 },
    {
      name: "training_plan_development_task",
      label: "Training Plan Development",
      id: 189,
    },
    {
      name: "course_application_and_approval_task",
      label: "Course Application and Approval",
      id: 190,
    },
    { name: "performance_review_task", label: "Performance Review", id: 191 },
    { name: "final_certification_task", label: "Final Certification", id: 192 },
  ];

  // Remove createImplementationTasks function

  const handleSubmit = async (values, { resetForm }) => {
    const selectedDesignation = designations.find(
      (d) => d.value === values.position
    );
    const selectedEmployee = employeeOptions.find(
      (e) => e.value === values.succession_to
    );
    const departmentId =
      selectedDesignation?.organizational_structure_id || null;

    const {
      position,
      succession_to,
      annual_evaluation_score,
      gap_analysis_and_assesment,
      skill_and_qualification,
      successor_selection,
      training_plan_development,
      course_application_and_approval,
      performance_review,
      final_certification,
      direct_manager_recommendation,
      chro_approval,
      md_approval,
      evaluation_completion,
      minimum_one_year_at_mrna,
      successor_consent,
      id,
      ...rest
    } = values;

    const payload = {
      position: selectedDesignation?.label || position,
      succession_to: selectedEmployee?.value || succession_to,
      annual_evaluation_score: annual_evaluation_score,
      gap_analysis_and_assesment: gap_analysis_and_assesment,
      skill_and_qualification:
        skill_and_qualification === "true" || skill_and_qualification === true,
      successor_selection:
        successor_selection === "true" || successor_selection === true,
      training_plan_development:
        training_plan_development === "true" ||
        training_plan_development === true,
      course_application_and_approval:
        course_application_and_approval === "true" ||
        course_application_and_approval === true,
      performance_review:
        performance_review === "true" || performance_review === true,
      final_certification:
        final_certification === "true" || final_certification === true,
      direct_manager_recommendation: direct_manager_recommendation,
      evaluation_completion:
        evaluation_completion === "true" || evaluation_completion === true,
      minimum_one_year_at_mrna:
        minimum_one_year_at_mrna === "true" ||
        minimum_one_year_at_mrna === true,
      successor_consent:
        successor_consent === "true" || successor_consent === true,
      chro_approval: managers?.chro_manager?.name || chro_approval,
      md_approval: managers?.md_manager?.name || md_approval,
      employee_id: user?.id || null,
    };

    try {
      await createSuccessionPlanning(payload);
      const employeeId = Number(selectedEmployee?.value);

      const implementationAssignments = Object.entries(rest).map(
        ([task_id, assignedToId]) => ({
          task_id: Number(task_id),
          assigned_to_id: Number(assignedToId),
          employee_id: Number(employeeId),
          status: "assigned",
          created_by: user?.id,
          updated_by: user?.id,
        })
      );
      await assignSuccessionTasks(implementationAssignments);
      resetForm();
      navigate("/admin/human-resource/succession-planning");
    } catch (err) {
      toast.error("Error occurred during succession plan/task assignment.");
      console.error(
        "Error in createSuccessionPlanning or assigning tasks:",
        err
      );
    }
  };

  return (
    <PageWrapperWithHeading title="Succession Planning" items={breadcrumbItems}>
      <Formik
        initialValues={{
          ...dynamicInitialValues,
          chro_approval: managers?.chro_manager?.name || "",
          md_approval: managers?.md_manager?.name || "",
        }}
        validationSchema={dynamicValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue }) => (
          <Form className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-lg shadow-sm">
              <FormikSelectField
                label="Applicable Positions"
                name="position"
                placeholder="Select"
                options={designations}
                required
              />
              <FormikSelectField
                label="Succession To"
                name="succession_to"
                placeholder="Select"
                options={employeeOptions}
                required
                onChange={(selectedValue) => {
                  setFieldValue("succession_to", selectedValue);
                  const hasOneYearService =
                    calculateOneYearService(selectedValue);
                  setFieldValue("minimum_one_year_at_mrna", hasOneYearService);
                }}
              />
            </div>

            <div className="p-4 bg-gray-100 rounded-lg shadow-sm flex flex-col gap-4">
              <Box>
                <p className="font-semibold text-md mb-4">
                  Eligibility Criteria
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <FormikInputField
                    label="Annual Evaluation Score"
                    name="annual_evaluation_score"
                  />
                  <FormikInputField
                    label="Direct Manager Recommendation"
                    name="direct_manager_recommendation"
                  />
                  <FormikCheckbox
                    label="360 Evaluation Completion"
                    name="evaluation_completion"
                    required
                  />
                  <FormikCheckbox
                    label="Minimum 1 Year Service at MRNA"
                    name="minimum_one_year_at_mrna"
                    disabled
                  />
                  <FormikCheckbox
                    label="Successor's Consent"
                    name="successor_consent"
                    required
                  />
                  <FormikInputField
                    label="CHRO Approval"
                    name="chro_approval"
                    disabled
                  />
                  <FormikInputField
                    label="MD Final Approval"
                    name="md_approval"
                    disabled
                  />
                </div>
              </Box>

              <Box>
                <p className="font-semibold text-md mb-4">
                  Implementation Process
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <FormikCheckbox
                    label="Gap Analysis and Assessment"
                    name="gap_analysis_and_assesment"
                    required
                  />
                  <FormikCheckbox
                    label="Skill and Qualification"
                    name="skill_and_qualification"
                    required
                  />
                  <FormikCheckbox
                    label="Successor Selection"
                    name="successor_selection"
                    required
                  />
                  <FormikCheckbox
                    label="Training Plan Development"
                    name="training_plan_development"
                    required
                  />
                  <FormikCheckbox
                    label="Course Application and Approval"
                    name="course_application_and_approval"
                    required
                  />
                  <FormikCheckbox
                    label="Performance Review"
                    name="performance_review"
                    required
                  />
                  <FormikCheckbox
                    label="Final Certification"
                    name="final_certification"
                    required
                  />
                </div>
              </Box>

              {/* Implementation Process Task Assignment */}
              {/* <Box>
                <p className='font-semibold text-md mb-4'>Assign Implementation Process Tasks</p>
                <div className='flex flex-col gap-6'>
                  <div className='mb-4 grid gap-2 grid-cols-2'>
                    <p className='text-sm mb-1 text-gray-800'>Gap Analysis and Assessment Task</p>
                    <FormikSelectField
                      label='Assign To'
                      name='gap_analysis_and_assesment_task'
                      placeholder='Select'
                      options={employeeOptions}
                      getOptionLabel={option => option.label}
                      selectKey='value'
                      required
                    />
                  </div>
                  <div className='mb-4 grid gap-2 grid-cols-2'>
                    <p className='text-sm mb-1 text-gray-800'>Skill and Qualification Task</p>
                    <FormikSelectField
                      label='Assign To'
                      name='skill_and_qualification_task'
                      placeholder='Select'
                      options={employeeOptions}
                      getOptionLabel={option => option.label}
                      selectKey='value'
                      required
                    />
                  </div>
                  <div className='mb-4 grid gap-2 grid-cols-2'>
                    <p className='text-sm mb-1 text-gray-800'>Successor Selection Task</p>
                    <FormikSelectField
                      label='Assign To'
                      name='successor_selection_task'
                      placeholder='Select'
                      options={employeeOptions}
                      getOptionLabel={option => option.label}
                      selectKey='value'
                      required
                    />
                  </div>
                  <div className='mb-4 grid gap-2 grid-cols-2'>
                    <p className='text-sm mb-1 text-gray-800'>Training Plan Development Task</p>
                    <FormikSelectField
                      label='Assign To'
                      name='training_plan_development_task'
                      placeholder='Select'
                      options={employeeOptions}
                      getOptionLabel={option => option.label}
                      selectKey='value'
                      required
                    />
                  </div>
                  <div className='mb-4 grid gap-2 grid-cols-2'>
                    <p className='text-sm mb-1 text-gray-800'>Course Application and Approval Task</p>
                    <FormikSelectField
                      label='Assign To'
                      name='course_application_and_approval_task'
                      placeholder='Select'
                      options={employeeOptions}
                      getOptionLabel={option => option.label}
                      selectKey='value'
                      required
                    />
                  </div>
                  <div className='mb-4 grid gap-2 grid-cols-2'>
                    <p className='text-sm mb-1 text-gray-800'>Performance Review Task</p>
                    <FormikSelectField
                      label='Assign To'
                      name='performance_review_task'
                      placeholder='Select'
                      options={employeeOptions}
                      getOptionLabel={option => option.label}
                      selectKey='value'
                      required
                    />
                  </div>
                  <div className='mb-4 grid gap-2 grid-cols-2'>
                    <p className='text-sm mb-1 text-gray-800'>Final Certification Task</p>
                    <FormikSelectField
                      label='Assign To'
                      name='final_certification_task'
                      placeholder='Select'
                      options={employeeOptions}
                      getOptionLabel={option => option.label}
                      selectKey='value'
                      required
                    />
                  </div>
                </div>
              </Box> */}

              <Box>
                <p className="font-semibold text-md mb-4">
                  Succession Tasks Assignment
                </p>
                <div className="flex flex-col gap-6">
                  {(successionTasks || []).map((task) => (
                    <div key={task.id} className="mb-4 grid gap-2 grid-cols-2">
                      <p className="text-sm mb-1 text-gray-800">
                        {task.name || task.id}
                      </p>
                      <FormikSelectField
                        label="Assign To"
                        name={task.id}
                        placeholder="Select"
                        options={employeeOptions}
                        getOptionLabel={(option) => option.label}
                        selectKey="value"
                        required
                      />
                    </div>
                  ))}
                </div>
              </Box>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="contained"
                color="primary"
                title="Submit"
                type="submit"
              >
                Submit
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </PageWrapperWithHeading>
  );
};

export default SuccessionPlanningForm;
