/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        PublicSans: ['Public Sans'],
        EBGaramond: ['EB Garamond'],
        freight: ['FreightTextPro', 'serif'], // Replace 'FreightTextPro' with the font name and appropriate font family if you have it hosted from a non-Google font API.
      },
    },
  },
  plugins: [],
}