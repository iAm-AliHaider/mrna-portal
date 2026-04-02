import React, { useState } from 'react'
import ImageCarousel from '../../../Admin/humanResource/photoGallery/ImageCarousel'
import { usePhotos } from '../../../../utils/hooks/api/photoGallery'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import HomeIcon from "@mui/icons-material/Home";
import { Pagination, Box, Typography } from "@mui/material";
import LoadingWrapper from '../../../../components/common/LoadingWrapper';

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Self Service" },
  { title: "Photo Gallery" },
];

const ITEMS_PER_PAGE = 12;

const PhotoGallery = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: photos, loading, totalCount, refetch } = usePhotos(currentPage, ITEMS_PER_PAGE);

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Extract photo URLs for carousel
  const imageUrls = photos?.map(photo => photo.photo_url).filter(Boolean) || [];

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <PageWrapperWithHeading
      title="Photo Gallery"
      items={breadcrumbItems}
    >
      <div className="space-y-4">
        <LoadingWrapper isLoading={loading}>
          <ImageCarousel images={imageUrls} />
        </LoadingWrapper>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Box className="flex flex-row-reverse items-center space-x-2 py-4">
            <Typography variant="body2" className="text-gray-600">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} photos
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="medium"
            />
          </Box>
        )}
      </div>
    </PageWrapperWithHeading>
  )
}

export default PhotoGallery
