import { RepositorioDeServicosLucid } from './persistencia/repositorios/repositorio-de-servicos-lucid.js'
import {
  CriarServico,
  AtualizarServico,
  InativarServico,
  ReativarServico,
  DefinirTempoEstimado,
  ObterServico,
  ListarServicos,
  RemoverServico,
} from '../aplicacao/casos-de-uso.js'

const repositorio = new RepositorioDeServicosLucid()

export const fabricaServicos = {
  repositorio: () => repositorio,
  criar: () => new CriarServico(repositorio),
  atualizar: () => new AtualizarServico(repositorio),
  inativar: () => new InativarServico(repositorio),
  reativar: () => new ReativarServico(repositorio),
  definirTempoEstimado: () => new DefinirTempoEstimado(repositorio),
  obter: () => new ObterServico(repositorio),
  listar: () => new ListarServicos(repositorio),
  remover: () => new RemoverServico(repositorio),
}
