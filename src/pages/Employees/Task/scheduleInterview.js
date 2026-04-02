import React from "react";
import { Formik, Form } from "formik";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import * as Yup from "yup";
import FormikSelectField from "../../../components/common/FormikSelectField";
import FormikInputField from "../../../components/common/FormikInputField";
import SubmitButton from "../../../components/common/SubmitButton";

const initialValues = {
  objectiveType: "all-employee",
  companyObjective: "",
  companyObjectiveWeight: "0",
  companyObjectiveScore: "0",
  orgUnitObjective: "",
  orgUnitObjectiveWeight: "0",
  orgUnitObjectiveScore: "0",
  generalObjectivesGroup: "",
  fullBonusAmount: "",
  startDate: "01/01/2021",
  endDate: "31/12/2021",
  evaluation360: false,
  allowMultipleKPI: false,
  userCannotModifyScore: false,
};

const validationSchema = Yup.object({
  companyObjective: Yup.string().required("Required"),
  companyObjectiveWeight: Yup.string().required("Required"),
  companyObjectiveScore: Yup.string().required("Required"),
  startDate: Yup.string().required("Required"),
  endDate: Yup.string().required("Required"),
  reason: Yup.string().optional().test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
});

const SchedualeInterview = () => {
  return (
    <Box className="page-wrapper">
      <Box className="page-header">
        <Typography variant="h5" fontWeight={600}>
          Scheduled New Interview
        </Typography>
      </Box>

      <Box className="breadcrumb-container">
        <Breadcrumbs separator=">">
          <Link underline="hover" color="inherit" href="/home">
            <HomeIcon sx={{ mr: 0.5 }} />
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/hiring">
            Hiring
          </Link>
          <Link underline="hover" color="inherit" href="#">
            Schedule Interview
          </Link>
          <Typography color="text.primary">Scheduled New Interview</Typography>
        </Breadcrumbs>
      </Box>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <Typography variant="h5" fontWeight={600}>
          Candidate Information
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={() => {}}
        >
          {({ values, setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto space-y-6">
              {/* First row - Company and Organizational Unit */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <FormikSelectField
                    name="company"
                    label="Company*"
                    options={[]}
                    required
                    fullWidth
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormikSelectField
                    name="organizationalUnit"
                    label="Organizational Unit*"
                    options={[]}
                    required
                    fullWidth
                  />
                </Box>
              </Box>

              {/* Second row - Organizational Unit Objective and English version */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <FormikInputField
                    name="organizationalUnitObjective"
                    label="Organizational Unit Objective*"
                    required
                    fullWidth
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormikInputField
                    name="organizationalUnitObjectiveEn"
                    label="Organizational Unit Objective (English)"
                    fullWidth
                  />
                </Box>
              </Box>

              {/* Third row - Weight, Percentage, and Score */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <FormikInputField
                    name="weightOfObjective"
                    label="Weight of Objective in Employee's Appraisal*"
                    type="number"
                    required
                    fullWidth
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormikInputField
                    name="percentageFromBonus"
                    label="Percentage from Employee Target Bonus*"
                    type="number"
                    required
                    fullWidth
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <FormikInputField
                    name="score"
                    label="Score"
                    type="number"
                    disabled
                    fullWidth
                  />
                </Box>
              </Box>

              {/* Fourth row - Notes */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <FormikInputField
                    name="reason"
                    label="Notes"
                    textarea
                    rows={3}
                    placeholder="Add Reason"
                  />
                </Box>
              </Box>

              {/* Fifth row - Checkboxes */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.allowMultipleKPI}
                      onChange={(e) =>
                        setFieldValue("allowMultipleKPI", e.target.checked)
                      }
                    />
                  }
                  label="Allow selecting more than one KPI"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.userCannotModifyScore}
                      onChange={(e) =>
                        setFieldValue("userCannotModifyScore", e.target.checked)
                      }
                    />
                  }
                  label="User cannot modify appraisal score, if defined KPI"
                />
              </Box>

              {/* Add button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <SubmitButton title="Add" type="submit" />
              </Box>
            </Form>
          )}
        </Formik>
      </div>
    </Box>
  );
};

export default SchedualeInterview;
