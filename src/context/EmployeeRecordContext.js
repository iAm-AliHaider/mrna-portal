import React, { createContext, useContext, useState } from "react";
import { useGetEmployeeRecord } from "../utils/hooks/api/employeeRecords";

const EmployeeRecordContext = createContext({
  record: null,
  loading: false,
  error: null,
  loadRecord: () => {},
  loadRecord2: () => {},
});

export const EmployeeRecordProvider = ({ children }) => {
  const [empCode, setEmpCode] = useState("");
  const {
    data: record,
    loading,
    error,
    fetchEmployeeRecord,
  } = useGetEmployeeRecord();

  const loadRecord = async () => {
    await fetchEmployeeRecord(empCode);
  };

  const loadRecord2 = async (dataToFetch) => {
    await fetchEmployeeRecord(dataToFetch);
  };

  return (
    <EmployeeRecordContext.Provider
      value={{
        record,
        loading,
        error,
        loadRecord,
        loadRecord2,
        setEmpCode,
        empCode,
      }}
    >
      {children}
    </EmployeeRecordContext.Provider>
  );
};

export const useEmployeeRecord = () => {
  const context = useContext(EmployeeRecordContext);
  if (context === undefined) {
    throw new Error(
      "useEmployeeRecord must be used within EmployeeRecordProvider"
    );
  }
  return context;
};
