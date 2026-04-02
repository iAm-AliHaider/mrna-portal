import React, { useState, useEffect } from 'react'
import HomeIcon from '@mui/icons-material/Home'
import CompanyForm from './form'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import { supaBaseSingleCall } from '../../../../utils/common'
import { supabase } from '../../../../supabaseClient'
import toast from 'react-hot-toast'
import { useCompanyInfo, useEmployeesForDropdown } from '../../../../utils/hooks/api/companyInfo'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Company Info' },
  { title: 'General' }
]

const General = () => {
  const { companyData: companyInfo, loading: companyLoading, refetch: refetchCompany } = useCompanyInfo();
  const { employees, loading: employeesLoading } = useEmployeesForDropdown();
  
  const loading = companyLoading || employeesLoading;
  const employeeCount = companyInfo?.no_of_employees || employees?.length || 0;

  return (
   <PageWrapperWithHeading title='General' items={breadcrumbItems}>
      <div className='flex flex-col lg:flex-row gap-4'>
        <div className='lg:w-1/5 w-full p-4 bg-white rounded shadow text-center'>
          <img
            src={companyInfo?.attachment_path || '/assets/images/logo.png'}
            alt='Company Logo'
            className='mx-auto w-[120px] h-[120px] object-contain'
            onError={(e) => {
              e.target.src = '/assets/images/logo.png'
            }}
          />
          <h2 className='font-bold mt-4 text-lg'>
            {companyInfo?.name}
          </h2>
          <div className='text-sm text-gray-600 mt-2'>Website</div>
          <a 
            href={companyInfo?.website} 
            className='text-blue-600 text-sm'
            target="_blank"
            rel="noopener noreferrer"
          >
            {companyInfo?.website}
          </a>
          <div className='mt-4 border-t pt-4 text-sm text-gray-700'>
            <p>
              <strong>Number of Employees</strong>
              <br />
              {loading ? 'Loading...' : employeeCount}
            </p>
            <p className='mt-4'>
              <strong>Company Code</strong>
              <br />
              {companyInfo?.company_code}
            </p>
            {companyInfo?.email && (
              <p className='mt-4'>
                <strong>Email</strong>
                <br />
                {companyInfo.email}
              </p>
            )}
            {companyInfo?.trade_name && (
              <p className='mt-4'>
                <strong>Trade Name</strong>
                <br />
                {companyInfo.trade_name}
              </p>
            )}
          </div>
        </div>
        <CompanyForm onDataUpdate={refetchCompany} />
      </div>
    </PageWrapperWithHeading>
  )
}

export default General
