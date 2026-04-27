import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, SessaoUsuario } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cadastro.html'
})
export class LoginComponent {
  username = '';
  senha = '';
  mensagemErro = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  aoEntrar() {
    this.mensagemErro = '';

    if (!this.username.trim() || !this.senha) {
      this.mensagemErro = 'Informe usuario e senha para entrar.';
      return;
    }

    this.authService.login(this.username, this.senha).subscribe({
      next: (sessao: SessaoUsuario) => {
        this.mensagemErro = '';

        if (sessao.role === 'ROLE_ADMIN') {
          this.router.navigate(['/dashboard']);
          return;
        }

        this.router.navigate(['/professor/meus-dados']);
      },
      error: (erro) => {
        this.authService.clearSession();
        const backendMessage = typeof erro?.error?.message === 'string' ? erro.error.message : '';

        if (erro.status === 0) {
          this.mensagemErro = 'Nao foi possivel conectar ao backend em http://localhost:8081. ';
          return;
        }

        if (backendMessage.toLowerCase().includes('inativo')) {
          this.mensagemErro = backendMessage;
          return;
        }

        if (erro.status === 401 || erro.status === 403 || backendMessage.includes('senha inv') || backendMessage.includes('Usu')) {
          this.mensagemErro = 'Usuario ou senha invalidos.';
          return;
        }

        this.mensagemErro = 'Nao foi possivel autenticar agora.';
      }
    });
  }
}
