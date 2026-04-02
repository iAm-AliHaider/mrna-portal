import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../supabaseClient'
import toast from 'react-hot-toast'
import {
  generateAssignedTasksPayloads,
  generateEmployeeCode,
  incrementEmployeeCode
} from '../../helper'
// import { sendNewTaskEmail } from '../../emailSender'
import { sendNewTaskEmail } from '../../emailSenderHelper'


export function useOnboardingCandidates () {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCandidates = useCallback(async isCancelled => {
    if (!isCancelled) {
      setLoading(true)
      setError(null)
    }

    try {
      const { data: rows, error: fetchError } = await supabase
        .from('candidates')
        .select('*')
        .eq('suiteable_for_recruitment', true)
        .eq('offer_letter', 'accepted')
        .eq('contract', 'accepted')
        .eq('is_employee', false)
        .eq('is_deleted', false)

      if (fetchError) {
        throw fetchError
      }

      if (!isCancelled) {
        setData(rows || [])
        setLoading(false)
      }
    } catch (err) {
      if (!isCancelled) {
        setError(err.message || err)
        setLoading(false)
        toast.error(`Error loading candidates: ${err.message || err}`)
      }
    }
  }, [])

  useEffect(() => {
    let isCancelled = false
    fetchCandidates(isCancelled)

    return () => {
      isCancelled = true
    }
  }, [fetchCandidates])

  return {
    data,
    loading,
    error,
    refetch: fetchCandidates
  }
}

export function useGetOnBoardingTasks () {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOnBoardingTasks = async () => {
      const { data: rows, error: fetchError } = await supabase.rpc(
        'get_onboarding_tasks_by_department'
      )

      if (fetchError) {
        setError(fetchError)
        setLoading(false)
        return
      }
      setData(rows)
      setLoading(false)
    }

    fetchOnBoardingTasks()
  }, [])
  return { data, loading, error }
}

