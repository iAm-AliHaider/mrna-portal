const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: [
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
        'sans-serif'
      ],
      mono: [
        '"source-code-pro"',
        'Menlo',
        'Monaco',
        'Consolas',
        '"Courier New"',
        'monospace'
      ]
    },
    screens: {
      '2xsm': '375px',
      xsm: '425px',
      '3xl': '2000px',
      ...defaultTheme.screens
    },
    extend: {
      colors: {
        primary: '#424B9A',
        secondary: '#FBFAFE',
        dark: '#111645',
        neutral: '#FFFFFF',
        accent1: '#ebedfd',
        accent2: '#d8dafa',
        accent3: '#c4c8f8',
        grey: '#fdfdff',
        lightGrey: '#f7f8fe',
        fieldOutline: '#f5f6fe',
        lines: '#eff1fd',
        success: '#219653',
        warning: '#FFA70B',
        danger: '#D34053'
      },
      boxShadow: {
        card: '0px 4px 40px rgba(0, 0, 0, 0.1)',
        popup: '0px 10px 40px rgba(0, 0, 0, 0.1)'
      },
      borderRadius: {
        ...defaultTheme.borderRadius
      },
      fontSize: {
        'title-xxl': ['44px', '55px'],
        'title-xl': ['36px', '45px'],
        'title-lg': ['28px', '35px'],
        'title-md': ['24px', '30px'],
        'title-sm': ['20px', '26px'],
        'title-xsm': ['18px', '24px']
      }
    }
  },
  plugins: []
}
