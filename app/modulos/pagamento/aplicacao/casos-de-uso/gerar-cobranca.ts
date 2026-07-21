import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { Dinheiro } from '#shared/dominio/objetos-de-valor/dinheiro'
import { coletarEventosDe } from '#shared/aplicacao/coletor-de-eventos'
import type { RepositorioDePagamentos } from '../../dominio/repositorios/repositorio-de-pagamentos.js'
import { Pagamento } from '../../dominio/entidades/pagamento.js'
import { paraDTO, type PagamentoDTO } from '../dtos.js'

export interface EntradaGerarCobranca {
  ordemId: string
  total: number
}

/** Gera a cobrança de uma ordem de serviço, criando o pagamento pendente. */
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
