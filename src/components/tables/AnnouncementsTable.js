// import React, { useState } from "react";
// import {
//   Box,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Button,
//   Chip,
//   Avatar,
//   Pagination,
//   Select,
//   MenuItem,
//   Menu,
//   Typography,
//   IconButton,
// } from "@mui/material";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import { format } from "date-fns";
// import TableLoadingWrapper from "../common/LoadingWrapper/TableWrapper";
// import DescriptionTableCell from "../common/DescriptionTableCell";
// import "./style.css";

// const DynamicTable = ({
//   columns = [],
//   data = [],
//   onAction = () => {},
//   currentPage = 1,
//   totalPages = 1,
//   onPageChange = () => {},
//   perPage = 10,
//   onPerPageChange = () => {},
//   onColumnAction = () => {},
//   onRowClick = () => {},
//   rowCursor = false,
//   footerInfo = "",
//   showCheckbox = false,
//   showMenu = false,
//   onSelectChange,
//   showPagination = true,
//   loading = false
// }) => {
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [menuPosition, setMenuPosition] = useState(null);
//   const [selectedRow, setSelectedRow] = useState(null);

//   console.log("table rows MZ", columns)

//   const toggleRow = (id) => {
//     const newSelection = selectedIds.includes(id)
//       ? selectedIds.filter((i) => i !== id)
//       : [...selectedIds, id];
//     setSelectedIds(newSelection);
//     onSelectChange && onSelectChange(newSelection);
//   };

//   const toggleAll = () => {
//     if (selectedIds.length === data.length) {
//       setSelectedIds([]);
//       onSelectChange && onSelectChange([]);
//     } else {
//       const allIds = data.map((row) => row.id);
//       setSelectedIds(allIds);
//       onSelectChange && onSelectChange(allIds);
//     }
//   };

//   const openMenu = (event, row, col) => {
//     setMenuPosition({ top: event.clientY, left: event.clientX });
//     setSelectedRow(row);
//     setMenuOpen(true);
//   };

//   const closeMenu = () => {
//     setMenuOpen(false);
//     setMenuPosition(null);
//     setSelectedRow(null);
//   };

//   const handleAction = (type) => {
//     if (onColumnAction && selectedRow) {
//       onColumnAction(selectedRow.id, type);
//     }
//     closeMenu();
//   };

//   const handlePerPageChange = (event) => {
//     const value = parseInt(event.target.value, 10);
//     onPerPageChange(value);
//     onPageChange(1); // Reset to first page on perPage change
//     setSelectedIds([]); // Reset selection when perPage changes
//   }

