import React, { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

const MASTER_FIELD_TYPES_TABLES = {
    branch: 'branches',
    department: 'organizational_units',
    designation: 'designations'
}

export function ChangeRequestView ({ request, isOld = false }) {
  const { type } = request
  const rawValue = isOld ? request[`old_${type}`] : request[`new_${type}`]

  const [label, setLabel] = useState(null)

  const MASTER_FIELD_TYPES = Object.keys(MASTER_FIELD_TYPES_TABLES)

  useEffect(() => {
    if (MASTER_FIELD_TYPES.includes(type) && rawValue != null) {
      supabase
        .from(MASTER_FIELD_TYPES_TABLES[type])
        .select('*')
        .eq('id', rawValue)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            setLabel('—')
          } else {
            setLabel(data.name || data.title || data.designation)
          }
        })
    } else {
      setLabel(null)
    }
  }, [type, rawValue, MASTER_FIELD_TYPES])

  let display
  if (MASTER_FIELD_TYPES.includes(type)) {
    display =
      label === null
        ? '…'
        : label
  } else {
    display = rawValue ?? '—'
  }

  return (
    <div className='p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200'>
      {display}
    </div>
  )
}
