export type PlanilhaMercosType = {
    codigo: string;
    nome: string;
    ativo: 'True' | 'False';
    observacoes: string;
    imagem_principal: string;
    saldo_estoque: number;
    categoria: string;
}