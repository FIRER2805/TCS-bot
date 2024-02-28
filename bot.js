const venom = require("venom-bot");
const MensagemHistoricoDto = require("./model/dto/MensagemHistoricoDto");

class Bot{

    hooks;

    constructor(){
        hooks = new webhooks({
            db:{
                "salvarMensagem": ["http://localhost:9000/historico-mensagem"]
            }
        });
    }

    async criarSessao(nomeSessao){
        let client = await venom.create({session: nomeSessao})
        await this.#iniciarBot(client).catch((err) => {
            console.log(err);
        })
    }

    #iniciarBot(client){
        client.onMessage((message) => {
            this.hooks.trigger("salvarMensagem",
            new MensagemHistoricoDto(message.body, message.from));
        });
    }
}

module.exports = Bot;