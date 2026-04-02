import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'

export function useCandidates (
  page = 0,
  searchQuery = '',
  filters = {},
  perPage = 10
) {
  const [candidatesData, setCandidatesData] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [candidateNames, setCandidateNames] = useState([])
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     const fetchCandidates = async () => {
//       setLoading(true)
//       try {
//         const from = page * perPage
//         const to = page * perPage + perPage - 1
//         let query = supabase
//           .from('candidates')
//           .select('*, vacancy:vacancy (id, title)', { count: 'exact' })
//           .eq('is_deleted', false)

//         if (searchQuery) {
//           query = query.or(`first_name.ilike.%${searchQuery}%`)
//         }
//         if (filters.candidate_number) {
//           query = query.eq('candidate_no', filters.candidate_number)
//         }
//         if (filters.from_date) {
//           query = query.gte('created_at', filters.from_date)
//         }
//         if (filters.to_date) {
//           query = query.lte('created_at', filters.to_date)
//         }

//         query = query.order('created_at', { ascending: false })
//         query = query.range(from, to)

//         const { data, error, count } = await query

//         if (error) {
//           setError(error)
//           setCandidatesData([])
//           setTotalPages(0)
//           setCount(0)
//         } else {
//           setCandidatesData(data || [])
//           setCount(count || 0)
//           setTotalPages(Math.ceil((count || 0) / perPage))
//           setCandidateNames(
//             (data || []).map(c => ({ label: c.full_name, value: c.id }))
//           )
//         }
//       } catch (err) {
//         setError(err)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchCandidates()
//   }, [searchQuery, page, filters, perPage])



// useEffect(() => {
//   const fetchCandidates = async () => {
//     setLoading(true);
//     try {
//       const from = page * perPage;
//       const to = page * perPage + perPage - 1;

//       // 1) Base candidates query (filters + pagination)
//       let query = supabase
//         .from("candidates")
//         .select("*, vacancy:vacancy (id, title)", { count: "exact" })
//         .eq("is_deleted", false);

//       if (searchQuery) {
//         query = query.or(`first_name.ilike.%${searchQuery}%`);
//         // If you prefer full-name search, use:
//         // query = query.or(`full_name.ilike.%${searchQuery}%`);
//       }
//       if (filters.candidate_number) {
//         query = query.eq("candidate_no", filters.candidate_number);
//       }
//       if (filters.from_date) {
//         query = query.gte("created_at", filters.from_date);
//       }
//       if (filters.to_date) {
//         query = query.lte("created_at", filters.to_date);
//       }

//       query = query.order("created_at", { ascending: false }).range(from, to);

//       const { data: candidates, error, count } = await query;

//       if (error) {
//         setError(error);
//         setCandidatesData([]);
//         setTotalPages(0);
//         setCount(0);
//         return;
//       }

//       // Nothing to enrich if no candidates on this page
//       const ids = (candidates || []).map((c) => c.id);
//       if (!ids.length) {
//         setCandidatesData([]);
//         setCount(count || 0);
//         setTotalPages(Math.ceil((count || 0) / perPage));
//         setCandidateNames([]);
//         return;
//       }

//       // 2) Follow-up batched queries (mirror your style: separate selects)
//       const [eduRes, certRes] = await Promise.all([
//         supabase.from("education").select("*").in("candidate_id", ids),
//         supabase.from("certificates").select("*").in("candidate_id", ids),
//       ]);

//       // 3) Group by candidate_id for quick merge
//       const groupBy = (rows = [], key = "candidate_id") =>
//         rows.reduce((acc, row) => {
//           const k = row[key];
//           if (!acc[k]) acc[k] = [];
//           acc[k].push(row);
//           return acc;
//         }, {});

//       const eduByCandidate = groupBy(eduRes?.data || [], "candidate_id");
//       const certByCandidate = groupBy(certRes?.data || [], "candidate_id");

//       // (optional) sort nested arrays, e.g., latest first
//       Object.values(eduByCandidate).forEach((arr) =>
//         arr.sort((a, b) => String(b.passing_year || "").localeCompare(String(a.passing_year || "")))
//       );
//       Object.values(certByCandidate).forEach((arr) =>
//         arr.sort((a, b) => String(b.cert_date || "").localeCompare(String(a.cert_date || "")))
//       );

//       // 4) Merge onto candidates
//       const merged = (candidates || []).map((c) => ({
//         ...c,
//         education: eduByCandidate[c.id] || [],
//         certificates: certByCandidate[c.id] || [],
//       }));

//       // 5) Set state
//       setCandidatesData(merged);
//       setCount(count || 0);
//       setTotalPages(Math.ceil((count || 0) / perPage));
//       setCandidateNames(merged.map((c) => ({ label: c.full_name, value: c.id })));
//     } catch (err) {
//       setError(err);
//       setCandidatesData([]);
//       setTotalPages(0);
//       setCount(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchCandidates();
// }, [searchQuery, page, filters, perPage]);


useEffect(() => {
  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const from = page * perPage;
      const to = page * perPage + perPage - 1;

      // 1) Base candidates query (filters + pagination)
      let query = supabase
        .from("candidates")
        .select("*, vacancy:vacancy (id, title)", { count: "exact" })
        .eq("is_deleted", false);

      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%`);
        // If you prefer full-name search, use:
        // query = query.or(`full_name.ilike.%${searchQuery}%`);
      }
      if (filters.candidate_number) {
        query = query.eq("candidate_no", filters.candidate_number);
      }
      if (filters.from_date) {
        query = query.gte("created_at", filters.from_date);
      }
      if (filters.to_date) {
        query = query.lte("created_at", filters.to_date);
      }

      query = query.order("created_at", { ascending: false }).range(from, to);

      const { data: candidates, error, count } = await query;

      if (error) {
        setError(error);
        setCandidatesData([]);
        setTotalPages(0);
        setCount(0);
        return;
      }

      // Nothing to enrich if no candidates on this page
      const ids = (candidates || []).map((c) => c.id);



      if (!ids.length) {
        setCandidatesData([]);
        setCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / perPage));
        setCandidateNames([]);
        return;
      }

      

      // 2) Follow-up batched queries (mirror your style: separate selects)
      const [eduRes, certRes] = await Promise.all([
        supabase.from("education").select("*").in("candidate_id", ids),
        supabase.from("certificates").select("*").in("candidate_id", ids),
      ]);



      // 3) Group by candidate_id for quick merge
      const groupBy = (rows = [], key = "candidate_id") =>
        rows.reduce((acc, row) => {
          const k = row[key];
          if (!acc[k]) acc[k] = [];
          acc[k].push(row);
          return acc;
        }, {});

      const eduByCandidate = groupBy(eduRes?.data || [], "candidate_id");
      const certByCandidate = groupBy(certRes?.data || [], "candidate_id");

      // (optional) sort nested arrays, e.g., latest first
      Object.values(eduByCandidate).forEach((arr) =>
        arr.sort((a, b) => String(b.passing_year || "").localeCompare(String(a.passing_year || "")))
      );
      Object.values(certByCandidate).forEach((arr) =>
        arr.sort((a, b) => String(b.cert_date || "").localeCompare(String(a.cert_date || "")))
      );

      // 4) Merge onto candidates
      const merged = (candidates || []).map((c) => ({
        ...c,
        education: eduByCandidate[c.id] || [],
        certificates: certByCandidate[c.id] || [],
      }));

      // 5) Set state
      setCandidatesData(merged);
      setCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
      setCandidateNames(merged.map((c) => ({ label: c.full_name, value: c.id })));
    } catch (err) {
      setError(err);
      setCandidatesData([]);
      setTotalPages(0);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  fetchCandidates();
}, [searchQuery, page, filters, perPage]);



  return { candidatesData, totalPages, candidateNames, error, count, loading }
}
