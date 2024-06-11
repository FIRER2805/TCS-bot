class Sessao {
    idSetor;
    idUsuario;
    ultimoIdMensagem;
    ultimasOpcoes;

    constructor(idSetor, idUsuario){
        this.idSetor = idSetor;
        this.idUsuario = idUsuario;
        this.ultimoIdMensagem = new Map();
        this.ultimasOpcoes = new Map();
    }
}

module.exports = Sessao;