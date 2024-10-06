//basic socket io setup
// const socket = io();
// //send churan event to backend
// socket.emit("churan");
// //received event sent from backend 
// socket.on("churan papdi", function(){
//     console.log("received at frontend")
// })

const socket = io();
const chess = new Chess();
const boardelement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderboard = () => {
    const board = chess.board();//this will give me a chess board at 
    boardelement.innerHTML = "";
    // console.log(board);
    board.forEach((row, rowindex) => {
        // console.log(row,rowindex);
        row.forEach((square, squareindex) => {//to get individual square*********
            // console.log(square,squareindex);
            const squareElement = document.createElement("div");//to create square for each element...
            squareElement.classList.add("square",
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
            );
            squareElement.dataset.row=row;
            squareElement.dataset.col=squareindex;

            //if a square is holding a piece we have to develop that piece
            if(square){
                const pieceElement=document.createElement("div");
                pieceElement.classList.add("piece",square.color==="w"?"white":"black");
                pieceElement.innerText=getpieceunicode(square);
                pieceElement.draggable=playerRole===square.color;
                pieceElement.addEventListener("dragstart",(e)=>{
                    if(pieceElement.draggable){
                        draggedPiece=pieceElement;
                        sourceSquare={row:rowindex,col:squareindex};
                        e.dataTransfer.setData("text/plain","");//to remove any kind of issue in dragging
                    }
                });
                pieceElement.addEventListener("dragend",(e)=>{
                    draggedPiece=null;
                    sourceSquare=null;
                });
                squareElement.appendChild(pieceElement);
            }
            squareElement.addEventListener("dragover",(e)=>{
                e.preventDefault();
            })
            squareElement.addEventListener("drop",(e)=>{
                e.preventDefault();
                if(draggedPiece){
                    const targetSource={
                    row:parseInt(squareElement.dataset.row,10),
                    col:parseInt(squareElement.dataset.col,10)
                    };
                    handlemove(sourceSquare,targetSource);
                }
            });
            boardelement.appendChild(squareElement);
        });
    });
    if(playerRole==='b'){
        boardelement.classList.add("flipped");
    }
    else{
        boardelement.classList.remove("flipped");
    }

};

const handlemove = (source,target) => {
    const move={
        from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:'q'
    }
    socket.emit("move",move); 
}

const getpieceunicode = (piece) => {
    const unicodePieces = {
        p: "♙",
        r: "♜",
        n: "♘",
        b: "♝",
        q: "♛",
        k: "♚",
        P: "♙",
        R: "♖",
        N: "♘",
        B: "♗",
        Q: "♕",
        K: "♔",

    };
    return unicodePieces[piece.type] || "";

};
socket.on("playerRole",function(role){
    playerRole=role;
    renderboard();
})
socket.on("spectator",function(){
    playerRole=null;
    renderboard();
})
socket.on("boardState",function(fen){
    chess.load(fen);
    renderboard();
})
socket.on("move",function(move){
    chess.move(move);
    renderboard();
})
socket.on("Invalid move:",function(move){
    console.log("invalid hai bhai");

})

