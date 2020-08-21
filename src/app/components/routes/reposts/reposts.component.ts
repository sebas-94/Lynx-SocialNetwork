import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {Post} from '../../../models/Post';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {PostService} from '../../../services/post.service';
import {UserService} from '../../../services/user.service';

@Component({
  selector: 'app-reposts',
  templateUrl: './reposts.component.html',
  styleUrls: ['./reposts.component.css']
})
export class RepostsComponent implements OnInit {


  currentRef: string;
  currentPost: Observable<Post>;

  repostsId: string;
  repostsUsers: any;


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
        this.repostsId = p.reposts;

        console.log(this.repostsId);
        this.repostsUsers = this.postService.getUserByArrayId(this.repostsId);
        console.log(this.repostsUsers);
      });

    });


  }

}
