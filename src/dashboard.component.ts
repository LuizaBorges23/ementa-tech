import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CursoService } from './app/services/curso.service';
import { DisciplinaService } from './app/services/disciplina.service';
import { EscolaService } from './app/services/escola.service';
import { InstituicaoService } from './app/services/instituicao.service';
import { ProfessorService } from './app/services/professor.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  carregando = false;
  mensagemErro = '';
  totais = {
    ies: 0,
    escolas: 0,
    professores: 0,
    cursos: 0,
    disciplinas: 0
  };

  constructor(
    private instituicaoService: InstituicaoService,
    private escolaService: EscolaService,
    private professorService: ProfessorService,
    private cursoService: CursoService,
    private disciplinaService: DisciplinaService
  ) {}

  ngOnInit(): void {
    this.carregarTotais();
  }

  carregarTotais(): void {
    this.carregando = true;
    this.mensagemErro = '';

    forkJoin({
      ies: this.instituicaoService.listarInstituicoes(),
      escolas: this.escolaService.listarEscolas(),
      professores: this.professorService.listarProfessores(),
      cursos: this.cursoService.listarCursos(),
      disciplinas: this.disciplinaService.listarDisciplinas()
    }).subscribe({
      next: ({ ies, escolas, professores, cursos, disciplinas }) => {
        this.totais = {
          ies: Array.isArray(ies) ? ies.length : 0,
          escolas: Array.isArray(escolas) ? escolas.length : 0,
          professores: Array.isArray(professores) ? professores.length : 0,
          cursos: Array.isArray(cursos) ? cursos.length : 0,
          disciplinas: Array.isArray(disciplinas) ? disciplinas.length : 0
        };
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar totais do dashboard:', erro);
        this.carregando = false;
        this.mensagemErro = 'Nao foi possivel carregar todos os indicadores do painel agora.';
      }
    });
  }
}
