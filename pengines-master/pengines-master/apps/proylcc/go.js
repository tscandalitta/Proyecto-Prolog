// Reference to object provided by pengines.js library which interfaces with Pengines server (Prolog-engine)
// by making query requests and receiving answers.
var pengine;
// Bidimensional array representing board configuration.
var gridData;
// Bidimensional array with board cell elements (HTML elements).
var cellElems;
// States if it's black player turn.
var turnBlack = false;
var bodyElem;
var latestStone;
var turnosConsecutivosPasados = 0;
var contadorFichasNegras = 0;
var contadorFichasBlancas = 0;
var juegoFinalizado = false;
var modalPuntajes;
var modalJugadaInvalida;
// Get the <span> element that closes the modalPuntajes
var spanP;
var spanJ;
var jugarContraMaquina;
var turnoMaquina = true;
var modo;
var botonFinalizar;
var botonPasar;
/**
* Initialization function. Requests to server, through pengines.js library,
* the creation of a Pengine instance, which will run Prolog code server-side.
*/

function init() {
    document.getElementById("passBtn").addEventListener('click', () => switchTurn());
    document.getElementById("finBtn").addEventListener('click', () => finalizar());
    document.getElementById("reloadBtn").addEventListener('click', () => reiniciarJuego());
    botonFinalizar = document.getElementById("finBtn");
    botonPasar = document.getElementById("passBtn");
    botonFinalizar.disabled = true;
    bodyElem = document.getElementsByTagName('body')[0];
    modalPuntajes = document.getElementById("modalPuntajes");
    modalJugadaInvalida = document.getElementById("modalJugadaInvalida");
    spanP = document.getElementsByClassName("closeP")[0];
    spanJ = document.getElementsByClassName("closeJ")[0];
    spanP.onclick = function() {
      modalPuntajes.style.display = "none";
    }
    spanJ.onclick = function() {
      modalPuntajes.style.display = "none";
    }
    // Get the <span> element that closes the modalPuntajes
    createBoard();
    // Creación de un conector (interface) para comunicarse con el servidor de Prolog.
    pengine = new Pengine({
        server: "http://localhost:3030/pengine",
        application: "proylcc",
        oncreate: handleCreate,
        onsuccess: handleSuccess,
        onfailure: handleFailure,
        destroy: false
    });
}

/**
 * Create grid cells elements
 */

function createBoard() {
    const dimension = 19;
    const boardCellsElem = document.getElementById("boardCells");
    for (let row = 0; row < dimension - 1; row++) {
        for (let col = 0; col < dimension - 1; col++) {
            var cellElem = document.createElement("div");
            cellElem.className = "boardCell";
            boardCellsElem.appendChild(cellElem);
        }
    }
    const gridCellsElem = document.getElementById("gridCells");
    cellElems = [];
    for (let row = 0; row < dimension; row++) {
        cellElems[row] = [];
        for (let col = 0; col < dimension; col++) {
            var cellElem = document.createElement("div");
            cellElem.className = "gridCell";
            cellElem.addEventListener('click', () => handleClick(row, col));
            gridCellsElem.appendChild(cellElem);
            cellElems[row][col] = cellElem;
        }
    }
    jugarContraMaquina = false;
    modo = new DosJugadores();
    setTimeout(function(){
                    jugarContraMaquina = confirm("DESEA JUGAR CONTRA LA MAQUINA?");
                    if(jugarContraMaquina){
                        modo = new Maquina();
                        botonFinalizar.disabled = false;
                    }
              }, 500);
}

/**
 * Callback for Pengine server creation
 */

function handleCreate() {
    pengine.ask('emptyBoard(Board)');
}

/**
 * Callback for successful response received from Pengines server.
 */

