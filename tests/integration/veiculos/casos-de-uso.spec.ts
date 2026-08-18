import { test } from '@japa/runner'
import { prepararBanco } from '#tests/helpers/banco'
import { capturarErro } from '#tests/helpers/erros'
import { gerarCpf } from '#tests/helpers/dados'
import { ConflitoDeRecurso, RecursoNaoEncontrado } from '#shared/entities/erros'
import { fabricaClientes } from '#modulos/clientes/frameworks-drivers/fabrica'
import { fabricaVeiculos } from '#modulos/veiculos/frameworks-drivers/fabrica'

test.group('Casos de uso de Veículos', (group) => {
  prepararBanco(group)

  async function criarCliente() {
    const c = await fabricaClientes.criar().executar({ nome: 'Dono', documento: gerarCpf() })
    return c.id
  }

  function dadosVeiculo(clienteId: string, placa = 'ABC1D23') {
    return { clienteId, placa, marca: 'Fiat', modelo: 'Uno', ano: 2020 }
  }

  test('cria veículo vinculado a um cliente', async ({ assert }) => {
    const clienteId = await criarCliente()
    const veiculo = await fabricaVeiculos.criar().executar(dadosVeiculo(clienteId))
    assert.equal(veiculo.clienteId, clienteId)
    assert.equal(veiculo.placa, 'ABC1D23')
  })

  test('criar veículo para cliente inexistente lança RecursoNaoEncontrado', async ({ assert }) => {
    const erro = await capturarErro(() =>
      fabricaVeiculos.criar().executar(dadosVeiculo('inexistente'))
    )
    assert.instanceOf(erro, RecursoNaoEncontrado)
  })

  test('placa duplicada lança ConflitoDeRecurso', async ({ assert }) => {
    const clienteId = await criarCliente()
    await fabricaVeiculos.criar().executar(dadosVeiculo(clienteId, 'ABC1D23'))
    const erro = await capturarErro(() =>
      fabricaVeiculos.criar().executar(dadosVeiculo(clienteId, 'ABC1D23'))
    )
    assert.instanceOf(erro, ConflitoDeRecurso)
  })

  test('vincula veículo a outro cliente (transferência)', async ({ assert }) => {
    const clienteId = await criarCliente()
    const novoDono = await criarCliente()
    const veiculo = await fabricaVeiculos.criar().executar(dadosVeiculo(clienteId))

    const transferido = await fabricaVeiculos
      .vincularCliente()
      .executar({ id: veiculo.id, clienteId: novoDono })
    assert.equal(transferido.clienteId, novoDono)
  })

  test('vincular com veículo ou cliente inexistente lança RecursoNaoEncontrado', async ({
    assert,
  }) => {
    const clienteId = await criarCliente()
    assert.instanceOf(
      await capturarErro(() => fabricaVeiculos.vincularCliente().executar({ id: 'x', clienteId })),
      RecursoNaoEncontrado
    )
    const veiculo = await fabricaVeiculos.criar().executar(dadosVeiculo(clienteId))
    assert.instanceOf(
      await capturarErro(() =>
        fabricaVeiculos.vincularCliente().executar({ id: veiculo.id, clienteId: 'inexistente' })
      ),
      RecursoNaoEncontrado
    )
  })

  test('busca por placa: encontrado e não encontrado', async ({ assert }) => {
    const clienteId = await criarCliente()
    await fabricaVeiculos.criar().executar(dadosVeiculo(clienteId, 'ABC1D23'))

    const achado = await fabricaVeiculos.buscarPorPlaca().executar('ABC1D23')
    assert.equal(achado!.modelo, 'Uno')
    assert.isNull(await fabricaVeiculos.buscarPorPlaca().executar('XYZ9K88'))
  })

  test('atualiza, lista por cliente e remove', async ({ assert }) => {
    const clienteId = await criarCliente()
    const veiculo = await fabricaVeiculos.criar().executar(dadosVeiculo(clienteId))

    const atualizado = await fabricaVeiculos
      .atualizar()
      .executar({ id: veiculo.id, modelo: 'Uno Way' })
    assert.equal(atualizado.modelo, 'Uno Way')

    const lista = await fabricaVeiculos.listar().executar({ clienteId })
    assert.lengthOf(lista, 1)

    await fabricaVeiculos.remover().executar(veiculo.id)
    assert.lengthOf(await fabricaVeiculos.listar().executar(), 0)
  })

  test('operações sobre veículo inexistente lançam RecursoNaoEncontrado', async ({ assert }) => {
    assert.instanceOf(
      await capturarErro(() => fabricaVeiculos.obter().executar('x')),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() => fabricaVeiculos.atualizar().executar({ id: 'x', modelo: 'Z' })),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() => fabricaVeiculos.remover().executar('x')),
      RecursoNaoEncontrado
    )
  })
})
