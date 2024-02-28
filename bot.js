const venom = require("venom-bot");
const webhooks = require("node-webhooks");
const MensagemHistoricoDto = require("./model/dto/MensagemHistoricoDto");

class Bot{

    hooks;

    constructor(){
        this.hooks = new webhooks({
            db:{
                "salvarMensagem": ["http://localhost:8080/historico-mensagem"]
            }
        });
    }

    async criarSessao(nomeSessao){
        try{
            let client = await venom.create({session: nomeSessao});
            await this.#iniciarBot(client);
        }
        catch(err){
            console.log(err);
        }
    }

    #iniciarBot(client){
        client.onMessage((message) => {
            let dado = new MensagemHistoricoDto(message.body, message.from);
            console.log(dado);
            this.hooks.trigger("salvarMensagem", dado);
        });
    }
}

module.exports = Bot;