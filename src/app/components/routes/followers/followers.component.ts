import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {User} from '../../../models/User';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {UserService} from '../../../services/user.service';

@Component({
  selector: 'app-followers',
  templateUrl: './followers.component.html',
  styleUrls: ['./followers.component.css']
})
export class FollowersComponent implements OnInit {

  currentId: string;
  currentUser: Observable<User>;

  followersId: string;
  followers: any;

  constructor(public route: ActivatedRoute,
              public authService: AuthService,
              public userService: UserService) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.currentId = params.id;

      // Usuario actual
      this.currentUser = this.userService.getUserById(this.currentId);

      // Seguidores y seguidos del usuario actual
      this.userService.getUserById(this.currentId).subscribe(u => {
        // @ts-ignore
        this.followersId = u.followers;
        this.followers = this.userService.getUserByArrayId(this.followersId);

      });

    });


  }


}
