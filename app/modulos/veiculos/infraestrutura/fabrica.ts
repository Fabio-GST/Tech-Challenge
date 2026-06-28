import { fabricaClientes } from '#modulos/clientes/infraestrutura/fabrica'
import { RepositorioDeVeiculosLucid } from './persistencia/repositorios/repositorio-de-veiculos-lucid.js'
import {
  CriarVeiculo,
  AtualizarVeiculo,
  VincularClienteAoVeiculo,
  BuscarVeiculoPorPlaca,
  ObterVeiculo,
  ListarVeiculos,
  RemoverVeiculo,
} from '../aplicacao/casos-de-uso.js'

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
