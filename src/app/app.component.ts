import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AuthRedirectService } from './services/auth-redirect.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'chessoutpost';
  private authRedirectService = inject(AuthRedirectService);

  ngOnInit() {
    // Initialise la surveillance des changements d'authentification
    this.authRedirectService.initializeAuthRedirect();
  }
}
