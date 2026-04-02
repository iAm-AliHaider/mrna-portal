import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import FormikSelectField from "../../../../components/common/FormikSelectField";
import SubmitButton from "../../../../components/common/SubmitButton";
import { supaBaseSingleCall } from "../../../../utils/common";
import { supabase } from "../../../../supabaseClient";
import toast from "react-hot-toast";
import FileUploadField from "../../../../components/common/FormikFileUpload";
import { useCompanyInfo, useEmployeesForDropdown, useUpdateCompanyInfo } from "../../../../utils/hooks/api/companyInfo";

const CompanyForm = ({ onDataUpdate }) => {
  const { companyData, loading: companyLoading, refetch: refetchCompany } = useCompanyInfo();
  const { employees, hrManagers, financeManagers, generalManagers, loading: employeesLoading } = useEmployeesForDropdown();
  const { updateCompanyInfo, loading: updateLoading } = useUpdateCompanyInfo();
  
  const [initialValues, setInitialValues] = useState({
    companyCode: "",
    numberOfEmployees: "",
    companyName: "",
    // companyNameEn: "",
    tradeName: "",
    // tradeNameEn: "",
    registrationNo: "",
    nationalId: "",
    // taxId: "",
    valueAddedTaxId: "",
    email: "",
    website: "",
    // tax: "",
    // socialSecurity: "",
    generalManagerNumber: "",
    generalManagerName: "",
    hrManager: "",
    hrManagerNumber: "",
    financeManager: "",
    financeManagerNumber: "",
    generalManager: "",
    generalManagerNumber: "",
    attachment: "",
     // delayPolicy: "",
    // nationality: "",
    // socialSecurityNo: "",
    // holidayDefinition: "",
    // savingScheme: "",
  });

  // Update initial values when company data changes
  useEffect(() => {
    if (companyData?.id) {
      // Extract manager information
      const generalManager = companyData.general_manager;
      const hrManager = companyData.hr_manager;
      const financeManager = companyData.finance_manager;
      
      const initialData = {
        companyCode: companyData?.company_code || "",
        companyName: companyData?.name || "",
        tradeName: companyData?.trade_name || "",
        registrationNo: companyData?.registration_no || "",
        nationalId: companyData?.national_id || "",
        valueAddedTaxId: companyData?.value_added_tax_id || "",
        email: companyData?.email || "",
        website: companyData?.website || "",
        generalManagerNumber: generalManager?.candidate?.telephone || generalManager?.candidate?.mobile || "",
        generalManagerName: generalManager?.candidate?.first_name ? 
          `${generalManager.candidate.first_name} ${generalManager.candidate.family_name || ''}`.trim() : "",
        hrManager: companyData?.hr_manager_id?.toString() || "",
        hrManagerNumber: hrManager?.candidate?.telephone || hrManager?.candidate?.mobile || "",
        financeManager: companyData?.finance_manager_id?.toString() || "",
        financeManagerNumber: financeManager?.candidate?.telephone || financeManager?.candidate?.mobile || "",
        generalManager: companyData?.general_manager_id?.toString() || "",
        attachment: companyData?.attachment_path || "",
        numberOfEmployees: companyData?.no_of_employees?.toString() || employees.length.toString()
      };
      setInitialValues(initialData);
    }
  }, [companyData]);

  // Update numberOfEmployees when employees data changes and no existing company data
  // useEffect(() => {
  //   if (!companyData?.id && employees.length > 0) {
  //     console.log('Updating numberOfEmployees from employees count:', employees.length);
  //     setInitialValues(prev => ({
  //       ...prev,
  //       numberOfEmployees: employees.length.toString()
  //     }));
  //   }
  // }, [employees, companyData?.id]);

  const handleSubmit = async (values) => {
    try {
      // Check if all required fields are filled
      const requiredFields = {
        companyCode: values.companyCode,
        companyName: values.companyName,
        generalManager: values.generalManager,
        hrManager: values.hrManager,
        financeManager: values.financeManager
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || value.trim() === '')
        .map(([key]) => key);

      if (missingFields.length > 0) {
        const fieldNames = {
          companyCode: 'Company Code',
          companyName: 'Company Name',
          generalManager: 'General Manager',
          hrManager: 'HR Manager',
          financeManager: 'Finance Manager'
        };
        
        // const missingFieldNames = missingFields.map(field => fieldNames[field]).join(', ');
        // toast.error(`Please fill all required fields: ${missingFieldNames}`);
        // return;
      }
      
      const payload = {
        company_code: values.companyCode,
        name: values.companyName,
        trade_name: values.tradeName,
        registration_no: values.registrationNo,
        national_id: values.nationalId,
        value_added_tax_id: values.valueAddedTaxId,
        email: values.email,
        website: values.website,
        no_of_employees: values.numberOfEmployees ? parseInt(values.numberOfEmployees) : null,
        // general_manager_number: values.generalManagerNumber,
        // general_manager_name: values.generalManagerName,
        // hr_manager_number: values.hrManagerNumber,
        // finance_manager_number: values.financeManagerNumber,
      };

      // Add manager IDs if they have values
      if (values.generalManager && values.generalManager.trim() !== '') {
        payload.general_manager_id = parseInt(values.generalManager);
      }
      
      if (values.hrManager && values.hrManager.trim() !== '') {
        payload.hr_manager_id = parseInt(values.hrManager);
      }
      
      if (values.financeManager && values.financeManager.trim() !== '') {
        payload.finance_manager_id = parseInt(values.financeManager);
      }

      // Only include attachment_path if it has a value
      if (values.attachment_path && values.attachment_path.trim() !== '') {
        payload.attachment_path = values.attachment_path;
      }

      const result = await updateCompanyInfo(payload, companyData?.id);
      
      if (result) {
        await refetchCompany(); 
        if (onDataUpdate) {
          onDataUpdate();
        }
      }
    } catch (error) {
      console.error("Error saving company info:", error);
      toast.error("Failed to save company information");
    }
  };

  const loading = companyLoading || employeesLoading || updateLoading;

  if (loading) {
    return (
      <div className="w-full lg:w-4/5 bg-white p-4 lg:p-6 rounded shadow">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading company information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-4/5 bg-white p-4 lg:p-6 rounded shadow">
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormikInputField
                name="companyCode"
                label="Company Code"
              />
             <FormikInputField
  name="numberOfEmployees"
  label="Number of Employees"
  type="number"
/>
              <FormikInputField name="companyName" label="Company Name*" />
               {/* <FormikInputField
                name="companyNameEn"
                label="Company Name in English*"
              /> */}
              <FormikInputField name="tradeName" label="Trade Name" />
                 {/* <FormikInputField
                name="tradeNameEn"
                label="Trade Name in English"
              /> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormikInputField
                name="registrationNo"
                label="Registration No."
              />
              <FormikInputField name="nationalId" label="Commercial Registration Id" />
              <FormikInputField
                name="valueAddedTaxId"
                label="VAT"
              />
              <FormikInputField name="website" label="Website" />
              {/* <FormikInputField name="taxId" label="Tax ID" /> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikInputField name="email" label="Email" />
               {/* <FormikSelectField name="tax" label="Tax" options={[]} /> */}
              {/* <FormikSelectField
                name="socialSecurity"
                label="Social Security"
                options={[initialValues.tax]}
              /> */}
              <FileUploadField name="attachment_path" label="Attachment" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormikSelectField
    name="generalManager"
  label="General Manager"
  options={generalManagers}
  onChange={(selectedValue) => {
    const selectedGM = generalManagers.find(gm => gm.value === selectedValue);
    setFieldValue('generalManager', selectedValue);
    setFieldValue('generalManagerNumber', selectedGM?.phone || '');
  }}
/>

<FormikInputField
  name="generalManagerNumber"
  label="General Manager Cell Number"
  disabled
/>

              <FormikSelectField
                name="hrManager"
                label="HR Manager"
                options={hrManagers}
                onChange={(selectedValue) => {
                  const selectedHr = hrManagers.find(hr => hr.value === selectedValue);
                  setFieldValue('hrManager', selectedValue);
                  setFieldValue('hrManagerNumber', selectedHr?.phone || '');
                }}
              />
              <FormikInputField
                name="hrManagerNumber"
                label="HR Manager Cell Number"
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormikSelectField
                name="financeManager"
                label="Finance Manager"
                options={financeManagers}
                onChange={(selectedValue) => {
                  const selectedFin = financeManagers.find(fin => fin.value === selectedValue);
                  setFieldValue('financeManager', selectedValue);
                  setFieldValue('financeManagerNumber', selectedFin?.phone || '');
                }}
              />
              <FormikInputField
                name="financeManagerNumber"
                label="Finance Manager Cell Number"
                disabled
              />

              {/* <FormikSelectField
                name="savingScheme"
                label="Saving Scheme"
                options={[
                  { label: "Pension Plan", value: "pension" },
                  { label: "401(k)", value: "401k" },
                  { label: "IRA", value: "ira" },
                  { label: "None", value: "none" }
                ]}
                disabled
              /> */}
                {/* <FormikSelectField
                name="delayPolicy"
                label="Delay Policy"
                options={[]}
              /> */}
              {/* <FormikSelectField
                name="nationality"
                label="Nationality*"
                options={[]}
              /> */}
              {/* <FormikInputField
                name="socialSecurityNo"
                label="Social Security No."
              /> */}

              {/* <FormikSelectField
                name="holidayDefinition"
                label="Holiday Definition"
                options={[]}
              /> */}
            </div>

            <div className="col-span-full flex justify-end mt-6">
              <SubmitButton
                type="submit"
                className="px-6 py-2 text-white bg-primary rounded-lg shadow"
                title="Save & Update"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CompanyForm;
