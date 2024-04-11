import { Candidato } from "./candidato";
import { ConfInicial } from "./conf-inicial";
import { Estado } from "./estado";

export class AlmacenamientoLocal{
    //Configuración Inicial
    getConfInicial() : ConfInicial{
        let confInicial:ConfInicial = JSON.parse(localStorage.getItem("confInicial"));
        return confInicial;
    }
    setConfInicial(confInicial:ConfInicial){
        localStorage.setItem("confInicial",JSON.stringify(confInicial));
    }
    //Arreglo de Candidatos
    getArrayCandidatos() : Candidato[]{
        let candidatosArray:Candidato[] = JSON.parse(localStorage.getItem("candidatosArray"));
        return candidatosArray;
    }
    setArrayCandidatos(candidatosArray:Candidato[]){
        localStorage.setItem("candidatosArray",JSON.stringify(candidatosArray));
    }
     //Bandera Preparados
     getBanderaPreparadados() {
        let banderaPreparados = localStorage.getItem("banderaPreparados");
        return banderaPreparados;
    }
    setBanderaPreparadados(banderaPreparados:boolean){
        localStorage.setItem("banderaPreparados",String(banderaPreparados));
    }
    //Bandera Cierre
    getBanderaCierre() {
        let banderaCierre = localStorage.getItem("banderaCierre");
        return banderaCierre;
    }
    setBanderaCierre(banderaCierre:boolean){
        localStorage.setItem("banderaCierre",String(banderaCierre));
    }
      //Número de Bloque
      getNumeroBloque() {
        let bloque = localStorage.getItem("numeroBloque");
        return bloque;
    }
    setNumeroBloque(numeroBloque:number){
        localStorage.setItem("numeroBloque",String(numeroBloque));
    }
     //Tipo Tiempo
     getTipoTiempo() : string{
        let tipoTiempo = localStorage.getItem("tipoTiempo");
        return tipoTiempo;
    }
    setTipoTiempo(tipoTiempo:string){
        localStorage.setItem("tipoTiempo",tipoTiempo);
    }
    //Arreglo de Estados
    getArrayEstado() : Estado[]{
        let estadoArray:Estado[] = JSON.parse(localStorage.getItem("estadoArray"));
        return estadoArray;
    }
    setArrayEstado(estadoArray:Estado[]){
        localStorage.setItem("estadoArray",JSON.stringify(estadoArray));
    }
}