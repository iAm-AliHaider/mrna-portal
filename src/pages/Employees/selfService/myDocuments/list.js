'use client'

import React, { useState } from 'react'
import { Button, Chip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import HomeIcon from '@mui/icons-material/Home'
import SearchField from '../../../../components/common/searchField'
import FiltersWrapper from '../../../../components/common/FiltersWrapper'
import ListFilter from './filters'
import { useMyApprovalsList } from '../../../../utils/hooks/api/approvals'
import { useEmployeesData } from '../../../../utils/hooks/api/emplyees'
import ApprovalStepper from '../../../../components/common/ApprovalHistory'
import ActionPermissionWrapper from '../myApprovals/ActionPermissionWrapper'
import SelectField from '../../../../components/common/SelectField'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Self Service' },
  { title: 'Documents' }
]

const DocumentsApproval = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(4)
  const [empCode, setEmpCode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [openFilters, setOpenFilters] = useState(false)

  const [filters, setFilters] = useState({
    is_start_half_day: false,
    is_end_half_day: false,
    status: '',
    type: '',
    leave_from: '',
    leave_to: ''
  })

  const { approvalsData, totalPages, count, loading, refetch } =
    useMyApprovalsList(
      currentPage - 1,
      perPage,
      searchQuery,
      'my_documents',
      empCode
    )

  const { data, loading: empLoading } = useEmployeesData()


  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset page when searching
  };

  const columns = [
    { key: 'custom_title', label: 'Title' },
    {
      key: 'document_type',
      label: 'Document Type',
      type: 'custom',
      render: row => (
        <div className='capitalize'>
          {row?.document_type ? row?.document_type?.replace('_', ' ') : ''}
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      type: 'custom',
      render: row => (
        <span>{`${row?.employee?.candidate?.first_name || ''} ${
          row?.employee?.candidate?.family_name || ''
        }`}</span>
      )
    },
    { key: 'location', label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      type: 'chip'
    },
    {
      key: 'attachment',
      label: 'Attachment',
      type: 'custom',
      render: row => (
        <a href={row?.file_path} target='_blank' rel='noopener noreferrer'>
          <Button variant='outlined' size='small'>
            Attachment
          </Button>
        </a>
      )
    },
    {
      key: 'history',
      label: 'Approval History',
      type: 'custom',
      width: '250px',
      render: row => <ApprovalStepper {...row} />
    },
    {
      key: 'action',
      label: 'Actions',
      type: 'custom',
      render: row => (
        <ActionPermissionWrapper
          refetch={refetch}
          row={row}
          reportType={'my_documents'}
        />
      )
    }
  ]

  const handleChangeFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyFilter = newValues => {
  }
  const resetFilters = () => {
    setFilters({
      is_start_half_day: false,
      is_end_half_day: false,
      status: '',
      type: '',
      leave_from: '',
      leave_to: ''
    })
  }

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title='Documents Approvals'
        items={breadcrumbItems}
      >
        <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
          {/* Filters */}
          <div className='flex justify-between items-center w-full'>
            <SearchField
              value={searchQuery}
              onChange={handleSearch}
              placeholder='Search'
            />
            <div className='flex gap-2'>
              <div className='w-[300px]'>
                <SelectField
                  options={data}
                  placeholder='Employee Number'
                  getOptionLabel={option =>
                    `${option?.employee_code} - ${option?.first_name || ''} ${
                      option?.family_name || ''
                    }`
                  }
                  onChange={value => setEmpCode(value)}
                  value={empCode}
                  loading={empLoading}
                  selectKey='employee_code'
                />
              </div>
              {/* Filters Wrapper */}
              <FiltersWrapper
                onApplyFilters={handleApplyFilter}
                resetFilters={resetFilters}
                open={openFilters}
                setOpen={setOpenFilters}
              >
                <ListFilter
                  values={filters}
                  label='Document Type'
                  options={[
                    { value: 'Letter', label: 'Letter' },
                    { value: 'CV', label: 'CV' },
                    { value: 'Education Degree', label: 'Education Degree' }
                  ]}
                  handleChange={handleChangeFilter}
                  placeholder='Select Document Type'
                />
              </FiltersWrapper>
              {/* <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                disabled={selectedIds.length === 0}
                style={{
                  textTransform: "none",
                  fontSize: "14px",
                }}
              >
                Delete
              </Button> */}
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={approvalsData}
            onAction={(row, key) => {}}
            footerInfo={`Showing ${approvalsData.length} of ${count} Approvals`}
            currentPage={currentPage}
            totalPages={totalPages || 1}
            perPage={perPage}
            onPageChange={p => setCurrentPage(p)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  )
}

export default DocumentsApproval
