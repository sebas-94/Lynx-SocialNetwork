import {Component, OnInit} from '@angular/core';

// Servicios
import {UserService} from '../../../services/user.service';
// Modelos
import {User} from '../../../models/User';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  search = '';
  currentUser: User;
  allUsers: Array<User>;
  manyUsers: Array<User>;

  constructor(public userService: UserService,
              public authService: AuthService) {
  }

  ngOnInit(): void {
    // Obtiene usuario actual
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    // Obtine todo los usuarios
    this.userService.getAllUsers().subscribe(users => {
      this.allUsers = users;
    });
  }

}
