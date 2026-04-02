import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { EMPLOYEE_REOCRDS_PAGE_TITLE } from '../constants';
import HomeIcon from '@mui/icons-material/Home'


const breadcrumbItems = [
    { href: '/home', icon: HomeIcon },
    { title: 'Employee' },
    { title: 'Employee Records', href: '/employees/records?section=general' },
  ]

const usePageData = () => {
  const location = useLocation();

  const { section, title, items } = useMemo(() => {
    const urlParams = new URLSearchParams(location.search);
    const section = urlParams.get('section') || 'general';
    const pageData = EMPLOYEE_REOCRDS_PAGE_TITLE[section] || {};

    return {
      section,
      title: pageData.pageTitle || 'Employee Records',
      items: [...breadcrumbItems, ...(pageData?.breadcrumbs || [])]
    };
  }, [location.search]);

  return { section, title, items };
};

export default usePageData;
