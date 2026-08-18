import { UnidadeDeTrabalhoLucid } from '#shared/frameworks-drivers/unidade-de-trabalho'
import { RepositorioDePecasLucid } from '../interface-adapters/gateways/repositorio-de-pecas-lucid.js'
import { RepositorioDeSolicitacoesCompraLucid } from '../interface-adapters/gateways/repositorio-de-solicitacoes-compra-lucid.js'
import { CriarPeca } from '../use-cases/criar-peca.js'
import { AtualizarPeca } from '../use-cases/atualizar-peca.js'
import { AjustarEstoque } from '../use-cases/ajustar-estoque.js'
import { ReservarPeca } from '../use-cases/reservar-peca.js'
import { LiberarReservaDePeca } from '../use-cases/liberar-reserva-de-peca.js'
import { UtilizarPeca } from '../use-cases/utilizar-peca.js'
import { DefinirEstoqueMinimo } from '../use-cases/definir-estoque-minimo.js'
import { ObterPeca } from '../use-cases/obter-peca.js'
import { ListarPecas } from '../use-cases/listar-pecas.js'
import { RemoverPeca } from '../use-cases/remover-peca.js'
import { SolicitarCompra } from '../use-cases/solicitar-compra.js'
import { ReceberCompra } from '../use-cases/receber-compra.js'

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
