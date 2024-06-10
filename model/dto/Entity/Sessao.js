class Sessao {
    idSetor;
    idUsuario;
    ultimoIdMensagem;

    constructor(idSetor, idUsuario){
        this.idSetor = idSetor;
        this.idUsuario = idUsuario;
        this.ultimoIdMensagem = new Map();
    }
}

module.exports = Sessao;