"use client";
import { useMemo } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";

const  MuiThemeProvider = ({ children }) => {
  const resolvedTailwindConfig = useMemo(
    () => resolveConfig(tailwindConfig),
    []
  );

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        primary: {
          main: resolvedTailwindConfig.theme.colors.primary,
        },
        secondary: {
          main: resolvedTailwindConfig.theme.colors.secondary,
        },
        success: {
          main: resolvedTailwindConfig.theme.colors.success,
        },
        warning: {
          main: resolvedTailwindConfig.theme.colors.warning,
        },
        error: {
          main: resolvedTailwindConfig.theme.colors.danger,
        },
        background: {
          default: resolvedTailwindConfig.theme.colors.neutral,
          paper: resolvedTailwindConfig.theme.colors.lightGrey,
        },
      },
      typography: {
        fontFamily: "Helvetica, sans-serif",
      },
      shape: {
        // borderRadius: 10, commented for now to get the default shapes of MUI components in the app
      },
      shadows: [
        "none",
        "0px 4px 40px rgba(0, 0, 0, 0.1)",
        "0px 10px 40px rgba(0, 0, 0, 0.1)",
        "0px 12px 40px rgba(0, 0, 0, 0.12)",
        "0px 14px 40px rgba(0, 0, 0, 0.14)",
        "0px 16px 40px rgba(0, 0, 0, 0.16)",
        "0px 18px 40px rgba(0, 0, 0, 0.18)",
        "0px 20px 40px rgba(0, 0, 0, 0.2)",
        "0px 22px 40px rgba(0, 0, 0, 0.22)"
      ],
      components: {
        MuiStack: {
          defaultProps: {
            direction: "row",
            gap: 1,
          },
        },
        MuiMenu: {
          defaultProps: {
            transitionDuration: 300,
          },
        },
        MuiTextField: {
          defaultProps: {
            variant: "outlined",
          },
          styleOverrides: {
            root: {
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: resolvedTailwindConfig.theme.colors.fieldOutline,
                },
                "&:hover fieldset": {
                  borderColor: resolvedTailwindConfig.theme.colors.primary,
                },
                "&.Mui-focused fieldset": {
                  borderColor: resolvedTailwindConfig.theme.colors.primary,
                },
                "&.Mui-error fieldset": {
                  borderColor: resolvedTailwindConfig.theme.colors.danger,
                },
              },
            },
          },
        },
        MuiAutocomplete: {
          defaultProps: {
            classes: {
              input: "font-Helvetica text-black",
              root: "bg-white",
              clearIndicator: "text-gray-600",
              popupIndicator: "text-gray-600",
            },
          },
          styleOverrides: {
            root: {
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: resolvedTailwindConfig.theme.colors.stroke,
                },
                "&:hover fieldset": {
                  borderColor: resolvedTailwindConfig.theme.colors.primary,
                },
                "&.Mui-focused fieldset": {
                  borderColor: resolvedTailwindConfig.theme.colors.primary,
                },
                "&.Mui-error fieldset": {
                  borderColor: resolvedTailwindConfig.theme.colors.danger,
                },
              },
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            root: {
              zIndex: 9999,
              boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.1)",
              borderRadius: "20px",
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            root: {
              borderBottom: `1px solid ${resolvedTailwindConfig.theme.colors.lines}`,
            },
            indicator: {
              height: "3px",
              backgroundColor: resolvedTailwindConfig.theme.colors.primary,
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              "&.Mui-selected": {
                backgroundColor: resolvedTailwindConfig.theme.colors.accent2,
              },
            },
          },
        },
        MuiLinearProgress: {
          defaultProps: {
            variant: "determinate",
            color: "warning",
          },
        },
      },
    });
  }, [resolvedTailwindConfig.theme.colors]);

  return (
    <ThemeProvider theme={theme} key="mui-theme">
      <CssBaseline enableColorScheme key="mui-css-baseline" />
      {children}
    </ThemeProvider>
  );
}

export default MuiThemeProvider;
