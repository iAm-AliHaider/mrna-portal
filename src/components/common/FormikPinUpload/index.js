import { useState, useRef } from 'react';
import { uploadFile } from '../../../utils/s3';
import { useField } from 'formik';
import toast from 'react-hot-toast';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const FormikPinUpload = ({
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
  const fileInputRef = useRef(null);
  const [, , helpers] = useField(fieldName);
  const [uploading, setUploading] = useState(false);

  const acceptAttr = accept.length > 0 ? accept.join(',') : undefined;
  const isErrorField = touched && error;

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (accept.length > 0) {
      const okByMime = accept.includes(file.type);
      const ext = file.name.split('.').pop().toLowerCase();
      const okByExt = accept
        .filter(t => t.startsWith('.'))
        .some(extType => extType.slice(1).toLowerCase() === ext);

      if (!okByMime && !okByExt) {
        toast.error(`File type not allowed. Allowed: ${accept.join(', ')}`);
        event.target.value = '';
        return;
      }
    }

    setUploading(true);
    if (onUploadStart) onUploadStart();

    try {
      const uploadedUrl = await uploadFile(file);
      if (onChange) {
        onChange(uploadedUrl);
      } else {
        helpers.setValue(uploadedUrl);
      }
    } catch (err) {
      console.error('Upload failed!', err);
    } finally {
      setUploading(false);
      if (onUploadComplete) onUploadComplete();
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center gap-2 mb-1">
          <label className="text-xs sm:text-sm text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
      )}

      <button
        type="button"
        onClick={handleChooseFile}
        disabled={uploading}
        className="text-gray-600 hover:text-primary disabled:opacity-50 bg-slate-200 p-2 rounded-full"
        title="Upload File"
      >
        <AttachFileIcon className="w-6 h-6" />
      </button>

      <input
        ref={fileInputRef}
        accept={acceptAttr}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        name={fieldName}
        {...fieldProps}
      />

      {isErrorField && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormikPinUpload;
