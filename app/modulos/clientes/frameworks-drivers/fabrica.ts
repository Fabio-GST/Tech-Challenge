import { RepositorioDeClientesLucid } from './persistencia/repositorios/repositorio-de-clientes-lucid.js'
import { CriarCliente } from '../aplicacao/casos-de-uso/criar-cliente.js'
import { AtualizarCliente } from '../aplicacao/casos-de-uso/atualizar-cliente.js'
import { BuscarClientePorDocumento } from '../aplicacao/casos-de-uso/buscar-cliente-por-documento.js'
import { ObterCliente } from '../aplicacao/casos-de-uso/obter-cliente.js'
import { ListarClientes } from '../aplicacao/casos-de-uso/listar-clientes.js'
import { RemoverCliente } from '../aplicacao/casos-de-uso/remover-cliente.js'

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
