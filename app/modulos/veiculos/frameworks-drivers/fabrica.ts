import { fabricaClientes } from '#modulos/clientes/frameworks-drivers/fabrica'
import { RepositorioDeVeiculosLucid } from '../interface-adapters/gateways/repositorio-de-veiculos-lucid.js'
import { CriarVeiculo } from '../use-cases/criar-veiculo.js'
import { AtualizarVeiculo } from '../use-cases/atualizar-veiculo.js'
import { VincularClienteAoVeiculo } from '../use-cases/vincular-cliente-ao-veiculo.js'
import { BuscarVeiculoPorPlaca } from '../use-cases/buscar-veiculo-por-placa.js'
import { ObterVeiculo } from '../use-cases/obter-veiculo.js'
import { ListarVeiculos } from '../use-cases/listar-veiculos.js'
import { RemoverVeiculo } from '../use-cases/remover-veiculo.js'

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
