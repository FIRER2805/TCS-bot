const venom = require("venom-bot");
const webhooks = require("node-webhooks");
const MensagemHistoricoDto = require("./model/dto/MensagemHistoricoDto");
const SessaoDto = require("./model/dto/SessaoDto");
const axios = require("axios");
const URL_PROXIMA_MENSAGEM = "localhost:8080/mensagem/proximo";

class Bot{

    // TODO criar hashmap para controle de sessão
    // chave vai ser o objeto client logo quando ele é criado
    sessoes;
    hooks;

    constructor(){
        this.sessoes = new Map();
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
            let dadosSessao = new SessaoDto(1);
            this.sessoes.set(client.session, dadosSessao);
            await this.#iniciarBot(client);
        }
        catch(err){
            console.log(err);
        }
    }

    #iniciarBot(client){
        client.onMessage(async (message) => {
            if(message.body != undefined && !message.isGroupMsg){
                /*TODO futuramente remover o salvamento da mensagem do bot 
                e deixar na api*/
                // salva mensagem no histórico
                let dado = new MensagemHistoricoDto(message.body, message.from);
                this.hooks.trigger("salvarMensagem", dado);

                // configura objeto da sessaoDto
                let sessao = this.sessoes.get(client.session);
                sessao.inputPai = message.body;

                // envia requisição para receber proxima mensagem
                let proximaMensagem = await axios.post(URL_PROXIMA_MENSAGEM, sessao);

                console.log(proximaMensagem);
            }
        });
    }
}

module.exports = Bot;