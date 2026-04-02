// ManualAttendance.js
import React, { useState, useEffect, useMemo } from 'react'
import HomeIcon from '@mui/icons-material/Home'
import PageWrapperWithHeading from '../../../../components/common/PageHeadSection'
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import Button from '@mui/material/Button'
import { Typography } from '@mui/material'
import useCurrentLocation from '../../../../utils/hooks/useCurrentLocation'
import { getDistanceInMeters } from '../../../../utils/helper'
import { supabase } from '../../../../supabaseClient'
import {
  findInterval,
  subtractIntervals,
  timeDifference
} from '../../../../utils/common'
import Storage from '../../../../utils/storage'
import { useUser } from '../../../../context/UserContext'
import { useTodayApprovedLeave } from '../../../../utils/hooks/api/leaveRequests'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useBranches } from '../../../../utils/hooks/api/useBranches'
const containerStyle = {
  width: '100%',
  height: '100%'
}

// Fallback center if geolocation is not yet available
const fallbackCenter = { lat: 31.415269, lng: 74.282014 }
// Sample campus markers (replace with actual branch locations)
// const markers = [
//   { id: 1, position: { lat: 31.55, lng: 74.34 } },
//   { id: 2, position: { lat: 31.56, lng: 74.35 } },
//   { id: 3, position: { lat: 31.54, lng: 74.33 } },
//   { id: 4, position: { lat: 31.57, lng: 74.36 } },
//   { id: 5, position: { lat: 31.53, lng: 74.32 } },
//   { id: 6, position: { lat: 31.55973148, lng: 74.29160308 } },
//   { id: 7, position: { lat: 31.415269, lng: 74.282014 } },
//   { id: 8, position: { lat: 31.50831917414205, lng: 74.31479283656087 } }
// ]

const breadcrumbItems = [
  { href: '/home', icon: HomeIcon },
  { title: 'Attendance' },
  { title: 'Manual Attendance' }
]

