import React, { useMemo, useState } from 'react'
import { format } from 'date-fns'
import HiringReportPDFButton from '../../../../components/pdfComponenets/HiringReportPDFButton'
import HomeIcon from '@mui/icons-material/Home'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import useHiringReport from '../../../../utils/hooks/api/reports'
import HiringReportPDF from '../../../../components/pdfComponenets/HiringPDF'
import InputField from '../../../../components/common/FormikInputField/Input'
import SubmitButton from '../../../../components/common/SubmitButton'

const HiringReport = () => {
  const [startDate, setStartDate] = useState(
    format(
      new Date(new Date().setDate(new Date().getDate() - 30)),
      'yyyy-MM-dd'
    )
  )
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [submitted, setSubmitted] = useState(false)

  const { data, loading, error } = useHiringReport(
    submitted ? startDate : null,
    submitted ? endDate : null
  )

  const handleGenerate = () => setSubmitted(true)

  const handleStartDateChange = e => {
    setSubmitted(false)
    setStartDate(e.target.value)
  }
  const handleEndDateChange = e => {
    setSubmitted(false)
    setEndDate(e.target.value)
  }

  const duration = useMemo(() => {
    if (!startDate || !endDate) return ''
  
    const start = new Date(startDate)
    const end = new Date(endDate)
  
    const days = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
  
    return `${days} day${days !== 1 ? 's' : ''}`
  }, [startDate, endDate])

  const breadcrumbItems = [
    { href: '/home', icon: HomeIcon },
    { title: 'Reports' },
    { title: 'Hiring Report' }
  ]

  return (
    <PageWrapperWithHeading title='Hiring Report' items={breadcrumbItems}>
      <div className='flex flex-wrap items-end justify-between gap-4 mb-6'>
        <div className='flex-1'>
          <InputField
            label='Start Date'
            id='start-date'
            type='date'
            max="2100-12-31"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </div>
        <div className='flex-1'>
          <InputField
            label='End Date'
            id='end-date'
            type='date'
            max="2100-12-31"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>

        <SubmitButton
          title='Generate'
          onClick={handleGenerate}
          isLoading={loading}
          type='button'
          style={{ height: '48px' }}
        />
      </div>

      {submitted && (
        <>
          {loading ? (
            <div className='p-6 text-center'>
              <div className='animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full mx-auto'></div>
            </div>
          ) : error ? (
            <div className='p-6 text-red-600 bg-red-50 border rounded'>
              {error}
            </div>
          ) : data.length > 0 ? (
            <div className='mt-6'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-lg font-semibold'>
                  Hired Employees from {startDate} to {endDate}
                </h2>
                <HiringReportPDFButton
                  reportName='Hiring_Report'
                />
              </div>
              <div
                className='border rounded-lg p-4 overflow-y-auto'
                style={{ maxHeight: '70vh' }}
              >
                <HiringReportPDF data={data} duration={duration} />
              </div>
            </div>
          ) : (
            <div className='p-6 text-gray-600'>
              No employees hired during this period.
            </div>
          )}
        </>
      )}
    </PageWrapperWithHeading>
  )
}

export default HiringReport
