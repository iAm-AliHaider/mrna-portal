import React, { useEffect, useState } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { Country, State } from 'country-state-city'
import FormikInputField from '../../../../../components/common/FormikInputField'
import FormikSelectField from '../../../../../components/common/FormikSelectField'
import SubmitButton from '../../../../../components/common/SubmitButton'
import { useEmployeeRecord } from '../../../../../context/EmployeeRecordContext'
import { useUpdateEmployeeRecord } from '../../../../../utils/hooks/api/employeeRecords'

const validationSchema = Yup.object({
  telephone: Yup.string(),
  mobile: Yup.string().required('Mobile is required'),
  address: Yup.string().trim().max(255, 'Address too long'),

  po_box: Yup.string()
    .matches(/^[\d\-\/\s]*$/, 'Invalid P.O. Box format')
    .max(20, 'Too long'),

  zip_code: Yup.string(),

  country: Yup.string().max(100, 'Country name too long'),

  state: Yup.string().max(100, 'State name too long'),

  district: Yup.string().max(100, 'District too long'),

  town: Yup.string().max(100, 'Town too long'),

  building_number: Yup.string().matches(
    /^[\w\-\/ ]*$/,
    'Invalid building number'
  ),

  floor_number: Yup.string().matches(/^[\w\-\/ ]*$/, 'Invalid floor number'),

  apartment_number: Yup.string().matches(
    /^[\w\-\/ ]*$/,
    'Invalid apartment number'
  ),

  fax_number: Yup.string().matches(
    /^\+?[0-9\s\-()]{7,20}$/,
    'Enter a valid fax number'
  ),

  neighbourhood: Yup.string().max(100, 'Neighbourhood too long'),

  street: Yup.string().max(150, 'Street name too long')
})

const HomeAddress = () => {
  const { record, loadRecord } = useEmployeeRecord()
  const { updateRecord, loading: updateLoading } = useUpdateEmployeeRecord()

  const [selectedCounty, setSelectedCounty] = useState('')
  const [countryOptions, setCountryOptions] = useState([])
  const [stateOptions, setStateOptions] = useState([])

  const initialValuesWithRecord = {
    telephone: record?.candidates?.telephone || '',
    mobile: record?.candidates?.mobile || '',
    address: record?.candidates?.address || '',
    po_box: record?.candidates?.po_box || '',
    zip_code: record?.candidates?.zip_code || '',
    country: record?.candidates?.country || '',
    state: record?.candidates?.state || '',
    district: record?.candidates?.district || '',
    town: record?.candidates?.town || '',
    building_number: record?.candidates?.building_number || '',
    floor_number: record?.candidates?.floor_number || '',
    apartment_number: record?.candidates?.apartment_number || '',
    fax_number: record?.candidates?.fax_number || '',
    neighbourhood: record?.candidates?.neighbourhood || '',
    street: record?.candidates?.street || ''
  }

  useEffect(() => {
    if (record?.candidates?.country) {
      setSelectedCounty(record.candidates.country)
    } else {
      setSelectedCounty('')
    }
  }, [record?.candidates?.country])

  useEffect(() => {
    const allCountries = Country.getAllCountries()
    const formatted = allCountries?.map(c => ({
      label: c.name,
      value: c.isoCode
    }))
    setCountryOptions(formatted)
  }, [])

  useEffect(() => {
    if (selectedCounty) {
      const states = State.getStatesOfCountry(selectedCounty)
      const formatted = states?.map(s => ({
        label: s.name,
        value: s.isoCode
      }))
      setStateOptions([])
      setStateOptions(formatted)
    } else {
      setStateOptions([])
    }
  }, [selectedCounty])

  const handleSubmit = async values => {
    const candidate = {
      id: record?.candidates.id,
      ...values
    }
    await updateRecord({ candidate })
    loadRecord()
  }

  return (
    <div className='flex flex-col'>
      <Formik
        initialValues={initialValuesWithRecord}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ setFieldValue }) => (
          <Form className='flex-1 overflow-y-auto p-4'>
            <div className='bg-gray-50 rounded-lg p-4 h-[calc(100vh-380px)] overflow-y-auto scrollbar-hide space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikInputField name='telephone' label='Telephone' />
                <FormikInputField name='mobile' label='Mobile' />
              </div>

              <FormikInputField name='address' label='Address' />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikInputField name='po_box' label='P.O. Box' />
                <FormikInputField name='zip_code' label='Zip Code' />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikSelectField
                  name='country'
                  label='Country'
                  options={countryOptions}
                  onChange={value => {
                    setFieldValue('country', value)
                    setSelectedCounty(value)
                  }}
                />
                <FormikSelectField
                  name='state'
                  label='States'
                  options={stateOptions}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikInputField name='district' label='District' />
                <FormikInputField name='town' label='Town' />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikInputField
                  name='building_number'
                  label='Building Number'
                />
                <FormikInputField name='floor_number' label='Floor Number' />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikInputField
                  name='apartment_number'
                  label='Apartment Number'
                />
                <FormikInputField name='fax_number' label='Fax Number' />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormikInputField name='neighbourhood' label='Neighbourhood' />
                <FormikInputField name='street' label='Street' />
              </div>
            </div>

            <div className='mt-6 pt-6 bg-white border-t flex justify-end'>
              <SubmitButton
                title='Save & Update'
                type='submit'
                isLoading={updateLoading}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default HomeAddress
