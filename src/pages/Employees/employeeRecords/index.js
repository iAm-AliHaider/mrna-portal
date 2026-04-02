import React from 'react'
import PageWrapperWithHeading from '../../../components/common/PageHeadSection'
import Records from './records'
import usePageData from '../../../utils/hooks/usePageData'
import { useEmployeeRecord } from '../../../context/EmployeeRecordContext'

const EmployeeRecords = () => {
  const { items, title } = usePageData()
  const { empCode, record } = useEmployeeRecord()

  const { candidates, designations } = record || {}

  return (
    <PageWrapperWithHeading
      title={title}
      items={items}
      isEmployeeRecordView={true}
    >
      <div className='flex gap-4'>
        {record && (
          <div className='w-1/5 p-4 bg-white rounded shadow text-center'>
            <img
              src={record?.profile_image || '/assets/images/placeholder_image.png'}
              alt='logo'
              className='mx-auto w-[120px] h-[130px] rounded-lg'
            />
            <h2 className='font-bold mt-4 text-lg'>{`${
              candidates?.first_name || ''
            } ${candidates?.family_name || ''}`}</h2>
            <div className='text-sm text-gray-600 mt-2'>Email</div>
            <p className='text-blue-600 text-sm'>
              {candidates?.email || 'No Email Provided'}
            </p>
            <div className='mt-4 border-t pt-4 text-sm text-gray-700'>
              <p>
                <strong>Designation</strong>
                <br />
                {designations?.name}
              </p>
              <p className='mt-4'>
                <strong>Employee</strong>
                <br />
                {empCode || 'No Employee Code Provided'}
              </p>
            </div>
          </div>
        )}
        <Records />
      </div>
    </PageWrapperWithHeading>
  )
}

export default EmployeeRecords
