import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgramaBibliografia, ProgramaDisciplinaResponse } from '../services/programa-disciplina.service';
import { ProfessorPortalService } from '../services/professor-portal.service';

interface UnidadeConteudo {
  titulo: string;
  topicos: string[];
}

@Component({
  selector: 'app-professor-programa-disciplina',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professor-programa-disciplina.component.html',
  styleUrls: ['./professor-programa-disciplina.component.css']
})
export class ProfessorProgramaDisciplinaComponent implements OnInit {
  programas: ProgramaDisciplinaResponse[] = [];
  programaSelecionadoId: number | null = null;
  carregando = true;
  mensagemErro = '';

  constructor(private professorPortalService: ProfessorPortalService) {}

  ngOnInit(): void {
    this.carregarProgramas();
  }

  get programaSelecionado(): ProgramaDisciplinaResponse | null {
    if (this.programaSelecionadoId == null) {
      return null;
    }

    return this.programas.find((programa) => programa.id === this.programaSelecionadoId) ?? null;
  }

  carregarProgramas(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.professorPortalService.listarMeusProgramas().subscribe({
      next: (programas) => {
        this.programas = Array.isArray(programas) ? programas : [];
        this.programaSelecionadoId = this.programas[0]?.id ?? null;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar programas da disciplina do professor:', erro);
        this.carregando = false;
        this.mensagemErro = 'Não foi possível carregar os programas da disciplina agora.';
      }
    });
  }

  selecionarPrograma(programaId: string | number | null): void {
    if (programaId == null || programaId === '') {
      this.programaSelecionadoId = null;
      return;
    }

    this.programaSelecionadoId = Number(programaId);
  }

  listarUnidades(conteudoProgramatico: string | undefined): UnidadeConteudo[] {
    if (!conteudoProgramatico?.trim()) {
      return [{ titulo: 'Unidade 1', topicos: ['Conteúdo programático não informado.'] }];
    }

    return conteudoProgramatico
      .split(';')
      .map((topico) => topico.trim())
      .filter(Boolean)
      .map((topico, indice) => ({
        titulo: `Unidade ${indice + 1}`,
        topicos: [topico]
      }));
  }

  formatarData(data?: string): string {
    if (!data) {
      return 'Sem data';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      const [ano, mes, dia] = data.split('-');
      return `${dia}/${mes}/${ano}`;
    }

    return data;
  }

  formatarStatus(ativo?: boolean): string {
    return ativo ? 'Ativo' : 'Inativo';
  }

  formatarBibliografia(bibliografia: ProgramaBibliografia): string {
    const partes = [bibliografia.titulo, bibliografia.autores, bibliografia.editora].filter(Boolean);
    return partes.join(' · ');
  }
}
