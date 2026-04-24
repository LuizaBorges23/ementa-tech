import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FormacaoProfessorPayload,
  ProfessorPortalFormacao,
  ProfessorPortalResponse,
  ProfessorPortalService
} from '../services/professor-portal.service';

@Component({
  selector: 'app-professor-meus-dados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professor-meus-dados.component.html',
  styleUrls: ['./professor-meus-dados.component.css']
})
export class ProfessorMeusDadosComponent implements OnInit {
  readonly categorias = [
    { valor: 'GRADUACAO', label: 'Graduação' },
    { valor: 'ESPECIALIZACAO', label: 'Especialização' },
    { valor: 'MBA', label: 'MBA' },
    { valor: 'MESTRADO', label: 'Mestrado' },
    { valor: 'DOUTORADO', label: 'Doutorado' },
    { valor: 'POS_DOUTORADO', label: 'Pós-Doutorado' }
  ];

  professor: ProfessorPortalResponse | null = null;
  carregando = true;
  salvando = false;
  mensagemErro = '';
  mensagemSucesso = '';
  novaFormacao: FormacaoProfessorPayload = this.criarFormulario();

  constructor(private professorPortalService: ProfessorPortalService) {}

  ngOnInit(): void {
    this.carregarPerfil();
  }

  carregarPerfil(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.professorPortalService.getMeuPerfil().subscribe({
      next: (professor) => {
        this.professor = {
          ...professor,
          formacoes: [...(professor.formacoes ?? [])].sort((a, b) => b.anoConclusao - a.anoConclusao)
        };
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar meus dados do professor:', erro);
        this.carregando = false;
        this.mensagemErro = 'Não foi possível carregar os dados do professor agora.';
      }
    });
  }

  salvarFormacao(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (
      !this.novaFormacao.categoriaTitulacao ||
      !this.novaFormacao.instituicaoConclusao.trim() ||
      !this.novaFormacao.nomeCurso.trim() ||
      !this.novaFormacao.anoConclusao
    ) {
      this.mensagemErro = 'Preencha todos os campos de titulação antes de salvar.';
      return;
    }

    this.salvando = true;

    this.professorPortalService.adicionarFormacao({
      categoriaTitulacao: this.novaFormacao.categoriaTitulacao,
      instituicaoConclusao: this.novaFormacao.instituicaoConclusao.trim(),
      nomeCurso: this.novaFormacao.nomeCurso.trim(),
      anoConclusao: this.novaFormacao.anoConclusao
    }).subscribe({
      next: (formacao: ProfessorPortalFormacao) => {
        if (this.professor) {
          this.professor = {
            ...this.professor,
            formacoes: [...this.professor.formacoes, formacao].sort((a, b) => b.anoConclusao - a.anoConclusao)
          };
        }

        this.novaFormacao = this.criarFormulario();
        this.salvando = false;
        this.mensagemSucesso = 'Titulação cadastrada com sucesso.';
      },
      error: (erro) => {
        console.error('Erro ao salvar formação do professor:', erro);
        this.salvando = false;
        this.mensagemErro = 'Não foi possível salvar a titulação agora.';
      }
    });
  }

  formatarCategoria(categoria: string): string {
    const categoriaEncontrada = this.categorias.find((item) => item.valor === categoria);
    return categoriaEncontrada?.label ?? categoria;
  }

  private criarFormulario(): FormacaoProfessorPayload {
    return {
      categoriaTitulacao: '',
      instituicaoConclusao: '',
      nomeCurso: '',
      anoConclusao: null
    };
  }
}
