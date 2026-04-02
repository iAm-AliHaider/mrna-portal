// MyTransactionsPage.js
import React, { useState } from 'react'
import { Button } from '@mui/material'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import './style.css'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import HomeIcon from '@mui/icons-material/Home'
import SelectField from '../../../../components/common/SelectField'
import SearchField from '../../../../components/common/searchField'
import FiltersWrapper from '../../../../components/common/FiltersWrapper'
import ListFilter from './filters'

const columns = [
  { key: 'employeeNumber', label: 'Employee Number' },
  { key: 'transaction', label: 'Transaction' },
  { key: 'type', label: 'Type' },
  { key: 'creationDate', label: 'Creation Date' },
  { key: 'lastUpdated', label: 'Last Updated' },
  { key: 'transactionStatus', label: 'Transaction Status', type: 'progress' },
  { key: 'approvalHistory', label: 'Approval History', type: 'button' },
  { key: 'escalate', label: 'Escalate', type: 'button' },
  { key: 'remind', label: 'Remind', type: 'button' }
]

const data = [
  {
    id: 1,
    employeeNumber: '409',
    transaction: 'Official Letter - Akram abdus samad',
    type: 'Visa request / طلب تأشيرة خروج',
    creationDate: '10/12/2024 18:26',
    lastUpdated: '10/12/2024',
    transactionStatus: { progress: 30, status: 'Pending' },
    approvalHistory: 'View',
    escalate: 'Escalate Transaction',
    remind: 'Send Reminder'
  }
]

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Self Service' },
  { title: 'Action created by me' }
]

const ActionsCreatedByMeList = () => {
  const [selectedIds, setSelectedIds] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    is_approved: false,
    status: '',
    transaction_type: '',
    creation_date: '',
    last_update: ''
  })

  const handleChangeFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyFilter = newValues => {
  }

  const resetFilters = () => {
    setFilters({
      is_approved: false,
      status: 'all',
      transaction_type: '',
      creation_date: '',
      last_update: ''
    })
  }

  return (
    <PageWrapperWithHeading
      title='Action Created by me'
      items={breadcrumbItems}
    >
      <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
        {/* Filters */}
        <div className='flex justify-between items-center w-full'>
          <SearchField value={searchQuery} onChange={setSearchQuery} />
          <div className='flex gap-4'>
            <div className='w-[300px]'>
              <SelectField options={[]} placeholder='Status' />
            </div>
            <div className='filter-buttons'>
              <FiltersWrapper
                onApplyFilters={handleApplyFilter}
                resetFilters={resetFilters}
              >
                <ListFilter
                  values={filters}
                  label='Type'
                  options={[]}
                  handleChange={handleChangeFilter}
                  placeholder='Select Type'
                />
              </FiltersWrapper>
              <Button variant='outlined' disabled>
                Delete
              </Button>
            </div>
          </div>
        </div>

        <DynamicTable
          columns={columns}
          data={data}
          showCheckbox={true}
          onSelectChange={ids => setSelectedIds(ids)}
          onAction={(row, key) => console.log('Action:', key, row)}
          footerInfo='Transactions out of 1'
          currentPage={1}
          totalPages={1}
          perPage={10}
          onPageChange={p => {}}
          onPerPageChange={n => {}}
        />
      </div>
    </PageWrapperWithHeading>
  )
}

export default ActionsCreatedByMeList
