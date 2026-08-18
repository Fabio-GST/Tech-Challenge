import type { HttpContext } from '@adonisjs/core/http'
import { fabricaPagamento } from '../../frameworks-drivers/fabrica.js'
import {
  gerarCobrancaValidator,
  aplicarDescontoValidator,
  registrarPagamentoValidator,
} from '../../frameworks-drivers/validadores/pagamento_validadores.js'

export default class PagamentosController {
  /**
   * @show
   * @tag Pagamentos
   * @summary Detalha um pagamento pelo identificador
   * @paramPath id - Identificador (UUID) do pagamento - @type(string)
   * @responseBody 200 - {"id":"uuid","ordemId":"uuid","total":200,"desconto":20,"pago":180,"valorDevido":180,"status":"QUITADO","notaFiscalNumero":"NF-1A2B3C4D"} - Pagamento encontrado
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Pagamento não encontrado."}} - Pagamento inexistente
   */
  async show({ params }: HttpContext) {
    return fabricaPagamento.obter().executar(params.id)
  }

  /**
   * @gerarCobranca
   * @tag Pagamentos
   * @summary Gera a cobrança de uma Ordem de Serviço
   * @description Cria um **Pagamento** vinculado à OS. Normalmente acionado pela Política após `ordem-servico.finalizada`; também disponível manualmente para o valor do **Orçamento**.
   * @paramPath id - Identificador (UUID) da Ordem de Serviço - @type(string)
   * @requestBody {"total":200}
   * @responseBody 201 - {"id":"uuid","ordemId":"uuid","total":200,"desconto":0,"pago":0,"valorDevido":200,"status":"PENDENTE"} - Cobrança gerada
   * @responseBody 422 - {"erro":{"codigo":"VALIDACAO","mensagem":"O valor total da cobrança deve ser positivo."}} - Valor inválido
   */
  async gerarCobranca({ params, request, response }: HttpContext) {
    const { total } = await request.validateUsing(gerarCobrancaValidator)
    const pagamento = await fabricaPagamento.gerarCobranca().executar({ ordemId: params.id, total })
    return response.created(pagamento)
  }

  /**
   * @aplicarDesconto
   * @tag Pagamentos
   * @summary Aplica um desconto sobre o total
   * @paramPath id - Identificador (UUID) do pagamento - @type(string)
   * @requestBody {"desconto":20}
   * @responseBody 200 - {"id":"uuid","ordemId":"uuid","total":200,"desconto":20,"pago":0,"valorDevido":180,"status":"PENDENTE"} - Desconto aplicado
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Pagamento não encontrado."}} - Pagamento inexistente
   * @responseBody 422 - {"erro":{"codigo":"REGRA_DE_NEGOCIO_VIOLADA","mensagem":"O desconto não pode ser maior que o total."}} - Desconto inválido
   */
  async aplicarDesconto({ params, request }: HttpContext) {
    const { desconto } = await request.validateUsing(aplicarDescontoValidator)
    return fabricaPagamento.aplicarDesconto().executar({ id: params.id, desconto })
  }

  /**
   * @registrarPagamento
   * @tag Pagamentos
   * @summary Registra um pagamento (total ou parcial)
   * @description Quita total ou parcialmente o **valorDevido**. Ao atingir quitação (`status: QUITADO`), dispara `pagamento.confirmado`, que aciona a emissão assíncrona da Nota Fiscal.
   * @paramPath id - Identificador (UUID) do pagamento - @type(string)
   * @requestBody {"valor":180}
   * @responseBody 200 - {"id":"uuid","ordemId":"uuid","total":200,"desconto":20,"pago":180,"valorDevido":180,"status":"QUITADO"} - Pagamento registrado
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Pagamento não encontrado."}} - Pagamento inexistente
   * @responseBody 422 - {"erro":{"codigo":"REGRA_DE_NEGOCIO_VIOLADA","mensagem":"Pagamento já quitado."}} - Pagamento já quitado
   */
  async registrarPagamento({ params, request }: HttpContext) {
    const { valor } = await request.validateUsing(registrarPagamentoValidator)
    return fabricaPagamento.registrarPagamento().executar({ id: params.id, valor })
  }

  /**
   * @emitirNotaFiscal
   * @tag Pagamentos
   * @summary Emite a Nota Fiscal (somente após a quitação)
   * @description Gera o número da **Nota Fiscal** apenas quando o Pagamento está **Quitado** (`valorDevido` zerado). Invariante de domínio: NF não pode ser emitida antes da quitação.
   * @paramPath id - Identificador (UUID) do pagamento - @type(string)
   * @responseBody 200 - {"id":"uuid","ordemId":"uuid","total":200,"desconto":20,"pago":180,"valorDevido":180,"status":"QUITADO","notaFiscalNumero":"NF-1A2B3C4D"} - Nota Fiscal emitida
   * @responseBody 404 - {"erro":{"codigo":"RECURSO_NAO_ENCONTRADO","mensagem":"Pagamento não encontrado."}} - Pagamento inexistente
   * @responseBody 422 - {"erro":{"codigo":"REGRA_DE_NEGOCIO_VIOLADA","mensagem":"A Nota Fiscal só pode ser emitida após a quitação."}} - Pagamento não quitado
   */
  async emitirNotaFiscal({ params }: HttpContext) {
    return fabricaPagamento.emitirNotaFiscal().executar(params.id)
  }
}
