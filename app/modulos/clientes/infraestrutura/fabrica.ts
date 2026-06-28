import { RepositorioDeClientesLucid } from './persistencia/repositorios/repositorio-de-clientes-lucid.js'
import {
  CriarCliente,
  AtualizarCliente,
  BuscarClientePorDocumento,
  ObterCliente,
  ListarClientes,
  RemoverCliente,
} from '../aplicacao/casos-de-uso.js'

const repositorio = new RepositorioDeClientesLucid()

export const fabricaClientes = {
  repositorio: () => repositorio,
  criar: () => new CriarCliente(repositorio),
  atualizar: () => new AtualizarCliente(repositorio),
  buscarPorDocumento: () => new BuscarClientePorDocumento(repositorio),
  obter: () => new ObterCliente(repositorio),
  listar: () => new ListarClientes(repositorio),
  remover: () => new RemoverCliente(repositorio),
}
