import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

// DEFAULT
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

// FIREBASE
import {environment} from '../environments/environment';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFireStorageModule} from '@angular/fire/storage';

// FORM
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// TOASTR
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastrModule} from 'ngx-toastr';

// COMPONENTES
import {SettingsComponent} from './components/nav/settings/settings.component';
import {UsersComponent} from './components/nav/users/users.component';
import {TimelineComponent} from './components/nav/timeline/timeline.component';
import {PostFormComponent} from './components/post-form/post-form.component';
import {LoginComponent} from './components/auth/login/login.component';
import {PostComponent} from './components/routes/post/post.component';
import {RegisterComponent} from './components/auth/register/register.component';
import {UserComponent} from './components/routes/user/user.component';
import {FilterUsersPipe} from './components/nav/users/filterUsers.pipe';
import {NotFoundComponent} from './components/nav/not-found/not-found.component';
import {FollowComponent} from './components/routes/follows/follow.component';
import {FirstregisterComponent} from './components/auth/firstregister/firstregister.component';
import { BarComponent } from './components/nav/bar/bar.component';
import { FollowersComponent } from './components/routes/followers/followers.component';
import { LikesComponent } from './components/routes/likes/likes.component';
import { RepostsComponent } from './components/routes/reposts/reposts.component';


@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    UsersComponent,
    TimelineComponent,
    PostFormComponent,
    LoginComponent,
    PostComponent,
    RegisterComponent,
    UserComponent,
    FilterUsersPipe,
    NotFoundComponent,
    FollowComponent,
    FirstregisterComponent,
    BarComponent,
    FollowersComponent,
    LikesComponent,
    RepostsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    // FIREBASE
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    // FORMS
    FormsModule,
    // TOASTR
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 2000,
      positionClass: 'toast-top-center',
      enableHtml: true
    }),
    ReactiveFormsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
