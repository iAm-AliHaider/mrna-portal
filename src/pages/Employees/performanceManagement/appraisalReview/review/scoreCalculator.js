import React, { useMemo } from 'react'
import { useFormikContext } from 'formik'
import { 
  BarChart as ChartBarIcon,
} from '@mui/icons-material'

// Real-time calculation component
const ScoreCalculator = ({ objectives }) => {
  const { values } = useFormikContext()
  
  const calculations = useMemo(() => {
    const companyObjs = objectives?.filter(o => o.type === 'company')
    const employeeObjs = objectives?.filter(o => o.type === 'employee')
    
    const calculateSection = (objs) => {
      const totalWeight = objs?.reduce((sum, o) => sum + o.weight, 0)
      const weightedScore = objs?.reduce((sum, o) => {
        const score = Number(values.scores?.[o.id] || 0)
        return sum + (score * o.weight / o.score)
      }, 0)
      const averageScore = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0
      
      return { totalWeight, weightedScore, averageScore }
    }
    
    const company = calculateSection(companyObjs)
    const employee = calculateSection(employeeObjs)
    const overall = calculateSection(objectives)
    
    return { company, employee, overall }
  }, [objectives, values.scores])
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">Live Score Calculation</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Company Objectives</div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(calculations?.company?.averageScore)}`}>
            {calculations?.company?.averageScore?.toFixed(1)}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Employee Objectives</div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(calculations?.employee?.averageScore)}`}>
            {calculations?.employee?.averageScore?.toFixed(1)}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Overall Score</div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${getScoreColor(calculations?.overall?.averageScore)}`}>
            {calculations?.overall?.averageScore?.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScoreCalculator;