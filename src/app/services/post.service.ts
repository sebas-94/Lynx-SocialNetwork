import {Injectable} from '@angular/core';

// Firebase y firestore
import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
// Servicios
import {AuthService} from './auth.service';
// Modelos
import {Post} from '../models/Post';
import {ToastrService} from 'ngx-toastr';
import {onTaskCompleted} from '@angular/compiler-cli/ngcc/src/execution/utils';


@Injectable({
  providedIn: 'root'
})
export class PostService {

  targetPost: any;
  postReply = {} as Post;

  visibleIdSet: Set<string>;
  visibleId: Array<string>;

  constructor(public db: AngularFirestore,
              public authService: AuthService,
              public toastr: ToastrService) {
  }


  getPost(postRef) {
    return this.db.doc(`${postRef}`).valueChanges();
  }

  getVisiblePosts() {
    return this.db.collection('posts', ref =>
      ref.where(`visible`, 'array-contains', this.authService.authUser.uid)
        .orderBy('date', 'desc')
    ).valueChanges({idField: 'id'});
  }

  getMy() {
    return this.db.collection('posts', ref =>
      ref.where('author.id', '==', this.authService.authUser.uid)
        .orderBy('date', 'desc')
    ).valueChanges({idField: 'id'});
  }

  getUserByArrayId(arrayIds) {
    if (arrayIds.length <= 0) {
      arrayIds = ['empty'];
    }

    return this.db.collection('users', ref =>
      ref.where('id', 'in', arrayIds)
    ).valueChanges({idField: 'id'});
  }

  getUserPosts(userId) {
    return this.db.collection('posts', ref =>
      ref.where('author.id', '==', userId)
        .orderBy('date', 'desc')
    ).valueChanges({idField: 'id'});
  }

  getReplies(postRef) {
    return this.db.collection(`${postRef}/replies`, ref =>
      ref.orderBy('date', 'desc')
    ).valueChanges({idField: 'id'});
  }

  setTarget(post) {
    this.targetPost = post;
  }

  add(post: Post) {
    // El contenido de la publicación se recoge del formulario de Angular
    // Se establece la fecha actual
    post.date = new Date();
    // Se inicializa algunas variables
    post.reposts = [];
    post.likes = [];
    post.countReplies = 0;

    // Para recoger el autor es necesario previamente realizar una consulta al usuario actual
    this.db.doc(`users/${this.authService.authUser.uid}`).ref.get()
      .then(user => {
        // Agrega autor
        post.author = user.data();

        // Agrega la publicación
        this.db.collection('posts').add(post).then(promise => {
          // Agrega la referencia de la publicación (útil para las respuestas)
          promise.update('ref', promise.path);
          // Actualiza quién puede ver la publicación (propio usuario y seguidores del mismo)
          this.updateVisible(promise.path);
        });

        setTimeout(() => {
          this.toastr.info('¡Mensaje publicado con éxito!', 'Publicación');
        }, 400);


      });
  }

  reply(postRef, postReply: Post) {
    console.log(postReply);
    // El contenido de la publicación se recoge del formulario de Angular
    // Se establece la fecha actual
    postReply.date = new Date();
    // Se inicializa algunas variables
    postReply.reposts = [];
    postReply.likes = [];
    postReply.countReplies = 0;

    // Para recoger el autor es necesario previamente realizar una consulta al usuario actual
    this.db.doc(`users/${this.authService.authUser.uid}`).get().subscribe(user => {
      // Agrega autor
      postReply.author = user.data();

      // Agrega el post
      this.db.collection(`${postRef}/replies`).add(postReply).then(promise => {
        // Agrega la referencia del post (útil para las respuestas)
        promise.update('ref', promise.path);
        // Actualiza quién puede ver la publicación (propio usuario y seguidores del mismo)
        this.updateVisible(promise.path);
      });
      // Aumenta el contador de respuestas
      this.db.doc(postRef).update({
        countReplies: firebase.firestore.FieldValue.increment(1)
      });
    });
  }

  like(post) {
    this.db.doc(`${post.ref}`).update({
      likes: firebase.firestore.FieldValue.arrayUnion(this.authService.authUser.uid)
    });
    // Agrega notidicación
    /*
    this.authService.addNotification('like', post.ref, this.authService.authUser.uid, post.author.id, new Date());
    */
  }

  unlike(post) {
    this.db.doc(`${post.ref}`).update({
      likes: firebase.firestore.FieldValue.arrayRemove(this.authService.authUser.uid)
    });
  }

  repost(post) {
    // Añade el repost a la lista
    this.db.doc(`${post.ref}`).update({
      reposts: firebase.firestore.FieldValue.arrayUnion(this.authService.authUser.uid)
    }).then(() => {
        this.updateVisible(post.ref);
      }
    );
  }

  unrepost(post) {
    this.db.doc(`${post.ref}`).update({
      reposts: firebase.firestore.FieldValue.arrayRemove(this.authService.authUser.uid)/*,
      content: post.contentBack,
      date: post.dateBack*/
    }).then(() => {
        this.updateVisible(post.ref);
      }
    );
  }

  // Actualiza los datos del autor en cada publicación o respuesta
  updateUserPosts(idUser) {
    this.db.doc(`users/${idUser}`).get().subscribe(updateAuthor => {

      // Obtiene las publicaciones
      this.db.collection('posts', ref =>
          ref.where('author.id', '==', idUser)
        // Por cada publicación
      ).get().forEach(t => t.docs.map(value => {
        // Se actualiza el autor
        this.db.doc(`posts/${value.id}`).update(
          {author: updateAuthor.data()}
        );
        // Se actualiza la visibilidad
        this.updateVisible(`posts/${value.id}`);
      }));

      // Obtiene las respuestas
      this.db.collectionGroup('replies', ref =>
          ref.where('author.id', '==', idUser)
        // Por cada publicación
      ).get().forEach(t => t.docs.map(value => {
        // Se actualiza el autor
        this.db.doc(`${value.data().ref}`).update(
          {author: updateAuthor.data()}
        );
        // Se actualiza la visibilidad
        this.updateVisible(`${value.data().ref}`);
      }));

    });


  }

  // Elimina publicaciones y respuestass

  deletePosts(idUser) {
    let valueData;
    let refData;

    this.db.doc(`users/${idUser}`).get().subscribe(updateAuthor => {

      // Obtiene y borra las publicaciones
      this.db.collection('posts', ref =>
          ref.where('author.id', '==', idUser)
        // Por cada publicación
      ).get().forEach(t => t.docs.map(value => {
        // La borra
        this.db.doc(`posts/${value.id}`).delete();
      }));

      // Obtiene y borra las respuestas
      this.db.collectionGroup('replies', ref =>
          ref.where('author.id', '==', idUser)
        // Por cada publicación
      ).get().forEach(t => t.docs.map(value => {
        // La borra
        this.db.doc(`${value.data().ref}`).delete()
          // Decrementa el número de respuestas del padre
          .finally(() => {
            valueData = value.data();
            refData = valueData.ref;
            // Tratamiento de la cadena
            refData = refData.split('/');
            refData = refData.splice(1, refData.length - 3);
            refData = refData.join();
            // Decrementa el contador de la publicación padre
            this.db.collection('posts').doc(refData).update({
              countReplies: firebase.firestore.FieldValue.increment(-1)
            });

          });

      }));

    });

  }

