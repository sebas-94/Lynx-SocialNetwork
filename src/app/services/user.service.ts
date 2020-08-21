import {Injectable} from '@angular/core';

// Firebase y firestore
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireStorage} from '@angular/fire/storage';
// Servicios
import {AuthService} from './auth.service';
import {PostService} from './post.service';
import {ToastrService} from 'ngx-toastr';
import {register} from 'ts-node';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  // tslint:disable-next-line:max-line-length
  iconDefault = 'https://firebasestorage.googleapis.com/v0/b/proyectodaw-lynx.appspot.com/o/icons%2F%3F.png?alt=media&token=7bf940c8-93c0-4a4f-8167-9aa9397f8915';


  constructor(public authService: AuthService,
              public db: AngularFirestore,
              public postService: PostService,
              public firestorage: AngularFireStorage,
              public toastr: ToastrService) {

  }

  // Obtiene el documento del usuario actual
  getCurrentUser() {
    return this.db.doc(`users/${this.authService.authUser.uid}`).valueChanges();
  }

  getUserByArrayId(arrayIds) {
    if (arrayIds.length <= 0) {
      arrayIds = ['empty'];
    }

    return this.db.collection('users', ref =>
      ref.where('id', 'in', arrayIds)
    ).valueChanges({idField: 'id'});
  }

  /*getFollowers(followers) {
    if (followers.length <= 0) {
      followers = ['empty'];
    }

    return this.db.collection('users', ref =>
      ref.where('id', 'in', followers)
    ).valueChanges({idField: 'id'});
  }

  getFollows(follows) {
    if (follows.length <= 0) {
      follows = ['empty'];
    }

    return this.db.collection('users', ref =>
      ref.where('id', 'in', follows)
    ).valueChanges({idField: 'id'});
  }*/

  // Actualiza usuario sin modificar sus publicaciones (utilizado para completar el registro por Google Login)
  updateCurrentUserSimple(userData: any) {
    this.db.doc(`users/${this.authService.authUser.uid}`).update(userData)
      .finally(() => {
        console.log('Datos actualizados');
        window.location.reload();
      });


  }

  // Actualiza los campos pasados por parámetros al documento del usuario actual
  updateCurrentUser(userData: any) {
    this.db.doc(`users/${this.authService.authUser.uid}`).update(userData);
    // Actualiza sus publicaciones
    this.postService.updateUserPosts(this.authService.authUser.uid);
    this.toastr.success('Perfil actualizado correctamente', 'Perfil');
  }

  // Obtiene el documento del usuario pasado por parámetro
  getUserById(userId) {
    return this.db.collection('users').doc(userId).valueChanges();
  }

  // Obtiene la colección de documentos de todos los usuarios
  getAllUsers() {
    return this.db.collection('users').valueChanges();
  }

  // Obtiene la colección de documentos de todos los usuarios
  /*getManyUsers() {
    return this.db.collection('users').valueChanges();
  }*/

  // Borra el usuario
  deleteUser() {
    let userData;
    let follows;
    let followers;

    // Hace unfollow a sus seguidos y lo dejan de seguir
    this.db.doc(`users/${this.authService.authUser.uid}`).get().subscribe(u => {
      userData = u.data();
      follows = userData.follows;
      followers = userData.followers;
      // Deja de seguir
      if (follows.length > 0) {
        follows.forEach(f => {
          this.unfollow(f);
        });
        console.log('Deja de seguir');
      }
      // Lo dejan de seguir
      if (followers.length > 0) {
        followers.forEach(f => {
          this.unfollow(this.authService.authUser.uid, f);
        });
        console.log('Lo dejan de seguir');
      }

    });

    setTimeout(() => {
      this.deletePost();
    }, 300);

  }

  deletePost() {
    // Se eliminan sus publicaciones y respuestas
    this.postService.deletePosts(this.authService.authUser.uid);
    console.log('Borra las publiciones');
    this.deleteIcon();
  }

  deleteIcon() {
    // Borra la imagen de perfil
    const iconPathPng = `icons/${this.authService.authUser.uid}.png`;
    const iconPathJpeg = `icons/${this.authService.authUser.uid}.jpeg`;
    const iconPathJpg = `icons/${this.authService.authUser.uid}.jpg`;

    this.firestorage.ref(iconPathPng).delete();
    this.firestorage.ref(iconPathJpg).delete();
    this.firestorage.ref(iconPathJpeg).delete();
    console.log('Borra la imegen de perfil');
    this.deleteUserDB();
  }

  deleteUserDB() {
    // Borra el usuario de la base de datos
    this.db.doc(`users/${this.authService.authUser.uid}`).delete();
    console.log('Borra la BD');
    this.deleteAuth();
  }

  deleteAuth() {
    // Borra los datos de autenticación
    this.authService.deleteAuth();
    console.log('Borra la autenticación');
  }

  // Unfollow del usuario actual a uno pasado por parámetro
  unfollow(target, current: string = this.authService.authUser.uid) {
    // Usuario actual deja de seguir
    this.db.doc(`users/${current}`).update({
      follows: firebase.firestore.FieldValue.arrayRemove(target)
    }).finally(() => this.postService.updateUserPosts(current));
    // Usuario seguido pierde el seguidor
    this.db.doc(`users/${target}`).update({
      followers: firebase.firestore.FieldValue.arrayRemove(current)
    }).finally(() => this.postService.updateUserPosts(target));

    // Actualiza el autor y el usuario afectado dentro de cada publicación
    /*this.postService.updateUserPosts(current);
    this.postService.updateUserPosts(target);*/
  }

  // Follow del usuario actual a uno pasado por parámetro
  follow(target) {
    // Usuario actual sigue
    this.db.doc(`users/${this.authService.authUser.uid}`).update({
      follows: firebase.firestore.FieldValue.arrayUnion(target)
    });

    // Usuario seguido añade un seguidor
    this.db.doc(`users/${target}`).update({
      followers: firebase.firestore.FieldValue.arrayUnion(this.authService.authUser.uid)
    });

    // Actualiza el autor y le usuario afectado dentro de cada publicación
    this.postService.updateUserPosts(this.authService.authUser.uid);
    this.postService.updateUserPosts(target);
  }


  // Llama a recuperar la contraseña
  recoverPass() {
    this.authService.recoverPass();
    this.authService.logout();
  }


}
