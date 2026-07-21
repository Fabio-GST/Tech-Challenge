import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import type { RepositorioDePecas } from '../../dominio/repositorios/repositorio-de-pecas.js'
import { paraDTO, type PecaDTO } from '../dtos.js'

/** Lista todas as peças do estoque. */
export class ListarPecas implements CasoDeUso<void, PecaDTO[]> {
  constructor(private readonly repositorio: RepositorioDePecas) {}

  async executar(): Promise<PecaDTO[]> {
    const pecas = await this.repositorio.listar()
    return pecas.map(paraDTO)
  }
}
