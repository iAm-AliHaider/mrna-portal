import React from 'react';
import { useField } from 'formik';
import { RadioGroup, FormControlLabel, Radio } from '@mui/material';

const FormikRadioGroup = ({ name, label, options = [], disabled }) => {
  const [field, meta, helpers] = useField(name);
  const { value } = field;
  const { setValue } = helpers;

  return (
    <div className="flex flex-col justify-start items-start mt-2">
      {label && (
        <div className='flex items-center gap-2'>
          <label className='text-xs sm:text-sm dark-color'>
            {label}
          </label>
        </div>
      )}
      <RadioGroup
        name={name}
        value={value}
        onChange={event => setValue(event.target.value)}
        className="flex !flex-row"
      >
        {options.map((item, index) => (
          <FormControlLabel
            key={`${item.value}-${index}`}
            value={item.value}
            control={<Radio disabled={disabled} />}
            label={item.label}
          />
        ))}
      </RadioGroup>
      {meta.touched && meta.error && (
        <div className="text-red-500 text-xs">{meta.error}</div>
      )}
    </div>
  );
};

export default FormikRadioGroup;