export function useAssignOnBoardingTasks () {
  const [loading, setLoading] = useState(false)

  const assigneTasks = useCallback(
    async (values, { resetForm }, refetchCandidates) => {
      setLoading(true)
      const rollbackState = {
        assigned_tasks: false,
        candidate_updated: false,
        employee_created: false,
        leave_quota_created: false,
        employee_id: null,
        candidate_id: values.employee,
        employee_code_updated: false,
        employee_previous_code: null
      }

      try {
        const payload = generateAssignedTasksPayloads(values)
        const { data: inserted, error: insertError } = await supabase
          .from('assigned_tasks')
          .insert(payload)
          .select()

        if (insertError) throw new Error(insertError)
        rollbackState.assigned_tasks = true

        const { empData } = await onboardCandidateEmployee(
          values.employee,
          values.role,
          values.employment_type,
          // values.salary,
          rollbackState
        )

        rollbackState.employee_id = empData.id
        rollbackState.employee_created = true
        rollbackState.leave_quota_created = true
        rollbackState.candidate_updated = true

        toast.success('Onboarding tasks assigned successfully.')
        refetchCandidates()
        resetForm()
        if (payload && payload.length) {
          const employeeIds = []
          payload.forEach(task_a => {
            employeeIds.push(task_a.assigned_to_id)
          })

          const { data, error: employeeError } = await supabase
            .from('employees')
            .select(`*`)
            .in('id', employeeIds) // filter for multiple IDs
            .order('id', { ascending: true })
          if (data && data.length) {
            data.forEach(async emp => {
              if (emp.work_email) {
                await sendNewTaskEmail({
                  email: emp.work_email
                })
              }
            })
          }
        }
        return { data: inserted, error: null }
      } catch (err) {
        console.error('Error assigning tasks:', err)
        await rollbackOnboarding(rollbackState)
        toast.error(`An unexpected error occurred: ${err.message || err}`)
        return { data: null, error: err }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { assigneTasks, loading }
}

async function onboardCandidateEmployee (
  candidateId,
  userRole,
  employmentTypeId,
  // employeeSalary,
  rollbackState = {}
) {
  let savedCandData = null
  let newEmployee = null
  let roles = ['employee']

  // Step 1: Update candidate
  const { data: candData, error: candError } = await supabase
    .from('candidates')
    .update({ is_employee: true, selection_status: 'hired' })
    .eq('id', candidateId)
    .select(`*, vacancy (*)`)

  if (candError)
    throw new Error(`Error updating candidate: ${candError.message}`)
  if (!candData || candData.length === 0)
    throw new Error(`No candidate row found with ID ${candidateId}`)

  savedCandData = candData
  rollbackState.candidate_updated = true
  if (userRole !== 'employee') roles.push(userRole)

  // Step 2: Insert employee
  // GET SALARY FROM OFFER
  const { data: offerData, error: offerError } = await supabase
    .from('offer_requests')
    .select('*')
    .eq('candidate_id', candidateId)
    .eq('status', 'accepted')
    .single()

  if (offerError) throw new Error(`Error inserting employee`)

  const employeeSalary = offerData?.salary;
  const housing = (employeeSalary * 3) / 12;
  const transport = employeeSalary * 0.1;
  const total = employeeSalary + housing + transport;

  const {raw: rawCode, formatted: employeeCode} = await generateEmployeeCode()

  const { data: empData, error: empError } = await supabase
    .from('employees')
    .insert([
      {
        candidate_id: candidateId,
        shift_start_time: '09:00',
        shift_end_time: '18:00',
        company_id: candData[0]?.company_id || 1,
        company_employee_status: 'active',
        employee_status: 'probation',
        user_status: 'active',
        employee_code: `EMP${employeeCode}`,
        role_columns: { roles },
        designation_type: candData[0].designation,
        // salary: employeeSalary,
        employment_type_id: employmentTypeId,
        organizational_unit_id: candData[0]?.vacancy?.organizational_unit_id,
        total_salary: total,
        housing_allowance: housing,
        transportation_allowance: transport,
        basic_salary: employeeSalary
      }
    ])
    .select()

  if (empError) throw new Error(`Error inserting employee: ${empError.message}`)
  if (!empData || empData.length === 0)
    throw new Error(`Employee insert returned no rows`)
  newEmployee = empData[0]
  rollbackState.employee_id = newEmployee.id
  rollbackState.employee_created = true

  const {error: incrementError} = await incrementEmployeeCode(rawCode)

  if (incrementError) throw new Error(`Error inserting employee`)

  rollbackState.employee_previous_code = rawCode
  rollbackState.employee_code_updated = true
  // Log the generated employee code

  // Step 3: Fetch leave types
  const { data: insuranceLeaves, error: insuranceError } = await supabase
    .from('leaves_vacations_insurance')
    .select('*')
    .eq('employment_type_id', newEmployee.employment_type_id)
    .eq('company_id', newEmployee.company_id)

  if (insuranceError)
    throw new Error(`Error fetching leave types: ${insuranceError.message}`)

  // Step 4: Insert leave quota
  const leaveQuotaRows = insuranceLeaves.map(item => ({
    employee_id: newEmployee.id,
    leave_type_id: item.id,
    total_leaves: item.days_allowed,
    available_leaves: item.days_allowed,
    availed_leaves: 0
  }))

  const { error: quotaError } = await supabase
    .from('employee_leave_qouta')
    .insert(leaveQuotaRows)

  if (quotaError)
    throw new Error(`Error inserting leave quota: ${quotaError.message}`)

  rollbackState.leave_quota_created = true

  toast.success('Candidate onboarded – employee and leave quota created.')
  return { empData: newEmployee, candData: savedCandData }
}

export function useHiringTasks (employmentTypeId) {
  const [preTasks, setPreTasks] = useState([])
  const [postTasks, setPostTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchTasks = useCallback(async () => {
    if (!employmentTypeId) return

    setLoading(true)
    setError(null)

    try {
      const { data: rows, error: sbError } = await supabase
        .from('tasks')
        .select('*')
        .eq('employment_type_id', employmentTypeId)
        .in('task_type', ['pre_on_boarding', 'post_on_boarding'])

      if (sbError) throw sbError
      setPreTasks(rows.filter(r => r.task_type === 'pre_on_boarding'))
      setPostTasks(rows.filter(r => r.task_type === 'post_on_boarding'))
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load hiring tasks')
      toast.error(`Error loading tasks: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }, [employmentTypeId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return { preTasks, postTasks, loading, error }
}

async function rollbackOnboarding (rollbackKey) {
  const {
    assigned_tasks,
    candidate_updated,
    employee_created,
    leave_quota_created,
    employee_id,
    candidate_id
  } = rollbackKey

  try {
    if (leave_quota_created && employee_id) {
      await supabase
        .from('employee_leave_qouta')
        .delete()
        .eq('employee_id', employee_id)
    }

    if (employee_created && employee_id) {
      await supabase.from('employees').delete().eq('id', employee_id)
    }

    if (candidate_updated && candidate_id) {
      await supabase
        .from('candidates')
        .update({ is_employee: false, selection_status: 'selected' })
        .eq('id', candidate_id)
    }

    if (assigned_tasks && candidate_id) {
      await supabase
        .from('assigned_tasks')
        .delete()
        .eq('candidate_id', candidate_id)
    }
    if (rollbackKey.employee_code_updated && rollbackKey.employee_previous_code) {
      await supabase
        .from('code_counters')
        .update({ employee_code: rollbackKey.employee_previous_code })
        .eq('id', 1)
    }

    toast.error('Rollback completed for failed onboarding process.')
  } catch (rollbackError) {
    toast.error(`Rollback failed: ${rollbackError.message}`)
  }
}

export async function bumpEmployeeCode() {
  const { data, error } = await supabase
    .from('code_counters')
    .update({}, { returning: 'representation' })
    .increment('employee_code', 1)
    .eq('id', 1)
    .select() 

  if (error) {
    console.error('Error bumping employee_code:', error)
    throw error
  }
  return data
}