require("./bot");
const app = require("express")();
const bodyParser = require("body-parser");
const webhooks = require("node-webhooks");
const Bot = require("./bot");

bot = {};
const PORT = 9000;

app.use(bodyParser.json());

app.listen(PORT, (err)=>{
    if(!err){
        console.log("Servidor ouvindo na porta " + PORT);
        bot = new Bot();
        bot.criarSessao("sessão-teste");
    }
    else {
        console.log("Erro: " + err);
    }
});