import { RepositorioDeClientesLucid } from '../interface-adapters/gateways/repositorio-de-clientes-lucid.js'
import { CriarCliente } from '../use-cases/criar-cliente.js'
import { AtualizarCliente } from '../use-cases/atualizar-cliente.js'
import { BuscarClientePorDocumento } from '../use-cases/buscar-cliente-por-documento.js'
import { ObterCliente } from '../use-cases/obter-cliente.js'
import { ListarClientes } from '../use-cases/listar-clientes.js'
import { RemoverCliente } from '../use-cases/remover-cliente.js'

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
