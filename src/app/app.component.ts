import {Component} from '@angular/core';

// Servicios
import {AuthService} from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  loading = true;

  constructor(public authService: AuthService) {

    setTimeout(() => {
      this.loading = false;
    }, 1500);

  }

}


