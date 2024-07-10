require("./bot");
const app = require("express")();
const bodyParser = require("body-parser");
const webhooks = require("node-webhooks");
const Bot = require("./bot");
const path = require('path');
const fs = require('fs');
const cors = require("cors");

bot = {};
const PORT = 9000;

app.use(bodyParser.json());

app.use(cors({
    origin: "http://localhost:4200"
}));

app.get("/teste/:idUsuario", async(req, res) => {
    res.json("Funcionou!, idUsuario: " + req.params.idUsuario);
})

app.get("/criar-sessao/:idUsuario", async (req, res) => {
    
    fs.unlink(path.join(__dirname, "out.png"), (err) => {
        if (err) {
          console.error('Erro ao deletar o arquivo:', err);
        } else {
          console.log('Arquivo deletado com sucesso.');
        }
    });
    let bot = new Bot();
    bot.criarSessao(req.params.idUsuario);
    const filePath = path.join(__dirname, "out.png");
    const interval = setInterval(() => {
        if (fs.existsSync(filePath)) {
            clearInterval(interval); 

            res.sendFile(filePath, (err) => {
                if (err) {
                    console.error('Erro ao enviar o arquivo:', err);
                    res.status(500).send('Erro ao enviar o arquivo');
                } else {
                    console.log('Arquivo enviado com sucesso.');
                }
            });
            
        }
    }, 1000);
});

app.listen(PORT, (err)=>{
    if(!err){
        console.log("Servidor ouvindo na porta " + PORT);
    }
    else {
        console.log("Erro: " + err);
    }
});