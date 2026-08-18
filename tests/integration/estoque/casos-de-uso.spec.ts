import { test } from '@japa/runner'
import { prepararBanco } from '#tests/helpers/banco'
import { capturarErro } from '#tests/helpers/erros'
import { RecursoNaoEncontrado } from '#shared/entities/erros'
import { StatusSolicitacao } from '#modulos/estoque/entities/solicitacao-de-compra'
import { fabricaEstoque } from '#modulos/estoque/frameworks-drivers/fabrica'

test.group('Casos de uso de Estoque', (group) => {
  prepararBanco(group)

  async function criarPeca(nome = 'Óleo', quantidade = 10) {
    return fabricaEstoque
      .criar()
      .executar({ nome, preco: 45, quantidadeEstoque: quantidade, estoqueMinimo: 2 })
  }

  test('cria, obtém, atualiza e remove uma peça', async ({ assert }) => {
    const peca = await criarPeca()
    const obtida = await fabricaEstoque.obter().executar(peca.id)
    assert.equal(obtida.nome, 'Óleo')

    const atualizada = await fabricaEstoque
      .atualizar()
      .executar({ id: peca.id, nome: 'Óleo 5W30', preco: 50 })
    assert.equal(atualizada.nome, 'Óleo 5W30')
    assert.equal(atualizada.preco, 50)

    await fabricaEstoque.remover().executar(peca.id)
    assert.lengthOf(await fabricaEstoque.listar().executar(), 0)
  })

  test('ajusta, reserva, libera e utiliza estoque', async ({ assert }) => {
    const peca = await criarPeca('Filtro', 10)

    const ajustada = await fabricaEstoque.ajustarEstoque().executar({ id: peca.id, quantidade: 20 })
    assert.equal(ajustada.quantidadeEstoque, 20)

    const reservada = await fabricaEstoque.reservar().executar({ id: peca.id, quantidade: 5 })
    assert.equal(reservada.quantidadeEstoque, 15)
    assert.equal(reservada.quantidadeReservada, 5)

    const liberada = await fabricaEstoque.liberarReserva().executar({ id: peca.id, quantidade: 2 })
    assert.equal(liberada.quantidadeReservada, 3)

    const utilizada = await fabricaEstoque.utilizar().executar({ id: peca.id, quantidade: 3 })
    assert.equal(utilizada.quantidadeReservada, 0)
    assert.equal(utilizada.quantidadeEstoque, 17)
  })

  test('define estoque mínimo', async ({ assert }) => {
    const peca = await criarPeca()
    const atualizada = await fabricaEstoque
      .definirEstoqueMinimo()
      .executar({ id: peca.id, estoqueMinimo: 8 })
    assert.equal(atualizada.estoqueMinimo, 8)
  })

  test('operações sobre peça inexistente lançam RecursoNaoEncontrado', async ({ assert }) => {
    assert.instanceOf(
      await capturarErro(() => fabricaEstoque.obter().executar('x')),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() => fabricaEstoque.atualizar().executar({ id: 'x', nome: 'Z' })),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() =>
        fabricaEstoque.ajustarEstoque().executar({ id: 'x', quantidade: 1 })
      ),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() => fabricaEstoque.reservar().executar({ id: 'x', quantidade: 1 })),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() =>
        fabricaEstoque.liberarReserva().executar({ id: 'x', quantidade: 1 })
      ),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() => fabricaEstoque.utilizar().executar({ id: 'x', quantidade: 1 })),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() =>
        fabricaEstoque.definirEstoqueMinimo().executar({ id: 'x', estoqueMinimo: 1 })
      ),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() => fabricaEstoque.remover().executar('x')),
      RecursoNaoEncontrado
    )
  })

  test('solicita e recebe uma compra (repõe o estoque)', async ({ assert }) => {
    const peca = await criarPeca('Correia', 1)
    const solicitacao = await fabricaEstoque
      .solicitarCompra()
      .executar({ pecaId: peca.id, quantidade: 10 })
    assert.equal(solicitacao.status, StatusSolicitacao.SOLICITADA)

    const recebida = await fabricaEstoque.receberCompra().executar(solicitacao.id)
    assert.equal(recebida.status, StatusSolicitacao.RECEBIDA)

    const atual = await fabricaEstoque.obter().executar(peca.id)
    assert.equal(atual.quantidadeEstoque, 11) // 1 + 10
  })

  test('solicitar compra para peça inexistente lança RecursoNaoEncontrado', async ({ assert }) => {
    const erro = await capturarErro(() =>
      fabricaEstoque.solicitarCompra().executar({ pecaId: 'x', quantidade: 1 })
    )
    assert.instanceOf(erro, RecursoNaoEncontrado)
  })

  test('receber compra inexistente lança RecursoNaoEncontrado', async ({ assert }) => {
    const erro = await capturarErro(() => fabricaEstoque.receberCompra().executar('x'))
    assert.instanceOf(erro, RecursoNaoEncontrado)
  })
})
