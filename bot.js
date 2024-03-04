const venom = require("venom-bot");
const webhooks = require("node-webhooks");
const MensagemHistoricoDto = require("./model/dto/MensagemHistoricoDto");
const SessaoDto = require("./model/dto/SessaoDto");

class Bot{

    // TODO criar hashmap para controle de sessão
    // chave vai ser o objeto sessão logo quando ele é criado
    sessoes;
    hooks;

    constructor(){
        sessoes = new Map();
        this.hooks = new webhooks({
            db:{
                "salvarMensagem": ["http://localhost:8080/historico-mensagem"]
            }
        });
    }

    async criarSessao(nomeSessao){
        try{
            let client = await venom.create({session: nomeSessao});
            // idSetor = 1 para o padrão dos testes
            this.sessoes.set(client, new SessaoDto(1));
            await this.#iniciarBot(client);
        }
        catch(err){
            console.log(err);
        }
    }

    #iniciarBot(client){
        client.onMessage((message) => {
            if(message.body != undefined && !message.isGroupMsg){
                // salva mensagem no histórico
                let dado = new MensagemHistoricoDto(message.body, message.from);
                this.hooks.trigger("salvarMensagem", dado);
            }
        });
    }


}

module.exports = Bot;