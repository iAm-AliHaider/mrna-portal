import React from 'react';
import './styles.css';

const SalarySlipPDF = ({ data = {} }) => {
  const cellStyle = {
    border: '1px solid #ccc',
    padding: '4px',
    fontSize: '9pt',
    fontWeight: 500,
  };
// get image from public folder
  return (
    <div className='pdf-wrapper' dir='rtl'>
      <header className='header'>
        <img src='/assets/images/logo.png' alt='شعار الشركة' className='logo' />
        <div className='header-text'>
          <p><strong>قسيمة الراتب</strong></p>
          <p>الشهر: <strong>{data.month || '-'}</strong> / السنة: <strong>{data.year || '-'}</strong></p>
        </div>
      </header>

      <section className='section'>
        <table className='info-table'>
          <tbody>
            <tr>
              <td><strong>رقم الموظف:</strong> {data.employee_number || '-'}</td>
              <td><strong>اسم الموظف:</strong> {data.employee_name || '-'}</td>
              <td><strong>المسمى الوظيفي:</strong> {data.job_title || '-'}</td>
            </tr>
            <tr>
              <td><strong>تاريخ الانضمام:</strong> {data.joining_date || '-'}</td>
              <td><strong>الوحدة:</strong> {data.job_unit || '-'}</td>
              <td><strong>أيام العمل:</strong> {data.working_days || '-'}</td>
            </tr>
            <tr>
              <td><strong>البنك:</strong> {data.bank || '-'}</td>
              <td><strong>رقم الآيبان:</strong> {data.iban || '-'}</td>
              <td><strong>رقم الحساب:</strong> {data.account_number || '-'}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className='section'>
        <h3 className='section-title'>الاستقطاعات</h3>
        <table className='data-table'>
          <tbody>
            <tr>
              <td style={cellStyle}>التأمينات الاجتماعية</td>
              <td style={cellStyle}>{data.social_insurance || '0.000'}</td>
            </tr>
            <tr>
              <td style={cellStyle}>قسط القرض</td>
              <td style={cellStyle}>{data.loan_installment || '0.000'}</td>
            </tr>
            <tr>
              <td style={cellStyle}>استقطاعات أخرى</td>
              <td style={cellStyle}>{data.other_deduction || '0.000'}</td>
            </tr>
            <tr>
              <td style={cellStyle}><strong>إجمالي الاستقطاعات</strong></td>
              <td style={cellStyle}><strong>{data.total_deductions || '0.000'}</strong></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className='section'>
        <h3 className='section-title'>البدلات</h3>
        <table className='data-table'>
          <tbody>
            <tr>
              <td style={cellStyle}>الراتب الأساسي</td>
              <td style={cellStyle}>{data.basic_salary || '0.000'}</td>
            </tr>
            <tr>
              <td style={cellStyle}>الراتب المستحق</td>
              <td style={cellStyle}>{data.due_salary || '0.000'}</td>
            </tr>
            <tr>
              <td style={cellStyle}>بدل السكن</td>
              <td style={cellStyle}>{data.housing_allowance || '0.000'}</td>
            </tr>
            <tr>
              <td style={cellStyle}>بدل المواصلات</td>
              <td style={cellStyle}>{data.transport_allowance || '0.000'}</td>
            </tr>
            <tr>
              <td style={cellStyle}><strong>إجمالي الدخل</strong></td>
              <td style={cellStyle}><strong>{data.total_earnings || '0.000'}</strong></td>
            </tr>
            <tr>
              <td style={cellStyle}><strong>صافي الراتب</strong></td>
              <td style={cellStyle}><strong>{data.net_salary || '0.000'}</strong></td>
            </tr>
          </tbody>
        </table>
      </section>

      <footer className='pdf-footer'>
        <div className='footer-row'>
          <div>توقيع الموظف: .............................</div>
          <div>تاريخ الطباعة: {data.print_date || '-'} | الوقت: {data.print_time || '-'}</div>
        </div>
        <div className='footer-prepared'>أعد بواسطة: {data.prepared_by || '-'}</div>
      </footer>
    </div>
  );
};

export default SalarySlipPDF;
