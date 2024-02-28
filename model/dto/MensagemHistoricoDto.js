class MensagemHistoricoDto{
    conteudo;
    numeroContato;

    constructor(conteudo, numeroContato){
        this.conteudo = conteudo;
        this.numeroContato = numeroContato;
    }
}

module.exports = MensagemHistoricoDto;