function iniciarBot(){
    venom.create({session: "sessão-test"})
    .then((client)=>{
        start(client);
    }).catch((err) => {
        console.log(err);
    })
}

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

module.exports = iniciarBot;