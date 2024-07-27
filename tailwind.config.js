/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      borderColor: {
        'secondary-color-light': 'var(--secondary-color-light)',
      },
      boxShadow: {
        custom1: '10px 10px 30px rgba(0, 0, 0, 0.5)',
      },
      colors: {
        'primary': 'var(--primary-color)',
        'primary-light': 'var(--primary-color-light)',
        'secondary-light': 'var(--secondary-color-light)',
// --secondary-color-light: #e885c0;
// --grey-color-light0: #dbdbdb;
// --grey-color-light1: #fcfcfc;
// --grey-color-light2: #c8c8c8;
// --grey-color-light3: #adacac;
// --grey-color-light4: #898989;
// --grey-color-dark0: #272727;
// --grey-color-dark1: #3d3d3d;
// --grey-color-dark2: #626262;
// --grey-color-border1: #707070;
      },
    },
  },
  plugins: [],
}

