import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { RecursoNaoEncontrado } from '#shared/dominio/erros'
import { coletarEventosDe } from '#shared/aplicacao/coletor-de-eventos'
import type { RepositorioDePecas } from '../../dominio/repositorios/repositorio-de-pecas.js'
import type { RepositorioDeSolicitacoesCompra } from '../../dominio/repositorios/repositorio-de-solicitacoes-compra.js'
import { SolicitacaoDeCompra } from '../../dominio/entidades/solicitacao-de-compra.js'
import { solicitacaoParaDTO, type SolicitacaoCompraDTO } from '../dtos.js'

export interface EntradaSolicitarCompra {
  pecaId: string
  quantidade: number
}

/** Abre uma solicitação de compra para uma peça existente. */
export class SolicitarCompra implements CasoDeUso<EntradaSolicitarCompra, SolicitacaoCompraDTO> {
  constructor(
    private readonly solicitacoes: RepositorioDeSolicitacoesCompra,
    private readonly pecas: RepositorioDePecas
  ) {}

  async executar(entrada: EntradaSolicitarCompra): Promise<SolicitacaoCompraDTO> {
    const peca = await this.pecas.buscarPorId(entrada.pecaId)
    if (!peca) {
      throw new RecursoNaoEncontrado('Peça', entrada.pecaId)
    }
    const solicitacao = SolicitacaoDeCompra.criar({
      pecaId: entrada.pecaId,
      quantidade: entrada.quantidade,
    })
    await this.solicitacoes.salvar(solicitacao)
    await coletarEventosDe(solicitacao)
    return solicitacaoParaDTO(solicitacao)
  }
}
