import { Component, OnInit } from '@angular/core';

// Servicios
import {PostService} from '../../../services/post.service';
import {AuthService} from '../../../services/auth.service';
// Routing
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../../services/user.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Post} from '../../../models/Post';


@Component({
  selector: 'app-tweet',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  postReply = {} as any;

  currentRef: any;
  currentPost: any;
  currentReplies: any;

  replies: any;

  // Form reply
  postForm: FormGroup;
  post = {} as Post;
  replyLength = 0;
  replymaxLength = 200;

  constructor(public authService: AuthService,
              public route: ActivatedRoute,
              public postService: PostService,
              public userService: UserService,
              public fb: FormBuilder) { }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      this.currentRef = params.ref;
      console.log(this.currentRef);
      this.currentPost = this.postService.getPost(this.currentRef);
      this.currentReplies = this.postService.getReplies(this.currentRef);
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


  // Obtiene las repuestas de una pulicación
  /*getReplies(postRef) {
    this.replies = this.postService.getReplies(postRef);
  }*/

  reply(ref, post) {
    this.postService.reply(ref, post);
    setTimeout(() => {
      this.postForm.get('content').setValue('');
    }, 500);

  }

  reply2(ref, post) {
    this.postService.reply(ref, post);
    setTimeout(() => {
      this.postForm.get('content').setValue('');
    }, 500);

  }


}
