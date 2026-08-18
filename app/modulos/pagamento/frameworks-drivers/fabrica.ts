import { RepositorioDePagamentosLucid } from '../interface-adapters/gateways/repositorio-de-pagamentos-lucid.js'
import { GerarCobranca } from '../use-cases/gerar-cobranca.js'
import { AplicarDesconto } from '../use-cases/aplicar-desconto.js'
import { RegistrarPagamento } from '../use-cases/registrar-pagamento.js'
import { EmitirNotaFiscal } from '../use-cases/emitir-nota-fiscal.js'
import { ObterPagamento } from '../use-cases/obter-pagamento.js'

const repositorio = new RepositorioDePagamentosLucid()

export const fabricaPagamento = {
  repositorio: () => repositorio,
  gerarCobranca: () => new GerarCobranca(repositorio),
  aplicarDesconto: () => new AplicarDesconto(repositorio),
  registrarPagamento: () => new RegistrarPagamento(repositorio),
  emitirNotaFiscal: () => new EmitirNotaFiscal(repositorio),
  obter: () => new ObterPagamento(repositorio),
}
