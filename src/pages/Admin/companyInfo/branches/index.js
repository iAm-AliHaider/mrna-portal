import React, { useState } from 'react'
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import './style.css'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import HomeIcon from '@mui/icons-material/Home'
import SelectField from '../../../../components/common/SelectField'
import SearchField from '../../../../components/common/searchField'
import FiltersWrapper from '../../../../components/common/FiltersWrapper'
import { useUser } from '../../../../context/UserContext'
import { useBranches, useDeleteBranch } from '../../../../utils/hooks/api/branches'
import { useNavigate } from 'react-router-dom'
import ListFilter from '../../../../components/common/ListFilter'
import CustomMenu from '../../../../components/common/CustomMenu'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Company Info' },
  { title: 'Branches' }
];

const Branches = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  const { user } = useUser();
  const { branchesData, totalPages, loading, refetch } = useBranches(page-1, searchQuery, perPage)
  const { deleteBranch } = useDeleteBranch();
  
  const handleCreate = () => {
    navigate('/admin/company-info/branches/add')
  }

  const handleSearch = (value) => {
    setSearchQuery(value)
    // Reset page to 1 when searching
    setPage(1)
  }

  const handleDelete = async (row) => {
    try {
      await deleteBranch(row.id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'short_code', label: 'Short Code' },
    { key: 'lat', label: 'Latitude' },
    { key: 'long', label: 'Longitude' },
    {
      type: 'custom',
      label: 'Actions',
      width: '10%',
      render: row => (
        <CustomMenu
          items={[
            {
              label: 'Edit',
              icon: <EditIcon fontSize='small' />,
              action: () => navigate(`/admin/company-info/branches/edit/${row.id}`),
            },
            {
              label: 'Delete',
              icon: <DeleteIcon fontSize='small' />,
              action: () => handleDelete(row),
              danger: true,
            },
          ]}
        />
      )
    }
  ]

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title='Branches'
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle='Add Branch'
        Icon={AddIcon}
      >
        <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
          {/* Filters */}
          <div className='flex justify-between items-center w-full'>
            <SearchField 
              value={searchQuery} 
              onChange={handleSearch}
              placeholder="Search here..."
            />
          </div>

          <DynamicTable
            columns={columns}
            data={branchesData}
            footerInfo={`Branches out of ${branchesData?.length}`}
            currentPage={page}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={p => setPage(p)}
            onPerPageChange={n => setPerPage(n)}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>
    </React.Fragment>
  )
}

export default Branches 