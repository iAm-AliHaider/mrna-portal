import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import toast from 'react-hot-toast'

export function useOnboardingTasks({
    assignedToId = null,
    searchTerm = '',
    initialPage = 0,
    initialSize = 20,
    refetch
}) {
    const [data, setData] = useState([])
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(initialPage)
    const [pageSize, setPageSize] = useState(initialSize)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [totalPages, setTotalPages] = useState(0)

    const fetchTasks = useCallback(async () => {
        setLoading(true)
        setError(null)

        let query = supabase
            .from('assigned_tasks')
            .select(`*,
        tasks!inner(id,name,description,status,organizational_structure_id,type,task_type,employment_type_id,attachment,created_at,updated_at),
        creator:created_by(id,employee_code,role_columns,company_id,user_status),
        updater:updated_by(id,employee_code,role_columns,company_id,user_status),
        assignedTo:assigned_tasks_assigned_to_id_fkey(candidate:employees_candidate_id_fkey(*)),
        candidate:candidates!fk_candidate!inner(*)`,
                { count: 'exact' }
            )
            .in('tasks.task_type', ['post_on_boarding'])
            .eq('candidate.suiteable_for_recruitment', true)

        if (assignedToId != null) query = query.eq('assigned_to_id', assignedToId)

        if (searchTerm) {
            query = query
                .ilike('candidate.full_name', `%${searchTerm}%`) // Match search term in full_name
                .not('candidate', 'is', null) // Ensure candidate data exists
                .neq('candidate.full_name', ''); // Exclude empty full_name values
        }

        const from = page * pageSize
        const to = from + pageSize - 1

        query = query.range(from, to).order('assigned_at', { ascending: false })


        const { data: rows, error: fetchError, count: total } = await query
        if (fetchError) {
            toast.error('Failed to fetch assigned tasks.')
            setError(fetchError)
        } else {
            let taskData = rows.map(row => ({
                ...row,
                task_name: row?.tasks?.name,
                task_description: row?.tasks?.description,
                task_status: row?.tasks?.status,
                task_type: row?.tasks?.task_type ? row?.tasks?.task_type
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ') : '',
                task_attachment: row?.tasks?.attachment,
                assigned_at: row?.assigned_at,
                candidate_name: row?.candidate?.full_name,
                assigned_to_name:row?.assignedTo?.candidate?.full_name,
            }));
            setData(taskData || [])
            setCount(total)
            setTotalPages(Math.ceil((total || 0) / pageSize))
        }
        setLoading(false)
    }, [assignedToId, searchTerm, page, pageSize, refetch])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    return { data, loading, error, page, setPage, pageSize, setPageSize, count, totalPages, refetch: fetchTasks }
}