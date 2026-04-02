import { useCallback, useMemo } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const SelectField = ({
  name,
  label,
  options = [],
  placeholder,
  Icon,
  multiple = false,
  value = null,
  loading = false,
  selectKey = "value",
  getOptionLabel = (option) => option.label,
  onChange = () => null,
}) => {
  const stableOptions = useMemo(() => options, [options]);

  const handleChange = useCallback(
    (_, selected) => {
      const selectedValue = multiple
        ? selected.map((opt) => opt[selectKey])
        : selected?.[selectKey] || "";

      onChange(selectedValue);
    },
    [multiple, onChange, selectKey]
  );

  const selectedOption = useMemo(() => {
    if (multiple) {
      return stableOptions.filter((opt) => value.includes(opt[selectKey]));
    }
    return stableOptions.find((opt) => value === opt[selectKey]) || null;
  }, [stableOptions, multiple, selectKey, value]);

  return (
    <div>
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-xs sm:text-sm dark-color">{label}</label>
        </div>
      )}
      <div className="relative">
        <Autocomplete
          id={name}
          options={options}
          getOptionLabel={getOptionLabel}
          getOptionKey={(option) => option.value}
          value={selectedOption || (multiple ? [] : null)}
          onChange={handleChange}
          multiple={multiple}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={placeholder}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 48,
                  backgroundColor: "white",
                  "& fieldset": {
                    borderColor: "rgb(229 231 235) ",
                    borderWidth: 1,
                    transition: "border-color 0.3s",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgb(229 231 235)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgb(229 231 235)",
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

export default SelectField;
