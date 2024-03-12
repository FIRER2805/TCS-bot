const venom = require("venom-bot");
const webhooks = require("node-webhooks");
const MensagemHistoricoDto = require("./model/dto/MensagemHistoricoDto");
const Sessao = require("./model/dto/Entity/Sessao");
const MensagemDto = require("./model/dto/MensagemDto");
const axios = require("axios");
const URL_PROXIMA_MENSAGEM = "http://localhost:8080/mensagem/proximo";

class Bot{

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
            let dadosSessao = new Sessao(1,1);
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
                
                let sessao = this.sessoes.get(client.session);
                
                let mensagemParametro = new MensagemDto();
                mensagemParametro.idSetor = sessao.idSetor;
                mensagemParametro.idUsuario = sessao.idUsuario;
                mensagemParametro.numeroContato = message.from;
                mensagemParametro.inputPai = message.body;
                mensagemParametro.idMensagemPai = sessao.historicoContatos.get(message.from);
                
                let proximaMensagem = await axios.post(URL_PROXIMA_MENSAGEM, mensagemParametro);
                
                sessao.historicoContatos.set(message.from,proximaMensagem.data.id);

                console.log(sessao.historicoContatos.get(message.from));

                let dado = new MensagemHistoricoDto(message.body, message.from);
                this.hooks.trigger("salvarMensagem", dado);
            }
        });
    }
}

module.exports = Bot;