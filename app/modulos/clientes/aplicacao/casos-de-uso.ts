import type { CasoDeUso } from '#shared/aplicacao/caso-de-uso'
import { ConflitoDeRecurso, RecursoNaoEncontrado } from '#shared/dominio/erros'
import { coletarEventosDe } from '#shared/infraestrutura/eventos/coletor-de-eventos'
import { barramentoDeEventos } from '#shared/infraestrutura/eventos/barramento-de-eventos'
import type { RepositorioDeClientes } from '../dominio/repositorios/repositorio-de-clientes.js'
import { Cliente } from '../dominio/entidades/cliente.js'
import { Documento } from '../dominio/objetos-de-valor/documento.js'
import { BuscaDeClienteRealizada } from '../dominio/eventos/busca-de-cliente-realizada.js'

export interface ClienteDTO {
  id: string
  nome: string
  documento: string
  tipoDocumento: 'CPF' | 'CNPJ'
  telefone: string | null
  email: string | null
}

export function paraDTO(cliente: Cliente): ClienteDTO {
  return {
    id: cliente.id,
    nome: cliente.nome,
    documento: cliente.documento.valor,
    tipoDocumento: cliente.documento.tipo,
    telefone: cliente.telefone,
    email: cliente.email,
  }
}

export interface EntradaCriarCliente {
  nome: string
  documento: string
  telefone?: string | null
  email?: string | null
}

export class CriarCliente implements CasoDeUso<EntradaCriarCliente, ClienteDTO> {
  constructor(private readonly repositorio: RepositorioDeClientes) {}

  async executar(entrada: EntradaCriarCliente): Promise<ClienteDTO> {
    const documento = Documento.criar(entrada.documento)

    if (await this.repositorio.existeComDocumento(documento)) {
      throw new ConflitoDeRecurso(`Já existe um cliente com o documento ${documento.valor}.`)
    }

    const cliente = Cliente.criar({
      nome: entrada.nome,
      documento,
      telefone: entrada.telefone,
      email: entrada.email,
    })
    await this.repositorio.salvar(cliente)
    await coletarEventosDe(cliente)
    return paraDTO(cliente)
  }
}

/**
 * Identifica um cliente pelo documento (CPF/CNPJ). Publica
 * `clientes.busca-realizada` indicando se foi encontrado — base para a Política
 * "se não encontrado, dispara cadastro".
 */
export class BuscarClientePorDocumento implements CasoDeUso<string, ClienteDTO | null> {
  constructor(private readonly repositorio: RepositorioDeClientes) {}

  async executar(documentoBruto: string): Promise<ClienteDTO | null> {
    const documento = Documento.criar(documentoBruto)
    const cliente = await this.repositorio.buscarPorDocumento(documento)
    await barramentoDeEventos.publicar([
      new BuscaDeClienteRealizada(documento.valor, cliente !== null, cliente?.id),
    ])
    return cliente ? paraDTO(cliente) : null
  }
}

export interface EntradaAtualizarCliente {
  id: string
  nome?: string
  telefone?: string | null
  email?: string | null
}

export class AtualizarCliente implements CasoDeUso<EntradaAtualizarCliente, ClienteDTO> {
  constructor(private readonly repositorio: RepositorioDeClientes) {}

  async executar(entrada: EntradaAtualizarCliente): Promise<ClienteDTO> {
    const cliente = await this.repositorio.buscarPorId(entrada.id)
    if (!cliente) {
      throw new RecursoNaoEncontrado('Cliente', entrada.id)
    }
    cliente.atualizar({ nome: entrada.nome, telefone: entrada.telefone, email: entrada.email })
    await this.repositorio.salvar(cliente)
    return paraDTO(cliente)
  }
}

export class ObterCliente implements CasoDeUso<string, ClienteDTO> {
  constructor(private readonly repositorio: RepositorioDeClientes) {}

  async executar(id: string): Promise<ClienteDTO> {
    const cliente = await this.repositorio.buscarPorId(id)
    if (!cliente) {
      throw new RecursoNaoEncontrado('Cliente', id)
    }
    return paraDTO(cliente)
  }
}

export class ListarClientes implements CasoDeUso<void, ClienteDTO[]> {
  constructor(private readonly repositorio: RepositorioDeClientes) {}

  async executar(): Promise<ClienteDTO[]> {
    const clientes = await this.repositorio.listar()
    return clientes.map(paraDTO)
  }
}

export class RemoverCliente implements CasoDeUso<string, void> {
  constructor(private readonly repositorio: RepositorioDeClientes) {}

  async executar(id: string): Promise<void> {
    const cliente = await this.repositorio.buscarPorId(id)
    if (!cliente) {
      throw new RecursoNaoEncontrado('Cliente', id)
    }
    await this.repositorio.remover(id)
  }
}
