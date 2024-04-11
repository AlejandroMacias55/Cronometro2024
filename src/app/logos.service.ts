import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class LogosService {
  
  json= null;

  constructor() {

    const prueba=fetch("assets/logos.json");
    prueba.then(async r=>{
      this.json=await r.json();
      console.log("json",this.json)
    })
  }

  getFuente(id: number, clase: number) {
    let img;
    if (clase == 1) img = this.json.partidos.find((i) => i.id == id);
    else img = this.json.coalisiones.find((i) => i.id == id);
    return img.imagen;
  }
}