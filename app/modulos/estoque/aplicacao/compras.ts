import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { RecursoNaoEncontrado } from '#shared/dominio/erros'
import { UnidadeDeTrabalho } from '#shared/infraestrutura/unidade-de-trabalho'
import { coletarEventosDe } from '#shared/infraestrutura/eventos/coletor-de-eventos'
import type { RepositorioDePecas } from '../dominio/repositorios/repositorio-de-pecas.js'
import type { RepositorioDeSolicitacoesCompra } from '../dominio/repositorios/repositorio-de-solicitacoes-compra.js'
import {
  SolicitacaoDeCompra,
  StatusSolicitacao,
} from '../dominio/entidades/solicitacao-de-compra.js'

export interface SolicitacaoCompraDTO {
  id: string
  pecaId: string
  quantidade: number
  status: StatusSolicitacao
  criadaEm: string
  recebidaEm: string | null
}

export function paraDTO(solicitacao: SolicitacaoDeCompra): SolicitacaoCompraDTO {
  return {
    id: solicitacao.id,
    pecaId: solicitacao.pecaId,
    quantidade: solicitacao.quantidade,
    status: solicitacao.status,
    criadaEm: solicitacao.criadaEm.toISO() ?? '',
    recebidaEm: solicitacao.recebidaEm?.toISO() ?? null,
  }
}

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
    return paraDTO(solicitacao)
  }
}

/**
 * Recebe uma compra: marca a solicitação como recebida e repõe o estoque da
 * peça, de forma atômica (Unidade de Trabalho). Publica `estoque.peca-recebida`.
 */
export class ReceberCompra implements CasoDeUso<string, SolicitacaoCompraDTO> {
  constructor(
    private readonly solicitacoes: RepositorioDeSolicitacoesCompra,
    private readonly pecas: RepositorioDePecas,
    private readonly unidadeDeTrabalho: UnidadeDeTrabalho
  ) {}

  async executar(solicitacaoId: string): Promise<SolicitacaoCompraDTO> {
    return this.unidadeDeTrabalho.executar(async () => {
      const solicitacao = await this.solicitacoes.buscarPorId(solicitacaoId)
      if (!solicitacao) {
        throw new RecursoNaoEncontrado('Solicitação de compra', solicitacaoId)
      }
      const peca = await this.pecas.buscarPorId(solicitacao.pecaId)
      /* c8 ignore next 3 -- guarda defensiva: a FK garante que a peça da solicitação existe */
      if (!peca) {
        throw new RecursoNaoEncontrado('Peça', solicitacao.pecaId)
      }

      solicitacao.receber()
      peca.receber(solicitacao.quantidade)

      await this.solicitacoes.salvar(solicitacao)
      await this.pecas.salvar(peca)
      await coletarEventosDe(solicitacao)
      await coletarEventosDe(peca)
      return paraDTO(solicitacao)
    })
  }
}
