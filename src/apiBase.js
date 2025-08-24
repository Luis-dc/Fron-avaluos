// Soporta Vite (import.meta.env) y CRA (process.env.REACT_APP_*).
const API =
  (typeof import !== 'undefined' &&
    import.meta &&
    import.meta.env &&
    import.meta.env.VITE_API) ||
  process.env.REACT_APP_API ||
  'http://localhost:4000';

export default API;
