import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProfessorService } from '../services/professor.service';
import { CursoService } from '../services/curso.service';

interface ProfessorTabela {
  id: number;
  ativo: boolean;
  matricula: string;
  nome: string;
  email: string;
  telefone: string;
  escolaVinculada: string;
  curso: string;
  status: string;
}

@Component({
  selector: 'app-professores',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './professores.component.html',
  styleUrls: ['./professores.component.css']
})
export class ProfessoresComponent implements OnInit {
  totalCursosOfertados = 0;
  carregando = false;
  mensagemErro = '';
  listaProfessores: ProfessorTabela[] = [];

  constructor(
    private professorService: ProfessorService,
    private cursoService: CursoService
  ) {}

  ngOnInit(): void {
    this.carregarProfessores();
  }

  get totalProfessoresAtivos(): number {
    return this.listaProfessores.filter((professor) => professor.ativo).length;
  }

  carregarProfessores(): void {
    this.carregando = true;
    this.mensagemErro = '';

    forkJoin({
      professores: this.professorService.listarProfessores(),
      cursos: this.cursoService.listarCursos()
    }).subscribe({
      next: ({ professores, cursos }) => {
        const listaProfessores = Array.isArray(professores) ? professores : [];
        const listaCursos = Array.isArray(cursos) ? cursos : [];
        const cursosPorEscola = new Map<number, string>(
          listaCursos
            .filter((curso: any) => curso?.escola?.id != null)
            .map((curso: any) => [curso.escola.id, curso.descricao])
        );

        this.totalCursosOfertados = listaCursos.length;
        this.listaProfessores = listaProfessores.map((professor: any) => ({
          id: professor.id,
          ativo: !!professor.ativo,
          matricula: professor.matricula ?? '-',
          nome: professor.nomeCompleto ?? 'Professor sem nome',
          email: professor.email ?? '-',
          telefone: professor.telefone ?? '-',
          escolaVinculada: professor.escola?.nome ?? 'Sem escola',
          curso: cursosPorEscola.get(professor.escola?.id) ?? 'Curso nao vinculado',
          status: professor.ativo ? 'Ativo' : 'Inativo'
        }));

        this.carregando = false;
      },
      error: (erro: any) => {
        console.error('Erro ao buscar professores:', erro);
        this.carregando = false;

        if (erro.status === 401 || erro.status === 403) {
          alert('Erro de seguranca ao carregar professores. Faca login novamente e confirme se o backend aceita as mesmas credenciais usadas no sistema.');
          return;
        }

        this.mensagemErro = 'Nao foi possivel carregar a listagem de professores no backend agora.';
      }
    });
  }

  inativarProfessor(professor: ProfessorTabela): void {
    if (!professor.ativo) {
      return;
    }

    const confirmacao = confirm(`Deseja realmente inativar o professor ${professor.nome}?`);
    if (!confirmacao) {
      return;
    }

    this.professorService.inativarProfessor(professor.id).subscribe({
      next: () => this.carregarProfessores(),
      error: (erro: any) => {
        console.error('Erro ao inativar professor:', erro);

        if (erro.status === 401 || erro.status === 403) {
          alert('Erro de seguranca ao inativar o professor. Faca login novamente.');
          return;
        }

        alert('Nao foi possivel inativar o professor no backend agora.');
      }
    });
  }

  ativarProfessor(professor: ProfessorTabela): void {
    if (professor.ativo) {
      return;
    }

    const confirmacao = confirm(`Deseja realmente ativar o professor ${professor.nome}?`);
    if (!confirmacao) {
      return;
    }

    this.professorService.ativarProfessor(professor.id).subscribe({
      next: () => this.carregarProfessores(),
      error: (erro: any) => {
        console.error('Erro ao ativar professor:', erro);

        if (erro.status === 401 || erro.status === 403) {
          alert('Erro de seguranca ao ativar o professor. Faca login novamente.');
          return;
        }

        alert('Nao foi possivel ativar o professor no backend agora.');
      }
    });
  }
}
