// Reference to object provided by pengines.js library which interfaces with Pengines server (Prolog-engine)
// by making query requests and receiving answers.
var pengine;
// Bidimensional array representing board configuration.
var gridData;
// Bidimensional array with board cell elements (HTML elements).
var cellElems;
// States if it's black player turn.
var turnBlack = false;
// Contador de turnos consecutivos pasados.
var turnosConsecutivosPasados;
var bodyElem;
var latestStone;

var contFichasNegras, contFichasBlancas;



/**
* Initialization function. Requests to server, through pengines.js library,
* the creation of a Pengine instance, which will run Prolog code server-side.
*/

function init() {
    document.getElementById("passBtn").addEventListener('click', () => switchTurn());
    bodyElem = document.getElementsByTagName('body')[0];
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
    // Inicializo parametros
    turnosConsecutivosPasados=0;
    contFichasNegras=0;
    contFichasBlancas=0;
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
    contFichasNegras=0;
    contFichasBlancas=0;
    gridData = response.data[0].Board;
    for (let row = 0; row < gridData.length; row++)
        for (let col = 0; col < gridData[row].length; col++) {
            cellElems[row][col].className = "gridCell" +
                (gridData[row][col] === "w" ? " stoneWhite" : gridData[row][col] === "b" ? " stoneBlack" : "") +
                (latestStone && row === latestStone[0] && col === latestStone[1] ? " latest" : "");
            //Contador de fichas en el tablero.
            if( gridData[row][col] === "w")
              contFichasBlancas++
            else if( gridData[row][col] === "b")
              contFichasNegras++;
        }

    //Si algun jugador coloca una ficha seteo el contador en 0.
    turnosConsecutivosPasados=0;
    switchTurnDesdeTablero();
}

/**
 * Called when the pengine fails to find a solution.
 */

function handleFailure() {
    var row = latestStone[0];
    var col = latestStone[1];
    alert("JUGADA INVALIDA [" + row + "," + col + "]");
    const s = "eliminar(" + Pengine.stringify(gridData) + "," + "[" + row + "," + col + "]" + ",Board)";
  //  pengine.ask(s);
}

/**
 * Handler for color click. Ask query to Pengines server.
 */

function handleClick(row, col) {
    const s = "goMove(" + Pengine.stringify(gridData) + "," + Pengine.stringify(turnBlack ? "b" : "w") + "," + "[" + row + "," + col + "]" + ",Board)";
    pengine.ask(s);
    latestStone = [row, col];
}

function switchTurn() {
    turnosConsecutivosPasados++;
    if(turnosConsecutivosPasados==2)
      finalizar();
    switchTurnDesdeTablero();
}

function switchTurnDesdeTablero() {
    turnBlack = !turnBlack;
    bodyElem.className = turnBlack ? "turnBlack" : "turnWhite";
    document.getElementById("puntajeNegras").innerHTML= ""+contFichasNegras;
    document.getElementById("puntajeBlancas").innerHTML= ""+contFichasBlancas;
}

function finalizar(){
    imprimirPuntajes();
    turnosConsecutivosPasados=0;
    //Limpio tablero.
    pengine.ask('emptyBoard(Board)');
    //Empieza el jugador negro.
    turnBlack = true;
    bodyElem.className = "turnBlack";
}

function imprimirPuntajes(){
    if(contFichasNegras>contFichasBlancas)
      alert("GANO EL JUGADOR NEGRO\nPUNTAJE: "+contFichasNegras)
    else if(contFichasNegras==contFichasBlancas)
      alert("EMPATE\nPUNTAJE NEGRO: "+contFichasNegras+"\nPUNTAJE BLANCO: "+contFichasBlancas)
    else
      alert("GANO EL JUGADOR BLANCO\nPUNTAJE: "+contFichasBlancas);
}
/**
* Call init function after window loaded to ensure all HTML was created before
* accessing and manipulating it.
*/

window.onload = init;
