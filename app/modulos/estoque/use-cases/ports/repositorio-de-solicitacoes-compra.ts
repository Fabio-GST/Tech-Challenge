import { SolicitacaoDeCompra } from '../entidades/solicitacao-de-compra.js'

export interface RepositorioDeSolicitacoesCompra {
  salvar(solicitacao: SolicitacaoDeCompra): Promise<void>
  buscarPorId(id: string): Promise<SolicitacaoDeCompra | null>
  listar(): Promise<SolicitacaoDeCompra[]>
}
