import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EscolaService } from '../services/escola.service';
import {
  InstituicaoEnsinoSuperior,
  InstituicaoRequest,
  InstituicaoService
} from '../services/instituicao.service';

interface IesTabela {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  totalEscolas: number;
}

@Component({
  selector: 'app-ies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ies.component.html',
  styleUrls: ['./ies.component.css']
})
export class IesComponent implements OnInit {
  carregando = false;
  salvando = false;
  mensagemErro = '';
  mensagemSucesso = '';
  editandoId: number | null = null;
  totalEscolasVinculadas = 0;
  listaInstituicoes: IesTabela[] = [];
  formulario = {
    nome: '',
    endereco: '',
    telefone: ''
  };

  constructor(
    private instituicaoService: InstituicaoService,
    private escolaService: EscolaService
  ) {}

  ngOnInit(): void {
    this.carregarInstituicoes();
  }

  carregarInstituicoes(): void {
    this.carregando = true;
    this.mensagemErro = '';

    forkJoin({
      instituicoes: this.instituicaoService.listarInstituicoes(),
      escolas: this.escolaService.listarEscolas()
    }).subscribe({
      next: ({ instituicoes, escolas }) => {
        const listaInstituicoes = Array.isArray(instituicoes) ? instituicoes : [];
        const listaEscolas = Array.isArray(escolas) ? escolas : [];
        const escolasPorIes = new Map<number, number>();

        listaEscolas.forEach((escola) => {
          const iesId = escola?.ies?.id;
          if (iesId == null) {
            return;
          }

          escolasPorIes.set(iesId, (escolasPorIes.get(iesId) ?? 0) + 1);
        });

        this.totalEscolasVinculadas = listaEscolas.length;
        this.listaInstituicoes = listaInstituicoes.map((instituicao) => this.mapearInstituicao(instituicao, escolasPorIes));
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar IES e escolas:', erro);
        this.carregando = false;
        this.mensagemErro = this.formatarErro(erro, 'Nao foi possivel carregar as IES .');
      }
    });
  }

  salvarInstituicao(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const payload = this.montarPayload();
    if (!payload) {
      this.mensagemErro = 'Preencha nome, endereco e telefone da IES antes de salvar.';
      return;
    }

    this.salvando = true;
    const requisicao = this.editandoId == null
      ? this.instituicaoService.salvarInstituicao(payload)
      : this.instituicaoService.atualizarInstituicao(this.editandoId, payload);

    requisicao.subscribe({
      next: () => {
        this.salvando = false;
        this.mensagemSucesso = this.editandoId == null
          ? 'IES cadastrada com sucesso.'
          : 'IES atualizada com sucesso.';
        this.limparFormulario();
        this.carregarInstituicoes();
      },
      error: (erro) => {
        console.error('Erro ao salvar IES:', erro);
        this.salvando = false;
        this.mensagemErro = this.formatarErro(erro, 'Nao foi possivel salvar a IES agora.');
      }
    });
  }

  editarInstituicao(instituicao: IesTabela): void {
    this.editandoId = instituicao.id;
    this.formulario = {
      nome: instituicao.nome,
      endereco: instituicao.endereco,
      telefone: instituicao.telefone
    };
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  cancelarEdicao(): void {
    this.limparFormulario();
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  private mapearInstituicao(
    instituicao: InstituicaoEnsinoSuperior,
    escolasPorIes: Map<number, number>
  ): IesTabela {
    return {
      id: instituicao.id,
      nome: instituicao.nome ?? 'IES sem nome',
      endereco: instituicao.endereco ?? '-',
      telefone: instituicao.telefone ?? '-',
      totalEscolas: escolasPorIes.get(instituicao.id) ?? 0
    };
  }

  private montarPayload(): InstituicaoRequest | null {
    const nome = this.formulario.nome.trim();
    const endereco = this.formulario.endereco.trim();
    const telefone = this.formulario.telefone.trim();

    if (!nome || !endereco || !telefone) {
      return null;
    }

    return { nome, endereco, telefone };
  }

  private limparFormulario(): void {
    this.editandoId = null;
    this.formulario = {
      nome: '',
      endereco: '',
      telefone: ''
    };
  }

  private formatarErro(erro: any, fallback: string): string {
    if (erro?.status === 401 || erro?.status === 403) {
      return 'Erro de seguranca ao carregar ou salvar IES. Faca login novamente.';
    }

    return fallback;
  }
}
