import React from 'react';
import './styles.css';

const TerminationNoticePDF = ({ data = {} }) => {
  return (
    <div className="termination-wrapper" dir="rtl">
      <h2 className="title">إشعار إنهاء خدمات</h2>

      <div className="content">
        <p>الموظف/ {data.employee_name || '........................'}</p>
        <p>الإدارة/ {data.department || '........................'}</p>
        <p>الفرع/ {data.branch || '........................'}</p>

        <p className="mt-4">السلام عليكم ورحمة الله وبركاته،،،</p>

        <p className="mt-4">
          الموضوع: <strong>إنهاء خدمات</strong>
        </p>

        <p className="mt-4 paragraph-justified">
          <strong>
            إشــارة إلى الموضوع أعـــلاه، ونظراً لتطبيق نظام العمل السعودي
            بموجب المادة 80 فقرة رقم 7 من نفس النظام، نود إشعاركم بانتهاء خدماتكم
            من الشركة، ويعتبر تاريخ {data.termination_date || '___/___/____'} م هو
            آخر يوم لكم على رأس العمل.
          </strong>
        </p>

        <p className="mt-4">متمنين لكم دوام التوفيق والنجاح،،،</p>
      </div>

      <div className="footer mt-6">
        <p>مدير الموارد البشرية</p>
        <p className="bold">{data.hr_name || 'محمد الخليفي'}</p>
      </div>
    </div>
  );
};

export default TerminationNoticePDF;
