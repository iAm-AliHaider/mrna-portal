import React, { useState } from 'react'
import Button from '@mui/material/Button'
import UploadIcon from '@mui/icons-material/Upload'
import AddIcon from '@mui/icons-material/Add'
import SearchInput from '../../../../../../components/common/searchField'
import DynamicTable from '../../../../../../components/tables/AnnouncementsTable'

const data = [
  {
    id: 1,
    idType: 'Iqama',
    idNumber: '127364',
    issueDate: '12/03/2024',
    hijriIssueDate: '12/03/1444',
    expiryDate: '12/03/2025',
    hijriExpiryDate: '12/03/1445',
    issuePlace: 'Lorem',
    status: 'Active',
    attachmentCategories: 'General',
    file: 'A'
  }
]

const columns = [
  { key: 'idType', label: 'ID Type' },
  { key: 'idNumber', label: 'ID Number' },
  { key: 'issueDate', label: 'Issue Date' },
  { key: 'hijriIssueDate', label: 'Hijri Issue Date' },
  { key: 'expiryDate', label: 'Expiry Date' },
  { key: 'hijriExpiryDate', label: 'Hijri Expiry Date' },
  { key: 'issuePlace', label: 'Issue Place' },
  { key: 'status', label: 'Status', type: 'chip' },
  { key: 'attachmentCategories', label: 'Attachment Categories' },
  { key: 'file', label: 'File' },
  { type: 'action_menu' }
]

const IDTypeTable = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])
  const filteredData = data.filter(item =>
    Object.values(item)
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredData.length / perPage)

  const handleColumnAction = (id, action) => {
  }

  const handleExportCSV = () => {
  }

  const handleAddNew = () => {
  }

  const handleSelectChange = newSelectedIds => {
    setSelectedIds(newSelectedIds)
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center mb-4'>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder='Search'
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant='outlined'
            startIcon={<UploadIcon />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            Add New ID Type
          </Button>
        </div>
      </div>

      <DynamicTable
        columns={columns}
        data={filteredData}
        footerInfo={`records out of ${filteredData.length}`}
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={setCurrentPage}
        onPerPageChange={setPerPage}
        onColumnAction={handleColumnAction}
        showCheckbox={true}
        onSelectChange={handleSelectChange}
      />
    </div>
  )
}

export default IDTypeTable
