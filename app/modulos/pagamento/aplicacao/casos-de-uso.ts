import { randomUUID } from 'node:crypto'
import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { RecursoNaoEncontrado } from '#shared/dominio/erros'
import { Dinheiro } from '#shared/dominio/objetos-de-valor/dinheiro'
import { coletarEventosDe } from '#shared/infraestrutura/eventos/coletor-de-eventos'
import type { RepositorioDePagamentos } from '../dominio/repositorios/repositorio-de-pagamentos.js'
import { Pagamento, StatusPagamento } from '../dominio/entidades/pagamento.js'

export interface PagamentoDTO {
  id: string
  ordemId: string
  total: number
  desconto: number
  pago: number
  valorDevido: number
  status: StatusPagamento
  notaFiscalNumero: string | null
}

export function paraDTO(pagamento: Pagamento): PagamentoDTO {
  return {
    id: pagamento.id,
    ordemId: pagamento.ordemId,
    total: pagamento.total.reais,
    desconto: pagamento.desconto.reais,
    pago: pagamento.pago.reais,
    valorDevido: pagamento.valorDevido().reais,
    status: pagamento.status,
    notaFiscalNumero: pagamento.notaFiscalNumero,
  }
}

export interface EntradaGerarCobranca {
  ordemId: string
  total: number
}

export class GerarCobranca implements CasoDeUso<EntradaGerarCobranca, PagamentoDTO> {
  constructor(private readonly repositorio: RepositorioDePagamentos) {}

  async executar(entrada: EntradaGerarCobranca): Promise<PagamentoDTO> {
    const pagamento = Pagamento.gerarCobranca({
      ordemId: entrada.ordemId,
      total: Dinheiro.deReais(entrada.total),
    })
    await this.repositorio.salvar(pagamento)
    await coletarEventosDe(pagamento)
    return paraDTO(pagamento)
  }
}

export interface EntradaAplicarDesconto {
  id: string
  desconto: number
}

export class AplicarDesconto implements CasoDeUso<EntradaAplicarDesconto, PagamentoDTO> {
  constructor(private readonly repositorio: RepositorioDePagamentos) {}

  async executar(entrada: EntradaAplicarDesconto): Promise<PagamentoDTO> {
    const pagamento = await this.buscar(entrada.id)
    pagamento.aplicarDesconto(Dinheiro.deReais(entrada.desconto))
    await this.repositorio.salvar(pagamento)
    await coletarEventosDe(pagamento)
    return paraDTO(pagamento)
  }

  private async buscar(id: string): Promise<Pagamento> {
    const pagamento = await this.repositorio.buscarPorId(id)
    if (!pagamento) {
      throw new RecursoNaoEncontrado('Pagamento', id)
    }
    return pagamento
  }
}

export interface EntradaRegistrarPagamento {
  id: string
  valor: number
}

export class RegistrarPagamento implements CasoDeUso<EntradaRegistrarPagamento, PagamentoDTO> {
  constructor(private readonly repositorio: RepositorioDePagamentos) {}

  async executar(entrada: EntradaRegistrarPagamento): Promise<PagamentoDTO> {
    const pagamento = await this.repositorio.buscarPorId(entrada.id)
    if (!pagamento) {
      throw new RecursoNaoEncontrado('Pagamento', entrada.id)
    }
    pagamento.registrarPagamento(Dinheiro.deReais(entrada.valor))
    await this.repositorio.salvar(pagamento)
    await coletarEventosDe(pagamento)
    return paraDTO(pagamento)
  }
}

/**
 * Emite a Nota Fiscal de um pagamento quitado. Não é chamado dentro de
 * `registrarPagamento`: é acionado pela Política de `pagamento.confirmado`
 * (Fase 2) ou manualmente, garantindo a emissão desacoplada.
 */
export class EmitirNotaFiscal implements CasoDeUso<string, PagamentoDTO> {
  constructor(private readonly repositorio: RepositorioDePagamentos) {}

  async executar(id: string): Promise<PagamentoDTO> {
    const pagamento = await this.repositorio.buscarPorId(id)
    if (!pagamento) {
      throw new RecursoNaoEncontrado('Pagamento', id)
    }
    pagamento.emitirNotaFiscal(`NF-${randomUUID().slice(0, 8).toUpperCase()}`)
    await this.repositorio.salvar(pagamento)
    await coletarEventosDe(pagamento)
    return paraDTO(pagamento)
  }
}

export class ObterPagamento implements CasoDeUso<string, PagamentoDTO> {
  constructor(private readonly repositorio: RepositorioDePagamentos) {}

  async executar(id: string): Promise<PagamentoDTO> {
    const pagamento = await this.repositorio.buscarPorId(id)
    if (!pagamento) {
      throw new RecursoNaoEncontrado('Pagamento', id)
    }
    return paraDTO(pagamento)
  }
}
