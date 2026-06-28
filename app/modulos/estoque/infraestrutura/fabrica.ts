import { UnidadeDeTrabalho } from '#shared/infraestrutura/unidade-de-trabalho'
import { RepositorioDePecasLucid } from './persistencia/repositorios/repositorio-de-pecas-lucid.js'
import { RepositorioDeSolicitacoesCompraLucid } from './persistencia/repositorios/repositorio-de-solicitacoes-compra-lucid.js'
import {
  CriarPeca,
  AtualizarPeca,
  AjustarEstoque,
  ReservarPeca,
  LiberarReservaDePeca,
  UtilizarPeca,
  DefinirEstoqueMinimo,
  ObterPeca,
  ListarPecas,
  RemoverPeca,
} from '../aplicacao/casos-de-uso.js'
import { SolicitarCompra, ReceberCompra } from '../aplicacao/compras.js'

const repositorio = new RepositorioDePecasLucid()
const solicitacoes = new RepositorioDeSolicitacoesCompraLucid()
const unidadeDeTrabalho = new UnidadeDeTrabalho()

export const fabricaEstoque = {
  repositorio: () => repositorio,
  criar: () => new CriarPeca(repositorio),
  atualizar: () => new AtualizarPeca(repositorio),
  ajustarEstoque: () => new AjustarEstoque(repositorio),
  reservar: () => new ReservarPeca(repositorio),
  liberarReserva: () => new LiberarReservaDePeca(repositorio),
  utilizar: () => new UtilizarPeca(repositorio),
  definirEstoqueMinimo: () => new DefinirEstoqueMinimo(repositorio),
  solicitarCompra: () => new SolicitarCompra(solicitacoes, repositorio),
  receberCompra: () => new ReceberCompra(solicitacoes, repositorio, unidadeDeTrabalho),
  obter: () => new ObterPeca(repositorio),
  listar: () => new ListarPecas(repositorio),
  remover: () => new RemoverPeca(repositorio),
}
