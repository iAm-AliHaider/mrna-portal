import toast from "react-hot-toast/headless";
import { supabase } from "../supabaseClient";

export const supaBaseGetById = async (tableName,id) => {
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq('id', id)
    .eq;
  if (data) {
    return data;
  } else {
    toast("error while fetching ");
  }
};
export const supaBaseSingleCall = async (tableName) => {
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .limit(1)
    .single();
  if (data) {
    return data;
  } else {
    toast("error while fetching ");
  }
};

export const supaBasegetAllCall = async (tableName) => {
  const { data, error } = await supabase.from(tableName).select("*");
  if (data) {
    return data;
  } else {
    toast("error while fetching ");
  }
};

export const supaBasePaginatedCall = async (tableName, page, limit) => {
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .limit(limit)
    .skip(page * limit)
    .single();
  if (data) {
    return data;
  } else {
    toast("error while fetching ");
  }
};

export const supaBaseUpdateById = async (tableName, id, payload) => {
  const { data, error } = await supabase
    .from(tableName)
    .update(payload)
    .eq("id", id)
    .select();

  if (error) {
    toast.error(`Error updating ${tableName} with id ${id}: ${error.message}`);
    return null;
  }
  return data;
};

export const supaBaseCreateCall = async (tableName, payload) => {
  const { data, error } = await supabase
    .from(tableName)
    .insert([payload]) // insert expects an array of objects
    .select()
    .single();

  if (error) {
    toast.error(`Error creating in ${tableName}: ${error.message}`);
    return null;
  }
  return data;
};

export const supaBaseCreateMultipleCall = async (tableName, payload) => {
  const { data, error } = await supabase
    .from(tableName)
    .insert(payload) // insert expects an array of objects
    .select();

  if (error) {
    toast.error(`Error creating in ${tableName}: ${error.message}`);
    return null;
  }
  return data;
};
export const supaBaseDeleteById = async (tableName, id) => {
  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    toast.error(
      `Error deleting from ${tableName} with id ${id}: ${error.message}`
    );
    return null;
  }
  return data;
};

export const supaBaseFilteredEqualCall = async (
  tableName,
  columnName,
  value
) => {
  try {
    // If table is employees, fetch with candidates join
    const selectQuery =
      tableName === "employees"
        ? "*, candidates:candidates!employees_candidate_id_fkey(*)"
        : "*";

    const { data, error } = await supabase
      .from(tableName)
      .select(selectQuery)
      .eq(columnName, value)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(`Error filtering ${tableName}: ${error.message}`);
      return null;
    }

    return data;
  } catch (err) {
    toast.error(`Unexpected error filtering ${tableName}: ${err.message}`);
    return null;
  }
};


export const supaBaseFilteredIlikeCall = async (
  tableName,
  columnName,
  value
) => {
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .ilike(columnName, `%${value}%`) // % is wildcard for LIKE
    .order("created_at", { ascending: false });
  if (error) {
    toast.error(`Error filtering ${tableName}: ${error.message}`);
    return null;
  }
  return data;
};

export const timeDifference =  (startTime, endTime) => {
  // Helper: convert "HH:MM:SS" → total seconds
  const toSeconds = (hms) => {
    const [h, m, s] = hms.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };

  const startSec = toSeconds(startTime);
  const endSec = toSeconds(endTime);

  // Compute raw difference
  let diffSec = endSec - startSec;

  // If negative, assume end is on the next day
  if (diffSec < 0) {
    diffSec += 24 * 3600;
  }

  // Reconstruct hours, minutes, seconds
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}


export const findInterval = (time1, time2) => {
  // 1) both values must be non-empty strings
  if (typeof time1 !== 'string' || typeof time2 !== 'string') return null;

  // 2) validate format HH:MM:SS
  const re = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  if (!re.test(time1) || !re.test(time2)) return null;

  // 3) parse into total seconds
  const toSeconds = t => {
    const [h, m, s] = t.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  };
  const diff = toSeconds(time1) - toSeconds(time2);

  // 4) clamp at zero
  const lateSec = Math.max(diff, 0);

  // 5) format back to HH:MM:SS
  const hh = String(Math.floor(lateSec / 3600)).padStart(2, '0');
  const mm = String(Math.floor((lateSec % 3600) / 60)).padStart(2, '0');
  const ss = String(lateSec % 60).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}

export function subtractIntervals(t1, t2) {
  // 1) both must be non-empty strings
  if (typeof t1 !== 'string' || typeof t2 !== 'string') return null;

  // 2) validate HH:MM:SS format
  const re = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  if (!re.test(t1) || !re.test(t2)) return null;

  // 3) parse into seconds
  const toSec = t => t.split(':').map(Number).reduce(
    (acc, val, idx) => acc + val * [3600, 60, 1][idx],
    0
  );

  const diff = toSec(t1) - toSec(t2);      // can be negative
  const sign = diff < 0 ? '-' : '';
  const absSec = Math.abs(diff);

  // 4) format back to HH:MM:SS
  const hh = String(Math.floor(absSec / 3600)).padStart(2, '0');
  const mm = String(Math.floor((absSec % 3600) / 60)).padStart(2, '0');
  const ss = String(absSec % 60).padStart(2, '0');

  return `${sign}${hh}:${mm}:${ss}`;
}

export function isFutureDate(dateString) {
  // parse as local date (year, monthIndex, day)
  const [year, month, day] = dateString.split("-").map(Number);
  const inputDate = new Date(year, month - 1, day);

  // get today at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0, 0);

  return inputDate > today;
}