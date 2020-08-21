import {Component, OnInit} from '@angular/core';

// Servicios
import {PostService} from '../../services/post.service';
import {AuthService} from '../../services/auth.service';
import {UserService} from '../../services/user.service';
// Modelos
import {Post} from '../../models/Post';
import {User} from '../../models/User';
// Observables
import {Observable} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';


@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css']
})
export class PostFormComponent implements OnInit {

  currentUser: Observable<User>;

  post = {} as Post;
  postLength = 0;
  maxLength = 200;
  postForm: FormGroup;


  constructor(public postService: PostService,
              public authService: AuthService,
              public userService: UserService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    // Usuario actual
    this.currentUser = this.userService.getCurrentUser();

    // Validators
    this.postForm = this.fb.group({
      content: ['',
        [Validators.required, Validators.minLength(1), Validators.maxLength(this.maxLength)]
      ]
    });

    // Suscribe los cambios en cada cambio de valor
    this.postForm.valueChanges.subscribe(fn =>
      this.onValueChanged()
    );

  }

  onValueChanged() {
    if (this.postForm.get('content').value !== undefined) {
      this.postLength = this.postForm.get('content').value.length;
    }
  }

  // Al pulsar en el botón, se publica el contenido
  publicar() {
    // Recoge el contenido
    this.post.content = this.postForm.get('content').value;
    // Añade la publicación
    this.postService.add(this.post);
    // Limpia el formulario
    this.postForm.get('content').setValue('');
  }


}
