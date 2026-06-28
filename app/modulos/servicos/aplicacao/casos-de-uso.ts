import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { RecursoNaoEncontrado } from '#shared/dominio/erros'
import { Dinheiro } from '#shared/dominio/objetos-de-valor/dinheiro'
import { coletarEventosDe } from '#shared/infraestrutura/eventos/coletor-de-eventos'
import type { RepositorioDeServicos } from '../dominio/repositorios/repositorio-de-servicos.js'
import { Servico } from '../dominio/entidades/servico.js'

export interface ServicoDTO {
  id: string
  nome: string
  descricao: string | null
  preco: number
  ativo: boolean
  tempoEstimadoMinutos: number | null
}

export function paraDTO(servico: Servico): ServicoDTO {
  return {
    id: servico.id,
    nome: servico.nome,
    descricao: servico.descricao,
    preco: servico.preco.reais,
    ativo: servico.ativo,
    tempoEstimadoMinutos: servico.tempoEstimadoMinutos,
  }
}

export interface EntradaCriarServico {
  nome: string
  descricao?: string | null
  preco: number
  tempoEstimadoMinutos?: number | null
}

export class CriarServico implements CasoDeUso<EntradaCriarServico, ServicoDTO> {
  constructor(private readonly repositorio: RepositorioDeServicos) {}

  async executar(entrada: EntradaCriarServico): Promise<ServicoDTO> {
    const servico = Servico.criar({
      nome: entrada.nome,
      descricao: entrada.descricao,
      preco: Dinheiro.deReais(entrada.preco),
      tempoEstimadoMinutos: entrada.tempoEstimadoMinutos,
    })
    await this.repositorio.salvar(servico)
    await coletarEventosDe(servico)
    return paraDTO(servico)
  }
}

export interface EntradaAtualizarServico {
  id: string
  nome?: string
  descricao?: string | null
  preco?: number
}

export class AtualizarServico implements CasoDeUso<EntradaAtualizarServico, ServicoDTO> {
  constructor(private readonly repositorio: RepositorioDeServicos) {}

  async executar(entrada: EntradaAtualizarServico): Promise<ServicoDTO> {
    const servico = await this.repositorio.buscarPorId(entrada.id)
    if (!servico) {
      throw new RecursoNaoEncontrado('Serviço', entrada.id)
    }
    servico.atualizar({
      nome: entrada.nome,
      descricao: entrada.descricao,
      preco: entrada.preco !== undefined ? Dinheiro.deReais(entrada.preco) : undefined,
    })
    await this.repositorio.salvar(servico)
    await coletarEventosDe(servico)
    return paraDTO(servico)
  }
}

export class InativarServico implements CasoDeUso<string, ServicoDTO> {
  constructor(private readonly repositorio: RepositorioDeServicos) {}

  async executar(id: string): Promise<ServicoDTO> {
    const servico = await this.repositorio.buscarPorId(id)
    if (!servico) {
      throw new RecursoNaoEncontrado('Serviço', id)
    }
    servico.inativar()
    await this.repositorio.salvar(servico)
    await coletarEventosDe(servico)
    return paraDTO(servico)
  }
}

export class ReativarServico implements CasoDeUso<string, ServicoDTO> {
  constructor(private readonly repositorio: RepositorioDeServicos) {}

  async executar(id: string): Promise<ServicoDTO> {
    const servico = await this.repositorio.buscarPorId(id)
    if (!servico) {
      throw new RecursoNaoEncontrado('Serviço', id)
    }
    servico.reativar()
    await this.repositorio.salvar(servico)
    await coletarEventosDe(servico)
    return paraDTO(servico)
  }
}

export interface EntradaDefinirTempoEstimado {
  id: string
  tempoEstimadoMinutos: number
}

export class DefinirTempoEstimado implements CasoDeUso<EntradaDefinirTempoEstimado, ServicoDTO> {
  constructor(private readonly repositorio: RepositorioDeServicos) {}

  async executar(entrada: EntradaDefinirTempoEstimado): Promise<ServicoDTO> {
    const servico = await this.repositorio.buscarPorId(entrada.id)
    if (!servico) {
      throw new RecursoNaoEncontrado('Serviço', entrada.id)
    }
    servico.definirTempoEstimado(entrada.tempoEstimadoMinutos)
    await this.repositorio.salvar(servico)
    await coletarEventosDe(servico)
    return paraDTO(servico)
  }
}

export class ObterServico implements CasoDeUso<string, ServicoDTO> {
  constructor(private readonly repositorio: RepositorioDeServicos) {}

  async executar(id: string): Promise<ServicoDTO> {
    const servico = await this.repositorio.buscarPorId(id)
    if (!servico) {
      throw new RecursoNaoEncontrado('Serviço', id)
    }
    return paraDTO(servico)
  }
}

export class ListarServicos implements CasoDeUso<void, ServicoDTO[]> {
  constructor(private readonly repositorio: RepositorioDeServicos) {}

  async executar(): Promise<ServicoDTO[]> {
    const servicos = await this.repositorio.listar()
    return servicos.map(paraDTO)
  }
}

export class RemoverServico implements CasoDeUso<string, void> {
  constructor(private readonly repositorio: RepositorioDeServicos) {}

  async executar(id: string): Promise<void> {
    const servico = await this.repositorio.buscarPorId(id)
    if (!servico) {
      throw new RecursoNaoEncontrado('Serviço', id)
    }
    await this.repositorio.remover(id)
  }
}
