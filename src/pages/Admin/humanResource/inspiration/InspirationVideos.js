import React, { useState } from 'react'
import HomeIcon from '@mui/icons-material/Home'
import DeleteIcon from '@mui/icons-material/Delete'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import InspirationVideoForm from './form'
import { useUser } from '../../../../context/UserContext'
import toast from 'react-hot-toast'
import { Box, Pagination, Typography } from '@mui/material'
import {
  useCreateInspirationVideos,
  useDeleteVideo,
  useInspirationVideos
} from '../../../../utils/hooks/api/inspirationVideos'
import { ROLES } from '../../../../utils/constants'

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Human Resource', href: '#' },
  { title: 'Inspiring Vedios' }
]

const ITEMS_PER_PAGE = 12

const InspirationVideos = () => {
  const { user } = useUser()
  const [currentPage, setCurrentPage] = useState(1)
  const [openForm, setOpenForm] = useState(false)

  const {
    data: inspirationData,
    loading: fetchLoading,
    totalCount,
    refetch
  } = useInspirationVideos(currentPage, ITEMS_PER_PAGE)

  const { createVideo, loading: createLoading } = useCreateInspirationVideos()
  const { deleteVideo, loading: deleteLoading } = useDeleteVideo()

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        attachment_path: values?.attachment_path || '',
        title: values?.title || '',
        url: values?.url || '',
        catagory: values?.catagory || '',
        created_by: user?.id,
        updated_by: user?.id
      }

      await createVideo(payload)
      toast.success('Video created successfully')
      setOpenForm(false)
      refetch()
      setCurrentPage(1)
    } catch (err) {
      console.error('Submission failed:', err)
      toast.error('Failed to submit video')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async videoId => {
    try {
      await deleteVideo(videoId)
      toast.success('Video deleted successfully')
      refetch()
      if (inspirationData.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (err) {
      console.error(err)
      toast.error('Delete failed')
    }
  }

  const handleVideoClick = videoId => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')
  }

  const handlePageChange = (_, newPage) => {
    setCurrentPage(newPage)
  }

  const isLoading = fetchLoading || createLoading || deleteLoading

  return (
    <PageWrapperWithHeading
      title='Inspiring Vedios'
      items={breadcrumbItems}
      action={user?.role !== 'employee' ? () => setOpenForm(true) : null}
      buttonTitle='+ Add Video'
    >
      <div className='relative p-4 mx-auto min-h-[300px]'>
        {/* Global Overlay Loader */}
        {isLoading && (
          <div className='absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10'>
            <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin' />
          </div>
        )}

        {/* Grid or Message */}
        {!isLoading && inspirationData?.length === 0 ? (
          <div className='text-center text-gray-500'>No videos available.</div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
            {inspirationData?.map(video => {
              return (
                <div
                  key={video?.id}
                  className='relative rounded-lg overflow-hidden hover:opacity-90 transition-opacity shadow-md group'
                >
                  <a href={video.url} target='_blank' rel='noopener noreferrer'>
                    <img
                      src={video?.attachment_path}
                      alt={video?.title}
                      className='w-full h-auto object-cover'
                    />
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='bg-white bg-opacity-70 p-2 rounded-full hover:bg-opacity-90 transition-all'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-6 w-6 text-indigo-600'
                          fill='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path d='M8 5v14l11-7z' />
                        </svg>
                      </div>
                    </div>
                  </a>

                  <div className='mt-2 p-2 text-sm font-medium'>
                    {video?.title}
                  </div>

                  <button
                    onClick={() => handleDelete(video?.id)}
                    disabled={deleteLoading}
                    className='absolute top-2 right-2 bg-white bg-opacity-80 p-1 rounded-full shadow hover:bg-opacity-100 transition disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {deleteLoading ? (
                      <div className='w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin' />
                    ) : (
                      <DeleteIcon fontSize='small' className='text-red-600' />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!fetchLoading && totalPages > 1 && (
          <Box className='flex flex-row-reverse items-center space-x-2 py-4'>
            <Typography variant='body2' className='text-gray-600'>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{' '}
              {totalCount} videos
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color='primary'
              size='medium'
            />
          </Box>
        )}
      </div>

      {openForm && (
        <InspirationVideoForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          handleSubmit={handleSubmit}
          isSubmitting={createLoading}
        />
      )}
    </PageWrapperWithHeading>
  )
}

export default InspirationVideos
