const app = require("express")();
const venom = require("venom-bot");
const iniciarBot = require("./bot");
const PORT = 9000;
const RESPOSTA = "Olá, ésta é uma mensagem automática feita pelo venom bot";

app.get("/",(req, res)=>{
    res.send("Hello World!");
});

app.listen(PORT, (err)=>{
    if(!err){
        console.log("Servidor ouvindo na porta " + PORT);
        iniciarBot();
    }
    else {
        console.log("Erro: " + err);
    }
});