export default function ManualAttendance () {
  // 1) Load Google Maps
  const { user } = useUser()
  const [isMarkers, setIsMarkers] = useState(null)
  const {
    branches,
    loading: branchLoading,
    error: branhError
  } = useBranches(user?.company_id)
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  })
  const { isOnLeave, leaveRecord, loading } = useTodayApprovedLeave()
  // 2) Current geolocation
  const { location } = useCurrentLocation()
  useEffect(() => {
    if (branches?.length > 0) {
      const validBranches = branches.filter(branch => {
        const hasCoords = branch?.lat && branch?.long
        return hasCoords
      })
      const campusMarkers = validBranches.map(branch => ({
        id: branch.id,
        position: {
          lat: parseFloat(branch.lat),
          lng: parseFloat(branch.long)
        }
      }))

      setIsMarkers(campusMarkers)
    } else {
      setIsMarkers([])
    }
  }, [branches])
  // 3) Within 500m of any campus marker?
  const isUnderRadius = isMarkers => {
    if (!location.latitude || !location.longitude) return false
    if (!isMarkers?.position.lat || !isMarkers?.position.lng) return false
    const distance = getDistanceInMeters(
      location.latitude,
      location.longitude,
      isMarkers?.position.lat,
      isMarkers?.position.lng
    )
    return distance <= 500
  }

  // 4) “enableCheckin” if any marker is in range
  const enableCheckin = useMemo(() => {
    if (!isMarkers || !isMarkers?.length) return false
    return isMarkers?.some(isUnderRadius)
  }, [location, isMarkers])

  // 5) Parse stored user once
  const storedUserJson = Storage.get('user')
  const storedUser = storedUserJson || null
  const employeeId = user?.id || 1

  // 6) Today’s date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0]

  // 7) State for today’s log and button flags
  const [logId, setLogId] = useState(null)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [hasBrokenOut, setHasBrokenOut] = useState(false)
  const [hasCheckedOut, setHasCheckedOut] = useState(false)
  const [loadingLog, setLoadingLog] = useState(false)
  const [errorLog, setErrorLog] = useState(null)

  // 8) Fetch or load today’s attendance log on mount
  useEffect(() => {
    if (!employeeId) return

    const loadTodayLog = async () => {
      setLoadingLog(true)
      setErrorLog(null)

      const { data, error } = await supabase
        .from('daily_attendance_logs')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', todayStr)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116: no row found (fine if none exists)
        setErrorLog(error.message)
        setLoadingLog(false)
        return
      }

      if (data) {
        setLogId(data.id)
        setHasCheckedIn(!!data.check_in_time)
        setIsOnBreak(!!data.break_start_time && !data.break_end_time)
        setHasBrokenOut(!!data.break_end_time)
        setHasCheckedOut(!!data.check_out_time)
      }

      setLoadingLog(false)
    }

    loadTodayLog()
  }, [employeeId, todayStr])

  // 9) Current time in “HH:MM”
  const now = new Date()
  const currentTimeStr = now.toTimeString().slice(0, 5) // e.g. "08:45"

  // 10) Disable “Check In” after 17:00
  const currentHour = now.getHours()
  const disableCheckInAfter5pm = currentHour >= 17

  // 11) Determine dynamic map center
  const mapCenter = useMemo(() => {
    if (location.latitude && location.longitude) {
      return { lat: location.latitude, lng: location.longitude }
    } else {
      return fallbackCenter
    }
  }, [location])

  // 12) Optional user marker at current location
  const userMarker =
    location.latitude && location.longitude
      ? {
          id: 'user',
          position: { lat: location.latitude, lng: location.longitude }
        }
      : null

  // 13) Handler: Check In
  const handleCheckIn = async () => {
    if (!employeeId) return

    setLoadingLog(true)

    try {
      const newRow = {
        employee_id: employeeId,
        date: todayStr,
        check_in_time: currentTimeStr
      }

      const { data, error } = await supabase
        .from('daily_attendance_logs')
        .insert([newRow])
        .select('id')
        .single()

      if (error) throw new Error(error.message)

      if (isOnLeave) {
        await decreaseAvailedLeave(data)
      }

      setLogId(data.id)
      setHasCheckedIn(true)
      setIsOnBreak(false)
      setHasBrokenOut(false)
      setHasCheckedOut(false)
    } catch (err) {
      console.error('Error during check-in:', err.message || err)
      setErrorLog(err.message || 'An unexpected error occurred')
    } finally {
      setLoadingLog(false)
    }
  }

  const decreaseAvailedLeave = async inserted => {
    if (!employeeId || !leaveRecord?.leave_type_id) return

    const { data: quotas, error: fetchError } = await supabase
      .from('employee_leave_qouta')
      .select('id, availed_leaves')
      .eq('employee_id', employeeId)
      .eq('id', leaveRecord?.leave_type_id)
      .gt('availed_leaves', 0)

    if (fetchError) throw fetchError

    if (!quotas || quotas.length === 0) {
      console.warn('No availed leaves found to decrement.')
      return
    }

    const targetQuota = quotas[0]
    const { error: updateError } = await supabase
      .from('employee_leave_qouta')
      .update({
        availed_leaves: targetQuota.availed_leaves - 1
      })
      .eq('id', targetQuota.id)

    if (updateError) {
      await supabase
        .from('daily_attendance_logs')
        .delete()
        .eq('id', inserted?.id)
      throw updateError
    }
  }

  // 14) Handler: Break In
  const handleBreakIn = async () => {
    if (!logId) return
    setLoadingLog(true)

    const updates = { break_start_time: currentTimeStr }

    const { error } = await supabase
      .from('daily_attendance_logs')
      .update(updates)
      .eq('id', logId)

    if (error) {
      console.error('Error on break-in:', error.message)
      setErrorLog(error.message)
      setLoadingLog(false)
      return
    }

    setIsOnBreak(true)
    setLoadingLog(false)
  }

  const handleBreakOut = async () => {
    if (!logId) return
    setLoadingLog(true)

    // Fetch both break_start_time AND the original date of the log
    const { data: existing, error: fetchErr } = await supabase
      .from('daily_attendance_logs')
      .select('break_start_time, date')
      .eq('id', logId)
      .single()

    if (fetchErr) {
      console.error('Error fetching for break-out:', fetchErr.message)
      setErrorLog(fetchErr.message)
      setLoadingLog(false)
      return
    }

    // Ensure we have a valid break_start_time
    let breakInterval = null
    if (existing.break_start_time) {
      const end = new Date() // e.g. "2025-06-04T14:30:45.123Z"
      const timeOnly = end.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      breakInterval = timeDifference(existing.break_start_time, timeOnly)
    }
    const updates = {
      break_end_time: currentTimeStr,
      break_availed: breakInterval // null if no break_start_time
    }

    const { error: updateErr } = await supabase
      .from('daily_attendance_logs')
      .update(updates)
      .eq('id', logId)

    if (updateErr) {
      console.error('Error on break-out:', updateErr.message)
      setErrorLog(updateErr.message)
      setLoadingLog(false)
      return
    }

    setIsOnBreak(false)
    setHasBrokenOut(true)
    setLoadingLog(false)
  }

  // 16) Handler: Check Out (& create daily_attendance_reports)
  const handleCheckOut = async () => {
    if (!logId) return
    setLoadingLog(true)

    // 1) Fetch check_in_time, break_availed, and the log's date
    const { data: existing, error: fetchErr } = await supabase
      .from('daily_attendance_logs')
      .select('check_in_time, break_availed, date')
      .eq('id', logId)
      .single()

    if (fetchErr) {
      console.error('Error fetching for checkout:', fetchErr.message)
      setErrorLog(fetchErr.message)
      setLoadingLog(false)
      return
    }

    // 2) Compute checkIn as UTC → local
    const [year, month, day] = existing.date.split('-').map(Number)
    const timeParts = existing.check_in_time.split(':').map(Number)
    const hour = timeParts[0]
    const minute = timeParts[1]
    const second = timeParts.length === 3 ? timeParts[2] : 0

    const checkIn = new Date(
      Date.UTC(year, month - 1, day, hour, minute, second)
    )
    const checkOut = new Date() // now in local zone
    const totalMillis = checkOut - checkIn

    // 3) Convert break_availed ("HH:MM:SS") to milliseconds, if present
    let breakMillis = 0
    if (existing.break_availed) {
      const [h, m, s] = existing.break_availed.split(':').map(Number)
      breakMillis = h * 3600_000 + m * 60_000 + s * 1000
    }

    // 4) Compute in-office duration
    const inOfficeMillis = totalMillis - breakMillis
    const workHours = Math.floor(inOfficeMillis / 3600_000)
    const workMinutes = Math.floor((inOfficeMillis % 3600_000) / 60000)
    const workInterval = `${String(workHours).padStart(2, '0')}:${String(
      workMinutes
    ).padStart(2, '0')}:00`
    const currentTimeInSec = `${currentTimeStr}:00`

    const workIntervalData = findInterval(
      currentTimeInSec,
      existing.check_in_time
    )
    const totalWorkTime = subtractIntervals(
      workIntervalData,
      existing.break_availed
    )

    const updates = {
      check_out_time: currentTimeInSec,
      time_in_office: workIntervalData,
      work_time: totalWorkTime
    }

    const { error: updateErr } = await supabase
      .from('daily_attendance_logs')
      .update(updates)
      .eq('id', logId)

    if (updateErr) {
      console.error('Error on check-out:', updateErr.message)
      setErrorLog(updateErr.message)
      setLoadingLog(false)
      return
    }

    setHasCheckedOut(true)
    setLoadingLog(false)

    // 6) Insert into daily_attendance_reports
    const reportRow = {
      employee_id: employeeId,
      report_type: 'daily',
      from_date: existing.date,
      to_date: existing.date,
      group_by: null,
      order_by: null,
      include_modified_data: false,
      attendance_report_template: null
    }

    const { error: reportErr } = await supabase
      .from('daily_attendance_reports')
      .insert([reportRow])

    if (reportErr) {
      console.error(
        'Error inserting daily attendance report:',
        reportErr.message
      )
    }
  }

  // 17) Determine which buttons to show/disable
  const showCheckIn = !hasCheckedIn && !disableCheckInAfter5pm && enableCheckin
  const showBreakIn =
    hasCheckedIn && !isOnBreak && !hasCheckedOut && !hasBrokenOut
  const showBreakOut = hasCheckedIn && isOnBreak && !hasCheckedOut
  const showCheckOut = hasCheckedIn && !isOnBreak && !hasCheckedOut

  if (loadError) return <div>Error loading maps</div>
  if (!isLoaded) return <div>Loading Maps...</div>

  return (
    <PageWrapperWithHeading title='Manual Attendance' items={breadcrumbItems}>
      <div className='relative h-[calc(100vh-220px)] bg-white rounded-lg shadow-md p-4'>
        {isOnLeave && showCheckIn && (
          <div className='absolute top-4 right-4 z-10 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400 rounded-lg p-4 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='flex-shrink-0'>
                <ErrorOutlineIcon className='h-5 w-5 text-blue-500' />
              </div>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center justify-between gap-2 mb-1'>
                  <h3 className='text-sm font-semibold text-blue-700'>
                    On Leave Today
                  </h3>
                  <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                    {leaveRecord?.leave_type}
                  </span>
                </div>
                <p className='text-xs text-blue-600 truncate'>
                  {leaveRecord?.start_date} - {leaveRecord?.end_date}
                </p>
              </div>
            </div>
          </div>
        )}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter} // ← dynamic center
          zoom={13}
        >
          {/* Campus markers */}
          {isMarkers?.length > 0 ? (
            isMarkers.map(marker => {
              return (
                <Marker
                  key={marker.id}
                  position={marker.position}
                  title={`Branch ${marker.id}`}
                />
              )
            })
          ) : (
            <div>No branch locations available</div>
          )}

          {/* User’s current position */}
          {userMarker && (
            <Marker
              key='user-location'
              position={userMarker.position}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
            />
          )}

          {/* Button panel */}
          <div
            className='absolute bottom-4 left-[40%] z-10 p-2'
            // style={{ transform: "translateX(-50%)" }}
          >
            <div className='text-center min-w-[250px] space-y-8'>
              <div className='bg-white rounded-lg shadow-md p-4 mb-2 w-[150px] mx-auto'>
                <img
                  src={'/assets/images/placeholder_image.png'}
                  alt={'User'}
                  className='w-24 h-30 mb-2 mx-auto rounded-lg'
                />
                <div className='font-bold text-lg'>
                  {storedUser?.first_name || 'Jane Doe'}
                </div>
              </div>

              <div className='space-y-2'>
                {/* Check In */}
                {showCheckIn && (
                  <Button
                    variant='contained'
                    color='primary'
                    fullWidth
                    disabled={loadingLog}
                    className='disabled:!bg-gray-400 disabled:!text-gray-200 disabled:!cursor-not-allowed'
                    onClick={handleCheckIn}
                  >
                    {loadingLog ? 'Checking In…' : 'Check In'}
                  </Button>
                )}
                {!showCheckIn && (
                  <Button
                    variant='contained'
                    color='primary'
                    className='disabled:!bg-gray-400 disabled:!text-gray-200 disabled:!cursor-not-allowed'
                    fullWidth
                    disabled
                  >
                    {disableCheckInAfter5pm
                      ? 'Check-In closed (past 17:00)'
                      : !enableCheckin
                      ? 'Out of range'
                      : 'Already Checked In'}
                  </Button>
                )}

                {/* Break In */}
                {showBreakIn && (
                  <Button
                    variant='contained'
                    color='primary'
                    fullWidth
                    className='disabled:!bg-gray-400 disabled:!text-gray-200 disabled:!cursor-not-allowed'
                    disabled={loadingLog}
                    onClick={handleBreakIn}
                  >
                    {loadingLog ? 'Recording break…' : 'Break In'}
                  </Button>
                )}

                {/* Break Out */}
                {showBreakOut && (
                  <Button
                    variant='contained'
                    color='secondary'
                    fullWidth
                    className='disabled:!bg-gray-400 disabled:!text-gray-200 disabled:!cursor-not-allowed'
                    disabled={loadingLog}
                    onClick={handleBreakOut}
                  >
                    {loadingLog ? 'Ending break…' : 'Break Out'}
                  </Button>
                )}

                {/* Check Out */}
                {showCheckOut && (
                  <Button
                    variant='contained'
                    color='secondary'
                    fullWidth
                    className='disabled:!bg-gray-400 disabled:!text-gray-200 disabled:!cursor-not-allowed'
                    disabled={loadingLog}
                    onClick={handleCheckOut}
                  >
                    {loadingLog ? 'Checking Out…' : 'Check Out'}
                  </Button>
                )}

                {/* Already Checked Out */}
                {hasCheckedOut && (
                  <Button
                    variant='contained'
                    className='disabled:!bg-gray-400 disabled:!text-gray-200 disabled:!cursor-not-allowed'
                    fullWidth
                    disabled
                  >
                    Already Checked Out
                  </Button>
                )}
              </div>
              {/* Show any error */}
              {errorLog && <Typography color='error'>{errorLog}</Typography>}
            </div>
          </div>
        </GoogleMap>
      </div>
    </PageWrapperWithHeading>
  )
}
