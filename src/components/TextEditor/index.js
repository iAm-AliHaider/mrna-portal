// TiptapField.jsx
import React from "react";
import { Field } from "formik";
import TiptapEditor from "./TiptapEditor";

const TiptapField = ({ name, label, placeholder }) => (
  <Field name={name}>
    {({ field, form, meta }) => (
      <div className="flex flex-col gap-2">
        {label && <label className="text-sm font-medium">{label}</label>}
        <TiptapEditor
          value={field.value}
          onChange={(val) => form.setFieldValue(name, val)}
          placeholder={placeholder}
        />
        {meta.touched && meta.error && (
          <div className="text-red-500 text-xs mt-1">{meta.error}</div>
        )}
      </div>
    )}
  </Field>
);

export default TiptapField;
