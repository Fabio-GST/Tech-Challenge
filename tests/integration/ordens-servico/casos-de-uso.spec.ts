import { test } from '@japa/runner'
import { prepararBanco } from '#tests/helpers/banco'
import { capturarErro } from '#tests/helpers/erros'
import { gerarCpf } from '#tests/helpers/dados'
import { RecursoNaoEncontrado, RegraDeNegocioViolada } from '#shared/entities/erros'
import { fabricaClientes } from '#modulos/clientes/frameworks-drivers/fabrica'
import { fabricaVeiculos } from '#modulos/veiculos/infraestrutura/fabrica'
import { fabricaServicos } from '#modulos/servicos/infraestrutura/fabrica'
import { fabricaEstoque } from '#modulos/estoque/infraestrutura/fabrica'
import { fabricaOrdensServico } from '#modulos/ordens-servico/infraestrutura/fabrica'
import { StatusOS } from '#modulos/ordens-servico/dominio/objetos-de-valor/status-ordem-servico'

test.group('Casos de uso de Ordens de Serviço', (group) => {
  prepararBanco(group)

  async function cenario() {
    const cliente = await fabricaClientes.criar().executar({ nome: 'Maria', documento: gerarCpf() })
    const veiculo = await fabricaVeiculos.criar().executar({
      clienteId: cliente.id,
      placa: 'ABC1D23',
      marca: 'Fiat',
      modelo: 'Uno',
      ano: 2020,
    })
    const servico = await fabricaServicos.criar().executar({ nome: 'Troca de óleo', preco: 120 })
    const peca = await fabricaEstoque
      .criar()
      .executar({ nome: 'Óleo', preco: 45, quantidadeEstoque: 10 })
    return { clienteId: cliente.id, veiculoId: veiculo.id, servicoId: servico.id, pecaId: peca.id }
  }

  test('cria OS com serviços e peças, compondo o orçamento e reservando estoque', async ({
    assert,
  }) => {
    const c = await cenario()
    const os = await fabricaOrdensServico.criar().executar({
      clienteId: c.clienteId,
      veiculoId: c.veiculoId,
      servicos: [{ servicoId: c.servicoId, quantidade: 1 }],
      pecas: [{ pecaId: c.pecaId, quantidade: 2 }],
    })

    assert.equal(os.status, StatusOS.RECEBIDA)
    assert.equal(os.orcamento, 210) // 120 + 45*2

    const peca = await fabricaEstoque.obter().executar(c.pecaId)
    assert.equal(peca.quantidadeReservada, 2)
    assert.equal(peca.quantidadeEstoque, 8)
  })

  test('cria OS para cliente/veículo inexistente lança RecursoNaoEncontrado', async ({
    assert,
  }) => {
    const c = await cenario()
    assert.instanceOf(
      await capturarErro(() =>
        fabricaOrdensServico.criar().executar({ clienteId: 'x', veiculoId: c.veiculoId })
      ),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() =>
        fabricaOrdensServico.criar().executar({ clienteId: c.clienteId, veiculoId: 'x' })
      ),
      RecursoNaoEncontrado
    )
  })

  test('cria OS com veículo de outro cliente viola regra de negócio', async ({ assert }) => {
    const c = await cenario()
    const outro = await fabricaClientes.criar().executar({ nome: 'Outro', documento: gerarCpf() })
    const erro = await capturarErro(() =>
      fabricaOrdensServico.criar().executar({ clienteId: outro.id, veiculoId: c.veiculoId })
    )
    assert.instanceOf(erro, RegraDeNegocioViolada)
  })

  test('adiciona serviço a uma OS existente', async ({ assert }) => {
    const c = await cenario()
    const os = await fabricaOrdensServico
      .criar()
      .executar({ clienteId: c.clienteId, veiculoId: c.veiculoId })

    const atualizada = await fabricaOrdensServico
      .adicionarServico()
      .executar({ ordemId: os.id, servicoId: c.servicoId, quantidade: 1 })
    assert.equal(atualizada.orcamento, 120)
  })

  test('adicionar serviço inativo viola regra de negócio', async ({ assert }) => {
    const c = await cenario()
    await fabricaServicos.inativar().executar(c.servicoId)
    const os = await fabricaOrdensServico
      .criar()
      .executar({ clienteId: c.clienteId, veiculoId: c.veiculoId })

    const erro = await capturarErro(() =>
      fabricaOrdensServico
        .adicionarServico()
        .executar({ ordemId: os.id, servicoId: c.servicoId, quantidade: 1 })
    )
    assert.instanceOf(erro, RegraDeNegocioViolada)
  })

  test('adicionar peça a uma OS reserva o estoque', async ({ assert }) => {
    const c = await cenario()
    const os = await fabricaOrdensServico
      .criar()
      .executar({ clienteId: c.clienteId, veiculoId: c.veiculoId })

    const atualizada = await fabricaOrdensServico
      .adicionarPeca()
      .executar({ ordemId: os.id, pecaId: c.pecaId, quantidade: 3 })
    assert.equal(atualizada.orcamento, 135)

    const peca = await fabricaEstoque.obter().executar(c.pecaId)
    assert.equal(peca.quantidadeReservada, 3)
  })

  test('percorre o ciclo de vida até a entrega e calcula tempo médio', async ({ assert }) => {
    const c = await cenario()
    const os = await fabricaOrdensServico.criar().executar({
      clienteId: c.clienteId,
      veiculoId: c.veiculoId,
      servicos: [{ servicoId: c.servicoId, quantidade: 1 }],
    })

    await fabricaOrdensServico.iniciarDiagnostico().executar(os.id)
    await fabricaOrdensServico.gerarOrcamento().executar(os.id)
    const aprovada = await fabricaOrdensServico.aprovar().executar(os.id)
    assert.equal(aprovada.status, StatusOS.EM_EXECUCAO)

    await fabricaOrdensServico.finalizar().executar(os.id)
    const entregue = await fabricaOrdensServico.entregar().executar(os.id)
    assert.equal(entregue.status, StatusOS.ENTREGUE)

    const detalhe = await fabricaOrdensServico.detalhar().executar(os.id)
    assert.equal(detalhe.status, StatusOS.ENTREGUE)

    const andamento = await fabricaOrdensServico.consultarAndamento().executar(os.id)
    assert.equal(andamento.status, StatusOS.ENTREGUE)

    const metrica = await fabricaOrdensServico.tempoMedioExecucao().executar()
    assert.isAtLeast(metrica.ordensConsideradas, 1)

    assert.lengthOf(await fabricaOrdensServico.listar().executar(), 1)
  })

  test('recusa uma OS em aguardando aprovação', async ({ assert }) => {
    const c = await cenario()
    const os = await fabricaOrdensServico.criar().executar({
      clienteId: c.clienteId,
      veiculoId: c.veiculoId,
      servicos: [{ servicoId: c.servicoId, quantidade: 1 }],
    })
    await fabricaOrdensServico.iniciarDiagnostico().executar(os.id)
    await fabricaOrdensServico.gerarOrcamento().executar(os.id)
    const recusada = await fabricaOrdensServico.recusar().executar(os.id)
    assert.equal(recusada.status, StatusOS.RECUSADA)
  })

  test('alterarStatus com transição inválida viola regra de negócio', async ({ assert }) => {
    const c = await cenario()
    const os = await fabricaOrdensServico
      .criar()
      .executar({ clienteId: c.clienteId, veiculoId: c.veiculoId })
    const erro = await capturarErro(() =>
      fabricaOrdensServico
        .alterarStatus()
        .executar({ ordemId: os.id, novoStatus: StatusOS.ENTREGUE })
    )
    assert.instanceOf(erro, RegraDeNegocioViolada)
  })

  test('operações sobre OS inexistente lançam RecursoNaoEncontrado', async ({ assert }) => {
    assert.instanceOf(
      await capturarErro(() => fabricaOrdensServico.detalhar().executar('x')),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() => fabricaOrdensServico.aprovar().executar('x')),
      RecursoNaoEncontrado
    )
    assert.instanceOf(
      await capturarErro(() =>
        fabricaOrdensServico
          .adicionarServico()
          .executar({ ordemId: 'x', servicoId: 'y', quantidade: 1 })
      ),
      RecursoNaoEncontrado
    )
  })
})
