import { RepositorioDePagamentosLucid } from './persistencia/repositorios/repositorio-de-pagamentos-lucid.js'
import { GerarCobranca } from '../aplicacao/casos-de-uso/gerar-cobranca.js'
import { AplicarDesconto } from '../aplicacao/casos-de-uso/aplicar-desconto.js'
import { RegistrarPagamento } from '../aplicacao/casos-de-uso/registrar-pagamento.js'
import { EmitirNotaFiscal } from '../aplicacao/casos-de-uso/emitir-nota-fiscal.js'
import { ObterPagamento } from '../aplicacao/casos-de-uso/obter-pagamento.js'

const repositorio = new RepositorioDePagamentosLucid()

export const fabricaPagamento = {
  repositorio: () => repositorio,
  gerarCobranca: () => new GerarCobranca(repositorio),
  aplicarDesconto: () => new AplicarDesconto(repositorio),
  registrarPagamento: () => new RegistrarPagamento(repositorio),
  emitirNotaFiscal: () => new EmitirNotaFiscal(repositorio),
  obter: () => new ObterPagamento(repositorio),
}
