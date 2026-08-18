import type { CasoDeUso } from '#shared/use-cases/caso-de-uso'
import { RecursoNaoEncontrado } from '#shared/entities/erros'
import { coletarEventosDe } from '#shared/use-cases/coletor-de-eventos'
import type { RepositorioDeClientes } from '#modulos/clientes/use-cases/ports/repositorio-de-clientes'
import type { RepositorioDeVeiculos } from '../../dominio/repositorios/repositorio-de-veiculos.js'
import { paraDTO, type VeiculoDTO } from '../dtos.js'

export interface EntradaVincularCliente {
  id: string
  clienteId: string
}

/** Vincula (ou transfere) um veículo existente a um cliente. */
export class VincularClienteAoVeiculo implements CasoDeUso<EntradaVincularCliente, VeiculoDTO> {
  constructor(
    private readonly repositorio: RepositorioDeVeiculos,
    private readonly repositorioClientes: RepositorioDeClientes
  ) {}

  async executar(entrada: EntradaVincularCliente): Promise<VeiculoDTO> {
    const veiculo = await this.repositorio.buscarPorId(entrada.id)
    if (!veiculo) {
      throw new RecursoNaoEncontrado('Veículo', entrada.id)
    }
    const cliente = await this.repositorioClientes.buscarPorId(entrada.clienteId)
    if (!cliente) {
      throw new RecursoNaoEncontrado('Cliente', entrada.clienteId)
    }
    veiculo.vincularCliente(entrada.clienteId)
    await this.repositorio.salvar(veiculo)
    await coletarEventosDe(veiculo)
    return paraDTO(veiculo)
  }
}
