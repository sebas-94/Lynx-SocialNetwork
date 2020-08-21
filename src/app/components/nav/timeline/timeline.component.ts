import {Component, HostListener, OnInit} from '@angular/core';

// Servicios
import {PostService} from '../../../services/post.service';
import {AuthService} from '../../../services/auth.service';
import {UserService} from '../../../services/user.service';
// Modelos
import {User} from '../../../models/User';
import {Post} from '../../../models/Post';
// Rxjs
import {Observable} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {

  currentUser: Observable<User>;
  visiblePosts: Observable<Array<Post>>;

  replies: any;

  // Form reply
  postForm: FormGroup;
  post = {} as Post;
  replyLength = 0;
  replymaxLength = 200;

  // Botón UP
  showGoUpButton: boolean;
  showScrollHeight = 1000;
  hideScrollHeight = 500;

  // Check Repost
  checkRepost: boolean;


  constructor(public authService: AuthService,
              public postService: PostService,
              public userService: UserService,
              public fb: FormBuilder) {
    this.showGoUpButton = false;
  }

  ngOnInit(): void {
    // Usuario actual
    this.currentUser = this.userService.getCurrentUser();
    // Posts seguidos
    this.visiblePosts = this.postService.getVisiblePosts();

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


    /*
    setTimeout(() => {
      this.checkRepost = false;
    }, 200);
     */
  }

  onValueChanged() {
    if (this.postForm.get('content').value !== undefined) {
      this.replyLength = this.postForm.get('content').value.length;
      this.post.content = this.postForm.get('content').value;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if ((window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) > this.showScrollHeight) {
      this.showGoUpButton = true;
      // tslint:disable-next-line:max-line-length
    } else if (this.showGoUpButton && (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) < this.hideScrollHeight) {
      this.showGoUpButton = false;
    }
  }

  scrollTop() {
    document.body.scrollTop = 0; // Safari
    document.documentElement.scrollTop = 0; // Otros
  }

  reply(ref, post) {
    this.postService.reply(ref, post);
    setTimeout(() => {
      this.postForm.get('content').setValue('');
    }, 500);

  }


}
