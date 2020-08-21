import {Component, OnInit} from '@angular/core';
// Routing
import {ActivatedRoute} from '@angular/router';
// Interfaces
import {User} from '../../../models/User';
import {UserService} from '../../../services/user.service';
// Observable
import {Observable} from 'rxjs';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-follow',
  templateUrl: './follow.component.html',
  styleUrls: ['./follow.component.css']
})
export class FollowComponent implements OnInit {

  currentId: string;
  currentUser: Observable<User>;

  followsId: string;
  follows: any;


  constructor(public route: ActivatedRoute,
              public authService: AuthService,
              public userService: UserService) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.currentId = params.id;

      // Usuario actual
      this.currentUser = this.userService.getUserById(this.currentId);

      // Seguidos del usuario actual
      this.userService.getUserById(this.currentId).subscribe(u => {
        // @ts-ignore
        this.followsId = u.follows;

        this.follows = this.userService.getUserByArrayId(this.followsId);

      });

    });


  }


}
