import { fabricaClientes } from '#modulos/clientes/frameworks-drivers/fabrica'
import { RepositorioDeVeiculosLucid } from './persistencia/repositorios/repositorio-de-veiculos-lucid.js'
import { CriarVeiculo } from '../aplicacao/casos-de-uso/criar-veiculo.js'
import { AtualizarVeiculo } from '../aplicacao/casos-de-uso/atualizar-veiculo.js'
import { VincularClienteAoVeiculo } from '../aplicacao/casos-de-uso/vincular-cliente-ao-veiculo.js'
import { BuscarVeiculoPorPlaca } from '../aplicacao/casos-de-uso/buscar-veiculo-por-placa.js'
import { ObterVeiculo } from '../aplicacao/casos-de-uso/obter-veiculo.js'
import { ListarVeiculos } from '../aplicacao/casos-de-uso/listar-veiculos.js'
import { RemoverVeiculo } from '../aplicacao/casos-de-uso/remover-veiculo.js'

const repositorio = new RepositorioDeVeiculosLucid()

export const fabricaVeiculos = {
  repositorio: () => repositorio,
  criar: () => new CriarVeiculo(repositorio, fabricaClientes.repositorio()),
  atualizar: () => new AtualizarVeiculo(repositorio),
  vincularCliente: () => new VincularClienteAoVeiculo(repositorio, fabricaClientes.repositorio()),
  buscarPorPlaca: () => new BuscarVeiculoPorPlaca(repositorio),
  obter: () => new ObterVeiculo(repositorio),
  listar: () => new ListarVeiculos(repositorio),
  remover: () => new RemoverVeiculo(repositorio),
}
