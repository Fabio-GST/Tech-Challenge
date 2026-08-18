import { randomUUID } from 'node:crypto'
import { test } from '@japa/runner'
import { prepararBanco } from '#tests/helpers/banco'
import { capturarErro } from '#tests/helpers/erros'
import { RecursoNaoEncontrado, RegraDeNegocioViolada } from '#shared/entities/erros'
import { StatusPagamento } from '#modulos/pagamento/dominio/entidades/pagamento'
import { fabricaPagamento } from '#modulos/pagamento/infraestrutura/fabrica'

test.group('Casos de uso de Pagamento', (group) => {
  prepararBanco(group)

  async function gerar(total = 200) {
    return fabricaPagamento.gerarCobranca().executar({ ordemId: randomUUID(), total })
  }

  test('gera cobrança e obtém', async ({ assert }) => {
    const cobranca = await gerar(200)
    assert.equal(cobranca.total, 200)
    assert.equal(cobranca.status, StatusPagamento.PENDENTE)

    const obtido = await fabricaPagamento.obter().executar(cobranca.id)
    assert.equal(obtido.id, cobranca.id)
  })

  test('aplica desconto, registra pagamento e emite nota', async ({ assert }) => {
    const cobranca = await gerar(200)
    const comDesconto = await fabricaPagamento
      .aplicarDesconto()
      .executar({ id: cobranca.id, desconto: 20 })
    assert.equal(comDesconto.valorDevido, 180)

    const pago = await fabricaPagamento
      .registrarPagamento()
      .executar({ id: cobranca.id, valor: 180 })
    assert.equal(pago.status, StatusPagamento.QUITADO)

    const comNota = await fabricaPagamento.emitirNotaFiscal().executar(cobranca.id)
    assert.exists(comNota.notaFiscalNumero)
  })

  test('registra pagamento parcial', async ({ assert }) => {
    const cobranca = await gerar(200)
    const parcial = await fabricaPagamento
      .registrarPagamento()
      .executar({ id: cobranca.id, valor: 50 })
    assert.equal(parcial.status, StatusPagamento.PARCIAL)
    assert.equal(parcial.pago, 50)
  })

  test('emitir nota antes da quitação viola regra de negócio', async ({ assert }) => {
    const cobranca = await gerar(200)
    const erro = await capturarErro(() => fabricaPagamento.emitirNotaFiscal().executar(cobranca.id))
    assert.instanceOf(erro, RegraDeNegocioViolada)
  })

  test('operações sobre pagamento inexistente lançam RecursoNaoEncontrado', async ({ assert }) => {
    assert.instanceOf(
      await capturarErro(() => fabricaPagamento.obter().executar('x')),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() =>
        fabricaPagamento.aplicarDesconto().executar({ id: 'x', desconto: 1 })
      ),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() =>
        fabricaPagamento.registrarPagamento().executar({ id: 'x', valor: 1 })
      ),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() => fabricaPagamento.emitirNotaFiscal().executar('x')),
      RecursoNaoEncontrado
    )
  })
})
