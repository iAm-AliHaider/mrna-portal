import React, { useRef, useState, useEffect } from 'react'
import { useField } from 'formik'
import toast from 'react-hot-toast'
import { uploadFile } from '../../utils/s3'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import UploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import CancelIcon from '@mui/icons-material/Cancel'
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'

const ProfileImageUploader = ({ name, initialImageUrl }) => {
  const [field, meta, helpers] = useField(name)
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl || field.value || '')
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef()

  useEffect(() => {
    if (initialImageUrl || field.value) {
      setPreviewUrl(initialImageUrl || field.value)
    }
  }, [initialImageUrl, field.value])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) return toast.error('Only image files are allowed')
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    try {
      const uploadedUrl = await uploadFile(selectedFile)
      setPreviewUrl(uploadedUrl)
      helpers.setValue(uploadedUrl)
      setSelectedFile(null)
      toast.success('Profile image uploaded')
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreviewUrl('')
    helpers.setValue(null)
    setSelectedFile(null)
    toast.success('Image removed')
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Image Preview */}
      <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-gray-300 shadow-md group">
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Profile Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            />
            {/* Overlay (only when image exists) */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
              <Tooltip title="Change Photo">
                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ color: 'white' }}
                >
                  <AddAPhotoIcon />
                </IconButton>
              </Tooltip>
            </div>
          </>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col justify-center items-center text-gray-400 cursor-pointer bg-gray-50"
          >
            <AddAPhotoIcon fontSize="medium" />
            <span className="text-sm">Add Photo</span>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Action Buttons */}
      {selectedFile ? (
        <div className="flex gap-2 mt-2">
          <Tooltip title="Upload">
            <IconButton onClick={handleUpload} disabled={uploading} color="primary">
              <UploadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancel">
            <IconButton onClick={handleRemove} disabled={uploading} color="default">
              <CancelIcon />
            </IconButton>
          </Tooltip>
        </div>
      ) : (
        previewUrl && (
          <Tooltip title="Remove Photo">
            <IconButton onClick={handleRemove} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )
      )}
    </div>
  )
}

export default ProfileImageUploader
