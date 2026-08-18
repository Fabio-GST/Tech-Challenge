import { test } from '@japa/runner'
import { prepararBanco } from '#tests/helpers/banco'
import { capturarErro } from '#tests/helpers/erros'
import { gerarCpf } from '#tests/helpers/dados'
import { ConflitoDeRecurso, RecursoNaoEncontrado } from '#shared/entities/erros'
import { fabricaClientes } from '#modulos/clientes/frameworks-drivers/fabrica'

test.group('Casos de uso de Clientes', (group) => {
  prepararBanco(group)

  test('cria e obtém um cliente', async ({ assert }) => {
    const criado = await fabricaClientes.criar().executar({ nome: 'Maria', documento: gerarCpf() })
    const obtido = await fabricaClientes.obter().executar(criado.id)
    assert.equal(obtido.nome, 'Maria')
    assert.equal(obtido.tipoDocumento, 'CPF')
  })

  test('rejeita documento duplicado com ConflitoDeRecurso', async ({ assert }) => {
    const doc = gerarCpf()
    await fabricaClientes.criar().executar({ nome: 'A', documento: doc })
    const erro = await capturarErro(() =>
      fabricaClientes.criar().executar({ nome: 'B', documento: doc })
    )
    assert.instanceOf(erro, ConflitoDeRecurso)
  })

  test('atualiza um cliente existente', async ({ assert }) => {
    const criado = await fabricaClientes.criar().executar({ nome: 'Ana', documento: gerarCpf() })
    const atualizado = await fabricaClientes
      .atualizar()
      .executar({ id: criado.id, nome: 'Ana Paula', telefone: '1133334444' })
    assert.equal(atualizado.nome, 'Ana Paula')
    assert.equal(atualizado.telefone, '1133334444')
  })

  test('atualizar inexistente lança RecursoNaoEncontrado', async ({ assert }) => {
    const erro = await capturarErro(() =>
      fabricaClientes.atualizar().executar({ id: 'x', nome: 'Z' })
    )
    assert.instanceOf(erro, RecursoNaoEncontrado)
  })

  test('obter inexistente lança RecursoNaoEncontrado', async ({ assert }) => {
    const erro = await capturarErro(() => fabricaClientes.obter().executar('x'))
    assert.instanceOf(erro, RecursoNaoEncontrado)
  })

  test('remover inexistente lança RecursoNaoEncontrado', async ({ assert }) => {
    const erro = await capturarErro(() => fabricaClientes.remover().executar('x'))
    assert.instanceOf(erro, RecursoNaoEncontrado)
  })

  test('remove um cliente existente', async ({ assert }) => {
    const criado = await fabricaClientes.criar().executar({ nome: 'Del', documento: gerarCpf() })
    await fabricaClientes.remover().executar(criado.id)
    assert.lengthOf(await fabricaClientes.listar().executar(), 0)
  })

  test('busca por documento: encontrado e não encontrado', async ({ assert }) => {
    const doc = gerarCpf()
    await fabricaClientes.criar().executar({ nome: 'Busca', documento: doc })

    const achado = await fabricaClientes.buscarPorDocumento().executar(doc)
    assert.equal(achado!.nome, 'Busca')

    const naoAchado = await fabricaClientes.buscarPorDocumento().executar(gerarCpf())
    assert.isNull(naoAchado)
  })
})
