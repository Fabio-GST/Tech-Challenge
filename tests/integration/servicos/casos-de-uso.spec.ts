import { test } from '@japa/runner'
import { prepararBanco } from '#tests/helpers/banco'
import { capturarErro } from '#tests/helpers/erros'
import { RecursoNaoEncontrado, RegraDeNegocioViolada } from '#shared/entities/erros'
import { fabricaServicos } from '#modulos/servicos/infraestrutura/fabrica'

test.group('Casos de uso de Serviços', (group) => {
  prepararBanco(group)

  async function criar(nome = 'Troca de óleo') {
    return fabricaServicos.criar().executar({ nome, preco: 120, tempoEstimadoMinutos: 30 })
  }

  test('cria e obtém um serviço', async ({ assert }) => {
    const criado = await criar()
    const obtido = await fabricaServicos.obter().executar(criado.id)
    assert.equal(obtido.nome, 'Troca de óleo')
    assert.equal(obtido.preco, 120)
    assert.isTrue(obtido.ativo)
  })

  test('atualiza nome e preço', async ({ assert }) => {
    const criado = await criar()
    const atualizado = await fabricaServicos
      .atualizar()
      .executar({ id: criado.id, nome: 'Revisão', preco: 200 })
    assert.equal(atualizado.nome, 'Revisão')
    assert.equal(atualizado.preco, 200)
  })

  test('inativa e reativa', async ({ assert }) => {
    const criado = await criar()
    const inativado = await fabricaServicos.inativar().executar(criado.id)
    assert.isFalse(inativado.ativo)
    const reativado = await fabricaServicos.reativar().executar(criado.id)
    assert.isTrue(reativado.ativo)
  })

  test('atualizar serviço inativo viola regra de negócio', async ({ assert }) => {
    const criado = await criar()
    await fabricaServicos.inativar().executar(criado.id)
    const erro = await capturarErro(() =>
      fabricaServicos.atualizar().executar({ id: criado.id, preco: 300 })
    )
    assert.instanceOf(erro, RegraDeNegocioViolada)
  })

  test('define tempo estimado', async ({ assert }) => {
    const criado = await criar()
    const atualizado = await fabricaServicos
      .definirTempoEstimado()
      .executar({ id: criado.id, tempoEstimadoMinutos: 45 })
    assert.equal(atualizado.tempoEstimadoMinutos, 45)
  })

  test('operações sobre serviço inexistente lançam RecursoNaoEncontrado', async ({ assert }) => {
    assert.instanceOf(
      await capturarErro(() => fabricaServicos.obter().executar('x')),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() => fabricaServicos.atualizar().executar({ id: 'x', nome: 'Z' })),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() => fabricaServicos.inativar().executar('x')),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() => fabricaServicos.reativar().executar('x')),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() =>
        fabricaServicos.definirTempoEstimado().executar({ id: 'x', tempoEstimadoMinutos: 10 })
      ),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() => fabricaServicos.remover().executar('x')),
      RecursoNaoEncontrado
    )
  })

  test('lista e remove', async ({ assert }) => {
    const criado = await criar()
    assert.lengthOf(await fabricaServicos.listar().executar(), 1)
    await fabricaServicos.remover().executar(criado.id)
    assert.lengthOf(await fabricaServicos.listar().executar(), 0)
  })
})
