import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#424B9A', 
    },
    secondary: {
      main: '#FBFAFE',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      '"Fira Sans"',
      '"Droid Sans"',
      '"Helvetica Neue"',
      'sans-serif',
    ].join(','),
    fontFamilyMonospace: [
      '"source-code-pro"',
      'Menlo',
      'Monaco',
      'Consolas',
      '"Courier New"',
      'monospace',
    ].join(','),
  },
  shape: {
    borderRadius: 12, // <-- global border radius for many components (default is 4)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // <-- specifically set button border radius here
          textTransform: 'none', // optional: remove uppercase styling if you want
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: '#424B9A', // primary color
            color: '#FFFFFF', // white text
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      defaultProps: {
        exclusive: true,
        sx: {
          overflowX: 'auto',
        },
      },
      styleOverrides: {
        root: {
          "& .MuiToggleButton-root": {
            borderColor: '#E2E8F0',
            color: '#111645',
            '&:hover': {
              backgroundColor: '#F3F4F6',
            },
            "&.Mui-selected": {
              backgroundColor: '#424B9A',
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#424B9A',
              },
            },
          },
        },
      },
    },
  },
});

export default theme;
