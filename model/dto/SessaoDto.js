class SessaoDto {
    idSetor;
    // id da ultima mensagem enviada
    idMensagemPai;
    // input recebido pelo usuário
    inputPai;

    constructor(idSetor){
        this.idSetor = idSetor;
        this.idMensagemPai = null;
        this.inputPai = null;
    }
}

module.exports = SessaoDto;