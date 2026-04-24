import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgramaBibliografia, ProgramaDisciplinaResponse } from '../services/programa-disciplina.service';
import { BibliografiaPayload, ProfessorPortalService } from '../services/professor-portal.service';

@Component({
  selector: 'app-professor-bibliografias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professor-bibliografias.component.html',
  styleUrls: ['./professor-bibliografias.component.css']
})
export class ProfessorBibliografiasComponent implements OnInit {
  programas: ProgramaDisciplinaResponse[] = [];
  programaSelecionadoId: number | null = null;
  carregando = true;
  salvandoBasica = false;
  salvandoComplementar = false;
  mensagemErro = '';
  mensagemSucesso = '';
  novaBasica: BibliografiaPayload = this.criarBibliografiaPadrao('FISICO');
  novaComplementar: BibliografiaPayload = this.criarBibliografiaPadrao('DIGITAL');

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

  carregarProgramas(programaIdPreferencial?: number | null): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.professorPortalService.listarMeusProgramas().subscribe({
      next: (programas) => {
        this.programas = Array.isArray(programas) ? programas : [];
        const programaPreferencial = programaIdPreferencial ?? this.programaSelecionadoId ?? this.programas[0]?.id ?? null;
        this.programaSelecionadoId = this.programas.some((programa) => programa.id === programaPreferencial)
          ? programaPreferencial
          : this.programas[0]?.id ?? null;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar bibliografias do professor:', erro);
        this.carregando = false;
        this.mensagemErro = 'Não foi possível carregar as informações bibliográficas agora.';
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

  salvarBasica(): void {
    const programa = this.programaSelecionado;
    if (!programa) {
      this.mensagemErro = 'Selecione uma disciplina para cadastrar a bibliografia básica.';
      return;
    }

    if (programa.bibliografiasBasicas.length >= 3) {
      this.mensagemErro = 'Esta disciplina já possui as 03 bibliografias básicas exigidas.';
      return;
    }

    const payload = this.normalizarBibliografia(this.novaBasica);
    if (!payload) {
      return;
    }

    this.salvandoBasica = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    this.professorPortalService.adicionarBibliografiaBasica(programa.id, payload).subscribe({
      next: () => {
        this.salvandoBasica = false;
        this.novaBasica = this.criarBibliografiaPadrao('FISICO');
        this.mensagemSucesso = 'Bibliografia básica cadastrada com sucesso.';
        this.carregarProgramas(programa.id);
      },
      error: (erro) => {
        console.error('Erro ao salvar bibliografia básica:', erro);
        this.salvandoBasica = false;
        this.mensagemErro = 'Não foi possível salvar a bibliografia básica agora.';
      }
    });
  }

  salvarComplementar(): void {
    const programa = this.programaSelecionado;
    if (!programa) {
      this.mensagemErro = 'Selecione uma disciplina para cadastrar a bibliografia complementar.';
      return;
    }

    if (programa.bibliografiasComplementares.length >= 5) {
      this.mensagemErro = 'Esta disciplina já possui as 05 bibliografias complementares exigidas.';
      return;
    }

    const payload = this.normalizarBibliografia(this.novaComplementar);
    if (!payload) {
      return;
    }

    this.salvandoComplementar = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    this.professorPortalService.adicionarBibliografiaComplementar(programa.id, payload).subscribe({
      next: () => {
        this.salvandoComplementar = false;
        this.novaComplementar = this.criarBibliografiaPadrao('DIGITAL');
        this.mensagemSucesso = 'Bibliografia complementar cadastrada com sucesso.';
        this.carregarProgramas(programa.id);
      },
      error: (erro) => {
        console.error('Erro ao salvar bibliografia complementar:', erro);
        this.salvandoComplementar = false;
        this.mensagemErro = 'Não foi possível salvar a bibliografia complementar agora.';
      }
    });
  }

  formatarLocalizacao(localizacao: string | null | undefined): string {
    return localizacao === 'DIGITAL' ? 'Digital' : 'Físico';
  }

  detalheLocalizacao(bibliografia: ProgramaBibliografia): string {
    if (bibliografia.localizacao === 'DIGITAL') {
      return bibliografia.linkLivro ?? '-';
    }

    return bibliografia.posicaoEstante ?? '-';
  }

  private normalizarBibliografia(modelo: BibliografiaPayload): BibliografiaPayload | null {
    if (
      !modelo.titulo.trim() ||
      !modelo.autores.trim() ||
      !modelo.editora.trim() ||
      !modelo.isbn.trim() ||
      !modelo.anoPublicacao
    ) {
      this.mensagemErro = 'Preencha título do livro, autores do livro, editora, ISBN e ano de publicação.';
      return null;
    }

    if (modelo.localizacao === 'DIGITAL' && !modelo.linkLivro?.trim()) {
      this.mensagemErro = 'Informe o link do livro quando a localização for digital.';
      return null;
    }

    if (modelo.localizacao === 'FISICO' && !modelo.posicaoEstante?.trim()) {
      this.mensagemErro = 'Informe a posição na estante quando a localização for física.';
      return null;
    }

    return {
      titulo: modelo.titulo.trim(),
      autores: modelo.autores.trim(),
      editora: modelo.editora.trim(),
      isbn: modelo.isbn.trim(),
      anoPublicacao: modelo.anoPublicacao,
      localizacao: modelo.localizacao,
      linkLivro: modelo.localizacao === 'DIGITAL' ? modelo.linkLivro?.trim() ?? null : null,
      posicaoEstante: modelo.localizacao === 'FISICO' ? modelo.posicaoEstante?.trim() ?? null : null
    };
  }

  private criarBibliografiaPadrao(localizacao: 'DIGITAL' | 'FISICO'): BibliografiaPayload {
    return {
      titulo: '',
      autores: '',
      editora: '',
      isbn: '',
      anoPublicacao: null,
      localizacao,
      linkLivro: '',
      posicaoEstante: ''
    };
  }
}
