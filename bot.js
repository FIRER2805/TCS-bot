const venom = require("venom-bot");
const webhooks = require("node-webhooks");
const MensagemHistoricoDto = require("./model/dto/MensagemHistoricoDto");
const Sessao = require("./model/dto/Entity/Sessao");
const MensagemDto = require("./model/dto/MensagemDto");
const axios = require("axios");
const URL_PROXIMA_MENSAGEM = "http://localhost:8080/mensagem/proximo";
const URL_SELECIONAR_SETOR = "http://localhost:8080/mensagem/selecionarSetor";
const URL_CONTATO_AUTOMATIZADO = "http://localhost:8080/contatos/automatizado";
const URL_ATIVAR_ATENDIMENTO_MANUAL = "http://localhost:8080/contatos/atendimentoManual";
const URL_CONTATOS_BASE = "http://localhost:8080/contatos"

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
            let client = await venom.create(nomeSessao,
                (base64Qr, asciiQR, attempts, urlCode) => {
                var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                  response = {};
          
                if (matches.length !== 3) {
                  return new Error('Invalid input string');
                }
                response.type = matches[1];
                response.data = new Buffer.from(matches[2], 'base64');
          
                var imageBuffer = response;
                require('fs').writeFile(
                  'out.png',
                  imageBuffer['data'],
                  'binary',
                  function (err) {
                    if (err != null) {
                      console.log(err);
                    }
                  }
                );
              },
              undefined,
              { logQR: false }
            );
            let dadosSessao = new Sessao(1);
            this.sessoes.set(client.session, dadosSessao);
            await this.#configurarBot(client);
        }
        catch(err){
            console.log(err);
        }
    }

    #configurarBot(client){
        client.onMessage(async (message) => {
            let contatoRetornado = await axios.post(URL_CONTATO_AUTOMATIZADO, {numero: message.from});
            if(contatoRetornado.data.id != null && contatoRetornado.data.automatizado == false){
                return;
            }
            else if (contatoRetornado.data.id == null){
                let idUsuario = this.sessoes.get(client.session).idUsuario;
                await axios.post(URL_CONTATOS_BASE, {idUsuario, numero: message.from, automatizado: true});
            }
            if(message.body.toLowerCase() == "atendimento manual"){
                await axios.post(URL_ATIVAR_ATENDIMENTO_MANUAL, {numero: message.from, automatizado: false});
                return client.sendText(message.from, "solicitado o atendimento manual");
            }
            if(message.body != undefined && !message.isGroupMsg && message.from != "status@broadcast"){
                let sessao = this.sessoes.get(client.session);
                // seleção de setor
                if(sessao.idSetor.get(message.from) == undefined && (sessao.ultimasOpcoes.get(message.from) == undefined || sessao.ultimasOpcoes.get(message.from).length == 0)){
                    let setores = await axios.post(URL_SELECIONAR_SETOR, { idUsuario: sessao.idUsuario });
                    sessao.ultimasOpcoes.set(message.from, setores.data);
                    let mensagemEnviar = "Antes de começar o atendimento, escolha o setor em que você deseja falar"
                    let contador = 1
                    setores.data.forEach(element => {
                        mensagemEnviar += "\n"+contador+"- "+element.nome;
                        contador++;
                    })
                    return client.sendText(message.from,mensagemEnviar);
                } else if (sessao.idSetor.get(message.from) == undefined && (sessao.ultimasOpcoes.get(message.from) != undefined || sessao.ultimasOpcoes.get(message.from).length > 0)){
                    if(!isNaN(message.body) && sessao.ultimasOpcoes.get(message.from)[Number(message.body) - 1] != undefined){
                        let sessaoSelecionada = sessao.ultimasOpcoes.get(message.from)[Number(message.body) - 1].id;
                        sessao.idSetor.set(message.from,sessaoSelecionada);
                    } else {
                        let mensagemEnviar = "Input incorreto!";
                        let contador = 1
                        sessao.ultimasOpcoes.get(message.from).forEach(element => {
                            mensagemEnviar += "\n" + contador + "- " + element.nome;
                            contador++;
                        })
                        return client.sendText(message.from,mensagemEnviar);
                    }
                }
                let mensagemParametro = this.#montarMensagemParametro(sessao, message);
                let proximaMensagem;
                try{
                    console.log(mensagemParametro);
                    proximaMensagem = await axios.post(URL_PROXIMA_MENSAGEM, mensagemParametro);
                    sessao.ultimoIdMensagem.set(message.from,proximaMensagem.data.id);
                    sessao.ultimasOpcoes.set(message.from, proximaMensagem.data.inputsFilhos);
                }
                catch(err){
                    console.log("erro: " + err);
                }
                let conteudoMensagemHistorico;
                if(sessao.ultimasOpcoes.get(message.from)[Number(message.body) - 1] != undefined){
                    conteudoMensagemHistorico = sessao.ultimasOpcoes.get(message.from)[Number(message.body) - 1].conteudo
                }
                else {
                    conteudoMensagemHistorico = message.body;
                }
                let dado = new MensagemHistoricoDto(conteudoMensagemHistorico, message.from, sessao.idUsuario);
                this.hooks.trigger("salvarMensagem", dado);
                let mensagemEnviar = proximaMensagem.data.conteudo;
                let contador = 1;
                if(proximaMensagem.data.inputsFilhos.length == 0){
                    sessao.ultimoIdMensagem.set(message.from, null);
                    sessao.ultimasOpcoes.set(message.from, undefined);
                    sessao.idSetor.set(message.from, undefined);
                    mensagemEnviar += "\nEsta conversa chegou ao fim";
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
        mensagemParametro.idSetor = sessao.idSetor.get(message.from);
        mensagemParametro.numeroContato = message.from;
        if(isNaN(message.body) || sessao.ultimasOpcoes.get(message.from)[Number(message.body) - 1] == undefined){
            mensagemParametro.inputPai = "";
        }else {
            mensagemParametro.inputPai = sessao.ultimasOpcoes.get(message.from)[Number(message.body) - 1].conteudo;
        }
        mensagemParametro.idUsuario = sessao.idUsuario;
        mensagemParametro.idMensagemPai = sessao.ultimoIdMensagem.get(message.from);
        return mensagemParametro;
    }
}

module.exports = Bot;