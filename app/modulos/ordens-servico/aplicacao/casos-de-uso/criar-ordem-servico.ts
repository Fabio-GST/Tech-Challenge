import type { CasoDeUso } from '#shared/use-cases/caso-de-uso'
import { RecursoNaoEncontrado, RegraDeNegocioViolada } from '#shared/entities/erros'
import type { UnidadeDeTrabalho } from '#shared/use-cases/unidade-de-trabalho'
import { coletarEventosDe } from '#shared/use-cases/coletor-de-eventos'
import { PrioridadeOS } from '../../dominio/objetos-de-valor/prioridade-os.js'
import type { RepositorioDeClientes } from '#modulos/clientes/use-cases/ports/repositorio-de-clientes'
import type { RepositorioDeVeiculos } from '#modulos/veiculos/dominio/repositorios/repositorio-de-veiculos'
import type { RepositorioDeServicos } from '#modulos/servicos/dominio/repositorios/repositorio-de-servicos'
import type { RepositorioDePecas } from '#modulos/estoque/dominio/repositorios/repositorio-de-pecas'
import type { RepositorioDeOrdensServico } from '../../dominio/repositorios/repositorio-de-ordens-servico.js'
import { OrdemServico } from '../../dominio/entidades/ordem-servico.js'
import { paraDTO, type OrdemServicoDTO } from '../dtos.js'

export interface EntradaCriarOrdemServico {
  clienteId: string
  veiculoId: string
  prioridade?: PrioridadeOS
  servicos?: { servicoId: string; quantidade: number }[]
  pecas?: { pecaId: string; quantidade: number }[]
}

/**
 * Abre uma nova Ordem de Serviço, compondo o orçamento com os serviços e peças
 * solicitados. A inclusão de peças **reserva** (bloqueia) o estoque de forma
 * atômica (Unidade de Trabalho) junto da criação da OS; a baixa efetiva ocorre
 * na aprovação (Política `ordem-servico.aprovada → utilizar peças`).
 */
export class CriarOrdemServico implements CasoDeUso<EntradaCriarOrdemServico, OrdemServicoDTO> {
  constructor(
    private readonly ordens: RepositorioDeOrdensServico,
    private readonly clientes: RepositorioDeClientes,
    private readonly veiculos: RepositorioDeVeiculos,
    private readonly servicos: RepositorioDeServicos,
    private readonly pecas: RepositorioDePecas,
    private readonly unidadeDeTrabalho: UnidadeDeTrabalho
  ) {}

  async executar(entrada: EntradaCriarOrdemServico): Promise<OrdemServicoDTO> {
    const cliente = await this.clientes.buscarPorId(entrada.clienteId)
    if (!cliente) {
      throw new RecursoNaoEncontrado('Cliente', entrada.clienteId)
    }

    const veiculo = await this.veiculos.buscarPorId(entrada.veiculoId)
    if (!veiculo) {
      throw new RecursoNaoEncontrado('Veículo', entrada.veiculoId)
    }
    if (veiculo.clienteId !== cliente.id) {
      throw new RegraDeNegocioViolada('O veículo informado não pertence ao cliente.')
    }

    return this.unidadeDeTrabalho.executar(async () => {
      const ordem = OrdemServico.criar({
        clienteId: cliente.id,
        veiculoId: veiculo.id,
        prioridade: entrada.prioridade,
      })

      await this.incluirServicos(ordem, entrada.servicos ?? [])
      await this.incluirPecas(ordem, entrada.pecas ?? [])

      await this.ordens.salvar(ordem)
      await coletarEventosDe(ordem)
      return paraDTO(ordem)
    })
  }

  private async incluirServicos(
    ordem: OrdemServico,
    pedidos: { servicoId: string; quantidade: number }[]
  ): Promise<void> {
    if (pedidos.length === 0) return
    const servicos = await this.servicos.buscarVarios(pedidos.map((p) => p.servicoId))
    const porId = new Map(servicos.map((s) => [s.id, s]))

    for (const pedido of pedidos) {
      const servico = porId.get(pedido.servicoId)
      if (!servico) {
        throw new RecursoNaoEncontrado('Serviço', pedido.servicoId)
      }
      if (!servico.ativo) {
        throw new RegraDeNegocioViolada(`O serviço "${servico.nome}" está inativo.`)
      }
      ordem.adicionarServico({
        servicoId: servico.id,
        descricao: servico.nome,
        precoUnitario: servico.preco,
        quantidade: pedido.quantidade,
      })
    }
  }

  private async incluirPecas(
    ordem: OrdemServico,
    pedidos: { pecaId: string; quantidade: number }[]
  ): Promise<void> {
    if (pedidos.length === 0) return
    const pecas = await this.pecas.buscarVarias(pedidos.map((p) => p.pecaId))
    const porId = new Map(pecas.map((p) => [p.id, p]))

    for (const pedido of pedidos) {
      const peca = porId.get(pedido.pecaId)
      if (!peca) {
        throw new RecursoNaoEncontrado('Peça', pedido.pecaId)
      }
      peca.reservar(pedido.quantidade)
      ordem.adicionarPeca({
        pecaId: peca.id,
        descricao: peca.nome,
        precoUnitario: peca.preco,
        quantidade: pedido.quantidade,
      })
      await this.pecas.salvar(peca)
      await coletarEventosDe(peca)
    }
  }
}
