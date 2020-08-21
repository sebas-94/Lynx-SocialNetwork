import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Rutas
import {SettingsComponent} from './components/nav/settings/settings.component';
import {UsersComponent} from './components/nav/users/users.component';
import {TimelineComponent} from './components/nav/timeline/timeline.component';
import {PostComponent} from './components/routes/post/post.component';
import {UserComponent} from './components/routes/user/user.component';
import {NotFoundComponent} from './components/nav/not-found/not-found.component';
import {FollowComponent} from './components/routes/follows/follow.component';
import {FollowersComponent} from './components/routes/followers/followers.component';
import {FirstregisterComponent} from './components/auth/firstregister/firstregister.component';
import {RegisterComponent} from './components/auth/register/register.component';
import {LikesComponent} from './components/routes/likes/likes.component';
import {RepostsComponent} from './components/routes/reposts/reposts.component';

const routes: Routes = [
  {path: '', component: TimelineComponent},

  {path: 'timeline', component: TimelineComponent},
  {path: 'settings', component: SettingsComponent},
  {path: 'users', component: UsersComponent},

  {path: 'register', component: RegisterComponent},
  {path: 'firstregister', component: FirstregisterComponent},

  {path: 'user/:id', component: UserComponent},
  {path: 'follows/:id', component: FollowComponent},
  {path: 'followers/:id', component: FollowersComponent},

  {path: 'post/:ref', component: PostComponent},
  {path: 'likes/:ref', component: LikesComponent},
  {path: 'reposts/:ref', component: RepostsComponent},

  {path: '404', component: NotFoundComponent},
  {path: '**', redirectTo: '404'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, /*{useHash: true}*/)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
