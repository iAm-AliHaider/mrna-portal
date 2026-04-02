import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, MenuItem, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EMPLOYEE_RECORDS_MEMU } from '../../utils/constants';

const EmployeeTabsMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeSection = queryParams.get('section');

  const [anchorEls, setAnchorEls] = React.useState({});

  const handleClick = (event, label) => {
    setAnchorEls(prev => ({ ...prev, [label]: event.currentTarget }));
  };

  const handleClose = (label) => {
    setAnchorEls(prev => ({ ...prev, [label]: null }));
  };

  const handleMenuItemClick = (value) => {
    queryParams.set('section', value);
    navigate({ pathname: location.pathname, search: queryParams.toString() }, { replace: true });
  };

  return (
    <div className="flex gap-3 mb-6">
      {EMPLOYEE_RECORDS_MEMU.map(({ label, children }) => (
        <div key={label}>
          <Button
            variant="contained"
            
            onClick={(e) => handleClick(e, label)}
            sx={{
              color: 'white',
              textTransform: 'none',
              fontWeight: 500,
              paddingX: 2,
              borderRadius: '8px',
            }}
            endIcon={<ExpandMoreIcon />}
          >
            {label}
          </Button>

          <Menu
            anchorEl={anchorEls[label]}
            open={Boolean(anchorEls[label])}
            onClose={() => handleClose(label)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            {children.map(({ label: itemLabel, value }) => (
              <MenuItem
                key={value}
                selected={activeSection === value}
                onClick={() => {
                  handleMenuItemClick(value);
                  handleClose(label);
                }}
              >
                {itemLabel}
              </MenuItem>
            ))}
          </Menu>
        </div>
      ))}
    </div>
  );
};

export default EmployeeTabsMenu;
