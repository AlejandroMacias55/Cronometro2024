import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, DialogPosition } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Candidato } from './classes/candidato';
import { ConfInicial } from './classes/conf-inicial';
import { Estado } from './classes/estado';
import { AlmacenamientoLocal } from './classes/local-storage';
import { Seleccionado } from './classes/seleccionado';
import { Tiempo } from './classes/tiempo';
import { LogosService } from './logos.service';
//
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    public logos: LogosService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {}

  @ViewChild('logosDialog', { static: false }) logosDialog: any;
  @ViewChild('masTiempoDialog', { static: false }) masTiempoDialog: any;
  @ViewChild('contrasenaDialog', { static: false }) contrasenaDialog: any;
  @ViewChild('confirmDialog', { static: false }) confirmDialog: any;
  @ViewChild('cierreDebateDialog', { static: false }) cierreDebateDialog: any;

  candidatosArray = new Array<Candidato>();
  indexCandidatoArray: number;
  candidatoSeleccionado = new Seleccionado();
  logosArray = [];
  confInicial = new ConfInicial();
  tipoTiempo = 'Configuración Inicial';
  msgAlert = '';
  // bandera para las alertas
  bandera_guardar = false;
  // Cuando haya guardado los datos originales se estará listo para comenzar
  banderaPreparados = false;
  //Index candidato seleccionado
  indexSeleccionado: number;
  // Variable para cerrar la modal
  dialogRef;
  dialogRefTiempo;
  dialogContrasena;
  dialogConfirmar;
  dialogCerrar;
  // Arrego con ID de los logos para verificar que no esté seleccionado aún
  arrayLogos = [];
  // Variables para el tiempo
  tempo: any;
  claveTiempo: string;
  //para saber si es resumen o segmentos
  banderaResumen = true;
  // Bandera para saber si alguien está hablando
  banderaTransmitir = false;
  //Bandera para el ajuste de los tiempos de un candidato
  banderaAjusteTiempo = false;
  //Ajuste Array
  ajusteArray = [];
  //Contraseña de ajuste
  passAjuste = '';
  //Número Bloque:
  numeroBloque = 1;
  //
  almacenamientoLocal = new AlmacenamientoLocal();
  // Guardar estado al cambiar el bloque
  estado = new Array<Estado>();
  //Meses del año:
  months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  //Variables para confiramción
  textoConfirmar = '';
  banderaConfirmar = false;
  //Bandera de cierre de debate
  banderaCierre = false;
  //Bandera para editar candidatos
  banderaEditarCandidatos = false;

  ngOnInit(): void {
    if (this.almacenamientoLocal.getConfInicial() != undefined) {
      this.confInicial = this.almacenamientoLocal.getConfInicial();
    }
    if (this.almacenamientoLocal.getArrayCandidatos() != undefined) {
      this.candidatosArray = this.almacenamientoLocal.getArrayCandidatos();
    }
    if (this.almacenamientoLocal.getBanderaPreparadados() != undefined) {
      this.banderaPreparados = Boolean(
        this.almacenamientoLocal.getBanderaPreparadados()
      );
    }
    if (this.almacenamientoLocal.getBanderaCierre() != undefined) {
      this.banderaCierre = Boolean(this.almacenamientoLocal.getBanderaCierre());
    }
    if (this.almacenamientoLocal.getNumeroBloque() != undefined) {
      this.numeroBloque = Number(this.almacenamientoLocal.getNumeroBloque());
    }
    if (this.almacenamientoLocal.getTipoTiempo() != undefined) {
      this.tipoTiempo = this.almacenamientoLocal.getTipoTiempo();
    }
    if (this.almacenamientoLocal.getArrayEstado() != undefined) {
      this.estado = this.almacenamientoLocal.getArrayEstado();
    }
    this.iniciarSeleccionado();
  }

  iniciarSeleccionado() {
    let auxTiempo: Tiempo;
    auxTiempo = { min: 0, seg: 0, terminado: false };
    this.candidatoSeleccionado = {
      tiempo: auxTiempo,
      id_logo: 0,
      id_clase: 0,
      nombre: '',
      tipo_tiempo: this.tipoTiempo,
    };
  }

  formatTwoDigits(val: number) {
    return val.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
  }

  guardarConfInicial(form: NgForm) {
    this.bandera_guardar = false;
    this.bandera_guardar = !this.validar(form);
    if (!this.bandera_guardar) {
      this.tipoTiempo = 'Añadir Candidatos';
      this.llenarCandidatos(false);
    }
  }

  llenarCandidatos(bloqueNuevo: boolean) {
    let array = [];
    this.almacenamientoLocal.setConfInicial(this.confInicial);
    for (let i = 0; i < this.confInicial.candidatos; i++) {
      let candidato: Candidato = {
        nombre: this.banderaPreparados ? this.candidatosArray[i].nombre : '',
        id_logo: this.banderaPreparados ? this.candidatosArray[i].id_logo : 0,
        id_clase: this.banderaPreparados ? this.candidatosArray[i].id_clase : 0,
        tiempo_exposicion: {
          min: this.confInicial.tiempo_exposicion_min,
          seg: this.confInicial.tiempo_exposicion_seg,
          terminado: false,
        },
        tiempo_segmento1: {
          min: this.confInicial.tiempo_segmento_min,
          seg: this.confInicial.tiempo_segmento_seg,
          terminado: false,
        },
        tiempo_segmento2: {
          min: this.confInicial.tiempo_segmento_min,
          seg: this.confInicial.tiempo_segmento_seg,
          terminado: false,
        },
      };
      array.push(candidato);
    }
    if (bloqueNuevo) {
      this.openDialogConfirm(
        '¿Está seguro que desea pasar al siguiente bloque?',
        array
      );
    } else this.candidatosArray = array;
  }

  nuevoBloque(array) {
    var d = new Date();
    this.estado.push({
      bloque: this.numeroBloque,
      fecha: `${this.formatTwoDigits(d.getDate())} de ${
        this.months[d.getMonth()]
      } del ${d.getFullYear()}`,
      hora: `${this.formatTwoDigits(d.getHours())}:${this.formatTwoDigits(
        d.getMinutes()
      )}`,
      estado: this.candidatosArray,
    });
    this.numeroBloque++;
    this.almacenamientoLocal.setNumeroBloque(this.numeroBloque);
    this.almacenamientoLocal.setArrayEstado(this.estado);
    //
    this.candidatosArray = array;
    this.almacenamientoLocal.setArrayCandidatos(this.candidatosArray);
    this.iniciarSeleccionado();
    this.tipoTiempo = 'Listo Para Comenzar';
    this.banderaPreparados = true;
    this.banderaResumen = true;
    this.detenerTiempo();
  }

  openDialog(partido: boolean, index_candidato: number) {
    let pos: DialogPosition;
    pos = {
      top: '34vh',
    };
    this.indexSeleccionado = index_candidato;
    this.logosArray = partido ? this.logos.json.partidos : this.logos.json.coalisiones;
    this.dialogRef = this.dialog.open(this.logosDialog, {
      width: '30%',
      height: '66vh',
      disableClose: true,
      position: pos,
    });
    this.dialogRef.afterClosed().subscribe((result) => {
      //
    });
  }

  openDialogTiempo() {
    let pos: DialogPosition;
    pos = {
      top: '34vh',
    };
    this.dialogRefTiempo = this.dialog.open(this.masTiempoDialog, {
      width: '100%',
      height: '66vh',
      disableClose: true,
      position: pos,
    });
    this.dialogRefTiempo.afterClosed().subscribe((result) => {
      //
    });
  }

  openDialogContrasena() {
    let pos: DialogPosition;
    pos = {
      top: '34vh',
    };
    this.dialogContrasena = this.dialog.open(this.contrasenaDialog, {
      width: '30%',
      disableClose: true,
      position: pos,
    });
    this.dialogContrasena.afterClosed().subscribe((result) => {
      this.passAjuste = '';
    });
  }

  openDialogCierre() {
    let pos: DialogPosition;
    pos = {
      top: '34vh',
    };
    this.dialogCerrar = this.dialog.open(this.cierreDebateDialog, {
      width: '30%',
      disableClose: true,
      position: pos,
    });
  }

  openDialogConfirm(mensaje: string, array?: any) {
    this.banderaConfirmar = false;
    this.textoConfirmar = mensaje;
    let pos: DialogPosition;
    pos = {
      top: '34vh',
    };
    this.dialogConfirmar = this.dialog.open(this.confirmDialog, {
      width: '30%',
      disableClose: true,
      position: pos,
    });
    this.dialogConfirmar.afterClosed().subscribe((confirmado: boolean) => {
      if (this.banderaConfirmar) {
        switch (this.textoConfirmar) {
          case 'Está seguro de reiniciar la configuración':
            this.reiniciar();
            break;
          case '¿Está seguro de guradar los cambios ralizados?':
            this.ajustarTiempos();
            break;
          case 'Está seguro de finalizar el cronómetro. Todos los valores se reiniciarán':
            this.finalizarCronometro();
            break;
          case '¿Está seguro que desea pasar al siguiente bloque?':
            this.nuevoBloque(array);
            break;
        }
      }
    });
  }

  selectLogo(id: number, clase: number) {
    if (this.verificarLogos(id)) {
      this.arrayLogos.push(id);
      this.candidatosArray[this.indexSeleccionado].id_logo = id;
      this.candidatosArray[this.indexSeleccionado].id_clase = clase;
      this.dialogRef.close();
    } else
      this.openDialogConfirm(
        'Este logo ya está siendo usado por otro candidato'
      );
  }

  verificarLogos(id: number) {
    let bandera = true;
    if (this.arrayLogos.length != 0) {
      for (const iterator of this.arrayLogos) {
        if (iterator == id) bandera = false;
      }
    }
    return bandera;
  }

  quitarLogo(index: number, id: number, bandera) {
    if (id != 0) {
      this.candidatosArray[index].id_logo = 0;
      this.candidatosArray[index].id_clase = 0;
      let indexLogos = 0;
      let bandera_logos = false;
      for (const iterator of this.arrayLogos) {
        if (iterator == id) {
          bandera_logos = true;
          break;
        }
        indexLogos++;
      }
      if (bandera_logos) this.arrayLogos.splice(indexLogos, 1);
    }
  }

  reiniciar() {
    // if (confirm('Está seguro de reiniciar la configuración')) {
    this.tipoTiempo = 'Configuración Inicial';
    this.candidatosArray = new Array<Candidato>();
    this.arrayLogos = [];
    this.confInicial = new ConfInicial();
    this.estado = new Array<Estado>();
    this.banderaPreparados = false;
    this.banderaResumen = true;
    this.banderaCierre = false;
    this.numeroBloque = 1;
    this.iniciarSeleccionado();
    localStorage.clear();
    // } else {
    //   console.log('canceló');
    // }
  }

  guardarCandidatos(valid: boolean, editar?: boolean) {
    if (valid) {
      if (this.candidatosArray.length == this.arrayLogos.length) {
        this.tipoTiempo = 'Listo Para Comenzar';
        this.banderaPreparados = true;
        this.almacenamientoLocal.setArrayCandidatos(this.candidatosArray);
        this.almacenamientoLocal.setBanderaPreparadados(true);
        this.almacenamientoLocal.setTipoTiempo(this.tipoTiempo);
        this.banderaEditarCandidatos = false;
      } else {
        if (editar === true) {
          this.almacenamientoLocal.setArrayCandidatos(this.candidatosArray);
          this.banderaEditarCandidatos = false;
        } else
          this.openDialogConfirm(
            'Verifique que todos los candidatos tengan un logo'
          );
      }
    } else {
      this.openDialogConfirm(
        'Debe de añadir el nombre del candidato a todos los campos'
      );
    }
  }

  iniciarTiempo(index, tipo_tiempo) {
    this.banderaTransmitir = true;
    this.tipoTiempo = tipo_tiempo;
    this.claveTiempo =
      this.tipoTiempo == 'EXPONIENDO'
        ? 'tiempo_exposicion'
        : // : this.tipoTiempo == 'SEGUIMIENTO MODERACIÓN'
        // ? 'tiempo_seg_bolsa'
        this.tipoTiempo == 'PRIMER SEGMENTO'
        ? 'tiempo_segmento1'
        : 'tiempo_segmento2';
    this.detenerTiempo();
    this.indexCandidatoArray = index;
    this.candidatoSeleccionado.id_clase = this.candidatosArray[index].id_clase;
    this.candidatoSeleccionado.id_logo = this.candidatosArray[index].id_logo;
    this.candidatoSeleccionado.nombre = this.candidatosArray[index].nombre;
    if (this.banderaResumen) {
      this.candidatoSeleccionado.tiempo.min = this.candidatosArray[index][
        this.claveTiempo
      ].min;
      this.candidatoSeleccionado.tiempo.seg = this.candidatosArray[index][
        this.claveTiempo
      ].seg;
      this.candidatoSeleccionado.tiempo.terminado = this.candidatosArray[index][
        this.claveTiempo
      ].terminado;
    } else {
      this.calcularTiempoBolsa(index);
    }
    this.inicarTemporizador();
  }
  //
  calcularTiempoBolsa(index: number) {
    if (
      this.confInicial.tiempo_bolsa_min ==
      this.candidatosArray[index][this.claveTiempo].min
    ) {
      if (
        this.candidatosArray[index][this.claveTiempo].seg >
        this.confInicial.tiempo_bolsa_seg
      ) {
        this.candidatoSeleccionado.tiempo.min = this.confInicial.tiempo_bolsa_min;
        this.candidatoSeleccionado.tiempo.seg = this.confInicial.tiempo_bolsa_seg;
      } else {
        this.candidatoSeleccionado.tiempo.min = this.candidatosArray[index][
          this.claveTiempo
        ].min;
        this.candidatoSeleccionado.tiempo.seg = this.candidatosArray[index][
          this.claveTiempo
        ].seg;
        this.candidatoSeleccionado.tiempo.terminado = this.candidatosArray[
          index
        ][this.claveTiempo].terminado;
      }
    } else if (
      this.candidatosArray[index][this.claveTiempo].min >
      this.confInicial.tiempo_bolsa_min
    ) {
      this.candidatoSeleccionado.tiempo.min = this.confInicial.tiempo_bolsa_min;
      this.candidatoSeleccionado.tiempo.seg = this.confInicial.tiempo_bolsa_seg;
    } else {
      this.candidatoSeleccionado.tiempo.min = this.candidatosArray[index][
        this.claveTiempo
      ].min;
      this.candidatoSeleccionado.tiempo.seg = this.candidatosArray[index][
        this.claveTiempo
      ].seg;
      this.candidatoSeleccionado.tiempo.terminado = this.candidatosArray[index][
        this.claveTiempo
      ].terminado;
    }
  }
  //Debate
  cierreDebate() {
    let min_cierre: any = document.getElementById('inp_min_cierre');
    let seg_cierre: any = document.getElementById('inp_seg_cierre');
    let bandera = this.validarTiempoCierre(min_cierre, seg_cierre);
    this.bandera_guardar = !bandera;
    if (bandera) {
      let array = [];

      for (let i = 0; i < this.candidatosArray.length; i++) {
        let candidato: Candidato = {
          nombre: this.banderaPreparados ? this.candidatosArray[i].nombre : '',
          id_logo: this.banderaPreparados ? this.candidatosArray[i].id_logo : 0,
          id_clase: this.banderaPreparados
            ? this.candidatosArray[i].id_clase
            : 0,
          tiempo_exposicion: {
            min: Number(this.formatTwoDigits(min_cierre.value)),
            seg: Number(this.formatTwoDigits(seg_cierre.value)),
            terminado: false,
          },
          tiempo_segmento1: {
            min: 0,
            seg: 0,
            terminado: false,
          },
          tiempo_segmento2: {
            min: 0,
            seg: 0,
            terminado: false,
          },
        };
        array.push(candidato);
      }
      var d = new Date();
      this.estado.push({
        bloque: this.numeroBloque,
        fecha: `${this.formatTwoDigits(d.getDate())} de ${
          this.months[d.getMonth()]
        } del ${d.getFullYear()}`,
        hora: `${this.formatTwoDigits(d.getHours())}:${this.formatTwoDigits(
          d.getMinutes()
        )}`,
        estado: this.candidatosArray,
      });
      this.numeroBloque++;
      this.almacenamientoLocal.setNumeroBloque(this.numeroBloque);
      this.almacenamientoLocal.setArrayEstado(this.estado);
      this.almacenamientoLocal.setBanderaCierre(true);
      //
      this.candidatosArray = array;
      this.almacenamientoLocal.setArrayCandidatos(this.candidatosArray);
      this.dialogCerrar.close();
      this.banderaResumen = true;
      this.banderaCierre = true;
    }
  }
  ///Tiempo
  inicarTemporizador() {
    if (!this.banderaResumen)
      this.candidatoSeleccionado.tiempo.terminado = false;
    this.detenerTiempo();
    document
      .getElementById(this.claveTiempo + this.indexCandidatoArray)
      .classList.add('blink_me');
    let boton: any = document.getElementById(
      this.claveTiempo + '_button' + this.indexCandidatoArray
    );
    // .classList.add('btn-danger');
    boton.classList.add('btn-danger');
    boton.classList.add('blink_me');
    boton.innerHTML = 'Ocupado';
    // this.guardarRegistros();
    this.tempo = setInterval(() => this.temporizar(), 1000);
  }

  detenerTiempo() {
    let conf = this.almacenamientoLocal.getConfInicial();
    this.confInicial.tiempo_bolsa_min = conf.tiempo_bolsa_min;
    this.confInicial.tiempo_bolsa_seg = conf.tiempo_bolsa_seg;
    clearInterval(this.tempo);
    if (this.indexCandidatoArray != undefined) {
      let botones = [
        'tiempo_exposicion',
        // 'tiempo_seg_bolsa',
        'tiempo_segmento1',
        'tiempo_segmento2',
      ];
      botones.forEach((element) => {
        try {
          document
            .getElementById(element + this.indexCandidatoArray)
            .classList.remove('blink_me');
          let boton: any = document.getElementById(
            element + '_button' + this.indexCandidatoArray
          );
          // .classList.add('btn-danger');
          boton.classList.remove('btn-danger');
          boton.classList.remove('blink_me');
          boton.innerHTML = 'Iniciar';
        } catch (error) {}
      });
    }
  }

  temporizar() {
    if (this.banderaResumen) {
      this.candidatosArray[this.indexCandidatoArray][this.claveTiempo].seg--;
      if (--this.candidatoSeleccionado.tiempo.seg < 0) {
        this.candidatoSeleccionado.tiempo.seg = 59;
        this.candidatosArray[this.indexCandidatoArray][
          this.claveTiempo
        ].seg = 59;
        this.candidatosArray[this.indexCandidatoArray][this.claveTiempo].min--;
        if (--this.candidatoSeleccionado.tiempo.min < 0) {
          this.candidatoSeleccionado.tiempo.seg = 0;
          this.candidatoSeleccionado.tiempo.min = 0;
          this.candidatoSeleccionado.tiempo.terminado = true;
          //
          this.candidatosArray[this.indexCandidatoArray][
            this.claveTiempo
          ].seg = 0;
          this.candidatosArray[this.indexCandidatoArray][
            this.claveTiempo
          ].min = 0;
          this.candidatosArray[this.indexCandidatoArray][
            this.claveTiempo
          ].terminado = true;
          this.detenerTiempo();
          this.dejarTransmitir();
        }
      }
    } else {
      if (this.descontarBolsa()) this.descontarSegmentoDiscusion();
    }
    this.almacenamientoLocal.setArrayCandidatos(this.candidatosArray);
  }

  descontarSegmentoDiscusion() {
    if (
      --this.candidatosArray[this.indexCandidatoArray][this.claveTiempo].seg < 0
    ) {
      this.candidatosArray[this.indexCandidatoArray][this.claveTiempo].seg = 59;
      if (
        --this.candidatosArray[this.indexCandidatoArray][this.claveTiempo].min <
        0
      ) {
        this.candidatosArray[this.indexCandidatoArray][
          this.claveTiempo
        ].seg = 0;
        this.candidatosArray[this.indexCandidatoArray][
          this.claveTiempo
        ].min = 0;
        this.candidatosArray[this.indexCandidatoArray][
          this.claveTiempo
        ].terminado = true;
      }
    }
  }

  descontarBolsa(): boolean {
    if (--this.candidatoSeleccionado.tiempo.seg < 0) {
      this.candidatoSeleccionado.tiempo.seg = 59;
      if (--this.candidatoSeleccionado.tiempo.min < 0) {
        this.candidatoSeleccionado.tiempo.seg = 0;
        this.candidatoSeleccionado.tiempo.min = 0;
        this.candidatoSeleccionado.tiempo.terminado = true;
        //
        if (
          this.candidatosArray[this.indexCandidatoArray][this.claveTiempo]
            .seg == 0 &&
          this.candidatosArray[this.indexCandidatoArray][this.claveTiempo]
            .min == 0
        ) {
          this.candidatosArray[this.indexCandidatoArray][
            this.claveTiempo
          ].terminado = true;
        }

        //
        this.detenerTiempo();
        this.dejarTransmitir();
        return false;
      }
    }
    return true;
  }

  dejarTransmitir() {
    setTimeout(() => {
      this.banderaTransmitir = false;
    }, 2000);
  }

  ajustarTiempos() {
    // if (confirm('¿Está seguro de guradar los cambios ralizados?')) {
    this.banderaAjusteTiempo = true;
    this.ajusteArray = [];
    for (let index = 0; index < this.candidatosArray.length; index++) {
      let valores: any = {};
      //Exposición
      let expMin: any = document.getElementById('min_exposicion' + index);
      valores['expMin'] = expMin.value;
      let expSeg: any = document.getElementById('seg_exposicion' + index);
      valores['expSeg'] = expSeg.value;
      // Segmento 1
      let seg1Min: any = document.getElementById('min_seg1' + index);
      valores['seg1Min'] = seg1Min.value;
      let seg1Seg: any = document.getElementById('seg_seg1' + index);
      valores['seg1Seg'] = seg1Seg.value;
      // Segmento 2
      let seg2Min: any = document.getElementById('min_seg2' + index);
      valores['seg2Min'] = seg2Min.value;
      let seg2Seg: any = document.getElementById('seg_seg2' + index);
      valores['seg2Seg'] = seg2Seg.value;
      this.ajusteArray.push(valores);
    }
    this.banderaAjusteTiempo = !this.validarAjusteTiempo();
    if (!this.banderaAjusteTiempo) {
      this.reajustarTiempos();
      this.banderaAjusteTiempo = false;
      this.dialogRefTiempo.close();
    }
    // }
  }

  reajustarTiempos() {
    for (let index = 0; index < this.ajusteArray.length; index++) {
      // Exposición
      if (this.ajusteArray[index].expMin != '') {
        this.candidatosArray[index].tiempo_exposicion.min = Number(
          this.formatTwoDigits(this.ajusteArray[index].expMin)
        );
      }
      if (this.ajusteArray[index].expSeg != '') {
        this.candidatosArray[index].tiempo_exposicion.seg = Number(
          this.formatTwoDigits(this.ajusteArray[index].expSeg)
        );
      }
      // Segmento 1
      if (this.ajusteArray[index].seg1Min != '') {
        this.candidatosArray[index].tiempo_segmento1.min = Number(
          this.formatTwoDigits(this.ajusteArray[index].seg1Min)
        );
      }
      if (this.ajusteArray[index].seg1Seg != '') {
        this.candidatosArray[index].tiempo_segmento1.seg = Number(
          this.formatTwoDigits(this.ajusteArray[index].seg1Seg)
        );
      }
      // Segemnto 2
      if (this.ajusteArray[index].seg2Min != '') {
        this.candidatosArray[index].tiempo_segmento2.min = Number(
          this.formatTwoDigits(this.ajusteArray[index].seg2Min)
        );
      }
      if (this.ajusteArray[index].seg2Seg != '') {
        this.candidatosArray[index].tiempo_segmento2.seg = Number(
          this.formatTwoDigits(this.ajusteArray[index].seg2Seg)
        );
      }
    }
    this.almacenamientoLocal.setArrayCandidatos(this.candidatosArray);
  }

  finalizarCronometro() {
    var d = new Date();
    this.estado.push({
      bloque: this.numeroBloque,
      fecha: `${this.formatTwoDigits(d.getDate())} de ${
        this.months[d.getMonth()]
      } del ${d.getFullYear()}`,
      hora: `${this.formatTwoDigits(d.getHours())}:${this.formatTwoDigits(
        d.getMinutes()
      )}`,
      estado: this.candidatosArray,
    });
    setTimeout(() => {
      const doc = new jsPDF('landscape');
      autoTable(doc, { html: '#my-table' });
      doc.save('reporte.pdf');
      this.tipoTiempo = 'Configuración Inicial';
      this.candidatosArray = new Array<Candidato>();
      this.arrayLogos = [];
      this.confInicial = new ConfInicial();
      this.banderaPreparados = false;
      this.banderaResumen = true;
      this.numeroBloque = 1;
      this.estado = new Array<Estado>();
      this.iniciarSeleccionado();
      this.reiniciar();
      localStorage.clear();
    }, 2000);
    // }
  }

  validarContrasena() {
    if (this.passAjuste == '321') {
      this.openDialogTiempo();
      this.dialogContrasena.close();
      this.passAjuste = '';
    } else {
      this.openDialogConfirm('La contraseña es incorrecta');
    }
  }

  validar(form: NgForm) {
    let controls = form.controls;
    if (controls.candidatos.value == undefined) {
      this.msgAlert = 'El campo candidatos no debe de ir vacío';
      return false;
    } else if (
      !(controls.candidatos.value > 1 && controls.candidatos.value < 17)
    ) {
      this.msgAlert =
        'El número de candidatos debe de entrar en el rango 2 - 16';
      return false;
    }
    //Tiempo Exposición
    else if (controls.min_exposicion.value == undefined) {
      this.msgAlert =
        'El campo minutos del tiempo de exposición no debe de ir vacío';
      return false;
    } else if (
      !(
        controls.min_exposicion.value > -1 && controls.min_exposicion.value < 60
      )
    ) {
      this.msgAlert =
        'Los minutos del tiempo exposición deben entrar en el rango 0 - 59';
      return false;
    } else if (controls.seg_exposicion.value == undefined) {
      this.msgAlert =
        'El campo segundos del tiempo de exposición no debe de ir vacío';
      return false;
    } else if (
      !(
        controls.seg_exposicion.value > -1 && controls.seg_exposicion.value < 60
      )
    ) {
      this.msgAlert =
        'Los segundos del tiempo exposición deben entrar en el rango 0 - 59';
      return false;
    } else if (
      controls.min_exposicion.value == 0 &&
      controls.seg_exposicion.value == 0
    ) {
      this.msgAlert = 'El tiempo exposición debe tener al menos 1 segundo';
      return false;
    }
    //Tiempo Bolsa
    else if (controls.min_bolsa.value == undefined) {
      this.msgAlert =
        'El campo minutos del tiempo de bolsa no debe de ir vacío';
      return false;
    } else if (
      !(controls.min_bolsa.value > -1 && controls.min_bolsa.value < 60)
    ) {
      this.msgAlert =
        'Los minutos del tiempo de bolsa deben entrar en el rango 0 - 59';
      return false;
    } else if (controls.seg_bolsa.value == undefined) {
      this.msgAlert =
        'El campo segundos del tiempo de bolsa no debe de ir vacío';
      return false;
    } else if (
      !(controls.seg_bolsa.value > -1 && controls.seg_bolsa.value < 60)
    ) {
      this.msgAlert =
        'Los segundos del tiempo de bolsa deben entrar en el rango 0 - 59';
      return false;
    } else if (controls.min_bolsa.value == 0 && controls.seg_bolsa.value == 0) {
      this.msgAlert = 'El tiempo de bolsa debe tener al menos 1 segundo';
      return false;
    }
    //Tiempo Segmentos
    else if (controls.min_segmentos.value == undefined) {
      this.msgAlert =
        'El campo minutos del tiempo de segmentos no debe de ir vacío';
      return false;
    } else if (
      !(controls.min_segmentos.value > -1 && controls.min_segmentos.value < 60)
    ) {
      this.msgAlert =
        'Los minutos del tiempo segmentos deben entrar en el rango 0 - 59';
      return false;
    } else if (controls.seg_segmentos.value == undefined) {
      this.msgAlert =
        'El campo segundos del tiempo de segmentos no debe de ir vacío';
      return false;
    } else if (
      !(controls.seg_segmentos.value > -1 && controls.seg_segmentos.value < 60)
    ) {
      this.msgAlert =
        'Los segundos del tiempo segmentos deben entrar en el rango 0 - 59';
      return false;
    } else if (
      controls.min_segmentos.value == 0 &&
      controls.seg_segmentos.value == 0
    ) {
      this.msgAlert = 'El tiempo segmentos debe tener al menos 1 segundo';
      return false;
    }

    return true;
  }

  validarAjusteTiempo() {
    let index = 0;
    for (const iterator of this.ajusteArray) {
      ///////// Exposición ///////
      // Minuto
      if (iterator.expMin != '') {
        if (!(iterator.expMin > -1 && iterator.expMin < 60)) {
          this.msgAlert =
            'Por favor verifique el campo de minutos exposición del candidato: ' +
            this.candidatosArray[index].nombre;
          return false;
        }
      }
      // Segundo
      if (iterator.expSeg != '') {
        if (!(iterator.expSeg > -1 && iterator.expSeg < 60)) {
          this.msgAlert =
            'Por favor verifique el campo de segundos exposición del candidato: ' +
            this.candidatosArray[index].nombre;
          return false;
        }
      }
      if (iterator.expMin != '' && iterator.expSeg != '')
        if (iterator.expMin == 0 && iterator.expSeg == 0) {
          this.msgAlert =
            'El tiempo de Exposición debe de tener al menos 1 seg del candidato: ' +
            this.candidatosArray[index].nombre;
          return false;
        }
      ///////// Segmento 1  ///////
      // Minuto
      if (iterator.seg1Min != '') {
        if (!(iterator.seg1Min > -1 && iterator.seg1Min < 60)) {
          this.msgAlert =
            'Por favor verifique el campo de minutos Segmento 1  del candidato: ' +
            this.candidatosArray[index].nombre;
          return false;
        }
      }
      // Segundo
      if (iterator.seg1Seg != '') {
        if (!(iterator.seg1Seg > -1 && iterator.seg1Seg < 60)) {
          this.msgAlert =
            'Por favor verifique el campo de segundos Segmento 1 del candidato: ' +
            this.candidatosArray[index].nombre;
          return false;
        }
      }
      if (iterator.seg1Min != '' && iterator.seg1Seg != '')
        if (iterator.seg1Min == 0 && iterator.seg1Seg == 0) {
          this.msgAlert =
            'El tiempo de Segmento 1 debe de tener al menos 1 seg del candidato ' +
            this.candidatosArray[index].nombre;
          return false;
        }
      ///////// Segmento 2  ///////
      // Minuto
      if (iterator.seg2Min != '') {
        if (!(iterator.seg2Min > -1 && iterator.seg2Min < 60)) {
          this.msgAlert =
            'Por favor verifique el campo de minutos Segmento 2 del candidato: ' +
            this.candidatosArray[index].nombre;
          return false;
        }
      }
      // Segundo
      if (iterator.seg2Seg != '') {
        if (!(iterator.seg2Seg > -1 && iterator.seg2Seg < 60)) {
          this.msgAlert =
            'Por favor verifique el campo de segundos Segmento 2 del candidato: ' +
            this.candidatosArray[index].nombre;
          return false;
        }
      }
      if (iterator.seg2Min != '' && iterator.seg2Seg != '')
        if (iterator.seg2Min == 0 && iterator.seg2Seg == 0) {
          this.msgAlert =
            'El tiempo de Segmento 2 debe de tener al menos 1 seg del candidato: ' +
            this.candidatosArray[index].nombre;
          return false;
        }
      index++;
    }
    return true;
  }

  validarTiempoCierre(min_cierre, seg_cierre) {
    // let min_cierre: any = document.getElementById("inp_min_cierre");
    // let seg_cierre: any = document.getElementById("inp_seg_cierre");
    if (min_cierre.value == '') {
      this.msgAlert =
        'El campo minutos del tiempo de cierre no debe de ir vacío';
      return false;
    } else if (!(min_cierre.value > -1 && min_cierre.value < 60)) {
      this.msgAlert =
        'Los minutos del tiempo cierre deben entrar en el rango 0 - 59';
      return false;
    } else if (seg_cierre.value == '') {
      this.msgAlert =
        'El campo segundos del tiempo de cierre no debe de ir vacío';
      return false;
    } else if (!(seg_cierre.value > -1 && seg_cierre.value < 60)) {
      this.msgAlert =
        'Los segundos del tiempo cierre deben entrar en el rango 0 - 59';
      return false;
    } else if (min_cierre.value == 0 && seg_cierre.value == 0) {
      this.msgAlert = 'El tiempo cierre debe tener al menos 1 segundo';
      return false;
    }
    return true;
  }
}
