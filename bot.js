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
            await this.#configurarBot(client);
        }
        catch(err){
            console.log(err);
        }
    }

    #configurarBot(client){
        client.onMessage(async (message) => {
            if(message.body != undefined && !message.isGroupMsg && message.from != "status@broadcast"){
                let sessao = this.sessoes.get(client.session);
                let mensagemParametro = this.#montarMensagemParametro(sessao, message);
                let proximaMensagem;
                try{
                    proximaMensagem = await axios.post(URL_PROXIMA_MENSAGEM, mensagemParametro);
                    console.log(proximaMensagem.data.inputsFilhos);
                    sessao.ultimoIdMensagem.set(message.from,proximaMensagem.data.id);
                    sessao.ultimasOpcoes.set(message.from, proximaMensagem.data.inputsFilhos);
                }
                catch(err){
                    console.log("erro: " + err);
                }

                let dado = new MensagemHistoricoDto(message.body, message.from, sessao.idUsuario);
                this.hooks.trigger("salvarMensagem", dado);
                let mensagemEnviar = proximaMensagem.data.conteudo;
                let contador = 1;
                if(proximaMensagem.data.inputsFilhos.length == 0){
                    console.log("esta vazio");
                    sessao.ultimoIdMensagem.set(message.from, null);
                }
                proximaMensagem.data.inputsFilhos.forEach(element => {
                    mensagemEnviar += "\n"+ contador + "- " + element.conteudo;
                    contador++;
                });
                client.sendText(message.from,mensagemEnviar);
            }
        });
    }

    #montarMensagemParametro(sessao, message){
        let mensagemParametro = new MensagemDto();
        mensagemParametro.idSetor = sessao.idSetor;
        mensagemParametro.numeroContato = message.from;
        mensagemParametro.inputPai = message.body //sessao.ultimasOpcoes(message.from)[Number(message.body)];
        mensagemParametro.idUsuario = sessao.idUsuario;
        mensagemParametro.idMensagemPai = sessao.ultimoIdMensagem.get(message.from);
        return mensagemParametro;
    }
}

module.exports = Bot;