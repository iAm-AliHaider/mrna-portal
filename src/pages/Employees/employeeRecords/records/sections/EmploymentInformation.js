import React, { useMemo } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormikInputField from '../../../../../components/common/FormikInputField'
import FormikSelectField from '../../../../../components/common/FormikSelectField'
import FormikRadioGroup from '../../../../../components/common/RadioGroup'
import SubmitButton from '../../../../../components/common/SubmitButton'
import FormikCheckbox from '../../../../../components/common/FormikCheckbox'
import { useEmployeeRecord } from '../../../../../context/EmployeeRecordContext'
import { useGetAllPolicies, useUpdateEmployeeRecord } from '../../../../../utils/hooks/api/employeeRecords'



const paymentMethodOptions = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Daily', value: 'daily' }
]

const accessRequirementOptions = [
  { label: 'Not Required', value: 'not_required' },
  { label: 'Required', value: 'required' }
]

const salaryDateOptions = [
  { label: 'Definition', value: 'definition' },
  { label: 'Custom', value: 'custom' }
]


const validationSchema = Yup.object({
  employmentType: Yup.string().required('Required'),
  workHours: Yup.string().required('Required'),
  employmentDate: Yup.string().required('Required')
})

const EmploymentInformation = () => {
  const { record, loadRecord } = useEmployeeRecord()

  const {policies} = useGetAllPolicies()

  const { updateRecord, loading: updateLoading } = useUpdateEmployeeRecord()


  const initialValues = useMemo(
    () => ({
      accessRequirement: record
        ? record.access_requirement
          ? 'required'
          : 'not_required'
        : 'not_required',

      employmentType: record?.employment_types?.employment_type || '',
      workHours: record?.employment_types?.work_hours ?? '',
      probationPeriod: record?.employment_types?.probation_period || false,
      allowOvertime: record?.employment_types?.allow_overtime || false,
      allowShiftWork: record?.employment_types?.allow_shift_work || false,
      allowOnCallShift: record?.employment_types?.allow_on_call_shift || false,
      allowDelay: record?.employment_types?.allow_delay || false,
      resignationNoticePeriod: record?.employment_types?.resignation_notice_period ?? '',
      salaryGroup: record?.employment_types?.salary_group_id || '',
      excludedFromAdditionalSalaryMonth:
        record?.employment_types?.exclude_additional_salary || false,
      exemptedFromSocialSecurity: record?.employment_types?.exempt_social_security || false,
      entitledToTickets: record?.employment_types?.job_title_tickets || false,
      allowExceedTicketBalance: record?.employment_types?.allow_exceed_ticket_balance || false,
      excludeFromSalaryCalculation:
        record?.employment_types?.exclude_from_salary_calculation || false,
      excludeFromIndemnity: record?.employment_types?.exclude_from_indemnity || false,

      paymentMethod: record?.employment_types?.payment_type || 'hourly',
      absenteeism_policy: record?.employment_types?.absenteeism_policy_id || '',
      delayPolicy: record?.employment_types?.delay_policy_id || '',
      overtimePolicy: record?.employment_types?.overtime_policy_id || '',

      // fields not in record yet—keep your existing defaults
      coreFunction: record?.employment_types?.name || 'Information Technology',
      employmentDate: record?.created_at ? new Date(record?.created_at).toISOString().split('T')[0] : '',
      entranceDate: record?.created_at ? new Date(record?.created_at).toISOString().split('T')[0] : '',
      permanent_date: record?.permanent_date || '',
      salaryDateBasis: 'definition',
      additionalSalaryDate: '',
      hijriEmploymentDate: '',
      hijriPermanentDate: ''
    }),
    [record]
  )

  const handleSubmit = async values => {
    const employee = {
      id: record?.id || '',
      permanent_date: values?.permanent_date || '',
    }

    await updateRecord({ employee })
    loadRecord()
  }

  return (
    <div className=''>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {() => (
          <Form className='flex-1 overflow-y-auto p-4'>
            <div className='bg-gray-50 rounded-lg p-4 h-[calc(100vh-380px)] overflow-y-auto rounded-lg space-y-6 scrollbar-hide'>
              <h2 className='text-lg font-semibold'>Employment Information</h2>

              <FormikRadioGroup
                name='accessRequirement'
                label='Access Requirement'
                options={accessRequirementOptions}
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikInputField
                  name='employmentType'
                  label='Employment Type'
                  required
                  disabled
                />
                <FormikInputField
                  name='workHours'
                  label='Work Hours'
                  required
                  disabled
                />
              </div>

              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <FormikCheckbox
                  name='probationPeriod'
                  label='Probation period'
                  disabled
                />
                <FormikCheckbox name='allowOvertime' label='Allow overtime' disabled />
                <FormikCheckbox
                  name='allowShiftWork'
                  label='Allow shift work'
                  disabled
                />
                <FormikCheckbox
                  name='allowOnCallShift'
                  label='Allow on-call shift'
                  disabled
                />
                <FormikCheckbox name='allowDelay' label='Allow delay' disabled />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikInputField
                  name='resignationNoticePeriod'
                  label='Resignation notice period'
                  append='Days'
                  disabled
                />
                {/* <FormikSelectField
                  name='salaryGroup'
                  label='Salary Group'
                  options={salaryGroupOptions}
                /> */}
              </div>

              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <FormikCheckbox
                  name='excludedFromAdditionalSalaryMonth'
                  label='Excluded from additional salary month'
                  disabled
                />
                <FormikCheckbox
                  name='exemptedFromSocialSecurity'
                  label='Exempted from social security'
                  disabled
                />
                <FormikCheckbox
                  name='entitledToTickets'
                  label='Entitled to job title travel tickets'
                  disabled
                />
                <FormikCheckbox
                  name='allowExceedTicketBalance'
                  label='Allow exceed travel ticket balance'
                  disabled
                />
                <FormikCheckbox
                  name='excludeFromSalaryCalculation'
                  label='Exclude from salary calculation'
                  disabled
                />
                <FormikCheckbox
                  name='excludeFromIndemnity'
                  label='Exclude from indemnity'
                  disabled
                />
              </div>

              <FormikRadioGroup
                name='paymentMethod'
                label='Payment Method'
                options={paymentMethodOptions}
                disabled
              />

              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <FormikSelectField
                  name='absenteeism_policy'
                  label='Absenteeism Policy'
                  options={policies}
                  selectKey='id'
                  getOptionLabel={option => option.name}
                  disabled
                />
                <FormikInputField
                  name='coreFunction'
                  label='Core Function'
                  disabled
                />
                <FormikSelectField
                  name='delayPolicy'
                  label='Delay Policy'
                  options={policies}
                  selectKey='id'
                  getOptionLabel={option => option.name}
                  disabled
                />
                <FormikSelectField
                  name='overtimePolicy'
                  label='Overtime Policy'
                  options={policies}
                  selectKey='id'
                  getOptionLabel={option => option.name}
                  disabled
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormikInputField
                  name='employmentDate'
                  label='Employment Date'
                  type='date'
                  disabled

                />
                <FormikInputField
                  name='entranceDate'
                  label='Entrance Date'
                  type='date'
                  disabled
                />
                <FormikInputField
                  name='permanent_date'
                  label='Permanent Date'
                  type='date'
                  disabled={!!record?.permanent_date}
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormikRadioGroup
                  name='salaryDateBasis'
                  label='Additional salary date according to'
                  options={salaryDateOptions}
                />
                <FormikInputField name='additionalSalaryDate' label='Additional salary date' type='date' />
              </div>

              {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikInputField
                  name='hijriEmploymentDate'
                  label='Hijri Employment Date'
                  type='date'
                />
                <FormikInputField
                  name='hijriPermanentDate'
                  label='Hijri Permanent Date'
                  type='date'
                />
              </div> */}
            </div>
            <div className='mt-6 pt-6 bg-white border-t flex justify-end'>
              <SubmitButton title='Save & Update' type='submit' isLoading={updateLoading} />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default EmploymentInformation
