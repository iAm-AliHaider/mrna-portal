import React, { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import FiltersWrapper from '../../../../components/common/FiltersWrapper'
import { useNavigate } from 'react-router-dom'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import SearchInput from '../../../../components/common/searchField'
import { useSuccessionPlanning, useDeleteSuccessionPlanning } from '../../../../utils/hooks/api/successionPlanning'
import { useDesignations } from '../../../../utils/hooks/api/useDesignations'
import { useEmployeesData } from '../../../../utils/hooks/api/emplyees'
import CustomMenu from '../../../../components/common/CustomMenu'
import toast from 'react-hot-toast'
const SuccessionPlanningList = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [filters, setFilters] = useState({
    position: '',
    succession_to: '',
    from_date: '',
    to_date: ''
  })

  // Create stable filters object to prevent infinite re-renders
  const stableFilters = React.useMemo(() => filters, [filters])
  const { successionData, totalPages, refetch } = useSuccessionPlanning(currentPage - 1, searchQuery, stableFilters, perPage)
  const { deleteSuccessionPlanning, loading: deleteLoading } = useDeleteSuccessionPlanning()
  
  // Get designations and employees for filters
  const { designationNames: designations } = useDesignations(0, '', React.useMemo(() => ({}), []), 1000)
  const { data: employeesData } = useEmployeesData()

  // Transform employee data for dropdown
  const employees = React.useMemo(() => {
    if (!employeesData || employeesData.length === 0) return [];
    
    return employeesData.map(emp => ({
      label: `${emp.candidates?.first_name || ''} ${emp.candidates?.family_name || ''}`.trim() || `Employee #${emp.employee_code}`,
      value: emp.id.toString()
    }));
  }, [employeesData]);

  const handleColumnAction = (row, column, value) => {
    if (column === 'action') {
      navigate(`/admin/human-resource/succession-planning/edit/${row.id}`);
      return;
    }
    if (column === 'delete') {
      handleDeleteSuccessionPlanning(row.id);
    }
  };
  
  const columns = [
    {
      key: 'position',
      label: 'Position',
     
      width: '20%'
    },
    { 
      key: 'succession_to', 
      label: 'Succession To', 
      
      width: '20%' 
    },
    {
      key: 'annual_evaluation_score',
      label: 'Evaluation Score',
   
      width: '15%'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'chip',
      width: '15%'
    },
    { 
      key: 'modifiedDate', 
      label: 'Modified Date', 
      type: 'html', 
      width: '15%' 
    },
    {
      type: 'custom',
      label: 'Actions',
      width: '15%',
      render: row => (
        <CustomMenu
          items={[
            // {
            //   label: 'Edit',
            //   icon: <EditIcon fontSize='small' />,
            //   action: () => handleColumnAction(row, 'action'),
            // },
            {
              label: 'Delete',
              icon: <DeleteIcon fontSize='small' />,
              action: () => handleColumnAction(row, 'delete'),
              danger: true
            }
          ]}
        />
      )
    }
  ]
  
  const breadcrumbItems = [
    { href: '/home', icon: HomeIcon },
    { title: 'Human Resource' },
    { title: 'Succession Planning' }
  ]

  // Filtering is already handled by the hook, but you can add extra filtering here if needed
  const [localDeletedIds, setLocalDeletedIds] = useState([])
  const filteredData = successionData.filter(
    row => !localDeletedIds.includes(row.id)
  )

  // Map Supabase data to table columns
  const mappedData = filteredData.map(row => {
    // Find employee name by ID
    const employee = employees.find(emp => emp.value === row.succession_to?.toString());
    
    return {
      position: row.position || '-',
      succession_to: employee ? employee.label : `Employee #${row.succession_to}`,
      annual_evaluation_score: row.annual_evaluation_score || '-',
      status: getStatus(row),
      modifiedDate: row.updated_at ? new Date(row.updated_at).toLocaleDateString() : '-',
      id: row.id,
      action: row, // Pass the whole row for action column
    };
  });

  // Helper function to determine status based on completion of tasks
  function getStatus(row) {
    const tasks = [
      row.evaluation_completion,
      row.minimum_one_year_at_mrna,
      row.successor_consent,
      row.gap_analysis_and_assesment,
      row.skill_and_qualification,
      row.successor_selection,
      row.training_plan_development,
      row.course_application_and_approval,
      row.performance_review,
      row.final_certification
    ];
    
    const completedTasks = tasks.filter(task => task === true).length;
    const totalTasks = tasks.length;
    
    if (completedTasks === 0) return 'Not Started';
    if (completedTasks === totalTasks) return 'Completed';
    if (completedTasks >= totalTasks / 2) return 'In Progress';
    return 'Started';
  }

  const onSelectChange = ids => setSelectedIds(ids)

  const handleChangeFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyFilter = newValues => {
    setFilters(prev => ({ ...prev, ...newValues }))
  }

  const resetFilters = () => {
    setFilters({
      position: '',
      succession_to: '',
      from_date: '',
      to_date: ''
    })
  }

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset page when searching
  };

  const handleAddSuccessionPlanning = () => {
    navigate('/admin/human-resource/succession-planning/add')
  }

  const handleDeleteSuccessionPlanning = async (successionPlanningId) => {
    try {
      const result = await deleteSuccessionPlanning(successionPlanningId)
      if (result) {
        setLocalDeletedIds(ids => [...ids, successionPlanningId])
        refetch() // Refresh the data after deletion
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <PageWrapperWithHeading
      title='Succession Planning'
      items={breadcrumbItems}
      action={handleAddSuccessionPlanning}
      buttonTitle='+ Add Succession Planning'
    >
      <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
        {/* Search and Filter Bar */}
        <div className='flex justify-between items-center w-full'>
          <SearchInput value={searchQuery} onChange={handleSearch} />
          <div className='flex gap-4'>
            <FiltersWrapper
              onApplyFilters={handleApplyFilter}
              resetFilters={resetFilters}
            >
              <div className='flex gap-4'>
                <select
                  value={filters.position}
                  onChange={(e) => handleChangeFilter('position', e.target.value)}
                  className='border border-gray-300 rounded px-3 py-2'
                >
                  <option value=''>All Positions</option>
                  {designations.map(designation => (
                    <option key={designation.value} value={designation.value}>
                      {designation.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.succession_to}
                  onChange={(e) => handleChangeFilter('succession_to', e.target.value)}
                  className='border border-gray-300 rounded px-3 py-2'
                >
                  <option value=''>All Employees</option>
                  {employees.map(employee => (
                    <option key={employee.value} value={employee.value}>
                      {employee.label}
                    </option>
                  ))}
                </select>
              </div>
            </FiltersWrapper>
          </div>
        </div>

        {/* Table */}
        <DynamicTable
          columns={columns}
          data={mappedData}
          onSelectChange={onSelectChange}
          selectedIds={selectedIds}
          onAction={handleColumnAction}
          currentPage={currentPage}
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={setPerPage}
          footerInfo={`Succession Planning records out of ${mappedData.length}`}
        />
      </div>
    </PageWrapperWithHeading>
  )
}

export default SuccessionPlanningList 