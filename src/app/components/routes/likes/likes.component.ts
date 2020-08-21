import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {PostService} from '../../../services/post.service';
import {Post} from '../../../models/Post';
import {UserService} from '../../../services/user.service';

@Component({
  selector: 'app-likes',
  templateUrl: './likes.component.html',
  styleUrls: ['./likes.component.css']
})
export class LikesComponent implements OnInit {

  currentRef: string;
  currentPost: Observable<Post>;

  likesId: string;
  likesUsers: any;


  constructor(public route: ActivatedRoute,
              public authService: AuthService,
              public postService: PostService,
              public userService: UserService) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.currentRef = params.ref;

      // Post actual
      this.currentPost = this.postService.getPost(this.currentRef);

      // Likes
      this.postService.getPost(this.currentRef).subscribe(p => {
        // @ts-ignore
        this.likesId = p.likes;

        console.log(this.likesId);
        this.likesUsers = this.postService.getUserByArrayId(this.likesId);
        console.log(this.likesUsers);
      });

    });


  }

}
