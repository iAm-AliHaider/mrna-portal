import React, { useMemo } from "react";
import {
  Avatar,
  Button,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore, Logout } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { NavLink, useNavigate } from "react-router-dom";
import "./style.css";
import { generateMenuForRole } from "../utils/helper";
import { useUser } from "../context/UserContext";

// Menu config array with paths
//

const Sidebar = () => {
  const [openMenus, setOpenMenus] = React.useState({});
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [searchTerm, setSearchTerm] = React.useState("");

  const menuData = useMemo(() => {
    return user?.role_columns?.roles?.length
      ? generateMenuForRole(user?.role_columns?.roles)
      : [];
  }, [user?.role_columns?.roles?.length]);

  const toggleMenu = (label, path) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));

    // If the menu item has a path, navigate to it
    if (path) {
      navigate(path);
    }
  };

  ////////// for search menu item
  const filterMenu = (items, term, openParents = new Set()) => {
    return items
      .map((item) => {
        if (item.children) {
          const filteredChildren = filterMenu(item.children, term, openParents);
          if (
            item.label.toLowerCase().includes(term.toLowerCase()) ||
            filteredChildren.length > 0
          ) {
            // ✅ keep parent open if child matched
            openParents.add(item.label);
            return { ...item, children: filteredChildren };
          }
        } else if (item.label.toLowerCase().includes(term.toLowerCase())) {
          return item;
        }
        return null;
      })
      .filter(Boolean);
  };

  const filteredMenu = useMemo(() => {
    if (!searchTerm.trim()) {
      // Reset: close all menus when search is cleared
      setOpenMenus({});
      return menuData;
    }

    const openParents = new Set();
    const result = filterMenu(menuData, searchTerm.trim(), openParents);

    // Auto-open parents of matched submenus
    setOpenMenus((prev) => {
      const newState = { ...prev };
      openParents.forEach((label) => {
        newState[label] = true;
      });
      return newState;
    });

    return result;
  }, [searchTerm, menuData]);
  ////////////////////////

  const renderMenuItems = (items, level = 0) => {
    return items.map((item) => (
      <div key={item.label}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => toggleMenu(item.label, item.path)}
            sx={{ pl: 2 + level * 4 }} // Indentation increases with level
            component={item.path && !item.children ? NavLink : "button"}
            to={item.path && !item.children ? item.path : undefined}
            end={item.path && !item.children ? true : undefined}
            style={item.path && !item.children ? ({ isActive }) => isActive ? { backgroundColor: '#424B9A', color: '#fff', borderRadius: 8, margin: '2px 8px' } : {} : undefined}
          >
            {level === 0 && item.icon && (
              <ListItemIcon>{item.icon}</ListItemIcon>
            )}
            <ListItemText primary={item.label} />
            {item.children ? (
              openMenus[item.label] ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              )
            ) : null}
          </ListItemButton>
        </ListItem>

        {item.children && (
          <Collapse in={openMenus[item.label]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {renderMenuItems(item.children, level + 1)}
            </List>
          </Collapse>
        )}
      </div>
    ));
  };

  return (
    <div className="sidebar">
      {/* User Info */}
      <div className="user-section">
        <Avatar
          src={user?.profile_image || "/profile.jpg"}
          sx={{ width: 64, height: 64, border: "2px solid #f16ca4" }}
        />
        <Typography variant="subtitle1" fontWeight={600} mt={1}>
          {user?.first_name + " " + user?.family_name || "Jane Doe"}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user?.email || "jane@test.com"}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Logout />}
          className="logout-button mt-6"
          onClick={logout}
        >
          Logout
        </Button>
      </div>

      <div className="w-full max-w-md relative px-2 pb-2">
        <div className="flex items-center border border-gray-300 rounded-xl bg-white px-3 py-2 relative">
          <SearchIcon className="text-gray-400 mr-2" fontSize="small" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search menu..."
            className="w-full text-sm outline-none h-[30px] bg-transparent placeholder:text-gray-400"
          />

          {searchTerm && (
            <CloseIcon
              onClick={() => setSearchTerm("")}
              className="text-gray-400 cursor-pointer ml-2"
              fontSize="small"
            />
          )}
        </div>
      </div>

      <Divider />

      {/* Menu Items */}
      {/* <List
        component="nav"
        className="h-[calc(100vh-270px)] overflow-y-auto scrollbar-hide"
      >
        {renderMenuItems(menuData)}
      </List> */}
      <List
        component="nav"
        className="h-[calc(100vh-270px)] overflow-y-auto scrollbar-hide"
      >
        {renderMenuItems(filteredMenu)}
      </List>
    </div>
  );
};

export default Sidebar;
