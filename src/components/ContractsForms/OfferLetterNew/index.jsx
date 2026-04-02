import React from "react";
import "./styles.css";

const JobOfferDocument = ({ data = {} }) => {
  return (
    <div id="offer-pdf-preview">
      <div className="job-offer-pdf" dir="rtl">
        <header className="job-offer-header">
          <div className="job-offer-header-top">
            <img
              src="/assets/images/logo.png"
              alt="شعار الشركة"
              style={{ width: "100px", height: "auto" }}
              className="logo"
            />
            {/* <div className="job-offer-title">عرض وظيفي</div> */}
          </div>
          <div>
            <table
              style={{ width: "100%", fontSize: "18px", marginTop: "15px" }}
            >
              <thead>
                <tr>
                  <th className="text-right">
                    <p>عرض وظيفي</p>
                  </th>
                  <th className="text-left">
                    <p>JOB OFFER LETTER</p>
                  </th>
                </tr>
              </thead>
            </table>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <table width="100%">
              <tbody>
                <tr>
                  <td className="text-center" style={{ fontSize: "15px" }}>
                    <strong>
                      Date:{" "}
                      {data.date || new Date().toLocaleDateString("en-GB")}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <table width="100%" dir="ltr" >
              <tbody>
                <tr>
                  <td
                    className="text-center"
                    style={{ fontSize: "14px", width: "30%" }}
                  >
                    <table width="100%" className="header-mini-table">
                      <tbody>
                        <tr>
                          <td colSpan={2} className="header-value-box">
                            <strong>
                              {data.candidate.first_name
                                ? `${data.candidate.first_name || ""} 
                                  ${data.candidate.second_name || ""} 
                                  ${data.candidate.third_name || ""} 
                                  ${data.candidate.forth_name || ""} 
                                  ${data.candidate.family_name || ""}`
                                : "مؤمن"}
                            </strong>
                          </td>
                        </tr>
                        <tr className="border-bottom">
                          {/* English on left, Arabic on right */}
                          <td className="text-left" dir="ltr">
                            Name
                          </td>
                          <td className="text-right" dir="rtl">
                            الإسم
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{ width: "5%" }}>&nbsp;</td>
                  <td
                    className="text-center"
                    style={{ fontSize: "14px", width: "30%" }}
                  >
                    <table width="100%" className="header-mini-table">
                      <tbody>
                        <tr>
                          <td colSpan={2} className="header-value-box">
                            <strong>
                              {data?.candidate?.national_id || "10101010101010"}
                            </strong>
                          </td>
                        </tr>
                        <tr className="border-bottom">
                          <td className="text-left" dir="ltr">
                            National ID
                          </td>
                          <td className="text-right" dir="rtl">
                            الرقم القومي
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{ width: "5%" }}>&nbsp;</td>
                  <td
                    className="text-center"
                    style={{ fontSize: "14px", width: "30%" }}
                  >
                    <table width="100%" className="header-mini-table">
                      <tbody>
                        <tr>
                          <td colSpan={2} className="header-value-box">
                            <strong>
                              {data?.candidate?.vacancy?.title ||
                                "Business analysis"}
                            </strong>
                          </td>
                        </tr>
                        <tr className="border-bottom">
                          <td className="text-left" dir="ltr">
                            Job Position
                          </td>
                          <td className="text-right" dir="rtl">
                            المسمى الوظيفي
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </header>

        <section className="job-offer-salary">
          <table
            dir="ltr"
            width="100%"
            cellSpacing={0}
            cellPadding={6}
            style={{
              borderCollapse: "separate", // avoid auto-merging that can double up on print
              borderSpacing: 0,
              tableLayout: "fixed",
              color: "#000",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            <tbody>
              {/** helpers */}
              {/* use pt so print/PDF renders crisp 1px-equivalent lines */}
              {/* const B = "0.75pt solid #000";  <-- can't declare const in JSX;
        so we repeat "0.75pt solid #000" below. */}

              {/* HEADER (center box) — draw top/left/right only, no bottom */}
              <tr>
                {/* no outer lines on the side cells */}
                <td style={{ width: "33.333%" }} />
                <td
                  style={{
                    width: "33.333%",
                    textAlign: "center",
                    borderTop: "0.75pt solid #000",
                    borderLeft: "0.75pt solid #000",
                    borderRight: "0.75pt solid #000",
                    borderBottom: 0, // important: avoid double line with first data row
                  }}
                >
                  SR/Month
                </td>
                <td style={{ width: "33.333%" }} />
              </tr>

              {/* ROW 1 */}
              <tr>
                {/* LEFT column: top + left */}
                <td
                  style={{
                    borderTop: "0.75pt solid #000",
                    borderLeft: "0.75pt solid #000",
                  }}
                >
                  Basic Salary
                </td>

                {/* MIDDLE column: top + left + right */}
                <td
                  style={{
                    textAlign: "center",
                    borderTop: "0.75pt solid #000",
                    borderLeft: "0.75pt solid #000",
                    borderRight: "0.75pt solid #000",
                  }}
                >
                  {/* dynamic: basic salary value */}
                  {data.basic_salary || "0"}
                </td>

                {/* RIGHT column: top + right */}
                <td
                  dir="rtl"
                  style={{
                    textAlign: "right",
                    borderTop: "0.75pt solid #000",
                    borderRight: "0.75pt solid #000",
                  }}
                >
                  الراتب الأساسي
                </td>
              </tr>

              {/* ROW 2 */}
              <tr>
                <td
                  style={{
                    borderTop: "0.75pt solid #000",
                    borderLeft: "0.75pt solid #000",
                  }}
                >
                  Housing Allowance
                </td>
                <td
                  style={{
                    textAlign: "center",
                    borderTop: "0.75pt solid #000",
                    borderLeft: "0.75pt solid #000",
                    borderRight: "0.75pt solid #000",
                  }}
                >
                  {/* dynamic: housing allowance value */}
                  {data.housing_allowance || "0"}
                </td>
                <td
                  dir="rtl"
                  style={{
                    textAlign: "right",
                    borderTop: "0.75pt solid #000",
                    borderRight: "0.75pt solid #000",
                  }}
                >
                  بدل السكن
                </td>
              </tr>

              {/* ROW 3 */}
              <tr>
                <td
                  style={{
                    borderTop: "0.75pt solid #000",
                    borderLeft: "0.75pt solid #000",
                  }}
                >
                  Transportation Allowance
                </td>
                <td
                  style={{
                    textAlign: "center",
                    borderTop: "0.75pt solid #000",
                    borderLeft: "0.75pt solid #000",
                    borderRight: "0.75pt solid #000",
                  }}
                >
                  {/* dynamic: transportation allowance value */}
                  {data.transportation_allowance || "0"}
                </td>
                <td
                  dir="rtl"
                  style={{
                    textAlign: "right",
                    borderTop: "0.75pt solid #000",
                    borderRight: "0.75pt solid #000",
                  }}
                >
                  بدل النقل
                </td>
              </tr>

              {/* TOTAL ROW — same border logic, plus bottom border to close the table */}
              <tr>
                <td
                  style={{
                    borderTop: "0.75pt solid #000",
                    borderLeft: "0.75pt solid #000",
                    borderBottom: "0.75pt solid #000",
                    backgroundColor: "#eee",
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    textAlign: "center",
                    borderTop: "0.75pt solid #000",
                    borderLeft: "0.75pt solid #000",
                    borderRight: "0.75pt solid #000",
                    borderBottom: "0.75pt solid #000",
                    backgroundColor: "#eee",
                  }}
                >
                  {/* dynamic: total monthly value OR keep "0 SR" */}
                  {data.total_salary || "0 SR"}
                </td>
                <td
                  dir="rtl"
                  style={{
                    textAlign: "right",
                    borderTop: "0.75pt solid #000",
                    borderRight: "0.75pt solid #000",
                    borderBottom: "0.75pt solid #000",
                    backgroundColor: "#eee",
                  }}
                >
                  الإجمالي
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="job-offer-notes">
          <table dir="ltr" width="100%" cellSpacing={0} cellPadding={0}>
            <tbody>
              {/* Headings (underlined) */}
              <tr style={{ fontSize: "18px" }}>
                <td
                  style={{
                    width: "50%",
                    verticalAlign: "top",
                    padding: "0 10px 0px 0",
                  }}
                >
                  <div style={{ fontWeight: 700, textDecoration: "underline" }}>
                    OTHER BENEFITS &amp; Notes
                  </div>
                </td>
                <td
                  dir="rtl"
                  style={{
                    width: "50%",
                    verticalAlign: "top",
                    padding: "0 0 0px 10px",
                    textAlign: "right",
                  }}
                >
                  <div style={{ fontWeight: 700, textDecoration: "underline" }}>
                    مميزات أخرى وملاحظات
                  </div>
                </td>
              </tr>

              {/* Content */}
              <tr>
                {/* EN column */}
                <td style={{ verticalAlign: "top", padding: "0 10px 0 0" }}>
                  <div style={{ lineHeight: 1.45 }}>
                    {/* Annual Flight Tickets */}•{" "}
                    <strong style={{ fontSize: "16px" }}>
                      Annual Flight Tickets :
                    </strong>
                    <div>
                      - Employee + Spouse &amp; 2 Kids (For Non Saudis )
                    </div>
                    <br />
                    {/* Medical Insurance */}•{" "}
                    <strong style={{ fontSize: "16px" }}>
                      Medical Insurance :
                    </strong>
                    <div style={{ fontSize: "13px" }}>
                      - Employee + Spouse &amp; Kids
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      (As per company Policy).
                    </div>
                    {/* Offer Validity */}•{" "}
                    <strong style={{ fontSize: "16px" }}>
                      Offer Validity :
                    </strong>
                    <div style={{ fontSize: "13px" }}>
                      - 3Days from the date of this offer letter.
                    </div>
                    {/* Notes */}•{" "}
                    <strong style={{ fontSize: "16px" }}>Notes :</strong>
                    <div style={{ fontSize: "13px" }}>
                      - Applicant should join the company no longer than 30 days
                      from the date of signing this offer unless agreed by the
                      company.
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      - Applicant will be under probation period for 180 days
                      from joining date.
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      - Paid (30) days leave per year and entitled every one
                      year.
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      - Basic Salary and Housing Allowance are subjected to a
                      monthly deduction of 9.75 % due to GOSI (General
                      Organization for Social Insurance), the deduction
                      increases 0.50 % Yearly Pensions part Continues to
                      increase up to 11.75 % if there’s no previous Subscription
                      . ( For Saudis only )
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      - Applicant should provide a Clearance Letter from current
                      employer before joining.
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      - The company reserves the right to change these benefits
                      in accordance with any change in the company regulations
                      and policies.
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      - Applicant has to pass AML training. ( Max – Two chances
                      )
                    </div>
                  </div>
                </td>

                {/* AR column */}
                <td
                  dir="rtl"
                  style={{
                    verticalAlign: "top",
                    padding: "0 0 0 10px",
                    textAlign: "right",
                  }}
                >
                  <div style={{ lineHeight: 1.45 }}>
                    {/* Annual Flight Tickets */}•{" "}
                    <strong style={{ fontSize: "16px" }}>
                      تذاكر طيران سنوية :
                    </strong>
                    <div>- يشمل الموظف وزوجته وطفلين ( لغير السعوديين )</div>
                    <br />
                    {/* Medical Insurance */}•{" "}
                    <strong style={{ fontSize: "16px" }}>
                      التأمين الطبي :
                    </strong>
                    <div style={{ fontSize: "14px" }}>
                      - الموظف + زوجته + الأبناء
                    </div>
                    <div style={{ fontSize: "14px" }}>
                      (كما هو بسياسة الشركة)
                    </div>
                    {/* Offer Validity */}•{" "}
                    <strong style={{ fontSize: "16px" }}>
                      صلاحية عرض الوظيفة :
                    </strong>
                    <div style={{ fontSize: "14px" }}>
                      - 3 أيام من تاريخ إصدار العرض.
                    </div>
                    {/* Notes */}•{" "}
                    <strong style={{ fontSize: "16px" }}>ملاحظات :</strong>
                    <div style={{ fontSize: "14px" }}>
                      - يجب على المتقدم الانضمام بالشركة خلال 30 يوم من تاريخ
                      توقيع هذا العرض ما لم يتم الاتفاق مع الشركة على غير ذلك.
                    </div>
                    <div style={{ fontSize: "14px" }}>
                      - يخضع الموظف لفترة تجربة لمدة 180 يوم من تاريخ الالتحاق.
                    </div>
                    <br />
                    <div style={{ fontSize: "14px" }}>
                      - إجازة سنوية ( 30 ) يوماً مدفوعة الأجر وبواقع مرة كل سنة.
                    </div>
                    <br />
                    <div style={{ fontSize: "14px" }}>
                      - يخضع الراتب الأساسي وبدل السكن لخصم شهري بمقدار 9.75 %
                      لصالح التأمينات الاجتماعية ( المؤسسة العامة للتأمينات
                      الاجتماعية ) وتزاد نسبة الخصم سنوياً بمقدار 0.50 % لتصل
                      إلى 11.75 % في حال عدم وجود اشتراك سابق . ( للسعوديين فقط
                      )
                    </div>
                    <br />
                    <div style={{ fontSize: "14px" }}>
                      - يجب على المتقدم تقديم خطاب إخلاء طرف من جهة عمله الحالية
                      قبل المباشرة.
                    </div>
                    <div style={{ fontSize: "14px" }}>
                      - تحتفظ الشركة بحقها في تغيير هذه المزايا وفق أي تغيير
                      يطرأ على لوائح الشركة وسياساتها.
                    </div>
                    <br />
                    <div style={{ fontSize: "14px" }}>
                      - يجب على المرشح اجتياز دورة مكافحة غسل الأموال. ( بحد
                      أقصى محاولتين )
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer className="job-offer-footer">
          <div className="job-offer-signatures">
            <table dir="ltr" style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td
                    style={{ width: "50%", textAlign: "left", fontWeight: 700 }}
                  >
                    <p className="text-center">Applicant Acceptance</p>
                    <table>
                      <tbody>
                        <tr>
                          <td>Name:</td>
                          <td>______________________________</td>
                        </tr>
                        <tr>
                          <td>Date:</td>
                          <td>______________________________</td>
                        </tr>
                        <tr>
                          <td>Signature:</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{ width: "50%", fontWeight: "700" }}>
                    <p className="text-center" style={{ marginBottom: "15px" }}>
                      HR Manager
                    </p>
                    <p className="text-center" style={{ marginBottom: "" }}>
                      Abdul Khalify
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </footer>

        {/* <footer className="job-offer-footer">
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
        </footer> */}
      </div>
    </div>
  );
};

export default JobOfferDocument;
