interface Objeto {
    imagen: string;
    clase: number;
    id: number;
    nombre: string;
    acronimo: string;
    color: string;
  }
  
  const objeto: Objeto = require('src/assets/logos.json').partidos;

  export default objeto;