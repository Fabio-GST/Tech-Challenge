import { test } from '@japa/runner'
import { Dinheiro } from '#shared/entities/objetos-de-valor/dinheiro'
import type { UnidadeDeTrabalho } from '#shared/use-cases/unidade-de-trabalho'
import { Cliente } from '#modulos/clientes/entities/cliente'
import { Documento } from '#modulos/clientes/entities/objetos-de-valor/documento'
import { Veiculo } from '#modulos/veiculos/entities/veiculo'
import { Placa } from '#modulos/veiculos/entities/objetos-de-valor/placa'
import { Servico } from '#modulos/servicos/entities/servico'
import { Peca } from '#modulos/estoque/entities/peca'
import { QuantidadeEstoque } from '#modulos/estoque/entities/objetos-de-valor/quantidade-estoque'
import { OrdemServico } from '#modulos/ordens-servico/entities/ordem-servico'
import { CriarOrdemServico } from '#modulos/ordens-servico/use-cases/criar-ordem-servico'

/** Unidade de trabalho fake: executa a operação sem transação real. */
const unidadeFake = { executar: <T>(op: () => Promise<T>) => op() } as UnidadeDeTrabalho

function montarCenario() {
  const cliente = Cliente.criar({ nome: 'Maria', documento: Documento.criar('11144477735') })
  const veiculo = Veiculo.criar({
    clienteId: cliente.id,
    placa: Placa.criar('ABC1D23'),
    marca: 'Fiat',
    modelo: 'Uno',
    ano: 2020,
  })
  const servico = Servico.criar({ nome: 'Troca de óleo', preco: Dinheiro.deReais(120) })
  const peca = Peca.criar({
    nome: 'Óleo 5W30',
    preco: Dinheiro.deReais(45),
    quantidadeEstoque: QuantidadeEstoque.criar(10),
  })

  const ordensSalvas: OrdemServico[] = []
  const pecasSalvas: Peca[] = []

  const ordens = {
    salvar: async (o: OrdemServico) => {
      ordensSalvas.push(o)
    },
    buscarPorId: async () => null,
    listar: async () => [],
  }
  const clientes = {
    buscarPorId: async (id: string) => (id === cliente.id ? cliente : null),
  } as any
  const veiculos = {
    buscarPorId: async (id: string) => (id === veiculo.id ? veiculo : null),
  } as any
  const servicos = { buscarVarios: async () => [servico] } as any
  const pecas = {
    buscarVarias: async () => [peca],
    salvar: async (p: Peca) => {
      pecasSalvas.push(p)
    },
  } as any

  return {
    cliente,
    veiculo,
    servico,
    peca,
    ordens,
    clientes,
    veiculos,
    servicos,
    pecas,
    pecasSalvas,
  }
}

test.group('CriarOrdemServico (caso de uso)', () => {
  test('cria a OS, compõe o orçamento e dá baixa no estoque', async ({ assert }) => {
    const c = montarCenario()
    const caso = new CriarOrdemServico(
      c.ordens as any,
      c.clientes,
      c.veiculos,
      c.servicos,
      c.pecas,
      unidadeFake
    )

    const dto = await caso.executar({
      clienteId: c.cliente.id,
      veiculoId: c.veiculo.id,
      servicos: [{ servicoId: c.servico.id, quantidade: 1 }],
      pecas: [{ pecaId: c.peca.id, quantidade: 2 }],
    })

    // 120 (serviço) + 45*2 (peças) = 210
    assert.equal(dto.orcamento, 210)
    assert.lengthOf(dto.itens, 2)
    assert.equal(dto.status, 'RECEBIDA')
    // Estoque reduzido de 10 para 8.
    assert.equal(c.peca.quantidadeEstoque.valor, 8)
    assert.lengthOf(c.pecasSalvas, 1)
  })

  test('falha quando o veículo não pertence ao cliente', async ({ assert }) => {
    const c = montarCenario()
    const outroVeiculo = Veiculo.criar({
      clienteId: 'outro-cliente',
      placa: Placa.criar('XYZ4321'),
      marca: 'VW',
      modelo: 'Gol',
      ano: 2019,
    })
    const veiculos = { buscarPorId: async () => outroVeiculo } as any

    const caso = new CriarOrdemServico(
      c.ordens as any,
      c.clientes,
      veiculos,
      c.servicos,
      c.pecas,
      unidadeFake
    )

    await assert.rejects(() =>
      caso.executar({ clienteId: c.cliente.id, veiculoId: outroVeiculo.id })
    )
  })
})
