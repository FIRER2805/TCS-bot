class Sessao {
    idSetor;
    idUsuario;
    historicoContatos;

    constructor(idSetor, idUsuario){
        this.idSetor = idSetor;
        this.idUsuario = idUsuario;
        this.historicoContatos = new Map();
    }
}

module.exports = Sessao;