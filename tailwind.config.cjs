/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./wp-templates/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'dark_blue': '#1A4B7C',
        'dark_green': '#15341C',
        'dark_red': '#521414',
        'light_gray': '#D9D7CF',
        'taupe': '#C5C1B9',
      },
      colors: {
        'dark_green': '#15341C',
        'taupe': '#C5C1B9',
      },
      aspectRatio: {
        '5/7': '5 / 7',
        '3/2': '3 / 2',
      },
      fontSize: {
        'text-sm_extra': '15px',
      },
      height: {
        'home_banner': 'calc(100vh - 44px)',
        'work_project': 'calc(100vh - 108px)'
      },
      maxHeight: {
        'work_project': 'calc(100vh - 100px)'
      },
      maxWidth: {
        'main': '1440px',
        'wide': '1800px'
      },
      margin: {
        'our_latest_work': 'calc((100vw - 1440px) / 2)'
      }
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1440px',
    }
  },
  plugins: [],
}
