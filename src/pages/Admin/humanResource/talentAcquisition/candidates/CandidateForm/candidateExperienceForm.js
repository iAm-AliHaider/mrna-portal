import React from "react"
import FormikInputField from "../../../../../../components/common/FormikInputField"
import FormikSelectField from "../../../../../../components/common/FormikSelectField"

const CandidateExperienceForm = ({ vacancies, id, isPublicView }) => {
  const disabled = !!id && !isPublicView;
  
  return (
    <React.Fragment>
      <div className="text-lg font-bold">Candidate Expertise</div>

      <div className="p-4 bg-gray-50 rounded-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormikInputField
            name="experienceYears"
            label="Experience Years"
            placeholder="Enter years of experience"
            type="number"
            min="0"
            required
            disabled={disabled}
          />
          <FormikInputField
            name="numberOfSubordinates"
            label="Number of Subordinates in Last Company"
            placeholder="Enter number"
            type="number"
            min="0"
            required
            disabled={disabled}
          />
          <FormikInputField
            name="expectedSalary"
            label="Expected Salary "
            placeholder="Enter expected salary"
            type="number"
            min="0"
            required
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormikInputField
            name="computerSkills"
            label="Computer Skills"
            placeholder="List your computer skills"
            textarea
            rows={3}
            required
            disabled={disabled}
          />
          <FormikInputField
            name="availablePosition"
            label="Position in previous company"
            placeholder="Select available position"
            required
            disabled={disabled}
          />
        </div>

        <FormikInputField
          name="currentBenefits"
          label="Current Benefits"
          textarea
          rows={3}
          placeholder="Describe your current benefits"
          required
          disabled={disabled}
        />
      </div>
    </React.Fragment>
  )
}

export default CandidateExperienceForm
