import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { RecursoNaoEncontrado } from '#shared/dominio/erros'
import { Dinheiro } from '#shared/dominio/objetos-de-valor/dinheiro'
import { coletarEventosDe } from '#shared/infraestrutura/eventos/coletor-de-eventos'
import type { RepositorioDePecas } from '../dominio/repositorios/repositorio-de-pecas.js'
import { Peca } from '../dominio/entidades/peca.js'
import { QuantidadeEstoque } from '../dominio/objetos-de-valor/quantidade-estoque.js'

export interface PecaDTO {
  id: string
  nome: string
  descricao: string | null
  preco: number
  quantidadeEstoque: number
  quantidadeReservada: number
  estoqueMinimo: number
}

export function paraDTO(peca: Peca): PecaDTO {
  return {
    id: peca.id,
    nome: peca.nome,
    descricao: peca.descricao,
    preco: peca.preco.reais,
    quantidadeEstoque: peca.quantidadeEstoque.valor,
    quantidadeReservada: peca.quantidadeReservada,
    estoqueMinimo: peca.estoqueMinimo,
  }
}

export interface EntradaCriarPeca {
  nome: string
  descricao?: string | null
  preco: number
  quantidadeEstoque: number
  estoqueMinimo?: number
}

export class CriarPeca implements CasoDeUso<EntradaCriarPeca, PecaDTO> {
  constructor(private readonly repositorio: RepositorioDePecas) {}

  async executar(entrada: EntradaCriarPeca): Promise<PecaDTO> {
    const peca = Peca.criar({
      nome: entrada.nome,
      descricao: entrada.descricao,
      preco: Dinheiro.deReais(entrada.preco),
      quantidadeEstoque: QuantidadeEstoque.criar(entrada.quantidadeEstoque),
      estoqueMinimo: entrada.estoqueMinimo,
    })
    await this.repositorio.salvar(peca)
    await coletarEventosDe(peca)
    return paraDTO(peca)
  }
}

export interface EntradaAtualizarPeca {
  id: string
  nome?: string
  descricao?: string | null
  preco?: number
}

export class AtualizarPeca implements CasoDeUso<EntradaAtualizarPeca, PecaDTO> {
  constructor(private readonly repositorio: RepositorioDePecas) {}

  async executar(entrada: EntradaAtualizarPeca): Promise<PecaDTO> {
    const peca = await this.buscar(entrada.id)
    peca.atualizar({
      nome: entrada.nome,
      descricao: entrada.descricao,
      preco: entrada.preco !== undefined ? Dinheiro.deReais(entrada.preco) : undefined,
    })
    await this.repositorio.salvar(peca)
    return paraDTO(peca)
  }

  private async buscar(id: string): Promise<Peca> {
    const peca = await this.repositorio.buscarPorId(id)
    if (!peca) {
      throw new RecursoNaoEncontrado('Peça', id)
    }
    return peca
  }
}

export interface EntradaAjustarEstoque {
  id: string
  quantidade: number
}

/** Define a quantidade absoluta disponível de uma peça em estoque. */
export class AjustarEstoque implements CasoDeUso<EntradaAjustarEstoque, PecaDTO> {
  constructor(private readonly repositorio: RepositorioDePecas) {}

  async executar(entrada: EntradaAjustarEstoque): Promise<PecaDTO> {
    const peca = await this.repositorio.buscarPorId(entrada.id)
    if (!peca) {
      throw new RecursoNaoEncontrado('Peça', entrada.id)
    }
    peca.definirEstoque(entrada.quantidade)
    await this.repositorio.salvar(peca)
    await coletarEventosDe(peca)
    return paraDTO(peca)
  }
}

export interface EntradaMovimentarPeca {
  id: string
  quantidade: number
}

/** Reserva unidades de uma peça (bloqueia para uma OS). */
export class ReservarPeca implements CasoDeUso<EntradaMovimentarPeca, PecaDTO> {
  constructor(private readonly repositorio: RepositorioDePecas) {}

  async executar(entrada: EntradaMovimentarPeca): Promise<PecaDTO> {
    const peca = await this.repositorio.buscarPorId(entrada.id)
    if (!peca) {
      throw new RecursoNaoEncontrado('Peça', entrada.id)
    }
    peca.reservar(entrada.quantidade)
    await this.repositorio.salvar(peca)
    await coletarEventosDe(peca)
    return paraDTO(peca)
  }
}

/** Libera uma reserva, devolvendo as unidades ao disponível. */
export class LiberarReservaDePeca implements CasoDeUso<EntradaMovimentarPeca, PecaDTO> {
  constructor(private readonly repositorio: RepositorioDePecas) {}

  async executar(entrada: EntradaMovimentarPeca): Promise<PecaDTO> {
    const peca = await this.repositorio.buscarPorId(entrada.id)
    if (!peca) {
      throw new RecursoNaoEncontrado('Peça', entrada.id)
    }
    peca.liberarReserva(entrada.quantidade)
    await this.repositorio.salvar(peca)
    await coletarEventosDe(peca)
    return paraDTO(peca)
  }
}

/** Consome unidades reservadas de uma peça (baixa efetiva). */
export class UtilizarPeca implements CasoDeUso<EntradaMovimentarPeca, PecaDTO> {
  constructor(private readonly repositorio: RepositorioDePecas) {}

  async executar(entrada: EntradaMovimentarPeca): Promise<PecaDTO> {
    const peca = await this.repositorio.buscarPorId(entrada.id)
    if (!peca) {
      throw new RecursoNaoEncontrado('Peça', entrada.id)
    }
    peca.utilizar(entrada.quantidade)
    await this.repositorio.salvar(peca)
    await coletarEventosDe(peca)
    return paraDTO(peca)
  }
}

export interface EntradaDefinirEstoqueMinimo {
  id: string
  estoqueMinimo: number
}

export class DefinirEstoqueMinimo implements CasoDeUso<EntradaDefinirEstoqueMinimo, PecaDTO> {
  constructor(private readonly repositorio: RepositorioDePecas) {}

  async executar(entrada: EntradaDefinirEstoqueMinimo): Promise<PecaDTO> {
    const peca = await this.repositorio.buscarPorId(entrada.id)
    if (!peca) {
      throw new RecursoNaoEncontrado('Peça', entrada.id)
    }
    peca.definirEstoqueMinimo(entrada.estoqueMinimo)
    await this.repositorio.salvar(peca)
    await coletarEventosDe(peca)
    return paraDTO(peca)
  }
}

export class ObterPeca implements CasoDeUso<string, PecaDTO> {
  constructor(private readonly repositorio: RepositorioDePecas) {}

  async executar(id: string): Promise<PecaDTO> {
    const peca = await this.repositorio.buscarPorId(id)
    if (!peca) {
      throw new RecursoNaoEncontrado('Peça', id)
    }
    return paraDTO(peca)
  }
}

export class ListarPecas implements CasoDeUso<void, PecaDTO[]> {
  constructor(private readonly repositorio: RepositorioDePecas) {}

  async executar(): Promise<PecaDTO[]> {
    const pecas = await this.repositorio.listar()
    return pecas.map(paraDTO)
  }
}

export class RemoverPeca implements CasoDeUso<string, void> {
  constructor(private readonly repositorio: RepositorioDePecas) {}

  async executar(id: string): Promise<void> {
    const peca = await this.repositorio.buscarPorId(id)
    if (!peca) {
      throw new RecursoNaoEncontrado('Peça', id)
    }
    await this.repositorio.remover(id)
  }
}
