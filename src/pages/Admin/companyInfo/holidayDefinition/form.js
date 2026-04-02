import React, { useState } from 'react'
import { Formik, Form } from 'formik'
import { useNavigate, useParams } from 'react-router-dom'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import HomeIcon from '@mui/icons-material/Home'
import FormikCheckbox from '../../../../components/common/FormikCheckbox'
import FormikSelectField from '../../../../components/common/FormikSelectField'
import FormikInputField from '../../../../components/common/FormikInputField'
import SubmitButton from '../../../../components/common/SubmitButton'
import YearPicker from '../../../../components/common/YearPicker'
import { useCreateHolidayDefinition, useUpdateHolidayDefinition, useHolidayDefinitionById } from '../../../../utils/hooks/api/holidayDefinitions'
import * as Yup from 'yup';

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

const initialValues = {
  weekends: ['Friday', 'Saturday'],
  holidayYear: '',
  holidayName: '',
  holidayDate: '',
  religion: '',
  numberOfHolidays: '',
  repeatable: false,
  notes: ''
}

const validationSchema = Yup.object({
  weekends: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one weekend day must be selected')
    .required('Weekend selection is required'),

  holidayYear: Yup.string()
    .required('Holiday year is required'),

  holidayName: Yup.string()
    .required('Holiday name is required'),

  holidayDate: Yup.string()
    .required('Holiday date is required'),

  religion: Yup.string()
    .required('Religion is required'),

  numberOfHolidays: Yup.string()
    .required('Number of holidays is required'),

  repeatable: Yup.boolean(),

  notes: Yup.string()
});

const HolidayForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const { createHolidayDefinition, loading: createLoading } = useCreateHolidayDefinition()
  const { updateHolidayDefinition, loading: updateLoading } = useUpdateHolidayDefinition()
  const { holidayData, loading: fetchLoading, error } = useHolidayDefinitionById(id)

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial values when data is loaded (for edit mode)
  const getInitialValues = () => {
    if (!isEditMode || !holidayData) {
      return initialValues
    }

    return {
      weekends: ['Friday', 'Saturday'],
      holidayYear: holidayData.holiday_year?.toString() || '',
      holidayName: holidayData.name || '',
      holidayDate: holidayData.holiday_date || '',
      religion: holidayData.religion || '',
      numberOfHolidays: '1', // Default to 1 for single day holidays
      repeatable: holidayData.repeatable || false,
      notes: holidayData.notes || ''
    }
  }

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    if (isEditMode) {
      const result = await updateHolidayDefinition(id, values)
      if (result.success) {
        navigate('/admin/company-info/holidays')
      } else {
        setIsSubmitting(false);
      }
    } else {
      const result = await createHolidayDefinition(values)
      if (result.success) {
        navigate('/admin/company-info/holidays')
      } else {
        setIsSubmitting(false);
      }
    }
  }

  const getBreadcrumbItems = () => {
    const baseItems = [
      { icon: HomeIcon, href: '/home' },
      { title: 'Company Info' },
      { title: 'Holiday Definition', href: '/admin/company-info/holidays' }
    ]

    if (isEditMode) {
      baseItems.push({ title: 'Edit Holiday' })
    } else {
      baseItems.push({ title: 'Add Holiday' })
    }

    return baseItems
  }

  const getPageTitle = () => {
    return isEditMode ? 'Edit Holiday' : 'Add Holiday'
  }

  const getSubmitButtonTitle = () => {
    return isEditMode ? 'Update Holiday' : 'Create Holiday'
  }

  const getLoadingState = () => {
    if (isEditMode) {
      return fetchLoading || updateLoading
    }
    return createLoading
  }

  // Show loading state for edit mode while fetching data
  if (isEditMode && fetchLoading) {
    return (
      <PageWrapperWithHeading title={getPageTitle()} items={getBreadcrumbItems()}>
        <div className='bg-white p-6 rounded shadow-md'>
          <div className='flex justify-center items-center h-32'>
            <div className='text-gray-500'>Loading holiday data...</div>
          </div>
        </div>
      </PageWrapperWithHeading>
    )
  }

  // Show error state for edit mode
  if (isEditMode && error) {
    return (
      <PageWrapperWithHeading title={getPageTitle()} items={getBreadcrumbItems()}>
        <div className='bg-white p-6 rounded shadow-md'>
          <div className='flex justify-center items-center h-32'>
            <div className='text-red-500'>Error loading holiday data: {error}</div>
          </div>
        </div>
      </PageWrapperWithHeading>
    )
  }

  // Show not found state for edit mode
  if (isEditMode && !holidayData) {
    return (
      <PageWrapperWithHeading title={getPageTitle()} items={getBreadcrumbItems()}>
        <div className='bg-white p-6 rounded shadow-md'>
          <div className='flex justify-center items-center h-32'>
            <div className='text-gray-500'>Holiday not found</div>
          </div>
        </div>
      </PageWrapperWithHeading>
    )
  }

  return (
    <PageWrapperWithHeading title={getPageTitle()} items={getBreadcrumbItems()}>
      <div className='bg-white p-6 rounded shadow-md'>
        <Formik 
          initialValues={getInitialValues()} 
          validationSchema={validationSchema} 
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ values, setFieldValue }) => (
            <Form className='space-y-6'>
              {/* Weekend Section */}
              <div>
                <h2 className='text-lg font-semibold mb-2'>Weekend</h2>
                <div className='flex flex-wrap gap-4 bg-gray-50 p-4 rounded'>
                  {days.map((day, index) => (
                    <FormikCheckbox
                      name='weekends'
                      key={`${day}-${index}`}
                      checked={values.weekends.includes(day)}
                      handleChange={() => {
                        const updated = values.weekends.includes(day)
                          ? values.weekends.filter(d => d !== day)
                          : [...values.weekends, day]
                        setFieldValue('weekends', updated)
                      }}
                      label={day}
                    />
                  ))}
                </div>
              </div>
              
              {/* Public Holiday Section */}
              <div className='space-y-4 bg-gray-50 p-4 rounded'>
                <h2 className='text-lg font-semibold mb-4'>Public Holiday</h2>
                <YearPicker
                  name='holidayYear'
                  label='Holiday Year*'
                  required
                />
                <div className='grid grid-cols-2 gap-4'>
                  <FormikInputField
                    name='holidayName'
                    label='Holiday Name'
                    required
                  />
                  <FormikInputField
                    name='holidayDate'
                    label='Holiday Date'
                    type='date'
                    required
                  />
                  <FormikSelectField
                    name='religion'
                    label='Religion'
                    options={[
                      { label: 'Islam', value: 'Islam' },
                      { label: 'Christianity', value: 'Christianity' },
                      { label: 'Judaism', value: 'Judaism' },
                      { label: 'Hinduism', value: 'Hinduism' },
                      { label: 'Buddhism', value: 'Buddhism' },
                      { label: 'Other', value: 'Other' }
                    ]}
                    required
                  />
                  <FormikInputField
                    name='numberOfHolidays'
                    label='Number of Holidays'
                    type='number'
                    min='1'
                  />
                </div>

                <div className='mt-4'>
                  <FormikCheckbox name='repeatable' label='Repeatable' />
                </div>

                <div className='mt-4'>
                  <FormikInputField
                    name='notes'
                    label='Notes'
                    rows={3}
                    placeholder='Additional notes about this holiday...'
                  />
                </div>
              </div>

              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => navigate('/admin/company-info/holidays')}
                  className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                <SubmitButton 
                  type='submit'
                  isLoading={isSubmitting || getLoadingState()}
                  disabled={isSubmitting}
                  title={getSubmitButtonTitle()}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </PageWrapperWithHeading>
  )
}

export default HolidayForm
