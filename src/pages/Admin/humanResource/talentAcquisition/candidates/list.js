import React, { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import DeleteIcon from '@mui/icons-material/Delete'
import BlockIcon from '@mui/icons-material/Block';
import DownloadIcon from '@mui/icons-material/Download'
import BlockCandidateDialog from "./blockCandidate";

import DynamicTable from '../../../../../components/tables/AnnouncementsTable'
import FiltersWrapper from '../../../../../components/common/FiltersWrapper'
import ListFilter from './filters'
import { useNavigate } from 'react-router-dom'
import PageWrapperWithHeading from '../../../../../components/common/PageHeadSection'
import SearchInput from '../../../../../components/common/searchField'
import { useCandidates } from '../../../../../utils/hooks/api/useCandidates'
import CustomMenu from '../../../../../components/common/CustomMenu'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { supabase } from '../../../../../supabaseClient'
import toast from 'react-hot-toast'
import Modal from '../../../../../components/common/Modal';
import AttachmentsModal from './AttachmentsModal';
import FormikSelectField from '../../../../../components/common/FormikSelectField';
import { Formik, Form } from 'formik';
import { useVacanciesList } from '../../../../../utils/hooks/api/vacancies'
import { useDesignationsByDepartment } from '../../../../../utils/hooks/api/useDesignationsByDepartment';

const CandidatesList = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [filters, setFilters] = useState({
    candidate_number: '',
    filter_date: 'entery_date',
    from_date: '',
    to_date: ''
  })
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [attachmentCandidate, setAttachmentCandidate] = useState(null);
  // Modal state for Add Vacancy
  const [addVacancyModalOpen, setAddVacancyModalOpen] = useState(false);
  const [addVacancyCandidate, setAddVacancyCandidate] = useState(null);
  const [vacancyOptions, setVacancyOptions] = useState([]);
  const [addDesignationModalOpen, setAddDesignationModalOpen] = useState(false);
  const [addDesignationCandidate, setAddDesignationCandidate] = useState(null);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [designationDepartmentId, setDesignationDepartmentId] = useState(null);
    const [blockCandidateId, setBlockCandidateId] = useState(null);


  // Fetch all vacancies for dropdown
  const { vacancyData: allVacancies } = useVacanciesList(0, 1000, '');
  useEffect(() => {
    setVacancyOptions((allVacancies || []).map(v => ({ label: v.title, value: v.id })));
  }, [allVacancies]);


  useEffect(() => {
    if (addDesignationCandidate?.department) {
      setDesignationDepartmentId(addDesignationCandidate.department);
    } else {
      setDesignationDepartmentId(null);
    }
  }, [addDesignationCandidate]);

  const handleColumnAction = (row, column, value) => {
    if (column === 'attachments') {
      setAttachmentCandidate(row.attachments || row); // row.attachments for mappedData, row for raw
      setAttachmentModalOpen(true);
      return;
    }
    if (column === 'downloadCV') {
      window.open(row.downloadCV, '_blank');
      return;
    }
    if (column === 'action') {
      navigate(`/admin/human-resource/talent-acquisition/candidates/add/${row.id}`);
      return;
    }
    if (column === 'delete') {
      deleteCandidateAndRelated(row.id);
      return;
    }
    if (column === 'block') {
            setBlockCandidateId(row.id);
      setOpenModal(true);
      return;
    }
    if (column === 'addVacancy') {
      setAddVacancyCandidate(row);
      setAddVacancyModalOpen(true);
      return;
    }
    if (column === 'addDesignation') {
      setAddDesignationCandidate(row);
      setAddDesignationModalOpen(true);
      return;
    }
  };


  const handleAddDesignationSubmit = async (values, { setSubmitting }) => {
    if (!addDesignationCandidate) return;
    const { id } = addDesignationCandidate;
    const designationId = values.designation;
    const { error } = await supabase
      .from('candidates')
      .update({ designation: designationId })
      .eq('id', id);
    setSubmitting(false);
    setAddDesignationModalOpen(false);
    setAddDesignationCandidate(null);
    if (!error) {
      toast.success('Designation added successfully');
      setFilters(f => ({ ...f })); 
    } else {
      toast.error('Failed to add designation');
    }
  };
  
  
  const columns = [
    {
      key: 'candidateNumber',
      label: 'Candidate Number',
      type: 'html',
      width: '10%'
    },
    { key: 'fullName', label: 'Full Name', type: 'html', width: '15%' },
    { key: 'jobVacancy', label: 'Position Applied For', type: 'html', width: '15%' },
    { key: 'customVacancy', label: 'Own Vacancy', type: 'html', width: '15%' },
    { key: 'customDesignation', label: 'Own Designation', type: 'html', width: '15%' },
    {
      key: 'applicationStatus',
      label: 'Application Status',
      type: 'html',
      width: '8%'
    },
    // {
    //   key: 'interviewCreated',
    //   label: 'Interview Created',
    //   type: 'checkbox',
    //   width: '8%'
    // },
    { key: 'filingDate', label: 'Filing Date', type: 'html', width: '8%' },
    // {
    //   key: 'interviewStatus',
    //   label: 'Interview Status',
    //   type: 'html',
    //   width: '10%'
    // },
    // { key: 'offerSent', label: 'Offer Sent', type: 'checkbox', width: '6%' },
    // { key: 'offerStatus', label: 'Offer Status', type: 'html', width: '6%' },
    { key: 'hireStatus', label: 'Hire Status', type: 'html', width: '8%' },
    { key: 'modifiedDate', label: 'Modified Date', type: 'html', width: '8%' },
    {
      key: 'attachments',
      label: 'Attachments',
      type: 'button',
      width: '8%',
      buttonLabel: 'Attachments',
      icon: <DownloadIcon fontSize='small' />
      // Removed onClick here; handled in handleColumnAction
    },
    {
      type: 'custom',
      label: 'Actions',
      width: '10%',
      render: row => (
        <CustomMenu
          items={[
            {
              label: 'View',
              icon: <VisibilityOutlinedIcon fontSize='small' />,
              action: () => handleColumnAction(row, 'action'),
            },
            {
              label: 'Block',
              icon: <BlockIcon fontSize='small' />,
              action: () => handleColumnAction(row, 'block'),
              danger: true
            },
            {
              label: 'Delete',
              icon: <DeleteIcon fontSize='small' />,
              action: () => handleColumnAction(row, 'delete'),
              danger: true
            },
            // Add Vacancy action if no vacancy
            ...(row.jobVacancy === '-' ? [{
              label: 'Add Vacancy',
              icon: <EditIcon fontSize='small' />,
              action: () => handleColumnAction(row, 'addVacancy'),
            }] : []),
            // Add Designation action if no designation
            ...(( (row.designation === null)) ? [{
              label: 'Add Designation',
              icon: <EditIcon fontSize='small' />,
              action: () => handleColumnAction(row, 'addDesignation'),
            }] : [])
          ]}
        />
      )
    }
  ]
  
  const breadcrumbItems = [
    { href: '/home', icon: HomeIcon },
    { title: 'Human Resource', href: '#' },
    { title: 'Talent Acquisition' },
    { title: 'Candidates' }
  ]

    const [openModal, setOpenModal] = useState(false);
  
  
  const { candidatesData, totalPages, candidateNames, loading } = useCandidates(currentPage - 1, searchQuery, filters, perPage)

  // Filtering is already handled by the hook, but you can add extra filtering here if needed
  const [localDeletedIds, setLocalDeletedIds] = useState([])
  const filteredData = candidatesData.filter(
    row =>
      !row.is_deleted &&
      !localDeletedIds.includes(row.id) &&
      (([row.first_name, row.second_name].filter(Boolean).join(' ') || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.candidate_no || '').toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Map Supabase data to table columns
  const mappedData = filteredData.map(row => ({
    candidateNumber: row.candidate_no,
    fullName: [row.first_name, row.second_name,row.third_name,row.forth_name,row.family_name].filter(Boolean).join(' '),
    jobVacancy: row.vacancy?.title || '-',
    customVacancy: (row.designation == null && row.vacancy == null)
      ? (row.own_vacancy && row.own_vacancy.trim() !== '' ? row.own_vacancy : '-')
      : '-',
    customDesignation: (row.designation == null && row.vacancy == null)
      ? (row.own_designation && row.own_designation.trim() !== '' ? row.own_designation : '-')
      : '-',
    designation: row.designation,
    department: row.department,
    applicationStatus: row.application_status || '-',
    avaliablePosition: row.available_position || '-',
    filingDate: row.filing_date ? new Date(row.filing_date).toLocaleDateString() : '-',
    hireStatus: row.is_employee ? 'Hired' : 'Not Hired',
    modifiedDate: row.updated_at ? new Date(row.updated_at).toLocaleDateString() : '-',
    attachments: row,
    id: row.id,
    action: row,
    status: row.status
  }))

  const onSelectChange = ids => setSelectedIds(ids)

  const handleChangeFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyFilter = newValues => {
    setFilters(prev => ({ ...prev, ...newValues }))
  }

  const resetFilters = () => {
    setFilters({
      candidate_number: '',
      filter_date: 'entery_date',
      from_date: '',
      to_date: ''
    })
  }

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset page when searching
  };


  const deleteCandidateAndRelated = async (candidateId) => {
    try {
      await supabase.from("candidates").update({ is_deleted: true }).eq("id", candidateId)
      setLocalDeletedIds(ids => [...ids, candidateId])
      toast.success('Candidate deleted successfully')
    } catch (err) {
      toast.error('Failed to delete candidate')
      console.error(err)
    }
  }
  
  // Add Vacancy Modal logic
  const handleAddVacancySubmit = async (values, { setSubmitting }) => {
    if (!addVacancyCandidate) return;
    const { id } = addVacancyCandidate;
    const vacancyId = values.vacancy;
    const { error } = await supabase
      .from('candidates')
      .update({ vacancy: vacancyId })
      .eq('id', id);
    setSubmitting(false);
    setAddVacancyModalOpen(false);
    setAddVacancyCandidate(null);
    if (!error) {
      toast.success('Vacancy added successfully');
      // Refresh the list
      setFilters(f => ({ ...f })); // triggers useCandidates to refetch
    } else {
      toast.error('Failed to add vacancy');
    }
  };


  
  const handleBlock = async (values, { setSubmitting }) => {
    
    setSubmitting(true);
    try {
      const updateCandidate = {
        ...values,
        block_reason: values.block_reason,
        status: "block",
      };

      const { error: updateError } = await supabase
        .from("candidates")
        .update(updateCandidate)
        .eq('id', blockCandidateId);

      if (updateError) {
        throw new Error("Candidate update failed: " + updateError.message);
      }
      toast.success("Candidate blocked successfully!");
      setSubmitting(false)
      setOpenModal(false);
      setFilters(f => ({ ...f })); // triggers useCandidates to refetch
      setBlockCandidateId(null);
    } catch (err) {
      toast.error("Candidate update error:", err.message);
    } finally {
            
    }
  };


  const { designations: departmentDesignations, loading: designationLoading } = useDesignationsByDepartment(designationDepartmentId);

  return (
    <PageWrapperWithHeading
      title='Candidates'
      items={breadcrumbItems}
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
              <ListFilter
                values={filters}
                label='Type'
                options={candidateNames}
                handleChange={handleChangeFilter}
                placeholder='Select Type'
              />
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
          footerInfo={`Candidates out of ${mappedData.length}`}
          loading={loading}
        />
   {openModal &&  (
          <BlockCandidateDialog
            handleBlock={handleBlock}
            closeModal={() => {
              setOpenModal(false);
              setBlockCandidateId(null);
            }}
          />
        )}

        <AttachmentsModal open={attachmentModalOpen} onClose={() => setAttachmentModalOpen(false)} candidate={attachmentCandidate} />
        {/* Add Vacancy Modal */}
        <Modal open={addVacancyModalOpen} onClose={() => setAddVacancyModalOpen(false)}>
          <div className=' min-w-[300px]'>
            <h2 className='text-lg font-bold mb-4'>Add Vacancy</h2>
            <Formik
              initialValues={{ vacancy: '' }}
              onSubmit={handleAddVacancySubmit}
            >
              {({ isSubmitting, setFieldValue, values }) => (
                <Form className='flex flex-col gap-4'>
                  <FormikSelectField
                    name='vacancy'
                    label='Select Vacancy'
                    options={vacancyOptions}
                    onChange={value => setFieldValue('vacancy', value)}
                    required
                  />
                  <div className='flex justify-end gap-2'>
                    <Button onClick={() => setAddVacancyModalOpen(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type='submit' variant='contained' color='primary' disabled={isSubmitting || !values.vacancy}>
                      Add
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </Modal>
        {/* Add Designation Modal */}
        <Modal open={addDesignationModalOpen} onClose={() => setAddDesignationModalOpen(false)}>
          <div className=' min-w-[300px]'>
            <h2 className='text-lg font-bold mb-4'>Add Designation</h2>
            <Formik
              initialValues={{ designation: '' }}
              onSubmit={handleAddDesignationSubmit}
            >
              {({ isSubmitting, setFieldValue, values }) => (
                <Form className='flex flex-col gap-4'>
                  <FormikSelectField
                    name='designation'
                    label='Select Designation'
                    options={departmentDesignations}
                    onChange={value => setFieldValue('designation', value)}
                    required
                    loading={designationLoading}
                  />
                  <div className='flex justify-end gap-2'>
                    <Button onClick={() => setAddDesignationModalOpen(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type='submit' variant='contained' color='primary' disabled={isSubmitting || !values.designation}>
                      Add
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          

        </Modal>

     
      </div>
    </PageWrapperWithHeading>
  )
}

export default CandidatesList