/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
  trailingComma: "all", //Coloca , en una linea
  tabWidth: 2, //"2 espacios en la tabulación"
  semi: true, //coloca un ;
  singleQuote: false, // utiliza "" dobles comillas
  printWidth: 80, //cuanto caracteres se extiende la linea hasta que se "rompa"
};

module.exports = config;