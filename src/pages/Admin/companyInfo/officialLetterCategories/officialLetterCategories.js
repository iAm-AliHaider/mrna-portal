import React, { useState, useEffect } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { Button } from '@mui/material'
import FormikInputField from '../../../../components/common/FormikInputField'
import HomeIcon from '@mui/icons-material/Home'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import { useUser } from '../../../../context/UserContext'
import { useCreateOfficialLetterCategory, useUpdateOfficialLetterCategory } from '../../../../utils/hooks/api/officialLetterCategories'
import toast from "react-hot-toast/headless"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from '../../../../supabaseClient'

const initialValues = {
  category: '',
  notes: ''
}

const validationSchema = Yup.object().shape({
  category: Yup.string().required('Category is required'),
  notes: Yup.string().optional().test('no-spaces', 'Empty spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  })
})

const OfficialLetterCategories = () => {
  const { user } = useUser();
  const { createOfficialLetterCategory, loading: createLoading } = useCreateOfficialLetterCategory();
  const { updateOfficialLetterCategory, loading: updateLoading } = useUpdateOfficialLetterCategory();
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);

  const isEditMode = !!id;

  // Fetch category data for edit mode
  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      
      setLoadingData(true);
      try {
        const { data, error } = await supabase
          .from('official_letters_categories')
          .select('*')
          .eq('id', id)
          .eq('is_deleted', false)
          .single();

        if (error) {
          toast.error('Failed to load category data');
          navigate('/admin/company-info/letters-categories');
          return;
        }

        setCategoryData(data);
        setFormValues({
          category: data.category || '',
          notes: data.notes || ''
        });
      } catch (err) {
        toast.error('Failed to load category data');
        navigate('/admin/company-info/letters-categories');
      } finally {
        setLoadingData(false);
      }
    };

    fetchCategory();
  }, [id, navigate]);

  const breadcrumbItems = [
    { href: '/home', icon: HomeIcon },
    { title: 'Admin' },
    { title: 'Company Info', href: '/admin/company-info/letters-categories' },
    { title: isEditMode ? 'Edit Official Letter Category' : 'Add Official Letter Category' }
  ];

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (isEditMode) {
        // Update existing category
        const payload = {
          ...values,
          updated_by: user?.id,
        };

        const result = await updateOfficialLetterCategory(id, payload);
        
        if (result) {
          toast.success("Official letter category updated successfully");
          navigate("/admin/company-info/letters-categories");
        }
      } else {
        // Create new category
        const payload = {
          ...values,
          created_by: user?.id,
          updated_by: user?.id,
        };

        const result = await createOfficialLetterCategory(payload);
        
        if (result) {
          toast.success("Official letter category created successfully");
          resetForm();
          navigate("/admin/company-info/letters-categories");
        }
      }
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error(isEditMode ? "Failed to update official letter category" : "Failed to create official letter category");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <PageWrapperWithHeading
        title={isEditMode ? 'Edit Official Letter Category' : 'Add Official Letter Category'}
        items={breadcrumbItems}
      >
        <div className="text-center py-8">Loading...</div>
      </PageWrapperWithHeading>
    );
  }

  return (
    <PageWrapperWithHeading
      title={isEditMode ? 'Edit Official Letter Category' : 'Add Official Letter Category'}
      items={breadcrumbItems}
    >
      <Formik
        initialValues={formValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ isSubmitting }) => (
          <Form className='flex flex-col gap-4 mt-4'>
            <div className='p-4 bg-gray-100 rounded-lg shadow-sm'>
              <div className='grid grid-cols-1 gap-4'>
                <FormikInputField
                  label='Category'
                  name='category'
                  required
                  fullWidth
                />
                <FormikInputField 
                  label='Notes' 
                  name='notes' 
                  multiline
                  rows={4}
                  fullWidth
                />
              </div>
            </div>
            <div className='mt-4 sticky bottom-0 flex justify-end gap-2'>
              <Button
                variant='outlined'
                onClick={() => navigate('/admin/company-info/letters-categories')}
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                color='primary'
                title={isEditMode ? 'Update' : 'Submit'}
                type='submit'
                loading={createLoading || updateLoading || isSubmitting}
                disabled={createLoading || updateLoading || isSubmitting}
              >
                {createLoading || updateLoading || isSubmitting 
                  ? (isEditMode ? 'Updating...' : 'Submitting...') 
                  : (isEditMode ? 'Update' : 'Submit')
                }
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </PageWrapperWithHeading>
  )
}

export default OfficialLetterCategories
