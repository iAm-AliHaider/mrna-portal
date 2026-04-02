import React, { useState, useRef, useEffect } from 'react'
import { useField } from 'formik'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

const YearPicker = ({ name, label, required = false, placeholder = 'Select Year' }) => {
  const [field, meta, helpers] = useField(name)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(field.value || '')
  const [baseYear, setBaseYear] = useState(
    field.value ? Math.floor(field.value / 12) * 12 : Math.floor(new Date().getFullYear() / 12) * 12
  )
  const [filteredYears, setFilteredYears] = useState([])
  const dropdownRef = useRef(null)

  // Full year list (100 years range)
  const allYears = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleYearSelect = (year) => {
    setSelectedYear(year.toString())
    helpers.setValue(year.toString())
    setIsOpen(false)
    setFilteredYears([]) // reset filter
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSelectedYear(value)

    // Filter logic
    if (value && /^\d{1,4}$/.test(value)) {
      const filtered = allYears.filter((y) => y.toString().startsWith(value))
      setFilteredYears(filtered)
    } else {
      setFilteredYears([])
    }

    if (/^\d{4}$/.test(value)) {
      helpers.setValue(value)
    }
  }

  const renderYearGrid = () => {
    const yearsToRender = filteredYears.length > 0 ? filteredYears : Array.from({ length: 12 }, (_, i) => baseYear + i)

    return (
      <div className="grid grid-cols-4 gap-2 p-2">
        {yearsToRender.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => handleYearSelect(year)}
            className={`px-3 py-2 rounded-md text-sm ${
              selectedYear === year.toString() ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
          >
            {year}
          </button>
        ))}
        {yearsToRender.length === 0 && (
          <div className="col-span-4 text-center text-sm text-gray-500 py-2">
            No matching years
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {label && (
        <label className="text-sm mb-1 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={selectedYear}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full border ${
            meta.error ? 'border-red-500' : 'border-gray-200'
          } rounded-xl p-3 pr-10 bg-white outline-none focus:border-blue-500 transition-colors`}
        />

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
        >
          <CalendarTodayIcon />
        </button>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          {filteredYears.length === 0 && (
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <button onClick={() => setBaseYear(baseYear - 12)} className="text-sm text-gray-500 hover:text-black">
                ‹
              </button>
              <span className="text-sm font-medium">{baseYear} - {baseYear + 11}</span>
              <button onClick={() => setBaseYear(baseYear + 12)} className="text-sm text-gray-500 hover:text-black">
                ›
              </button>
            </div>
          )}
          {renderYearGrid()}
        </div>
      )}

      {meta.error && <p className="text-xs text-red-600 mt-1 pl-1">{meta.error}</p>}
    </div>
  )
}

export default YearPicker
