"use client";
import { Formik, Form } from "formik";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import FormikRadioGroup from "../../../../components/common/RadioGroup";
import SubmitButton from "../../../../components/common/SubmitButton";

const initialValues = {
  employeeNumber: "401",
  question1Response: "",
  question2Response: "",
  question3Response: "",
};

const employeeOptions = [{ value: "401", label: "401" }];

const SurveyResponseForm = () => {
  return (
    <Box className="page-wrapper">
      <Box className="page-header">
        <Typography variant="h5" fontWeight={600}>
          Add Survey Response
        </Typography>
      </Box>

      <Box className="breadcrumb-container">
        <Breadcrumbs separator=">">
          <Link underline="hover" color="inherit" href="/home">
            <HomeIcon sx={{ mr: 0.5 }} />
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/transactions">
            Transactions
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/transactions/surveys"
          >
            Survey Responses
          </Link>
          <Typography color="text.primary">Add Survey Response</Typography>
        </Breadcrumbs>
      </Box>

      <div className="bg-white p-5 rounded-lg shadow-md">
        <Formik
          initialValues={initialValues}
          onSubmit={() => {}}
        >
          {() => (
            <Form className="flex-1 overflow-y-auto">
              {/* Employee Selection Section */}
              <div className="bg-gray-100 p-4 space-y-5 rounded-lg mb-4">
                <Box sx={{ width: "50%" }}>
                  <FormikSelectField
                    name="employeeNumber"
                    label="Employee Number"
                    options={employeeOptions}
                    fullWidth
                  />
                </Box>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* First Row */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Employee Number
                    </label>
                    <div className="text-sm text-gray-900">401</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Job Title
                    </label>
                    <div className="text-sm text-gray-900">General Manager</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Employment Status
                    </label>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Attendance Status
                    </label>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        On Vacation
                      </span>
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Employee Name
                    </label>
                    <div className="text-sm text-gray-900">
                      Hasan Fathi Hussein Eid
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Employment Date
                    </label>
                    <div className="text-sm text-gray-900">25/04/23</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <div className="text-sm text-gray-900">ISS Business</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <div className="text-sm text-gray-900">Sales</div>
                  </div>

                  {/* Third Row */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Branch
                    </label>
                    <div className="text-sm text-gray-900">Head Office</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Division
                    </label>
                    <div className="text-sm text-gray-900">-</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Section
                    </label>
                    <div className="text-sm text-gray-900">-</div>
                  </div>
                </div>
              </div>

              {/* Survey Questions Section */}
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="mb-4">
                  <Typography variant="h6" fontWeight={600} className="mb-4">
                    Question
                  </Typography>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Question 1 */}
                    <div className="border-b pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="md:col-span-1">
                          <Typography>
                            Answer calls in professional way
                          </Typography>
                        </div>
                        <div className="md:col-span-4">
                          <FormikRadioGroup
                            name="question1Response"
                            options={[
                              { value: "always", label: "Always" },
                              {
                                value: "mostOfTheTime",
                                label: "Most of the time",
                              },
                              { value: "someTimes", label: "Some Times" },
                              { value: "notSatisfied", label: "Not Satisfied" },
                            ]}
                            row
                          />
                        </div>
                      </div>
                    </div>

                    {/* Question 2 */}
                    <div className="border-b pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="md:col-span-1">
                          <Typography>Quality of office furniture</Typography>
                        </div>
                        <div className="md:col-span-4">
                          <FormikRadioGroup
                            name="question2Response"
                            options={[
                              {
                                value: "verySatisfied",
                                label: "Very Satisfied",
                              },
                              { value: "satisfied", label: "Satisfied" },
                              { value: "medium", label: "Medium" },
                              { value: "notSatisfied", label: "Not Satisfied" },
                            ]}
                            row
                          />
                        </div>
                      </div>
                    </div>

                    {/* Question 3 */}
                    <div className="border-b pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="md:col-span-1">
                          <Typography>IT Services</Typography>
                        </div>
                        <div className="md:col-span-4">
                          <FormikRadioGroup
                            name="question3Response"
                            options={[
                              {
                                value: "verySatisfied",
                                label: "Very Satisfied",
                              },
                              { value: "satisfied", label: "Satisfied" },
                              { value: "medium", label: "Medium" },
                              { value: "notSatisfied", label: "Not Satisfied" },
                            ]}
                            row
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
                <SubmitButton title="Submit" type="submit" />
              </Box>
            </Form>
          )}
        </Formik>
      </div>
    </Box>
  );
};

export default SurveyResponseForm;
