import React from 'react';
import './styles.css';

const ConfidentialityAgreementPDF = ({ data = {} }) => {
  const articles = [
    "“Confidential Information” means and includes, without limiting the generality of the term, all  information of the Disclosing Party and all analytical findings resulting from the processing of such information by the Receiving Party, including but not limited to, name of potential partner(s), proprietary, technical, developmental, operating, performance, cost, know-how and process information, and all samples, models and prototypes containing or disclosing such information, relating to procedures, internal data processing, specifications, technology, patents, trade secrets, copyrights, know-how, formats, marketing plans, budgets, proposals, unpublished financial information, projections, strategies, and business agreements that is disclosed either (i) in a writing or other tangible form or (ii) orally.",
    "The Receiving Party shall (i) treat such Confidential Information with the same degree of care (provided that such is at least a reasonable degree of care) as not to disclose to third parties as it normally uses to protect its own confidential or proprietary information; and (ii) use the Confidential Information only for the purpose of executing the assignment, unless otherwise agreed to in writing by the Disclosing Party. In the event of a dispute, the burden shall be on the Receiving Party to demonstrate that the standard of care described herein was applied. Without limiting the generality of the foregoing: (a) The Receiving Party shall disclose Confidential Information only to those of the Receiving Party's employees, directors, advisors and agents who need access to such Confidential Information for the purpose described above and to no one else, and warrants, represents and covenants non-disclosure of the Confidential Information on behalf of the aforesaid employees, directors, advisors and agents; and (b) The Receiving Party shall ensure that all persons who receive any of the Confidential Information directly or indirectly from it shall abide by the terms and conditions of this Agreement as if such persons were parties hereto.",
    "There shall be no liability for breach of the restrictions contained in Article 2 on use and disclosure of the Confidential Information: If the Receiving Party can demonstrate from written records that such Confidential Information was already in the public domain or became publicly available through no breach of this Agreement by the Receiving Party. if the Receiving Party can demonstrate from written records that the Confidential Information was rightfully in the Receiving Party's possession without obligation of confidence prior to receipt of the same from the Disclosing Party or that the Receiving Party lawfully obtained said information from a third party who was under no obligation of confidence; If the Receiving Party can demonstrate from written records that employees of the Receiving Party who had not independently developed such information had access to the Disclosing Party's Confidential Information. If such Confidential Information is required to be disclosed by the Receiving Party to comply with applicable law or a judicial order or decree; provided, however, that the Receiving Party gives prior written notice of such disclosure to the Disclosing Party and takes reasonable and lawful actions to avoid and/or minimize the extent of such disclosure; or If such Confidential Information is disclosed with the prior written consent of the Disclosing Party.",
    "The Receiving Party agrees that neither it, nor any of its employees, directors, advisors or agents who are aware of the Agreement, shall disclose to any person (i) that the Parties are contemplating the Agreement, (ii) that negotiations or discussions are taking place between the Parties or (iii) any terms, conditions or other information with respect to the Agreement, including the status thereof.",
    "The Receiving Party shall take all necessary action to protect the confidentiality of the Confidential Information, except for its disclosure under Article 2(a) herein, and agrees to indemnify the Disclosing Party against any and all loses, damages, claims, or expenses incurred or suffered by the Disclosing Party as a result of the Receiving Party’s breach of this Agreement.",
    "This Agreement shall be effective as of the date first set forth hereinabove (the “Effective Date”) and may be terminated upon thirty (30) days' prior written notice to the either Party. The rights and obligations accruing prior to termination as set forth herein shall survive the termination of this Agreement. If either Party has any question regarding the continued effectiveness of this Agreement, that Party should contact the other Party for clarification.",
    "The Receiving Party understands and acknowledges that any disclosure or misappropriation of any of the Confidential Information in violation of this Agreement may cause the Disclosing Party irreparable harm, the amount of which may be difficult to ascertain and, therefore, agrees that the Disclosing Party shall have the right to apply to a court of competent jurisdiction for an order restraining any such further disclosure or misappropriation, and for such other relief as the Disclosing Party deems appropriate. Such right of the Disclosing Party is to be in addition to the remedies otherwise available to the Disclosing Party at law or in equity.",
    "In no event may the Receiving Party rely on or use Confidential Information disclosed hereunder to make, procure, or market, jointly or individually, products or services, now or in the future, which may be competitive with those offered by the Disclosing Party, or enter into any partnership, teaming agreement or joint venture with another party regarding the subject matter of this Agreement.",
    "The Receiving Party shall return to the Disclosing Party any and all records, notes, and other written, printed, or tangible or electronic materials pertaining to the Confidential Information immediately on the written request of the Disclosing Party, and the Receiving Party shall also delete/destroy copies of any records, notes, and other written, printed, or tangible or electronic materials pertaining to the Confidential Information, and shall confirm that in writing to the Disclosing Party.",
    "This Agreement shall be binding on and shall inure to the benefit of the Parties hereto, their respective successors and assigns. This Agreement may not be assigned in whole or in part by either Party without the prior written consent of the other Party. Any attempted assignment without such prior written consent shall be void and unenforceable. Notwithstanding the foregoing, either Party, with the prior written approval of the other Party, may, however, assign its rights and obligations hereunder to a successor in ownership of substantially all of the assets of the business, provided that the successor expressly assumes in writing the performance of the terms and conditions of this Agreement.",
    "In case of any breach to the obligations arising out of this Agreement, especially for divulging any Confidential Information to third part(ies), or if the Receiving Party uses, in breach of the obligations under this Agreement, any Confidential Information or data relating to the Disclosing Party during the continuance of this Agreement and survival period of the obligation, the Disclosing Party shall have right to take all legal steps/actions against the Receiving Party, including any of its executives, employees, workers and/or agents for remedies including damages.",
    "The Confidential Information shall remain the sole and exclusive property of the Disclosing Party. Nothing in this Agreement shall be construed as granting to the Receiving Party any right, title, or interest in or to any patent, trademark, license, copyright, or other right of the Disclosing Party.",
    "Nothing in this Agreement shall be deemed to create, either expresses or implied the power in either Party to bind the other regarding any matter, save and except the subject matter of this Agreement. Neither Party shall be bound by the actions of the other, nor shall be liable for the debts of the other, or shall have a right to share in the profits of the other. This Agreement is not intended to be a joint venture, partnership, or other formal business organization, and neither Party is under any obligation to enter into any further agreement with the other Party.",
    "No waiver of any provision of this Agreement, whether by conduct or otherwise, in any one or more instances, shall be deemed to be, or shall constitute, a waiver of any other provision hereof, nor shall such waiver constitute a waiver in any other instance. No waiver shall be binding unless executed in writing by the Party making the waiver.",
    "This Agreement is the only agreement between the Parties concerning the Confidential Information, and it supersedes and replaces any and all existing agreements, written, oral or otherwise, concerning the disclosure of Confidential Information, if any, between the Receiving Party and the Disclosing Party.",
    "If any provision of this Agreement is determined to be in violation of applicable law, then such provision shall be void and the other provisions of this Agreement shall remain in full force and effect.",
    "No modification to this Agreement shall be binding on either Party unless such modification is in writing and signed by an authorized representative of each of the Parties.",
    "The laws of the Kingdom of Saudi Arabia shall govern this Agreement. The Courts of the Kingdom of Saudi Arabia – located in Riyadh shall have exclusive jurisdiction to try any dispute(s) arising out of or relating to this Agreement."
  ];

  return (
    <div className='confidentiality-pdf-wrapper'>
      <div className='agreement-section'>
        <h2 className='text-center underline'>CONFIDENTIALITY AGREEMENT</h2>

        <p>
          THIS AGREEMENT hereinafter referred to as “the Agreement” is entered into an effective as of this day of <strong>{data.day || '---'}</strong> of <strong>{data.month || 'June'}, {data.year || '2021'}</strong>, hereinafter referred to as the "Effective Date" By and Between:
        </p>

        <p>
          <strong>Morabaha Finance Company</strong>, A Saudi closed joint stock company with a capital of 3113 million Saudi riyals, commercial registration number 1010337706 Hereinafter referred to as the <strong>"Disclosing Party"</strong><br />
          And<br />
          <strong>{data.receiver_name || '_______'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {data.receiver_title || '_____'}, Iqama number {data.receiver_iqama || '_____________'}</strong>,<br />
          Hereinafter referred to as the <strong>"Receiving Party"</strong>.
        </p>

        <p>The Disclosing Party and the Receiving Party are individually referred to herein as ‘Party’ and collectively as ‘Parties’.</p>

        <p>WHEREAS, The Parties hereto intend to engage in discussions relating to securing certain type of <strong>{data.discussion_type || '__________'}</strong> where the Disclosing Party will provide certain information and data to the Receiving Party that might not be available to the general public in order to facilitate such discussions.</p>

        <p>NOW, THEREFORE, the Parties hereto, with a view to preventing unauthorized disclosure of Confidential Information (as defined below) of the Disclosing Party which may be disclosed to the Receiving Party for the purpose of performing the obligations under this Agreement between the Parties hereto, hereby agree as follows:</p>

        {articles.map((article, idx) => (
          <p key={idx}><strong>Article {idx + 1}.</strong> {article}</p>
        ))}

        <p>IN WITNESS WHEREOF, the Parties hereto have caused this Agreement to be executed by their duly authorized representatives as on the date first hereinabove mentioned.</p>

        <div className='signature-section'>
          <div>
            <strong>Morabaha Finance Company</strong><br />
            (Disclosing Party)<br />
            By: ___________________
          </div>

          <div>
            ___________________<br />
            (Receiving Party)<br />
            By: ___________________
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidentialityAgreementPDF;
