import { RepositorioDePagamentosLucid } from './persistencia/repositorios/repositorio-de-pagamentos-lucid.js'
import {
  GerarCobranca,
  AplicarDesconto,
  RegistrarPagamento,
  EmitirNotaFiscal,
  ObterPagamento,
} from '../aplicacao/casos-de-uso.js'

const repositorio = new RepositorioDePagamentosLucid()

export const fabricaPagamento = {
  repositorio: () => repositorio,
  gerarCobranca: () => new GerarCobranca(repositorio),
  aplicarDesconto: () => new AplicarDesconto(repositorio),
  registrarPagamento: () => new RegistrarPagamento(repositorio),
  emitirNotaFiscal: () => new EmitirNotaFiscal(repositorio),
  obter: () => new ObterPagamento(repositorio),
}
