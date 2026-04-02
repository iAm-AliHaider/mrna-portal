import { useState, useRef } from 'react';
import { uploadFile } from '../../../utils/s3';
import { useField } from 'formik';
import toast from 'react-hot-toast';

const FileUploadField = ({
  name: fieldName,
  label,
  className,
  required = false,
  helperText = null,
  accept = [],
  value,
  onChange,
  error,
  touched,
  onUploadStart,
  onUploadComplete,
  ...fieldProps
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [field, meta, helpers] = useField(fieldName)

  const isErrorField = meta.touched && meta.error

  const acceptAttr = accept.length > 0
  ? accept.join(',')
  : undefined

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

     if (accept.length > 0) {
      const okByMime = accept.includes(file.type)

      const ext = file.name.split('.').pop().toLowerCase()
      const okByExt  = accept
        .filter(t => t.startsWith('.'))
        .some(extType => extType.slice(1).toLowerCase() === ext)

      if (!okByMime && !okByExt) {
        toast.error(`File type not allowed. Allowed: ${accept.join(', ')}`)
        event.target.value = ''
        return
      }
    }

    setUploading(true);
    setSelectedFile(file);
    
    // Notify parent component that upload has started
    if (onUploadStart) {
      onUploadStart();
    }

    try {
      const uploadedUrl = await uploadFile(file);
      if (onChange) {
        onChange(uploadedUrl);
        return
      }
      helpers.setValue(uploadedUrl)
    } catch (err) {
      console.error('Upload failed!', err);
    } finally {
      setUploading(false);
      // Notify parent component that upload has completed
      if (onUploadComplete) {
        onUploadComplete();
      }
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const getDisplayText = () => {
    if (!selectedFile) return 'No file Chosen';
    const name = selectedFile.name;
    return name.length > 25 ? name.substring(0, 22) + '...' : name;
  };

  return (
    <div>
      {label && (
        <div className='flex items-center gap-2'>
          <label className='text-xs sm:text-sm text-gray-700'>
            {label} {required && <span className='text-red-500'>*</span>}
          </label>
        </div>
      )}
      <div
        className={`border h-12 ${
          fieldProps?.disabled ? 'bg-gray-200' : 'bg-white'
        } border-gray-200 rounded-xl p-0 flex items-center justify-between overflow-hidden ${
          fieldProps?.disabled ? 'bg-gray-100' : ''
        }`}
        style={{ border: isErrorField ? '1px solid red' : undefined }}
      >
        <div className="px-4 text-gray-400 text-sm font-normal flex-1 truncate">
          {uploading ? 'Uploading...' : getDisplayText()}
        </div>

        <button
          type="button"
          onClick={handleChooseFile}
          disabled={fieldProps?.disabled || uploading}
          className="bg-primary hover:bg-primary-hover disabled:bg-gray-400 text-white px-6 h-full text-sm font-medium transition-colors duration-200 border-none outline-none"
        >
          {uploading ? 'Please wait' : 'Choose File'}
        </button>

        <input
          {...fieldProps}
          // {...field}
          ref={fileInputRef}
          accept={acceptAttr}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          name={fieldName}
        />
      </div>

      {isErrorField && <p className='text-red-500 text-xs'>{error}</p>}
    </div>
  );
};

export default FileUploadField;