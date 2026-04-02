import * as Yup from "yup";

const assetsTransactionValidationSchema = Yup.object().shape({
  assigned_to: Yup.string()
    .required("Select employee"),
  assignment_type: Yup.string()
    .required("Assignment type is required")
    .oneOf(
      [
        "add_asset_to_employee",
        "take_asset_from_employee",
        "transfer_asset",
        "return_asset",
        "maintenance_asset",
      ],
      "Invalid assignment type"
    ),

  asset_category_id: Yup.number()
    .required("Asset category is required")
    .positive("Asset category ID must be positive"),

  asset_id: Yup.number().nullable().positive("Asset ID must be positive"),

  asset_code: Yup.string()
    .required("Asset code is required")
    .min(2, "Asset code must be at least 2 characters")
    .max(50, "Asset code must not exceed 50 characters")
    .trim(),

  asset_value: Yup.number()
    .required("Asset value is required")
    .positive("Asset value must be positive")
    .min(0, "Asset value cannot be negative"),

  serial_number: Yup.string()
    .required("Serial number is required")
    .min(2, "Serial number must be at least 2 characters")
    .max(100, "Serial number must not exceed 100 characters")
    .trim(),

  asset_note: Yup.string()
    .required("Asset note is required")
    .min(5, "Asset note must be at least 5 characters")
    .max(500, "Asset note must not exceed 500 characters")
    .trim(),

  from_date: Yup.date()
    .required("From date is required")
    .min(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), 'From date cannot be in the past'),

  // to_date: Yup.date()
  //   .required("To date is required")
  //   .min(Yup.ref("from_date"), "To date must be after from date"),

  notes: Yup.string()
    .optional()
    .max(1000, "Notes must not exceed 1000 characters")
    .trim(),
});

export default assetsTransactionValidationSchema;
