import React, { useState } from 'react'
import Button from '@mui/material/Button'
import UploadIcon from '@mui/icons-material/Upload'
import AddIcon from '@mui/icons-material/Add'
import DynamicTable from '../../../../../../components/tables/AnnouncementsTable'
import SearchInput from '../../../../../../components/common/searchField'

const data = [
  {
    id: 1,
    attachmentCategories: 'General',
    attachmentName: 'ملف أكرم',
    description: 'Lorem ipsum dolor sit',
    fileSize: '2547153'
  },
  {
    id: 2,
    attachmentCategories: 'General',
    attachmentName: 'اقامات',
    description: 'Lorem ipsum dolor sit',
    fileSize: '385195'
  },
  {
    id: 3,
    attachmentCategories: 'General',
    attachmentName: 'اقامة',
    description: 'Lorem ipsum dolor sit',
    fileSize: '557149'
  }
]

const columns = [
  { key: 'attachmentCategories', label: 'Attachment Categories' },
  { key: 'attachmentName', label: 'Attachment Name' },
  { key: 'description', label: 'Description' },
  { key: 'fileSize', label: 'File Size' },
  { type: 'action_menu' }
]

const AttachmentsTable = () => {
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
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}
      >
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
            Add New Attachment
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

export default AttachmentsTable
