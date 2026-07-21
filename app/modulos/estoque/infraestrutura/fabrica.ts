import { UnidadeDeTrabalhoLucid } from '#shared/infraestrutura/unidade-de-trabalho'
import { RepositorioDePecasLucid } from './persistencia/repositorios/repositorio-de-pecas-lucid.js'
import { RepositorioDeSolicitacoesCompraLucid } from './persistencia/repositorios/repositorio-de-solicitacoes-compra-lucid.js'
import { CriarPeca } from '../aplicacao/casos-de-uso/criar-peca.js'
import { AtualizarPeca } from '../aplicacao/casos-de-uso/atualizar-peca.js'
import { AjustarEstoque } from '../aplicacao/casos-de-uso/ajustar-estoque.js'
import { ReservarPeca } from '../aplicacao/casos-de-uso/reservar-peca.js'
import { LiberarReservaDePeca } from '../aplicacao/casos-de-uso/liberar-reserva-de-peca.js'
import { UtilizarPeca } from '../aplicacao/casos-de-uso/utilizar-peca.js'
import { DefinirEstoqueMinimo } from '../aplicacao/casos-de-uso/definir-estoque-minimo.js'
import { ObterPeca } from '../aplicacao/casos-de-uso/obter-peca.js'
import { ListarPecas } from '../aplicacao/casos-de-uso/listar-pecas.js'
import { RemoverPeca } from '../aplicacao/casos-de-uso/remover-peca.js'
import { SolicitarCompra } from '../aplicacao/casos-de-uso/solicitar-compra.js'
import { ReceberCompra } from '../aplicacao/casos-de-uso/receber-compra.js'

const repositorio = new RepositorioDePecasLucid()
const solicitacoes = new RepositorioDeSolicitacoesCompraLucid()
const unidadeDeTrabalho = new UnidadeDeTrabalhoLucid()

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
