import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  ProgramaBibliografia,
  ProgramaDisciplinaResponse,
  ProgramaDisciplinaService
} from '../services/programa-disciplina.service';

interface BibliografiaExibida {
  titulo: string;
  autores: string;
  editora: string;
  isbn: string;
  anoPublicacao: string;
  localizacao: string;
  disponibilidade: string;
  linkLivro: string | null;
}

interface DisciplinaCompleta {
  id: string;
  nome: string;
  sigla: string;
  escola: string;
  semestre: string;
  cargaHoraria: string;
  professor: string;
  cursos: string[];
  preRequisitos: string[];
  dataCadastro: string;
  status: string;
  statusAtivo: boolean;
  ementa: string;
  competencias: string;
  metodologia: string;
  avaliacao: string;
  conteudoProgramatico: string[];
  bibliografiaBasica: BibliografiaExibida[];
  bibliografiaComplementar: BibliografiaExibida[];
}

@Component({
  selector: 'app-programa-disciplina',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './programa-disciplina.component.html',
  styleUrls: ['./programa-disciplina.component.css']
})
export class ProgramaDisciplinaComponent implements OnInit {
  disciplinaExibida: DisciplinaCompleta | null = null;
  carregando = true;
  mensagemErro = '';

  constructor(
    private route: ActivatedRoute,
    private programaDisciplinaService: ProgramaDisciplinaService
  ) {}

  ngOnInit(): void {
    const idDaUrl = this.route.snapshot.paramMap.get('id');

    if (!idDaUrl) {
      this.carregando = false;
      this.mensagemErro = 'Programa nao informado.';
      return;
    }

    this.carregarPrograma(idDaUrl);
  }

  private carregarPrograma(id: string): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.programaDisciplinaService.getProgramaPorId(id).subscribe({
      next: (programa: ProgramaDisciplinaResponse) => {
        this.disciplinaExibida = this.mapearPrograma(programa);
        this.carregando = false;
      },
      error: (erro: any) => {
        console.error('Erro ao carregar programa da disciplina:', erro);
        this.carregando = false;

        if (erro.status === 401 || erro.status === 403) {
          alert('Erro de seguranca ao carregar a ementa da disciplina. Faca login novamente.');
          return;
        }

        this.mensagemErro = 'Nao foi possivel carregar a ementa desta disciplina no backend agora.';
      }
    });
  }

  private mapearPrograma(programa: ProgramaDisciplinaResponse): DisciplinaCompleta {
    const disciplina = programa?.disciplina;
    const cursos = Array.isArray(disciplina?.cursos) && disciplina.cursos.length
      ? disciplina.cursos.map((curso) => `${curso.sigla} - ${curso.descricao}`)
      : ['Curso nao informado'];
    const prerequisitos = Array.isArray(programa?.prerequisitos) && programa.prerequisitos.length
      ? programa.prerequisitos.map((item) => `${item.sigla} - ${item.descricao}`)
      : ['Nenhum'];
    const bibliografiaBasica = this.mapearBibliografia(programa?.bibliografiasBasicas);
    const bibliografiaComplementar = this.mapearBibliografia(programa?.bibliografiasComplementares);

    return {
      id: String(programa?.id ?? ''),
      nome: disciplina?.descricao ?? 'Disciplina nao encontrada',
      sigla: disciplina?.sigla ?? '-',
      escola: disciplina?.escola?.nome ?? 'Escola nao informada',
      semestre: this.formatarSemestre(programa?.semestre),
      cargaHoraria: disciplina?.cargaHoraria ? `${disciplina.cargaHoraria}h` : 'Nao informada',
      professor: disciplina?.professor?.nomeCompleto ?? 'Professor nao informado',
      cursos,
      preRequisitos: prerequisitos,
      dataCadastro: this.formatarData(programa?.dataCadastro),
      status: programa?.ativo || disciplina?.ativo ? 'Ativo' : 'Inativo',
      statusAtivo: Boolean(programa?.ativo || disciplina?.ativo),
      ementa: programa?.ementa ?? 'Ementa nao informada.',
      competencias: programa?.competenciasHabilidades ?? 'Competencias e habilidades nao informadas.',
      metodologia: programa?.metodologia ?? 'Metodologia nao informada.',
      avaliacao: programa?.processoAvaliacao ?? 'Processo de avaliacao nao informado.',
      conteudoProgramatico: this.extrairConteudo(programa?.conteudoProgramatico),
      bibliografiaBasica,
      bibliografiaComplementar
    };
  }

  private mapearBibliografia(lista: ProgramaBibliografia[] | undefined): BibliografiaExibida[] {
    if (!Array.isArray(lista) || !lista.length) {
      return [{
        titulo: 'Bibliografia nao informada',
        autores: '',
        editora: '',
        isbn: '',
        anoPublicacao: '',
        localizacao: 'Nao informada',
        disponibilidade: 'Acervo nao informado',
        linkLivro: null
      }];
    }

    return lista.map((item) => ({
      titulo: item?.titulo ?? 'Titulo nao informado',
      autores: item?.autores ?? '',
      editora: item?.editora ?? '',
      isbn: item?.isbn ?? '',
      anoPublicacao: item?.anoPublicacao ? String(item.anoPublicacao) : '',
      localizacao: this.formatarLocalizacao(item?.localizacao),
      disponibilidade: this.formatarDisponibilidade(item),
      linkLivro: item?.linkLivro ?? null
    }));
  }

  private extrairConteudo(conteudoProgramatico?: string): string[] {
    if (!conteudoProgramatico?.trim()) {
      return ['Conteudo programatico nao informado.'];
    }

    const topicos = conteudoProgramatico
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean);

    return topicos.length ? topicos : [conteudoProgramatico];
  }

  private formatarSemestre(semestre?: number): string {
    if (!semestre) {
      return 'Nao informado';
    }

    return `${semestre}o semestre`;
  }

  private formatarData(dataCadastro?: string): string {
    if (!dataCadastro) {
      return 'Sem data';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dataCadastro)) {
      const [ano, mes, dia] = dataCadastro.split('-');
      return `${dia}/${mes}/${ano}`;
    }

    return dataCadastro;
  }

  private formatarLocalizacao(localizacao?: string | null): string {
    if (!localizacao) {
      return 'Nao informada';
    }

    if (localizacao === 'DIGITAL') {
      return 'Acervo digital';
    }

    if (localizacao === 'FISICO') {
      return 'Acervo fisico';
    }

    return localizacao;
  }

  private formatarDisponibilidade(item: ProgramaBibliografia): string {
    if (item?.linkLivro) {
      return 'Disponivel para consulta online';
    }

    if (item?.posicaoEstante) {
      return `Estante ${item.posicaoEstante}`;
    }

    return 'Disponibilidade nao informada';
  }
}
