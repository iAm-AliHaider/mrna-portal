   import React, { useState } from 'react'
   import AddIcon from '@mui/icons-material/Add'
   import DynamicTable from '../../../../components/tables/AnnouncementsTable'
   import './style.css'
   import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
   import HomeIcon from '@mui/icons-material/Home'
   import SearchField from '../../../../components/common/searchField'
   import { useUser } from '../../../../context/UserContext'
   import { useAssetCategories, useDeleteAssetCategory } from '../../../../utils/hooks/api/assetCategories'
   import { useNavigate } from 'react-router-dom'
   import CustomMenu from '../../../../components/common/CustomMenu'
   import EditIcon from '@mui/icons-material/Edit'
   import DeleteIcon from '@mui/icons-material/Delete'

   const breadcrumbItems = [
     { href: '/home', icon: HomeIcon },
     { title: 'Company Info' },
     { title: 'Asset Categories' }
   ];
 
   const AssetCategories = () => {
     const navigate = useNavigate()
    const [page, setPage] = useState(1)
     const [perPage, setPerPage] = useState(10)
     const [searchQuery, setSearchQuery] = useState('')
   
     const { user } = useUser();
     const { categoriesData, totalPages, loading, refetch } = useAssetCategories(page-1, searchQuery, perPage)
     const { deleteAssetCategory } = useDeleteAssetCategory();
     const handleCreate = () => {
       navigate('/admin/company-info/asset-categories/add')
     }
 
     const handleSearch = (value) => {
       setSearchQuery(value)
       setPage(1)
     }

     const handleDelete = async (row) => {
        try {
            await deleteAssetCategory(row.id);
            refetch();
        } catch (err) {
            console.error(err);
        }
     }

     const columns = [
       { key: 'name', label: 'Name' },
       { key: 'description', label: 'Description', type: 'description', render: (row) => row?.description },
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
                 action: () => navigate(`/admin/company-info/asset-categories/edit/${row.id}`),
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
 
     const statusOptions = [
       { label: 'Pending', value: 'pending' },
       { label: 'Approved', value: 'approved' },
       { label: 'Declined', value: 'declined' },
     ]
 
     return (
       <React.Fragment>
         <PageWrapperWithHeading
           title='Asset Categories'
           items={breadcrumbItems}
           action={handleCreate}
           buttonTitle='Add Asset Category'
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
               data={categoriesData}
               footerInfo={`Asset Categories out of ${categoriesData?.length}`}
               currentPage={page}
               totalPages={totalPages}
               perPage={perPage}
               onPageChange={p => setPage(p - 1)}
               onPerPageChange={setPerPage}
               loading={loading}
             />
           </div>
         </PageWrapperWithHeading>
       </React.Fragment>
     )
   }
 
   export default AssetCategories