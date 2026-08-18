import { randomUUID } from 'node:crypto'
import { test } from '@japa/runner'
import { prepararBanco } from '#tests/helpers/banco'
import { capturarErro } from '#tests/helpers/erros'
import { gerarCpf } from '#tests/helpers/dados'
import { RecursoNaoEncontrado, RegraDeNegocioViolada } from '#shared/entities/erros'
import { fabricaClientes } from '#modulos/clientes/frameworks-drivers/fabrica'
import { fabricaVeiculos } from '#modulos/veiculos/frameworks-drivers/fabrica'
import { fabricaServicos } from '#modulos/servicos/frameworks-drivers/fabrica'
import { fabricaOrdensServico } from '#modulos/ordens-servico/infraestrutura/fabrica'
import { StatusOS } from '#modulos/ordens-servico/dominio/objetos-de-valor/status-ordem-servico'

test.group('Casos de uso de OS — branches de erro', (group) => {
  prepararBanco(group)

  async function clienteEVeiculo() {
    const cliente = await fabricaClientes.criar().executar({ nome: 'Cli', documento: gerarCpf() })
    const veiculo = await fabricaVeiculos.criar().executar({
      clienteId: cliente.id,
      placa: 'ABC1D23',
      marca: 'Fiat',
      modelo: 'Uno',
      ano: 2020,
    })
    return { clienteId: cliente.id, veiculoId: veiculo.id }
  }

  test('criar OS com serviço inexistente lança RecursoNaoEncontrado', async ({ assert }) => {
    const { clienteId, veiculoId } = await clienteEVeiculo()
    const erro = await capturarErro(() =>
      fabricaOrdensServico
        .criar()
        .executar({ clienteId, veiculoId, servicos: [{ servicoId: randomUUID(), quantidade: 1 }] })
    )
    assert.instanceOf(erro, RecursoNaoEncontrado)
  })

  test('criar OS com serviço inativo viola regra de negócio', async ({ assert }) => {
    const { clienteId, veiculoId } = await clienteEVeiculo()
    const servico = await fabricaServicos.criar().executar({ nome: 'Inativo', preco: 100 })
    await fabricaServicos.inativar().executar(servico.id)
    const erro = await capturarErro(() =>
      fabricaOrdensServico
        .criar()
        .executar({ clienteId, veiculoId, servicos: [{ servicoId: servico.id, quantidade: 1 }] })
    )
    assert.instanceOf(erro, RegraDeNegocioViolada)
  })

  test('criar OS com peça inexistente lança RecursoNaoEncontrado', async ({ assert }) => {
    const { clienteId, veiculoId } = await clienteEVeiculo()
    const erro = await capturarErro(() =>
      fabricaOrdensServico
        .criar()
        .executar({ clienteId, veiculoId, pecas: [{ pecaId: randomUUID(), quantidade: 1 }] })
    )
    assert.instanceOf(erro, RecursoNaoEncontrado)
  })

  test('adicionar serviço inexistente a uma OS lança RecursoNaoEncontrado', async ({ assert }) => {
    const { clienteId, veiculoId } = await clienteEVeiculo()
    const os = await fabricaOrdensServico.criar().executar({ clienteId, veiculoId })
    const erro = await capturarErro(() =>
      fabricaOrdensServico
        .adicionarServico()
        .executar({ ordemId: os.id, servicoId: randomUUID(), quantidade: 1 })
    )
    assert.instanceOf(erro, RecursoNaoEncontrado)
  })

  test('adicionar peça: OS e peça inexistentes lançam RecursoNaoEncontrado', async ({ assert }) => {
    assert.instanceOf(
      await capturarErro(() =>
        fabricaOrdensServico
          .adicionarPeca()
          .executar({ ordemId: randomUUID(), pecaId: randomUUID(), quantidade: 1 })
      ),
      RecursoNaoEncontrado
    )

    const { clienteId, veiculoId } = await clienteEVeiculo()
    const os = await fabricaOrdensServico.criar().executar({ clienteId, veiculoId })
    assert.instanceOf(
      await capturarErro(() =>
        fabricaOrdensServico
          .adicionarPeca()
          .executar({ ordemId: os.id, pecaId: randomUUID(), quantidade: 1 })
      ),
      RecursoNaoEncontrado
    )
  })

  test('consultar andamento e alterar status de OS inexistente lançam RecursoNaoEncontrado', async ({
    assert,
  }) => {
    assert.instanceOf(
      await capturarErro(() => fabricaOrdensServico.consultarAndamento().executar(randomUUID())),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() =>
        fabricaOrdensServico
          .alterarStatus()
          .executar({ ordemId: randomUUID(), novoStatus: StatusOS.EM_DIAGNOSTICO })
      ),
      RecursoNaoEncontrado
    )
  })
})
