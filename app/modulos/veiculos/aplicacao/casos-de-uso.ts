import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { ConflitoDeRecurso, RecursoNaoEncontrado } from '#shared/dominio/erros'
import { coletarEventosDe } from '#shared/infraestrutura/eventos/coletor-de-eventos'
import { barramentoDeEventos } from '#shared/infraestrutura/eventos/barramento-de-eventos'
import type { RepositorioDeClientes } from '#modulos/clientes/dominio/repositorios/repositorio-de-clientes'
import type { RepositorioDeVeiculos } from '../dominio/repositorios/repositorio-de-veiculos.js'
import { Veiculo } from '../dominio/entidades/veiculo.js'
import { Placa } from '../dominio/objetos-de-valor/placa.js'
import { BuscaDeVeiculoRealizada } from '../dominio/eventos/busca-de-veiculo-realizada.js'

export interface VeiculoDTO {
  id: string
  clienteId: string
  placa: string
  marca: string
  modelo: string
  ano: number
}

export function paraDTO(veiculo: Veiculo): VeiculoDTO {
  return {
    id: veiculo.id,
    clienteId: veiculo.clienteId,
    placa: veiculo.placa.valor,
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    ano: veiculo.ano,
  }
}

export interface EntradaCriarVeiculo {
  clienteId: string
  placa: string
  marca: string
  modelo: string
  ano: number
}

export class CriarVeiculo implements CasoDeUso<EntradaCriarVeiculo, VeiculoDTO> {
  constructor(
    private readonly repositorio: RepositorioDeVeiculos,
    private readonly repositorioClientes: RepositorioDeClientes
  ) {}

  async executar(entrada: EntradaCriarVeiculo): Promise<VeiculoDTO> {
    const cliente = await this.repositorioClientes.buscarPorId(entrada.clienteId)
    if (!cliente) {
      throw new RecursoNaoEncontrado('Cliente', entrada.clienteId)
    }

    const placa = Placa.criar(entrada.placa)
    if (await this.repositorio.existeComPlaca(placa)) {
      throw new ConflitoDeRecurso(`Já existe um veículo com a placa ${placa.valor}.`)
    }

    const veiculo = Veiculo.criar({
      clienteId: entrada.clienteId,
      placa,
      marca: entrada.marca,
      modelo: entrada.modelo,
      ano: entrada.ano,
    })
    await this.repositorio.salvar(veiculo)
    await coletarEventosDe(veiculo)
    return paraDTO(veiculo)
  }
}

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

/**
 * Busca um veículo pela placa. Publica `veiculos.busca-realizada` indicando se
 * foi encontrado — base para a Política "se não encontrado, dispara cadastro".
 */
export class BuscarVeiculoPorPlaca implements CasoDeUso<string, VeiculoDTO | null> {
  constructor(private readonly repositorio: RepositorioDeVeiculos) {}

  async executar(placaBruta: string): Promise<VeiculoDTO | null> {
    const placa = Placa.criar(placaBruta)
    const veiculo = await this.repositorio.buscarPorPlaca(placa)
    await barramentoDeEventos.publicar([
      new BuscaDeVeiculoRealizada(placa.valor, veiculo !== null, veiculo?.id),
    ])
    return veiculo ? paraDTO(veiculo) : null
  }
}

export interface EntradaAtualizarVeiculo {
  id: string
  marca?: string
  modelo?: string
  ano?: number
}

export class AtualizarVeiculo implements CasoDeUso<EntradaAtualizarVeiculo, VeiculoDTO> {
  constructor(private readonly repositorio: RepositorioDeVeiculos) {}

  async executar(entrada: EntradaAtualizarVeiculo): Promise<VeiculoDTO> {
    const veiculo = await this.repositorio.buscarPorId(entrada.id)
    if (!veiculo) {
      throw new RecursoNaoEncontrado('Veículo', entrada.id)
    }
    veiculo.atualizar({ marca: entrada.marca, modelo: entrada.modelo, ano: entrada.ano })
    await this.repositorio.salvar(veiculo)
    return paraDTO(veiculo)
  }
}

export class ObterVeiculo implements CasoDeUso<string, VeiculoDTO> {
  constructor(private readonly repositorio: RepositorioDeVeiculos) {}

  async executar(id: string): Promise<VeiculoDTO> {
    const veiculo = await this.repositorio.buscarPorId(id)
    if (!veiculo) {
      throw new RecursoNaoEncontrado('Veículo', id)
    }
    return paraDTO(veiculo)
  }
}

export class ListarVeiculos implements CasoDeUso<{ clienteId?: string } | void, VeiculoDTO[]> {
  constructor(private readonly repositorio: RepositorioDeVeiculos) {}

  async executar(filtro?: { clienteId?: string }): Promise<VeiculoDTO[]> {
    const veiculos = filtro?.clienteId
      ? await this.repositorio.listarPorCliente(filtro.clienteId)
      : await this.repositorio.listar()
    return veiculos.map(paraDTO)
  }
}

export class RemoverVeiculo implements CasoDeUso<string, void> {
  constructor(private readonly repositorio: RepositorioDeVeiculos) {}

  async executar(id: string): Promise<void> {
    const veiculo = await this.repositorio.buscarPorId(id)
    if (!veiculo) {
      throw new RecursoNaoEncontrado('Veículo', id)
    }
    await this.repositorio.remover(id)
  }
}
