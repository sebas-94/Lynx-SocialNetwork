import {Component, OnInit} from '@angular/core';

// Routing
import {ActivatedRoute, Router} from '@angular/router';
// Modelos
import {User} from '../../../models/User';
// Servicios
import {AuthService} from '../../../services/auth.service';
import {UserService} from '../../../services/user.service';
import {PostService} from '../../../services/post.service';
// Observable
import {Observable} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Post} from '../../../models/Post';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user: Observable<User>;
  posts: Observable<any>;

  // Form reply
  postForm: FormGroup;
  post = {} as Post;
  replyLength = 0;
  replymaxLength = 200;


  constructor(public route: ActivatedRoute,
              private router: Router,
              public authService: AuthService,
              public userService: UserService,
              public postService: PostService,
              public fb: FormBuilder) {
  }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.user = this.userService.getUserById(params.id);

      // Comprueba si existe el ususario
      this.user.subscribe(u => {
        // Si no existe, redirige
          if (u === undefined) {
            this.router.navigate(['404']);
          }

        }
      );

      this.posts = this.postService.getUserPosts(params.id);
    });


    // Validators
    this.postForm = this.fb.group({
      content: ['',
        [Validators.required, Validators.minLength(1), Validators.maxLength(this.replymaxLength)]
      ]
    });

    // Suscribe los cambios en cada cambio de valor
    this.postForm.valueChanges.subscribe(fn =>
      this.onValueChanged()
    );

  }

  onValueChanged() {
    if (this.postForm.get('content').value !== undefined) {
      this.replyLength = this.postForm.get('content').value.length;
      this.post.content = this.postForm.get('content').value;
    }
  }

}
