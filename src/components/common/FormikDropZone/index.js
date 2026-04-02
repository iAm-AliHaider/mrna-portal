import React, { useState, useEffect, useCallback } from 'react'
import { useField } from 'formik'
import toast from 'react-hot-toast'
import { uploadFile } from '../../../utils/s3'

const FormikDropZone = ({
  label,
  required,
  maxSize = 50,
  acceptedFormats = ['JPG', 'PNG', 'MP4', 'JPEG'],
  ...props
}) => {
  const [field, meta, helpers] = useField(props.name)
  const { setValue, setTouched } = helpers
  const [isLoading, setIsLoading] = useState(false)
  const [fileNames, setFileNames] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!field.value) {
      setValue([])
    }
    if (field.value && field.value.length > 0) {
      setFileNames(
        field.value.map(file => ({
          name: file.split('/').pop(),
          size: '0MB'
        }))
      )
    }
  }, [])

  const validateFile = useCallback(
    file => {
      const sizeInMB = file.size / (1024 * 1024)
      const extension = file.name.split('.').pop().toUpperCase()

      if (sizeInMB > maxSize) {
        toast.error(`File size should be less than ${maxSize}MB`)
        return false
      }

      if (!acceptedFormats.includes(extension)) {
        toast.error(`Only ${acceptedFormats.join(', ')} files are allowed`)
        return false
      }

      return true
    },
    [maxSize, acceptedFormats]
  )

  const handleFiles = async files => {
    const validFiles = Array.from(files).filter(validateFile)
    if (validFiles.length === 0) return

    const newFileNames = validFiles.map(file => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)}MB`
    }))

    setTouched(true)

    try {
      setIsLoading(true)
      const fileUrls = await Promise.all(
        validFiles.map(file => getSignedUrl(file))
      )
      const currentValue = Array.isArray(field.value) ? field.value : []
      setValue([...currentValue, ...fileUrls])
      setFileNames(prev => [...prev, ...newFileNames])
    } catch (error) {
      toast.error(error?.detail || 'File upload failed')
    } finally {
      setIsLoading(false)
    }
  }

  const getSignedUrl = async file => {
    try {
      const response = await uploadFile(file)
      if (response) return response || ''
      else toast.error('File upload failed')
    } catch (error) {
      throw error
    }
  }

  const removeFile = index => {
    const newFileNames = [...fileNames]
    newFileNames.splice(index, 1)
    setFileNames(newFileNames)

    const currentValue = Array.isArray(field.value) ? field.value : []
    const newUrls = [...currentValue]
    newUrls.splice(index, 1)
    setValue(newUrls)
  }

  const handleDrop = useCallback(
    e => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback(e => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(e => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const showError =
    meta.touched &&
    (meta.error || (required && (!field.value || field.value.length === 0)))
  const errorMessage =
    meta.error ||
    (required && (!field.value || field.value.length === 0)
      ? 'At least one media upload is required'
      : '')

  return (
    <div className='w-full'>
      <h3 className='text-lg font-medium mb-2'>
        {label || 'Media Uploads'}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </h3>

      <div
        className={`border-2 border-dashed rounded-lg p-8 ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className='flex flex-col items-center justify-center gap-4'>
          <svg
            className='w-8 h-8 text-gray-400'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
            />
          </svg>

          <div className='text-center'>
            <p className='text-lg text-gray-700'>
              Choose a file or drag & drop it here
            </p>
            <p className='text-sm text-gray-500 mt-1'>
              {acceptedFormats.join(', ')} formats, up to {maxSize}MB
            </p>
          </div>

          <label className='bg-white px-4 py-2 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50'>
            Browse file
            <input
              type='file'
              className='hidden'
              onChange={e => handleFiles(e.target.files)}
              accept={acceptedFormats
                .map(format => `.${format.toLowerCase()}`)
                .join(',')}
              multiple
            />
          </label>
        </div>
      </div>

      {fileNames.length > 0 && (
        <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {fileNames.map((file, index) => (
            <div
              key={index}
              className='flex items-center justify-between border border-primary-300 bg-gray-50 p-3 rounded-lg w-full'
            >
              <div className='flex items-center gap-3 min-w-0 flex-1'>
                <svg
                  className='w-5 h-5 text-gray-400 flex-shrink-0'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z'
                    clipRule='evenodd'
                  />
                </svg>
                <div className='min-w-0 flex-1'>
                  <p
                    className='text-sm text-gray-700 truncate'
                    title={file.name || file}
                  >
                    {file.name || file}
                  </p>
                  <p className='text-xs text-gray-500'>{file.size}</p>
                </div>
              </div>
              <button
                type='button'
                onClick={() => removeFile(index)}
                className='text-gray-400 hover:text-gray-600 ml-3 flex-shrink-0'
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className='mt-2 text-sm text-blue-600'>Uploading files...</div>
      )}

      {showError && <p className='mt-2 text-sm text-red-500'>{errorMessage}</p>}
    </div>
  )
}

export default FormikDropZone
