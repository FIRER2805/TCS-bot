class Sessao {
    idSetor;
    idUsuario;
    ultimoIdMensagem;
    ultimasOpcoes;

    constructor(idUsuario){
        this.idUsuario = idUsuario;
        this.idSetor = new Map();
        this.ultimoIdMensagem = new Map();
        this.ultimasOpcoes = new Map();
    }
}

module.exports = Sessao;