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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  aoEntrar() {
    if (!this.username.trim() || !this.senha) {
      alert('Informe usuario e senha para entrar.');
      return;
    }

    this.authService.login(this.username, this.senha).subscribe({
      next: (sessao: SessaoUsuario) => {
        if (sessao.role === 'ROLE_ADMIN') {
          this.router.navigate(['/dashboard']);
          return;
        }

        alert('Login realizado, mas a area do professor ainda esta em construcao.');
      },
      error: (erro) => {
        this.authService.clearSession();
        const backendMessage = typeof erro?.error?.message === 'string' ? erro.error.message : '';

        if (erro.status === 0) {
          alert('Nao foi possivel conectar ao backend em http://localhost:8081. Verifique se o Spring Boot esta em execucao.');
          return;
        }

        if (erro.status === 401 || erro.status === 403 || backendMessage.includes('senha inv') || backendMessage.includes('Usu')) {
          alert('Usuario ou senha invalidos no backend. Para administrador, use usuario admin e senha admin123.');
          return;
        }

        alert('Nao foi possivel autenticar no backend agora.');
      }
    });
  }
}
