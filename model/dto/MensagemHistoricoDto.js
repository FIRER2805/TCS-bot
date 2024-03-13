class MensagemHistoricoDto{
    conteudo;
    numeroContato;
    idUsuario;

    constructor(conteudo, numeroContato, idUsuario){
        this.conteudo = conteudo;
        this.numeroContato = numeroContato;
        this.idUsuario = idUsuario;
    }
}

module.exports = MensagemHistoricoDto;