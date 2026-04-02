"use client";
import React, { useState } from "react";
import { Formik, Form } from "formik";
import FormikInputField from "../../../../components/common/FormikInputField";
import Modal from "../../../../components/common/Modal";
import SubmitButton from "../../../../components/common/SubmitButton";
import { supabase } from "../../../../supabaseClient";
import toast from "react-hot-toast";

const toYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const UpdateEffectiveDate = ({ onClose, open, data }) => {
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const todayStr = toYMD(today);

  const initialValues = {
    effected_date: data?.effected_date || "",
  };

  // Update Supabase record
  const handleUpdate = async (values, { setSubmitting }) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("resignation_request")
        .update({ effected_date: values.effected_date })
        .eq("id", data?.id);

      if (error) throw error;

      toast.success("Effective date updated successfully!");
      onClose();
    } catch (err) {
      toast.error(`Failed to update: ${err.message || err}`);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Edit Effective Date"
      open={open}
      width="400px" // Shorter modal width
    >
      <div className="flex flex-col p-4">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={handleUpdate}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              {/* Effective Date Field */}
              <FormikInputField
                name="effected_date"
                label="Effective Date"
                type="date"
                // min={todayStr}
                max="2100-12-31"
                required
              />

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <SubmitButton
                  variant="outlined"
                  title="Close"
                  type="button"
                  onClick={onClose}
                />
                <SubmitButton
                  title="Update"
                  type="submit"
                  isLoading={isSubmitting || loading}
                  disabled={isSubmitting || loading}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default UpdateEffectiveDate;
