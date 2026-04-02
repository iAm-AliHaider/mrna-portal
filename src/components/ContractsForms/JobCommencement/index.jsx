import React from 'react';
import './styles.css';

const DeclarationJobCommencementPDF = ({ data }) => {
  return (
    <div className="declaration-job-wrapper" dir="rtl">
      <header className="declaration-header">
        <img src='/assets/images/logo.png' alt='شعار الشركة' className='logo' />
      </header>

      <section className="content">
        <h2>إقرار مباشرة عمل</h2>
        <p>نحيطكم علماً بأني باشرت عملي</p>
        <p className="bold">اعتباراً من: {data?.start_date || '____/____/____'} م</p>
        <p>
          الاسم : <span className="bold">{data?.name || '..........................'}</span>
        </p>
        <p>المسمى الوظيفي : {data?.job_title || '..........................'}</p>
        <p>التوقيع : ..........................</p>
        <p>التاريخ : {data?.employee_sign_date || '..........................'}</p>

        <div className="hr-section">
          <p>مدير الموارد البشرية:</p>
          <p className="bold">{data?.hr_name || 'Mohammed al khulify'}</p>
          <p>التوقيع : ..........................</p>
        </div>
      </section>
    </div>
  );
};

export default DeclarationJobCommencementPDF;