//   const handleDownload = (url) => {
//     if (!url) return
//     const link = document.createElement('a')
//     link.href = url
//     link.download = ''        // let browser pick the filename
//     link.target = '_blank'
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   return (
//     <Box className="table-wrapper">
//       <TableContainer component={Paper} className="table-container">
//         <Table>
//           <TableHead>
//             <TableRow className="table-header-row">
//               {showCheckbox && (
//                 <TableCell padding="checkbox pl-2">
//                   <input
//                     type="checkbox"
//                     checked={selectedIds.length === data.length}
//                     onChange={toggleAll}
//                   />
//                 </TableCell>
//               )}
//               {columns.map((col, index) => (
//                 <TableCell
//                   key={`${col.key}-${index}`}
//                   className="table-header"
//                   style={{ width: col.width }}
//                 >
//                   {col.label}
//                 </TableCell>
//               ))}
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             <TableLoadingWrapper isLoading={loading}>
//               {data.map((row) => (
//                 <TableRow
//                   key={row.id}
//                   className={`table-row ${
//                     rowCursor ? "cursor-pointer hover:shadow-lg" : ""
//                   }`}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onRowClick(row.id);
//                   }}
//                 >
//                   {showCheckbox && (
//                     <TableCell padding="checkbox pl-2">
//                       <input
//                         type="checkbox"
//                         checked={selectedIds.includes(row.id)}
//                         onChange={() => toggleRow(row.id)}
//                       />
//                     </TableCell>
//                   )}
//                   {columns.map((col) => {
//                     const value = row[col.key];

//                     // Chip (status like Read/New/Completed)
//                     if (col.type === "chip") {
//                       return (
//                         <TableCell key={col.key}>
//                           <Chip
//                             label={value}
//                             size="small"
//                             className={`table-chip capitalize ${
//                               typeof value === "string"
//                                 ? value.toLowerCase().replace(/ /g, "-")
//                                 : ""
//                             }`}
//                           />
//                         </TableCell>
//                       );
//                     }

//                     if (col.type === "progress") {
//                       return (
//                         <TableCell key={col.key}>
//                           <Box className="progress-bar-wrapper">
//                             <Box className="progress-bar-track" />
//                             <Box
//                               className="progress-bar-fill"
//                               style={{ width: value.progress + "%" }}
//                             />
//                             <Chip
//                               label={value.status}
//                               size="small"
//                               className={`table-chip ${value.status.toLowerCase()}`}
//                             />
//                           </Box>
//                         </TableCell>
//                       );
//                     }

//                     // Button (like Download)
//                     if (col.type === "button") {
//                       return (
//                         <TableCell key={col.key} align="right">
//                           <Button
//                             variant="contained"
//                             size="small"
//                             // endIcon={<DownloadIcon />}
//                             className="table-download-button"
//                             onClick={() => onAction(row, col.key)}
//                           >
//                             {col.label}
//                           </Button>
//                         </TableCell>
//                       );
//                     }

//                     if (col.type === "checkbox") {
//                       return (
//                         <TableCell
//                           padding="checkbox"
//                           align="center"
//                           style={{ width: col.width }}
//                         >
//                           <input
//                             type="checkbox"
//                             checked={value}
//                             onChange={() => onAction(row.id, col, value)}
//                           />{" "}
//                           Yes
//                         </TableCell>
//                       );
//                     }

//                     // Avatar with name and subtitle
//                     if (col.type === "avatar") {
//                       return (
//                         <TableCell key={col.key}>
//                           <Box className="table-avatar-block">
//                             <Avatar
//                               src={value?.image}
//                               sx={{ width: 30, height: 30 }}
//                             />
//                             <Box ml={1}>
//                               <Typography>{value?.name}</Typography>
//                               <Typography variant="caption" color="textSecondary">
//                                 {value?.title}
//                               </Typography>
//                             </Box>
//                           </Box>
//                         </TableCell>
//                       );
//                     }

//                     if (col.type === "action_menu") {
//                       return (
//                         <TableCell align="right">
//                           <IconButton
//                             onClick={(e) => openMenu(e, row.id, col, value)}
//                           >
//                             <MoreVertIcon />
//                           </IconButton>
//                         </TableCell>
//                       );
//                     }

//                     if (col.type === "custom" && col.render) {
//                       return (
//                         <TableCell key={col.key}>{col.render(row)}</TableCell>
//                       );
//                     }

//                     if (col.type === "description" && col.render) {
//                       return (
//                         <TableCell key={col.key} style={{ width: col.width }}>
//                           <DescriptionTableCell description={col.render(row)} />
//                         </TableCell>
//                       );
//                     }

//                     if (col.type === "date") {
//                       return (
//                         <TableCell key={col.key}>{value? format(new Date(value), "dd-MM-yyyy"):'-'}</TableCell>
//                       );
//                     }

//                     if (col.type === 'attachment') {
//                       return (
//                         <TableCell key={col.key}>
//                           {value
//                             ? <Button
//                                 size="small"
//                                 variant="outlined"
//                                 onClick={() => handleDownload(value)}
//                               >
//                                 Download
//                               </Button>
//                             : <em>No file</em>
//                           }
//                         </TableCell>
//                       )
//                     }

//                     // Fallback: Text
//                     return (
//                       <TableCell
//                         key={col.key}
//                         className={col.align === "right" ? "rtl-text" : ""}
//                       >
//                         {/* {value} */}
//                         {value === 0 ? value.toString() : value ?? "-"}
//                       </TableCell>
//                     );
//                   })}
//                 </TableRow>
//               ))}
//               </TableLoadingWrapper>
//             </TableBody>
//         </Table>
//         <Menu
//           open={menuOpen}
//           onClose={closeMenu}
//           anchorReference="anchorPosition"
//           anchorPosition={
//             menuPosition
//               ? { top: menuPosition.top, left: menuPosition.left }
//               : undefined
//           }
//           PaperProps={{
//             style: {
//               borderRadius: 12,
//               minWidth: 140,
//             },
//           }}
//         >
//           <MenuItem onClick={() => handleAction("edit")}>
//             <EditIcon fontSize="small" />
//             <span style={{ marginLeft: 8 }}>Edit</span>
//           </MenuItem>
//           <MenuItem onClick={() => handleAction("delete")}>
//             <DeleteIcon fontSize="small" color="error" />
//             <span style={{ marginLeft: 8, color: "#f44336" }}>Delete</span>
//           </MenuItem>
//         </Menu>
//       </TableContainer>

//       {/* Footer */}
//       {showPagination && (
//         <Box className="table-footer">
//           <Pagination
//             count={totalPages}
//             page={currentPage}
//             onChange={(e, val) => onPageChange(val)}
//             size="small"
//           />
//           <Box className="table-footer-info">
//             <Select
//               value={perPage}
//               onChange={handlePerPageChange}
//               size="small"
//             >
//               {[4, 6, 10, 15].map((n) => (
//                 <MenuItem key={n} value={n}>
//                   {String(n).padStart(2, "0")}
//                 </MenuItem>
//               ))}
//             </Select>
//             <Typography variant="body2" ml={1}>
//               {footerInfo}
//             </Typography>
//           </Box>
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default DynamicTable;

import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Avatar,
  Pagination,
  Select,
  MenuItem,
  Menu,
  Typography,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import TableLoadingWrapper from "../common/LoadingWrapper/TableWrapper";
import DescriptionTableCell from "../common/DescriptionTableCell";
import "./style.css";
import { parseISO, isValid, format } from "date-fns";

const DynamicTable = ({
  columns = [],
  data = [],
  onAction = () => {},
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  perPage = 10,
  onPerPageChange = () => {},
  onColumnAction = () => {},
  onRowClick = () => {},
  rowCursor = false,
  footerInfo = "",
  showCheckbox = false,
  showMenu = false,
  onSelectChange,
  showPagination = true,
  loading = false,
  onLikesClick = () => {},
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const isCandidateNumberFirst = columns?.[0]?.key === "candidateNumber";
  const isRowBlocked = (row) =>
    isCandidateNumberFirst &&
    String(row?.status || "").toLowerCase() === "block";

  const toggleRow = (id) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    setSelectedIds(newSelection);
    onSelectChange && onSelectChange(newSelection);
  };

  const toggleAll = () => {
    if (!data.length) return;
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
      onSelectChange && onSelectChange([]);
    } else {
      const allIds = data.map((row) => row.id);
      setSelectedIds(allIds);
      onSelectChange && onSelectChange(allIds);
    }
  };

  const openMenu = (event, row /* full row obj */, col) => {
    setMenuPosition({ top: event.clientY, left: event.clientX });
    setSelectedRow(row); // keep full row for status checks
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setMenuPosition(null);
    setSelectedRow(null);
  };

  const handleAction = (type) => {
    if (onColumnAction && selectedRow) {
      onColumnAction(selectedRow.id, type);
    }
    closeMenu();
  };

  const handlePerPageChange = (event) => {
    const value = parseInt(event.target.value, 10);
    onPerPageChange(value);
    onPageChange(1); // Reset to first page on perPage change
    setSelectedIds([]); // Reset selection when perPage changes
  };

  const handleDownload = (url) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = ""; // let browser pick the filename
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toLocalDateObject = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day)); // parsed as local date
  };

  return (
    <Box className="table-wrapper">
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow className="table-header-row">
              {showCheckbox && (
                <TableCell padding="checkbox pl-2">
                  <input
                    type="checkbox"
                    checked={
                      !!data.length && selectedIds.length === data.length
                    }
                    onChange={toggleAll}
                  />
                </TableCell>
              )}
              {columns.map((col, index) => (
                <TableCell
                  key={`${col.key}-${index}`}
                  className="table-header"
                  style={{ width: col.width }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableLoadingWrapper isLoading={loading}>
              {data.map((row) => (
                <TableRow
                  key={row.id}
                  // ${rowCursor ? "cursor-pointer hover:shadow-lg" : ""}
                  className={`table-row cursor-pointer`}
                  sx={
                    isRowBlocked(row)
                      ? { opacity: 0.6, backgroundColor: "#f5f5f5" }
                      : undefined
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(row.id);
                  }}
                >
                  {showCheckbox && (
                    <TableCell
                      padding="checkbox pl-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                      />
                    </TableCell>
                  )}

                  {columns.map((col) => {
                    const value = row[col.key];

                    // Chip (status like Read/New/Completed)
                    if (col.type === "chip") {
                      return (
                        <TableCell key={col.key}>
                          <Chip
                            label={value}
                            size="small"
                            className={`table-chip capitalize ${
                              typeof value === "string"
                                ? value.toLowerCase().replace(/ /g, "-")
                                : ""
                            }`}
                          />
                        </TableCell>
                      );
                    }

                    if (col.type === "progress") {
                      return (
                        <TableCell key={col.key}>
                          <Box className="progress-bar-wrapper">
                            <Box className="progress-bar-track" />
                            <Box
                              className="progress-bar-fill"
                              style={{ width: value?.progress + "%" }}
                            />
                            <Chip
                              label={value?.status}
                              size="small"
                              className={`table-chip ${String(
                                value?.status || ""
                              ).toLowerCase()}`}
                            />
                          </Box>
                        </TableCell>
                      );
                    }

                    // Button (e.g., Download / Block / etc.)
                    if (col.type === "button") {
                      // Hide a Block button on blocked rows
                      if (col.key === "block" && isRowBlocked(row)) {
                        return <TableCell key={col.key} />;
                      }
                      return (
                        <TableCell key={col.key} align="right">
                          <Button
                            variant="contained"
                            size="small"
                            className="table-download-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction(row, col.key);
                            }}
                          >
                            {col.label}
                          </Button>
                        </TableCell>
                      );
                    }

                    if (col.type === "checkbox") {
                      return (
                        <TableCell
                          key={col.key}
                          padding="checkbox"
                          align="center"
                          style={{ width: col.width }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={!!value}
                            onChange={() => onAction(row.id, col, value)}
                          />{" "}
                          Yes
                        </TableCell>
                      );
                    }

                    // Avatar with name and subtitle
                    if (col.type === "avatar") {
                      return (
                        <TableCell key={col.key}>
                          <Box className="table-avatar-block">
                            <Avatar
                              src={value?.image}
                              sx={{ width: 30, height: 30 }}
                            />
                            <Box ml={1}>
                              <Typography>{value?.name}</Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {value?.title}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      );
                    }

                    if (col.type === "action_menu") {
                      return (
                        <TableCell key={col.key} align="right">
                          <IconButton
                            onClick={(e) => openMenu(e, row, col, value)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      );
                    }

                    // if (col.type === "custom" && col.render) {
                    //   if (
                    //     col.key === "likes" ||
                    //     col.key === "dislikes" ||
                    //     col.key === "views"
                    //   ) {
                    //     return (
                    //       <TableCell
                    //         key={col.key}
                    //         onClick={(e) => {
                    //           e.stopPropagation();
                    //           onLikesClick(row);
                    //         }}
                    //       >
                    //         {col.render(row)}
                    //       </TableCell>
                    //     );
                    //   }
                    //   return (
                    //     <TableCell key={col.key}>{col.render(row)}</TableCell>
                    //   );
                    // }
                    if (col.type === "custom" && col.render) {
  // Special case: likes / dislikes / views (unchanged)
  if (col.key === "likes" || col.key === "dislikes" || col.key === "views") {
    return (
      <TableCell
        key={col.key}
        onClick={(e) => {
          e.stopPropagation();
          onLikesClick(row);
        }}
      >
        {col.render(row)}
      </TableCell>
    );
  }

  // ✅ Special case for interviewer columns
  if (
    col.key === "first_interviewer" ||
    col.key === "second_interviewer" ||
    col.key === "third_interviewer"
  ) {
    return (
      <TableCell
        key={col.key}
        style={{
          whiteSpace: "normal",
          wordBreak: "break-word",
          overflow: "visible",
          minWidth: "350px",  // ⬆️ increased from 250px to 350px
          maxWidth: "500px",  // ⬆️ ensures large names fit properly
          lineHeight: "1.6",
          verticalAlign: "top",
        }}
      >
        {col.render(row)}
      </TableCell>
    );
  }

  // Default render for all other custom columns
  return <TableCell key={col.key}>{col.render(row)}</TableCell>;
}


                    if (col.type === "description" && col.render) {
                      return (
                        <TableCell key={col.key} style={{ width: col.width }}>
                          <DescriptionTableCell description={col.render(row)} />
                        </TableCell>
                      );
                    }

                    if (col.type === "date") {
                      return (
                        // <TableCell key={col.key}>
                        //   {value &&
                        //   toLocalDateObject(value) instanceof Date &&
                        //   !isNaN(toLocalDateObject(value))
                        //     ? format(toLocalDateObject(value), "dd-MM-yyyy")
                        //     : "-"}
                        // </TableCell>

                        // ...

                        <TableCell key={col.key}>
                          {(() => {
                            const d =
                              typeof value === "string"
                                ? parseISO(value)
                                : value instanceof Date
                                ? value
                                : new Date(value);

                            return isValid(d) ? format(d, "yyyy-MM-dd") : "-";
                          })()}
                        </TableCell>
                      );
                    }

                    // if (col.type === "date") {
                    //   return (
                    //     <TableCell key={col.key}>
                    //       {value ? format(new Date(value), "dd-MM-yyyy") : "-"}
                    //     </TableCell>
                    //   );
                    // }

                    if (col.type === "attachment") {
                      return (
                        <TableCell key={col.key}>
                          {value ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(value);
                              }}
                            >
                              Download
                            </Button>
                          ) : (
                            <em>No file</em>
                          )}
                        </TableCell>
                      );
                    }

                    // Fallback: Text
                    return (
                      <TableCell
                        key={col.key}
                        className={col.align === "right" ? "rtl-text" : ""}
                      >
                        {value === 0 ? value.toString() : value ?? "-"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableLoadingWrapper>
          </TableBody>
        </Table>

        <Menu
          open={menuOpen}
          onClose={closeMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            menuPosition
              ? { top: menuPosition.top, left: menuPosition.left }
              : undefined
          }
          PaperProps={{
            style: {
              borderRadius: 12,
              minWidth: 140,
            },
          }}
        >
          <MenuItem onClick={() => handleAction("edit")}>
            <EditIcon fontSize="small" />
            <span style={{ marginLeft: 8 }}>Edit</span>
          </MenuItem>

          {/* Show "Block" only if the row is not already blocked */}
          {!isRowBlocked(selectedRow || {}) && (
            <MenuItem onClick={() => handleAction("block")}>
              <span style={{ marginLeft: 0 }}>Block</span>
            </MenuItem>
          )}

          <MenuItem onClick={() => handleAction("delete")}>
            <DeleteIcon fontSize="small" color="error" />
            <span style={{ marginLeft: 8, color: "#f44336" }}>Delete</span>
          </MenuItem>
        </Menu>
      </TableContainer>

      {/* Footer */}
      {showPagination && (
        <Box className="table-footer">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, val) => onPageChange(val)}
            size="small"
          />
          <Box className="table-footer-info">
            <Select value={perPage} onChange={handlePerPageChange} size="small">
              {[4, 6, 10, 15].map((n) => (
                <MenuItem key={n} value={n}>
                  {String(n).padStart(2, "0")}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="body2" ml={1}>
              {footerInfo}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DynamicTable;
