import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import "./style.css";

const CustomTable = ({
  headers = [],
  data = [],
  onAction,
  showCheckbox = false,
  onSelectChange,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const openMenu = (event, row) => {
    setMenuPosition({ top: event.clientY, left: event.clientX });
    setSelectedRow(row);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setMenuPosition(null);
    setSelectedRow(null);
  };

  const handleAction = (type) => {
    if (onAction && selectedRow) {
      onAction(selectedRow.id, type);
    }
    closeMenu();
  };

  const toggleRow = (id) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    setSelectedIds(newSelection);
    onSelectChange && onSelectChange(newSelection);
  };

  const toggleAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
      onSelectChange && onSelectChange([]);
    } else {
      const allIds = data.map((row) => row.id);
      setSelectedIds(allIds);
      onSelectChange && onSelectChange(allIds);
    }
  };

  return (
    <TableContainer component={Paper} className="custom-table-container">
      <Table sx={{ minWidth: 650 }} aria-label="dynamic table">
        <TableHead>
          <TableRow className="table-header-row">
            {showCheckbox && (
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.length === data.length}
                  onChange={toggleAll}
                />
              </TableCell>
            )}
            {headers.map((header, index) => (
              <TableCell key={index} className="table-header-cell">
                {header}
              </TableCell>
            ))}
            <TableCell align="right" className="table-header-cell">
              {/* For Action column (3-dots) */}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="table-body-row">
              {showCheckbox && (
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleRow(row.id)}
                  />
                </TableCell>
              )}
              {headers.map((header, colIndex) => (
                <TableCell key={colIndex} className="table-body-cell">
                  {row[header]}
                </TableCell>
              ))}
              <TableCell align="right">
                <IconButton onClick={(e) => openMenu(e, row)}>
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
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
        <MenuItem onClick={() => handleAction("delete")}>
          <DeleteIcon fontSize="small" color="error" />
          <span style={{ marginLeft: 8, color: "#f44336" }}>Delete</span>
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};

export default CustomTable;
