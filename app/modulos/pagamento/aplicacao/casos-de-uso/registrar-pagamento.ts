import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { RecursoNaoEncontrado } from '#shared/dominio/erros'
import { Dinheiro } from '#shared/dominio/objetos-de-valor/dinheiro'
import { coletarEventosDe } from '#shared/aplicacao/coletor-de-eventos'
import type { RepositorioDePagamentos } from '../../dominio/repositorios/repositorio-de-pagamentos.js'
import { paraDTO, type PagamentoDTO } from '../dtos.js'

export interface EntradaRegistrarPagamento {
  id: string
  valor: number
}

/** Registra um valor pago em um pagamento existente. */
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
