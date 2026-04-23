import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DisciplinaService } from '../services/disciplina.service';

interface DisciplinaTabela {
  sigla: string;
  descricao: string;
  cargaHoraria: string;
  escola: string;
  curso: string;
  dataCadastro: string;
  status: string;
}

@Component({
  selector: 'app-disciplinas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './disciplina.component.html',
  styleUrls: ['./disciplina.component.css']
})
export class DisciplinaComponent implements OnInit {
  listaDisciplinas: DisciplinaTabela[] = [];
  carregando = false;
  mensagemErro = '';

  constructor(private disciplinaService: DisciplinaService) {}

  ngOnInit(): void {
    this.carregarDisciplinas();
  }

  carregarDisciplinas(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.disciplinaService.listarDisciplinas().subscribe({
      next: (resposta: any) => {
        const dadosDoBanco = resposta.content ? resposta.content : (Array.isArray(resposta) ? resposta : []);

        this.listaDisciplinas = dadosDoBanco.map((disciplinaJava: any) => ({
          sigla: disciplinaJava.sigla,
          descricao: disciplinaJava.descricao,
          cargaHoraria: `${disciplinaJava.cargaHoraria ?? 0}h`,
          escola: disciplinaJava.escola ? disciplinaJava.escola.nome : 'Sem escola',
          curso: this.formatarCursos(disciplinaJava),
          dataCadastro: this.formatarData(disciplinaJava.dataCadastro),
          status: disciplinaJava.ativo ? 'Ativo' : 'Inativo'
        }));

        this.carregando = false;
      },
      error: (erro: any) => {
        console.error('Erro ao buscar as disciplinas do banco:', erro);
        this.carregando = false;

        if (erro.status === 401 || erro.status === 403) {
          alert('Erro de seguranca ao carregar disciplinas. Faca login novamente e confirme se o backend aceita as mesmas credenciais usadas no sistema.');
          return;
        }

        this.mensagemErro = 'Nao foi possivel carregar a listagem de disciplinas no backend agora.';
      }
    });
  }

  private formatarCursos(disciplinaJava: any): string {
    const cursos = Array.isArray(disciplinaJava.cursos) ? disciplinaJava.cursos : [];

    if (disciplinaJava.sigla === 'BES008' || cursos.length > 1) {
      return 'Ambos Cursos';
    }

    if (!cursos.length) {
      return 'Sem Curso';
    }

    return cursos
      .map((curso: any) => curso.descricao || curso.nome || curso.sigla)
      .join(', ');
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
