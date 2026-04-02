import React, { useState } from 'react';
import { Box, Typography, Paper, InputBase, Button, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DynamicTable from '../../../components/tables/AnnouncementsTable';
import CustomBreadcrumbs from '../../../components/common/BreadCrumbs';
import { useNavigate } from 'react-router-dom';
import { useCorporateEventsList, useDeleteCorporateEvents } from '../../../utils/hooks/api/corporateEvents';
import CustomMenu from '../../../components/common/CustomMenu';
import "./style.css"
import { ROLES } from '../../../utils/constants'
import { useUser } from "../../../context/UserContext";

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Corporate Events' }
];

const CorporateEventsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { user } = useUser();

  const navigate = useNavigate();
  const { eventData, totalPages, count, error, loading, refetch } = useCorporateEventsList(currentPage - 1, perPage, searchTerm);
  const { deleteCorporateEvents, loading: deleteLoading } = useDeleteCorporateEvents();

  const onSelectChange = ids => setSelectedIds(ids);
  const handleAddEvent = () => navigate('/employees/corporate-events/add');
  const handleEditEvent = id => navigate(`/employees/corporate-events/edit/${id}`);

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected event(s)?`)) {
      const result = await deleteCorporateEvents(selectedIds);
      if (result.success) {
        setSelectedIds([]);
        refetch();
      }
    }
  };

  const handleIndividualDelete = async id => {
    const result = await deleteCorporateEvents([id]);
    if (result.success) refetch();
  };

  const columns = [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description', type: 'description', render: (row) => row?.description  },
      { key: 'location', label: 'Location' },
      { key: 'date', label: 'Date' },
    { key: 'start_date', label: 'Event Start Time' },
    { key: 'end_date', label: 'Event End Time' },
        { key: 'status', label: 'Status', type: 'chip' },
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
              action: () => handleEditEvent(row.id),
            },
            {
              label: 'Delete',
              icon: <DeleteIcon fontSize='small' />,
              action: () => handleIndividualDelete(row.id),
              danger: true
            }
          ]}
        />
      )
    }
  ];


  return (
    <Box className='corporate-events-wrapper'>
      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={3}>
        <Typography variant='h5' fontWeight='bold'>Corporate Events</Typography>
        {/* <Button variant='contained' size='medium' onClick={handleAddEvent}>+ Add Event</Button> */}
         {/* Only show Add Event if NOT employee */}
  {user?.role !== ROLES.EMPLOYEE && (
    <Button
      variant="contained"
      size="medium"
      onClick={handleAddEvent}
    >
      + Add Event
    </Button>
  )}
      </Stack>
      <CustomBreadcrumbs items={breadcrumbItems} />
      <Paper elevation={0} className='p-5'>
        <Box className='search-filter-bar'>
          <Paper className='search-box' elevation={0}>
            <InputBase
              placeholder='Search'
              fullWidth
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </Paper>
         
        </Box>
        <DynamicTable
          columns={columns}
          data={eventData}
          currentPage={currentPage}
          totalPages={totalPages || 1}
          perPage={perPage}
          onPageChange={p => setCurrentPage(p)}
          onPerPageChange={setPerPage}
          footerInfo={`Showing ${eventData.length} of ${count} events`}
          loading={loading}
        />
      </Paper>
    </Box>
  );
};

export default CorporateEventsList; 