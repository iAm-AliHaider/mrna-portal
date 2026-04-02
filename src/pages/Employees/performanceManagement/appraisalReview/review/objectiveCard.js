import React, { useState } from 'react'
import FormikInputField from '../../../../../components/common/FormikInputField'
import { 
  Business as BuildingOfficeIcon,
  Person as UserIcon
} from '@mui/icons-material'

const ObjectiveCard = ({ objective, type }) => {
    const [isExpanded, setIsExpanded] = useState(true)
    
    return (
      <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            {type === 'company' ? (
              <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
            ) : (
              <UserIcon className="h-4 w-4 text-purple-600" />
            )}
            <span className="font-medium text-left">{objective?.objective_title}</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {objective?.weight}%
            </span>
            <span className='text-gray-500 text-xs ml-2 font-medium'>
              {objective?.start_period} - {objective?.end_period}
            </span>
          </div>
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-white">
            <FormikInputField
              name={`scores.${objective?.id}`}
              label={`Score (0-${objective?.score || 100})`}
              type="number"
              placeholder="Enter score..."
              className="w-full"
              min="0"
              max={objective?.score || 100}
            />
          </div>
        )}
      </div>
    )
  }

  export default ObjectiveCard;