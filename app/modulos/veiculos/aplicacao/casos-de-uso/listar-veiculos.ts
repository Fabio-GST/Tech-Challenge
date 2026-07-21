import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import type { RepositorioDeVeiculos } from '../../dominio/repositorios/repositorio-de-veiculos.js'
import { paraDTO, type VeiculoDTO } from '../dtos.js'

/** Lista os veículos cadastrados, opcionalmente filtrando por cliente. */
export class ListarVeiculos implements CasoDeUso<{ clienteId?: string } | void, VeiculoDTO[]> {
  constructor(private readonly repositorio: RepositorioDeVeiculos) {}

  async executar(filtro?: { clienteId?: string }): Promise<VeiculoDTO[]> {
    const veiculos = filtro?.clienteId
      ? await this.repositorio.listarPorCliente(filtro.clienteId)
      : await this.repositorio.listar()
    return veiculos.map(paraDTO)
  }
}
