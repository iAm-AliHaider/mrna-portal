import { useCallback, useMemo } from "react";
import { useField } from "formik";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

const FormikSelectField = ({
  name,
  label,
  options = [],
  placeholder,
  Icon,
  required = false,
  multiple = false,
  selectKey = "value",
  getOptionLabel = (option) => option.label,
  onChange = null,
  disabled = false,
  loading = false,
}) => {
  const [field, meta, helpers] = useField(name);

  const stableOptions = useMemo(() => options, [options]);

  const handleChange = useCallback(
    (_, selected) => {
      const selectedValue = multiple
        ? selected.map((opt) => opt[selectKey])
        : selected?.[selectKey] || "";
      if (onChange) {
        onChange(selectedValue);
      } else {
        helpers.setValue(selectedValue);
      }
    },
    [multiple, onChange, helpers, selectKey]
  );

  const selectedOption = useMemo(() => {
    if (multiple) {
      return stableOptions.filter((opt) =>
        field.value?.includes(opt[selectKey])
      );
    }
    return stableOptions.find((opt) => field.value === opt[selectKey]) || null;
  }, [field.value, stableOptions, multiple, selectKey]);

  const isErrorField = Boolean(meta.error);

  return (
    <div>
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-xs sm:text-sm dark-color">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
      )}
      <div className="relative">
        <Autocomplete
          id={name}
          options={stableOptions}
          getOptionLabel={getOptionLabel}
          value={selectedOption || (multiple ? [] : null)}
          onChange={handleChange}
          multiple={multiple}
          disabled={disabled || loading}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={placeholder}
              error={isErrorField}
              helperText={isErrorField ? meta.error : ""}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 48,
                  backgroundColor: "white",
                  "& fieldset": {
                    borderColor: isErrorField ? "!#FF0000" : "rgb(229 231 235)",
                    borderWidth: 1,
                    transition: "border-color 0.3s",
                  },
                  "&:hover fieldset": {
                    borderColor: isErrorField ? "!#FF0000" : "rgb(229 231 235)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isErrorField ? "!#FF0000" : "rgb(229 231 235)",
                    boxShadow: "none",
                  },
                },
                "& input": {
                  height: "48px",
                  padding: "0 14px",
                  boxSizing: "border-box",
                },
              }}
              InputProps={{
                ...params.InputProps,
                style: { height: 48 },
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          slotProps={{
            paper: {
              elevation: 4,
              sx: {
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
                borderWidth: "2px",
                borderColor: "#e2e8f0",
              },
            },
          }}
        />
        {Icon && (
          <span className="absolute right-4 top-4 pointer-events-none">
            <Icon size={20} color="#B5BDC8" />
          </span>
        )}
      </div>
    </div>
  );
};

export default FormikSelectField;
