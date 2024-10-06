const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();

const server = http.createServer(app);
//intintiate socket.io on http server
//socket ko chaiye apka http ka server 
const io = socket(server);

const chess = new Chess();

let players = {};
let currentplayer = "W";

app.set("view engine", "ejs"); //isse hum ejs use kr paege i.e html for server side
app.use(express.static(path.join(__dirname, "public"))); // we can use static file i.e photo css videos
 
app.get("/", (req, res) => {
    res.render("index", { title: "CheckMate" });//res.send ki jagah we have used res.render because of ejs 
})

io.on("connection", function (uniquesocket) {  //jb bhi koi connect hoga backend se us case mai uski info milegi in uniquesocket
    console.log("connected");
    // uniquesocket.on("churan",function(){
    //     io.emit("churan papdi");
    // })
    if (!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    }
    else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    }
    else {
        uniquesocket.emit("spectator");
    }
    uniquesocket.on("dissconnect", function () {
        //to game band karni padegi but agar spectator disconnect hua to??
        if (uniquesocket.id == players.white) {
            delete players.white;
        }
        else if (uniquesocket.id == players.black) {
            delete players.black;
        }
    });

    //to validate the moves and player:
    uniquesocket.on("move", (move) => {
        try {
            if (chess.turn() === "w" && uniquesocket.id !== players.white) return;
            if (chess.turn() === "b" && uniquesocket.id !== players.black) return;
            
            const result=chess.move(move);//humne chess.move ko apna move dia check karne ke lie...
            
            if(result){
                currentplayer=chess.turn();
                io.emit("move",move);//frontend pe move chla dega
                io.emit("boardState",chess.fen());//board ki current state bhi frontend pe bhejni hai we will get this curent state of boaed from fen eq
            }
            else{
                console.log("Invalid move:",move);
                uniquesocket.emit("Invalid move:",move);
            }

        }
        catch(err){
            console.log("Invalid move:",move);
            uniquesocket.emit("Invalid move:",move);
        }
    })

})

server.listen(3000, function () {
    console.log("running");
});