function handleSuccess(response) {
    if(juegoFinalizado){
      var listaNegras = response.data[0].CapturadasNegro;
      var listaBlancas = response.data[0].CapturadasBlanco;
      juegoFinalizado = false;
      imprimirPuntajes(listaNegras.length,listaBlancas.length);
    }
    else{
      contadorFichasNegras = 0;
      contadorFichasBlancas = 0;

      gridData = response.data[0].Board;
      for (let row = 0; row < gridData.length; row++)
          for (let col = 0; col < gridData[row].length; col++) {
              cellElems[row][col].className = "gridCell" +
                  (gridData[row][col] === "w" ? " stoneWhite" : gridData[row][col] === "b" ? " stoneBlack" : "") +
                  (latestStone && row === latestStone[0] && col === latestStone[1] ? " latest" : "");
              //Contador de fichas en el tablero.
              if(gridData[row][col] === "w")
                contadorFichasBlancas++;
              else if(gridData[row][col] === "b")
                contadorFichasNegras++;
          }
      //Si algun jugador coloca una ficha seteo el contador en 0.
      turnosConsecutivosPasados = 0;
      switchTurnDesdeTablero();
    }
}

/**
 * Called when the pengine fails to find a solution.
 */

function handleFailure() {
    var row = latestStone[0];
    var col = latestStone[1];
    document.getElementById("labelJugadaInvalida").innerHTML = "JUGADA INVALIDA POSICION [" + row + "," + col + "]";
    modalJugadaInvalida.style.display = "block";
    setTimeout(function(){ modalJugadaInvalida.style.display = "none"; }, 1000);
}

/**
 * Handler for color click. Ask query to Pengines server.
 */

function handleClick(row, col) {
    if(!jugarContraMaquina | !turnoMaquina){
      const s = "goMove(" + Pengine.stringify(gridData) + "," + Pengine.stringify(turnBlack ? "b" : "w") + "," + "[" + row + "," + col + "]" + ",Board)";
      pengine.ask(s);
      latestStone = [row, col];
  }
}

function switchTurn() {
    turnosConsecutivosPasados++;
    if(turnosConsecutivosPasados == 2)
      finalizar();
    switchTurnDesdeTablero();
}

function switchTurnDesdeTablero() {
    turnBlack = !turnBlack;
    if(jugarContraMaquina){
        turnoMaquina = !turnoMaquina;
        if(!turnoMaquina){
            botonPasar.disabled = false;
            botonFinalizar.disabled = false;
        }
    }
    else
      turnoMaquina = false;

    bodyElem.className = turnBlack ? "turnBlack" : "turnWhite";
    document.getElementById("puntajeNegras").innerHTML = "negras: " + contadorFichasNegras;
    document.getElementById("puntajeBlancas").innerHTML = "blancas: " + contadorFichasBlancas;
    if(!turnBlack)
      modo.realizarJugada();
}

function finalizar(){
    juegoFinalizado = true;
    botonPasar.disabled = true;
    botonFinalizar.disabled = true;
    pengine.ask("getNulasCapturadas(" + Pengine.stringify(gridData) + ",CapturadasNegro,CapturadasBlanco)");

}

function reiniciarJuego(){
  document.location.reload();
}
function imprimirPuntajes(capturadasNegras, capturadasBlancas){
    var totalNegras = contadorFichasNegras + capturadasNegras;
    var totalBlancas = contadorFichasBlancas + capturadasBlancas;
    var ganador = "";

    if(totalNegras > totalBlancas)
      ganador = "GANADOR: NEGRO";
    else if(totalNegras == totalBlancas)
      ganador = "EMPATE";
    else
      ganador = "GANADOR: BLANCO";

    document.getElementById("labelGanador").innerHTML = ganador;
    document.getElementById("labelNegras").innerHTML = "NEGRO: "+totalNegras+" - Fichas: "+contadorFichasNegras+", Capturadas: "+capturadasNegras;
    document.getElementById("labelBlancas").innerHTML = "BLANCO: "+totalBlancas +" - Fichas: "+contadorFichasBlancas+", Capturadas: "+capturadasBlancas;

    modalPuntajes.style.display = "block";
}

/**
* Call init function after window loaded to ensure all HTML was created before
* accessing and manipulating it.
*/

window.onload = init;


class DosJugadores{
  realizarJugada(){
  }
}

class Maquina{
  realizarJugada(){
    turnoMaquina = true;
    botonPasar.disabled = true;
    botonFinalizar.disabled = true;
    pengine.ask("moverInteligencia(" + Pengine.stringify(gridData) + ",Board)");
  }
}
