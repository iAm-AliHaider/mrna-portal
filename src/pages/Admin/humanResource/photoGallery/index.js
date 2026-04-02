import React, { useState, useEffect } from "react";
import "./style.css";
import NewPhotoForm from "./form";
import AddIcon from "@mui/icons-material/Add";
import PageWrapperWithHeading from "../../../../components/common/PageHeadSection";
import HomeIcon from "@mui/icons-material/Home";
import { useUser } from '../../../../context/UserContext'
import ImageCarousel from "./ImageCarousel";
import { usePhotos, useCreatePhoto, useDeletePhoto } from "../../../../utils/hooks/api/photoGallery";
import toast from "react-hot-toast/headless";
import { Button, Pagination, Box, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const breadcrumbItems = [
  { href: "/home", icon: HomeIcon },
  { title: "Human Resource" },
  { title: "Photo Gallery" },
];

const ITEMS_PER_PAGE = 12;

const PhotoGallery = () => {
  const { user } = useUser();
  const employeeId = user?.id;
  const [openFormModal, setOpenFormModal] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: photos, loading, totalCount, refetch } = usePhotos(currentPage, ITEMS_PER_PAGE);
  const { createPhoto, loading: createLoading } = useCreatePhoto();
  const { deletePhoto, loading: deleteLoading } = useDeletePhoto();

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const deletePhotoClick = async (id) => {
    try {
      await deletePhoto(id); // Soft delete (sets is_deleted = true)
      toast.success("Photo deleted");
      refetch();
      
      // Adjust current page if we deleted the last item on the current page
      if (photos.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // Extract photo URLs for carousel
  const imageUrls = photos?.map(photo => photo.photo_url).filter(Boolean) || [];

  const handleCreate = () => {
    setSelectedPhotoId(null);
    setOpenFormModal(true);
  };
  
  const handleCloseFormModal = () => setOpenFormModal(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        photo_url: values.photo_url,
        is_deleted: false,
        created_by: employeeId,
      };
     
      const created = await createPhoto(payload);
      toast.success("Photo uploaded successfully");
      handleCloseFormModal();
      refetch();
      photos.unshift(created);
      
      // Go to first page when adding new photo
      setCurrentPage(1);
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to submit photo");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <React.Fragment>
      <PageWrapperWithHeading
        title="Photo Gallery"
        items={breadcrumbItems}
        action={handleCreate}
        buttonTitle="Add Photo"
        Icon={AddIcon}
      >
        <div className="space-y-4">
          <ImageCarousel 
            images={imageUrls} 
            renderAction={(photoUrl) => {
              // Find the photo object that matches this URL
              const photo = photos?.find(p => p.photo_url === photoUrl);
              return photo && (photo.created_by === employeeId || user?.role === "admin") && (
                <Button
                  onClick={() => deletePhotoClick(photo.id)} 
                  size="small"
                  variant="contained"
                  color="error"
                  sx={{ minWidth: "auto", px: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </Button>
              );
            }}
          />

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
      <NewPhotoForm
        open={openFormModal}
        onClose={handleCloseFormModal}
        id={selectedPhotoId}
        photos={photos}
        handleSubmit={handleSubmit}
        loading={createLoading}
      />
    </React.Fragment>
  );
};

export default PhotoGallery;