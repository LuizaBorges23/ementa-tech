import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, SessaoUsuario } from './auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  abaAtiva: 'professor' | 'admin' = 'professor';
  modoVisualizacao: 'abas' | 'lado-a-lado' = 'abas';

  // Campos do Professor
  usernameProfessor = '';
  senhaProfessor = '';
  mostrarSenhaProfessor = false;

  // Campos do Administrador
  usernameAdmin = '';
  senhaAdmin = '';
  mostrarSenhaAdmin = false;

  // Estados de feedback
  mensagemErro = '';
  mensagemSucesso = '';
  carregando = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selecionarAba(aba: 'professor' | 'admin') {
    this.abaAtiva = aba;
    this.fecharAlerta();
  }

  alternarModoVisualizacao() {
    this.fecharAlerta();
    this.modoVisualizacao = this.modoVisualizacao === 'abas' ? 'lado-a-lado' : 'abas';
  }

  toggleSenha(tipo: 'professor' | 'admin') {
    if (tipo === 'professor') {
      this.mostrarSenhaProfessor = !this.mostrarSenhaProfessor;
    } else {
      this.mostrarSenhaAdmin = !this.mostrarSenhaAdmin;
    }
  }

  preencherDemo(tipo: 'professor' | 'admin') {
    if (tipo === 'professor') {
      this.usernameProfessor = 'professor';
      this.senhaProfessor = 'professor123';
      this.abaAtiva = 'professor';
      this.mensagemSucesso = 'Credenciais de demonstração do Professor preenchidas!';
      this.mensagemErro = '';
    } else {
      this.usernameAdmin = 'admin';
      this.senhaAdmin = 'admin123';
      this.abaAtiva = 'admin';
      this.mensagemSucesso = 'Credenciais de demonstração do Administrador preenchidas!';
      this.mensagemErro = '';
    }
  }

  fecharAlerta() {
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  aoEntrar(tipo: 'professor' | 'admin') {
    this.fecharAlerta();

    const username = (tipo === 'professor' ? this.usernameProfessor : this.usernameAdmin).trim();
    const senha = tipo === 'professor' ? this.senhaProfessor : this.senhaAdmin;

    if (!username || !senha) {
      this.mensagemErro = `Por favor, preencha o usuário e a senha para o acesso do ${tipo === 'professor' ? 'Professor' : 'Administrador'}.`;
      return;
    }

    this.carregando = true;

    this.authService.login(username, senha).subscribe({
      next: (sessao: SessaoUsuario) => {
        this.carregando = false;
        this.mensagemSucesso = 'Autenticado com sucesso! Redirecionando...';

        setTimeout(() => {
          if (sessao.role === 'ROLE_ADMIN') {
            this.router.navigate(['/dashboard']);
            return;
          }

          this.router.navigate(['/professor/meus-dados']);
        }, 400);
      },
      error: (erro) => {
        this.carregando = false;
        this.authService.clearSession();
        const backendMessage = typeof erro?.error?.message === 'string' ? erro.error.message : '';

        if (erro.status === 0) {
          this.mensagemErro = 'Não foi possível conectar ao backend em http://localhost:8081. Verifique se o servidor está rodando.';
          return;
        }

        if (backendMessage.toLowerCase().includes('inativo')) {
          this.mensagemErro = backendMessage;
          return;
        }

        if (erro.status === 401 || erro.status === 403 || backendMessage.includes('senha inv') || backendMessage.includes('Usu')) {
          this.mensagemErro = 'Usuário ou senha inválidos para este perfil.';
          return;
        }

        this.mensagemErro = 'Não foi possível autenticar no momento. Verifique suas credenciais.';
      }
    });
  }
}