  // Actualzia quién puede y quién no puede ver la publicación
  // Podrán verlo el propio autor, sus seguidores y en el caso de hacer repost los seguidores de estos
  updateVisible(postRef) {
    console.log('ACtuazlizando TWEET: ', postRef);
    let dataPost;
    let dataUser;

    this.visibleIdSet = new Set();
    this.visibleId = [];


    this.db.doc(`${postRef}`).get().subscribe(p => {
      dataPost = p.data();
      // Lo ve el propio autor
      this.visibleIdSet.add(dataPost.author.id);
      console.log('agregado autor', this.visibleIdSet);
      // Lo ven los seguidores del autor
      console.log('followers', dataPost.author.followers);
      dataPost.author.followers.forEach(item => this.visibleIdSet.add(item));
      // this.visibleId = [...this.visibleId, ...dataPost.author.followers];
      console.log('agregado followers', this.visibleIdSet);

      // Por cada repost, incluye sus seguidores
      dataPost.reposts.forEach(r => {
        this.db.doc(`users/${r}`).get().subscribe(user => {
          dataUser = user.data();
          dataUser.followers.forEach(item => this.visibleIdSet.add(item));
          // this.visibleId = [...this.visibleId, ...dataPost.author.followers, ...dataUser.followers];
          console.log('FINAL: agregado followers, de followers', this.visibleIdSet);
          // Convierte Set a Array
          this.visibleId = [...this.visibleIdSet];
          console.log('to array', this.visibleId);
          // Finalmente actualiza los usuarios que verán la publicación
          this.db.doc(`${postRef}`).update({
            visible: this.visibleId
          });
        });

      });

      console.log('FINAL: agregado followers, de followers', this.visibleId);
      // Convierte Set a Array
      this.visibleId = [...this.visibleIdSet];
      console.log('to array', this.visibleId);
      // Finalmente actualiza los usuarios que verán la publicación
      this.db.doc(`${postRef}`).update({
        visible: this.visibleId
      });

    });

    /*
        this.db.doc(`${postRef}`).get().subscribe(p => {
          dataPost = p.data();
          // Lo ve el propio autor
          this.visibleIdSet.add(dataPost.author.id);
          console.log('agregado autor', this.visibleIdSet);
          // Lo ven los seguidores del autor
          console.log('followers', dataPost.author.followers);
          dataPost.author.followers.forEach(item => this.visibleIdSet.add(item));
          // this.visibleId = [...this.visibleId, ...dataPost.author.followers];
          console.log('agregado followers', this.visibleIdSet);

          // Por cada repost, incluye sus seguidores
          dataPost.reposts.forEach(r => {
            this.db.doc(`users/${r}`).get().subscribe(user => {
              dataUser = user.data();
              dataUser.followers.forEach(item => this.visibleIdSet.add(item));
              // this.visibleId = [...this.visibleId, ...dataPost.author.followers, ...dataUser.followers];
              console.log('FINAL: agregado followers, de followers', this.visibleIdSet);
              // Convierte Set a Array
              this.visibleId = [...this.visibleIdSet];
              console.log('to array', this.visibleId);
              // Finalmente actualiza los usuarios que verán la publicación
              this.db.doc(`${postRef}`).update({
                visible: this.visibleId
              });
            });

          });

          console.log('FINAL: agregado followers, de followers', this.visibleId);
          // Convierte Set a Array
          this.visibleId = [...this.visibleIdSet];
          console.log('to array', this.visibleId);
          // Finalmente actualiza los usuarios que verán la publicación
          this.db.doc(`${postRef}`).update({
            visible: this.visibleId
          });

        });
    */
  }

  delete(postRef) {
    // Separa el nombre de la colección y el nombre de los subdocumentos
    // Ejemplo: post/id/id --> post y id/id
    const [collection, ...document] = postRef.split('/');
    // Borra la publicaciñón referenciada
    this.db.collection(collection).doc(document.join('/')).delete();
    // Si el documento es mayor de 1 significa que es hijo de otra publicación (docPadre - replies - DocHijo1 - replies - DocHijo2 - etc...)
    if (document.length > 1) {
      // Refrencia al padre relativo
      const padreRel = document.slice(0, document.length - 2).join('/');
      console.log(padreRel);
      // Decrementa en uno el contador de respuestas del padre relativo
      this.db.collection(collection).doc(padreRel).update({
        countReplies: firebase.firestore.FieldValue.increment(-1)
      });
    }

    this.toastr.info('¡Mensaje eliminado con éxito!', 'Publicación');

  }

  share(postRef: string) {

    const origin = window.location.origin;
    // let post = `/#/post/`;
    const post = '/post/';
    const ref = postRef.split('/').join('%2F');

    const url = origin + post + ref;

    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = url;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.toastr.success('Dirección de la publicación copiada en el portapaples.', 'URL copiada');
  }

}
