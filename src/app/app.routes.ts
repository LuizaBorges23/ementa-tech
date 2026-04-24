import { Routes } from '@angular/router';
import { InicioComponent } from '../inicio.component'; 
import { LoginComponent } from '../login.component'; 
import { DashboardComponent } from '../dashboard.component';
import { adminGuard } from '../admin.guard';
import { professorGuard } from '../professor.guard';
import { ProfessoresComponent } from './professores/professores.component';
import { CursosComponent } from './cursos/cursos.component';
import { EscolasComponent } from './escolas/escolas.component';
import { IesComponent } from './ies/ies.component';
import { ProgramaDisciplinaComponent } from './programa-disciplina/programa-disciplina.component';
import { DisciplinaComponent } from './disciplina/disciplina.component';
import { ProfessorPortalLayoutComponent } from './professor-portal/professor-portal-layout.component';
import { ProfessorMeusDadosComponent } from './professor-portal/professor-meus-dados.component';
import { ProfessorBibliografiasComponent } from './professor-portal/professor-bibliografias.component';
import { ProfessorProgramaDisciplinaComponent } from './professor-portal/professor-programa-disciplina.component';

export const routes: Routes = [
  { path: '', component: InicioComponent }, 
  { path: 'login', component: LoginComponent }, 
  { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'ies', component: IesComponent, canActivate: [adminGuard] },
  { path: 'escolas', component: EscolasComponent, canActivate: [adminGuard] },
  { path: 'professores', component: ProfessoresComponent, canActivate: [adminGuard] },
  { path: 'cursos', component: CursosComponent, canActivate: [adminGuard] },
  { path: 'programa-disciplina/:id', component: ProgramaDisciplinaComponent, canActivate: [adminGuard] },
  { path: 'disciplinas', component: DisciplinaComponent, canActivate: [adminGuard] },
  {
    path: 'professor',
    component: ProfessorPortalLayoutComponent,
    canActivate: [professorGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'meus-dados' },
      { path: 'meus-dados', component: ProfessorMeusDadosComponent },
      { path: 'informacoes-bibliograficas', component: ProfessorBibliografiasComponent },
      { path: 'programa-disciplina', component: ProfessorProgramaDisciplinaComponent }
    ]
  }
];

