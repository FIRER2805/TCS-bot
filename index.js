const app = require("express")();
const venom = require("venom-bot");
const PORT = 9000;
const RESPOSTA = "Olá, ésta é uma mensagem automática feita pelo venom bot";

venom.create({session: "sessão-test"})
.then((client)=>{
    start(client);
}).catch((err) => {
    console.log(err);
})

function start(client){
    client.onMessage((message) => {
        if(message.body ==  "oi" && message.isGroupMsg == false){
            client.sendText(message.from, RESPOSTA)
            .then((result)=>{
                console.log("Mensagem recebida de: " + message.from);
                console.log("Conteudo da mensagem: " + message.body);
            }).catch((err) => {
                console.log(err);
            })
        }
    })
}

app.get("/",(req, res)=>{
    res.send("Hello World!");
});

app.listen(PORT, (err)=>{
    if(!err){
        return console.log("Servidor ouvindo na porta " + PORT);
    }
    console.log("Erro: " + err);
});