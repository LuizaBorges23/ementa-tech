import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CursoService } from '../services/curso.service';
import { DisciplinaService } from '../services/disciplina.service';
import { ProgramaDisciplinaService } from '../services/programa-disciplina.service';

interface DisciplinaMatriz {
  id: string;
  semestre: string;
  nome: string;
  status: string;
  sigla: string;
}

interface CursoTabela {
  id: number;
  nome: string;
  sigla: string;
  escola: string;
  coordenador: string;
  dataCadastro: string;
  status: string;
  matriz: DisciplinaMatriz[];
}

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css']
})
export class CursosComponent implements OnInit {
  mostrarMatriz = false;
  carregando = false;
  mensagemErro = '';
  cursoSelecionado: CursoTabela | null = null;
  disciplinasDaMatriz: DisciplinaMatriz[] = [];
  listaCursos: CursoTabela[] = [];

  constructor(
    private cursoService: CursoService,
    private disciplinaService: DisciplinaService,
    private programaDisciplinaService: ProgramaDisciplinaService
  ) {}

  ngOnInit(): void {
    this.carregarCursos();
  }

  carregarCursos(): void {
    this.carregando = true;
    this.mensagemErro = '';

    forkJoin({
      cursos: this.cursoService.listarCursos(),
      disciplinas: this.disciplinaService.listarDisciplinas(),
      programas: this.programaDisciplinaService.listarProgramas()
    }).subscribe({
      next: ({ cursos, disciplinas, programas }) => {
        const listaCursos = Array.isArray(cursos) ? cursos : [];
        const listaDisciplinas = Array.isArray(disciplinas) ? disciplinas : [];
        const listaProgramas = Array.isArray(programas) ? programas : [];
        const disciplinasPorId = new Map<number, any>(
          listaDisciplinas
            .filter((disciplina: any) => disciplina?.id != null)
            .map((disciplina: any) => [disciplina.id, disciplina])
        );

        this.listaCursos = listaCursos.map((curso: any) => ({
          id: curso.id,
          nome: curso.descricao ?? 'Curso sem nome',
          sigla: curso.sigla ?? '-',
          escola: curso.escola?.nome ?? 'Sem escola',
          coordenador: curso.coordenadorCurso?.nomeCompleto ?? 'Sem coordenador',
          dataCadastro: this.formatarData(curso.dataCadastro),
          status: curso.ativo ? 'Ativo' : 'Inativo',
          matriz: this.montarMatriz(curso.id, listaProgramas, disciplinasPorId)
        }));

        this.carregando = false;
      },
      error: (erro: any) => {
        console.error('Erro ao buscar cursos, disciplinas e programas:', erro);
        this.carregando = false;

        if (erro.status === 401 || erro.status === 403) {
          alert('Erro de seguranca ao carregar cursos. Faca login novamente e confirme se o backend aceita as mesmas credenciais usadas no sistema.');
          return;
        }

        this.mensagemErro = 'Nao foi possivel carregar a listagem de cursos no backend agora.';
      }
    });
  }

  abrirMatriz(curso: CursoTabela): void {
    this.cursoSelecionado = curso;
    this.disciplinasDaMatriz = curso.matriz;
    this.mostrarMatriz = true;
  }

  fecharMatriz(): void {
    this.mostrarMatriz = false;
    this.cursoSelecionado = null;
    this.disciplinasDaMatriz = [];
  }

  totalProgramas(curso: CursoTabela): number {
    return curso.matriz.length;
  }

  private montarMatriz(cursoId: number, programas: any[], disciplinasPorId: Map<number, any>): DisciplinaMatriz[] {
    return programas
      .map((programa: any) => {
        const disciplina = disciplinasPorId.get(programa?.disciplina?.id);
        return { programa, disciplina };
      })
      .filter(({ disciplina }) =>
        Array.isArray(disciplina?.cursos) &&
        disciplina.cursos.some((curso: any) => curso.id === cursoId)
      )
      .sort((atual, proximo) => (atual.programa?.semestre ?? 99) - (proximo.programa?.semestre ?? 99))
      .map(({ programa, disciplina }) => ({
        id: String(programa.id),
        semestre: this.formatarSemestre(programa.semestre),
        nome: disciplina?.descricao ?? programa?.disciplina?.descricao ?? 'Disciplina sem nome',
        status: programa.ativo ? 'Ativo' : 'Inativo',
        sigla: disciplina?.sigla ?? programa?.disciplina?.sigla ?? '-'
      }));
  }

  private formatarSemestre(semestre?: number): string {
    if (!semestre) {
      return 'Sem semestre';
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
}
