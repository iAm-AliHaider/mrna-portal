// pages/admin/human-resource/self-service/my-documents/index.tsx

'use client'

import React, { useState, useEffect } from 'react'
import './style.css'
import MasterDataRequestForm from './form'
import AddIcon from '@mui/icons-material/Add'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import HomeIcon from '@mui/icons-material/Home'
import SearchField from '../../../../components/common/searchField'
import DynamicTable from '../../../../components/tables/AnnouncementsTable'
import SelectField from '../../../../components/common/SelectField'
import { useCreateMyMasterData, useMyMasterData } from '../../../../utils/hooks/api/masterData'
import { useUser } from '../../../../context/UserContext'
import { supabase } from '../../../../supabaseClient'
import { useGenericFlowEmployees } from '../../../../utils/hooks/api/genericApprovalFlow'
import { transactionEmailSender } from '../../../../utils/helper'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Self Service' },
  { title: 'Master Data Request' }
]

const MasterDataRequest = () => {
  const [designationMap, setDesignationMap] = useState({})
  const [departmentMap, setDepartmentMap] = useState({})
  const [branchMap, setBranchMap] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [openFormModal, setOpenFormModal] = useState(false)
  const [editDoc, setEditDoc] = useState(null)
  const [filters, setFilters] = useState({ status: '' })
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const { user } = useUser()
  const employeeId = user?.id

  const {
    documents: data,
    totalPages,
    count,
    loading,
    refetch
  } = useMyMasterData(page, searchQuery, filters, perPage)

  const { createMyDocument } = useCreateMyMasterData()

  // Preload all unique IDs and resolve them to names
  useEffect(() => {
    const preloadNames = async () => {
      const designationIds = new Set()
      const departmentIds = new Set()
      const branchIds = new Set()

      data?.forEach(item => {
        if (item.old_designation) designationIds.add(item.old_designation)
        if (item.new_designation) designationIds.add(item.new_designation)
        if (item.old_department) departmentIds.add(item.old_department)
        if (item.new_department) departmentIds.add(item.new_department)
        if (item.old_branch) branchIds.add(item.old_branch)
        if (item.new_branch) branchIds.add(item.new_branch)
      })

      const [designationRes, departmentRes, branchRes] = await Promise.all([
        supabase.from('designations').select('id,name').in('id', [...designationIds]),
        supabase.from('organizational_units').select('id,name').in('id', [...departmentIds]),
        supabase.from('branches').select('id,name').in('id', [...branchIds]),
      ])

      setDesignationMap(Object.fromEntries((designationRes.data || []).map(d => [d.id, d.name])))
      setDepartmentMap(Object.fromEntries((departmentRes.data || []).map(d => [d.id, d.name])))
      setBranchMap(Object.fromEntries((branchRes.data || []).map(b => [b.id, b.name])))
    }

    preloadNames()
  }, [data])

  // Map values for table display
  const mappedData = data?.map(item => {
    const { type } = item
    let oldVal = '-'
    let newVal = '-'

    switch (type) {
      case 'passport_info':
        oldVal = item.old_passport_number ?? '-'
        newVal = item.new_passport_number ?? '-'
        break
      case 'branch':
        oldVal = branchMap[item.old_branch] || item.old_branch || '-'
        newVal = branchMap[item.new_branch] || item.new_branch || '-'
        break
      case 'family_size':
        oldVal = item.old_family_size ?? '-'
        newVal = item.new_family_size ?? '-'
        break
      case 'department':
        oldVal = departmentMap[item.old_department] || item.old_department || '-'
        newVal = departmentMap[item.new_department] || item.new_department || '-'
        break
      case 'designation':
        oldVal = designationMap[item.old_designation] || item.old_designation || '-'
        newVal = designationMap[item.new_designation] || item.new_designation || '-'
        break
      case 'salary':
        oldVal = item.old_salary ?? '-'
        newVal = item.new_salary ?? '-'
        break
      case 'number':
        oldVal = item.old_work_number ?? '-'
        newVal = item.new_work_number ?? '-'
        break
        case 'probation':
  oldVal = '-'
  newVal = item.reason ?? '-'
  break
      case 'address':
        oldVal = item.old_address ?? '-'
        newVal = item.new_address ?? '-'
        break
      default:
        break
    }

    return {
      type: type || '-',
      old_value: oldVal,
      new_value: newVal,
      status: item.status || '-',
    }
  })

  const columns = [
    { key: 'type', label: 'Type' },
    { key: 'old_value', label: 'Old Value' },
    { key: 'new_value', label: 'New Value' },
    { key: 'status', label: 'Status', type: 'chip'  }
  ]

  const { workflow_employees, loadingEmployees } = useGenericFlowEmployees();
  

  const handleFormSubmit = async (values) => {
    
    const today = new Date().toISOString().split('T')[0]
    const { type, old_value, new_value, reason } = values
    let subject = type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Update';
    
    if (type === 'probation') {
      const payload = {
        type,
        reason,
        status: 'pending',
        created_by: employeeId,
        updated_by: employeeId,
        created_at: today,
        updated_at: today,
        status_workflow: workflow_employees
      }


      if (user?.role === 'hr_manager') {
        payload.status = 'approved';
      } 
      
      
      await createMyDocument(payload);
      await transactionEmailSender(user, payload, "Master Data Request", subject);
      setOpenFormModal(false)
      setEditDoc(null)
      refetch()
      return
    }
  
    const fieldMap = {
      passport_info: { oldKey: 'old_passport_number', newKey: 'new_passport_number' },
      branch: { oldKey: 'old_branch', newKey: 'new_branch' },
      family_size: { oldKey: 'old_family_size', newKey: 'new_family_size' },
      department: { oldKey: 'old_department', newKey: 'new_department' },
      designation: { oldKey: 'old_designation', newKey: 'new_designation' },
      salary: { oldKey: 'old_salary', newKey: 'new_salary' },
      number: { oldKey: 'old_work_number', newKey: 'new_work_number' },
      address: { oldKey: 'old_address', newKey: 'new_address' },
    }
  
    const selectedField = fieldMap[type]
    if (!selectedField) return
  
    const needsNumber = ['family_size', 'salary', 'number']
    const needsId = ['branch', 'department', 'designation']
  
    let cleanedOldValue = old_value
    let cleanedNewValue = new_value
  
    if (needsNumber.includes(type)) {
      cleanedOldValue = old_value === '' ? null : Number(old_value)
      cleanedNewValue = new_value === '' ? null : Number(new_value)
    }
  
    if (needsId.includes(type)) {
      cleanedOldValue = old_value === '' ? null : parseInt(old_value)
      cleanedNewValue = new_value === '' ? null : parseInt(new_value)
    }
  
    const payload = {
      [selectedField.oldKey]: cleanedOldValue,
      [selectedField.newKey]: cleanedNewValue,
      type,
      status: 'pending',
      created_by: employeeId,
      updated_by: employeeId,
      created_at: today,
      updated_at: today,
      status_workflow: workflow_employees
    }

    
  if (user?.role === 'hr_manager') {
        payload.status = 'approved';
    } 
  
    await createMyDocument(payload)
    await transactionEmailSender(user, payload, "Master Data Request", subject);
    setOpenFormModal(false)
    setEditDoc(null)
    refetch()
  }
  
  

  return (
    <>
      <PageWrapperWithHeading
        title='Master Data Request'
        items={breadcrumbItems}
        action={() => setOpenFormModal(true)}
        buttonTitle='Add Master Data'
        Icon={AddIcon}
      >
        <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
          <div className='flex justify-between items-center w-full'>
            <SearchField value={searchQuery} onChange={setSearchQuery} />
            <div className='w-[300px]'>
              <SelectField 
                options={[
                  { label: 'Pending', value: 'pending' },
                  { label: 'Approved', value: 'approved' },
                  { label: 'Declined', value: 'declined' },
                ]} 
                placeholder='Status' 
                value={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              />
            </div>
          </div>

          <DynamicTable
            columns={columns}
            data={mappedData}
            footerInfo={`Documents out of ${count}`}
            currentPage={page + 1}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={p => setPage(p - 1)}
            onPerPageChange={setPerPage}
            loading={loading}
          />
        </div>
      </PageWrapperWithHeading>

      <MasterDataRequestForm
        open={openFormModal}
        onClose={() => setOpenFormModal(false)}
        onSubmit={handleFormSubmit}
        editDoc={editDoc}
        loading={loading}
      />
    </>
  )
}

export default MasterDataRequest