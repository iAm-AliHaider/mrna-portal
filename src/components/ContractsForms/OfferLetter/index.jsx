import React from "react";
import "./styles.css";

const JobOfferPDF = ({ data = {} }) => {
  return (
    <div id="offer-pdf-preview">
      <div className="job-offer-pdf" dir="rtl">
        <header className="job-offer-header">
          <div className="job-offer-header-top">
            <img
              src="/assets/images/logo.png"
              alt="شعار الشركة"
              style={{ width: "60px", height: "auto" }}
              className="logo"
            />
            <div className="job-offer-title">عرض وظيفي</div>
          </div>
          <div className="job-offer-header-info">
            <div>
              <strong>JOB OFFER LETTER</strong>
            </div>
            <div>
              التاريخ:{" "}
              <strong>
                {data.date || new Date().toLocaleDateString("en-GB")}
              </strong>
            </div>
            <div>
              الإسم:{" "}
              <strong>
                {data.candidate.first_name
                  ? `${data.candidate.first_name || ""} 
                  ${data.candidate.second_name || ""} 
                  ${data.candidate.third_name || ""} 
                  ${data.candidate.forth_name || ""} 
                  ${data.candidate.family_name || ""}`
                  : "مؤمن"}
              </strong>
            </div>
            <div>
              الرقم القومي:{" "}
              <strong>{data?.candidate?.national_id || "10101010101010"}</strong>
            </div>
            <div>
              المسمى الوظيفي:{" "}
              <strong>{data?.candidate?.vacancy?.title || "Business analysis"}</strong>
            </div>
          </div>
        </header>

        <section className="job-offer-salary">
          <table className="job-offer-salary-table">
            <thead>
              <tr>
                <th>SR/Month</th>
                <th>الوصف</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.basic_salary || "0"}</td>
                <td>الراتب الأساسي</td>
              </tr>
              <tr>
                <td>{data.housing_allowance || "0"}</td>
                <td>بدل السكن</td>
              </tr>
              <tr>
                <td>{data.transportation_allowance || "0"}</td>
                <td>بدل المواصلات</td>
              </tr>
              <tr>
                <td>
                  <strong>{data.total_salary || "0 SR"}</strong>
                </td>
                <td>
                  <strong>الإجمالي</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="job-offer-notes">
          <h3>المزايا الأخرى والملاحظات</h3>
          <ul>
            <li>
              تذاكر الطيران السنوية: الموظف + الزوجة + طفلين (لغير السعوديين)
            </li>
            <li>
              التأمين الطبي: الموظف + الزوجة + أطفال (وفقاً لسياسة الشركة)
            </li>
            <li>مدة صلاحية العرض: 30 يوم من تاريخ العرض</li>
            <li>
              ملاحظات:
              <ul>
                <li>
                  يجب على المتقدم الانضمام خلال 30 يوم من تاريخ التوقيع ما لم
                  يتم الاتفاق خلاف ذلك.
                </li>
                <li>يخضع الموظف لفترة تجربة لمدة 90 يوم</li>
                <li>إجازة مدفوعة 30 يوماً بعد سنة من الخدمة</li>
                <li>
                  الراتب والبدلات تخضع لاشتراك 9.75% لـ GOSI (للسعوديين فقط)
                </li>
                <li>يحتفظ صاحب العمل بحق تعديل المزايا عند الحاجة</li>
                <li>
                  العرض غير قابل للتحويل ولا يعتبر نهائياً إلا بموافقة البنك
                  المركزي السعودي
                </li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="job-offer-notes">
          <ul>
            <li>
              <h3>ملاحظة</h3>
            </li>
            <li>{data.note_ar}</li>
          </ul>
        </section>

        <footer className="job-offer-footer">
          <div className="job-offer-signatures">
            <div>
              <p>
                <strong>موافقة الموظف</strong>
              </p>
              <p>الاسم: _____________</p>
              <p>التوقيع: _____________</p>
            </div>
            <div>
              <p>
                <strong>مدير مباشر</strong>
              </p>
            </div>
            <div>
              <p>
                <strong>مدير الموارد البشرية</strong>
              </p>
              <p>الاسم:</p>
            </div>
          </div>
          <div className="job-offer-footer-secret">MRNA Confidential</div>
        </footer>
      </div>
    </div>
  );
};

export default JobOfferPDF;
