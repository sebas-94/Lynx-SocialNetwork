import {Injectable} from '@angular/core';

// Firebase y firestore y autenticación
import {auth} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {FirebaseApp} from '@angular/fire';
import {AngularFirestore} from '@angular/fire/firestore';
// Mapeado
import {map} from 'rxjs/operators';
// Enrutamiento
import {Router} from '@angular/router';
// Modelos
import {User} from '../models/User';
// Toast
import {ToastrService} from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // tslint:disable-next-line:max-line-length
  iconDefault = 'https://firebasestorage.googleapis.com/v0/b/proyectodaw-lynx.appspot.com/o/icons%2F%3F.png?alt=media&token=7bf940c8-93c0-4a4f-8167-9aa9397f8915';

  completed: boolean;

  user: any;
  authUser = null;

  email = '';
  emailRecover = '';
  password = '';

  /*
  notifications: Observable<any>;
  */

  constructor(public angularFireAuth: AngularFireAuth,
              public db: AngularFirestore,
              public fa: FirebaseApp,
              public toastr: ToastrService,
              public router: Router) {

    // Variable usuario
    this.user = this.angularFireAuth.authState.pipe(map(authState => {
      if (authState) {
        this.authUser = authState;
        this.db.doc(`/users/${this.authUser.uid}`).get().subscribe(u => {
          this.completed = u.get('completed');
          console.log(this.completed);
        });
        return authState;
      } else {
        return null;
      }
    }));


    // Notificaciones
    /*this.angularFireAuth.user.subscribe(u => {

      this.notifications = this.db.doc(`notifications/${u.uid}`).valueChanges();
      this.notifications.subscribe(n => {
        console.log('NOTIFICAIONES', n);
        console.log('LIKE', n.like);
        this.toastr.info(`${n.like.user}`, 'Likes');
      });

    });*/


  }

  /*addNotification(type, ref, user, userD, date) {
    const notification: any = {date, ref, user};

    this.db.collection('notifications').doc(userD).set(
      {[type]: notification}
    );
  }*/

  emailRegister(userData: User, password: string) {

    // Registra al usuario en el apartado de autenticación
    this.angularFireAuth.auth.createUserWithEmailAndPassword(userData.email, password)
      .then(user => {
        const uid = user.user.uid;
        console.log('Usuario creado', uid);
        // Si se registra correctamente se guardan los datos del usuario en la BD
        this.db.collection('users').doc(uid).set(userData).finally(() => {

          this.db.collection('users').doc(uid).update({
            id: uid
          });

        });
      }).catch(error => {
      console.log('error code: ', error.code);
      if (error.code === 'auth/email-already-in-use') {
        this.toastr.error('El email ya está en uso', 'Email en uso');
      }

    });
  }


  emailLogin() {
    return this.angularFireAuth.auth.signInWithEmailAndPassword(this.email, this.password)

      .then(u => {
        console.log('user logueado con email: ', u);
        /*this.loginUser.id = u.user.uid;
        this.loginUser.email = u.user.email;*/
        this.checkUserDoc(u.user.uid);
      }).catch(error => {
        console.log('error code: ', error.code);
        // Control de errores
        if (error.code === 'auth/wrong-password') {
          // alert('Contraseña no válida');
          this.toastr.error('Contraseña no válida', 'Error login');
        } else if (error.code === 'auth/invalid-email') {
          // alert('Email no válido');
          this.toastr.error('Email no válido', 'Error login');
        } else if (error.code === 'auth/user-not-found') {
          // alert('Email no encontrado');
          this.toastr.error('Email no encontrado', 'Error login');
        } else if (error.code === 'auth/too-many-requests') {
          // alert('Email no encontrado');
          this.toastr.error('Has realizado demasiados intentos, espere un momento.', 'Error login');
        }


      });
  }

  googleLogin() {
    console.log('Intento login con Google');
    this.angularFireAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
      .then(u => {
        const user = {id: u.user.uid, email: u.user.email};
        this.checkUserDoc(user);

      })
      .catch(error => {
        console.log('error en google login: ', error);
      });
  }

  deleteAuth() {
    setTimeout(() => {
      this.router.navigate(['/'], {replaceUrl: true});
    }, 300);

    setTimeout(() => {
      this.angularFireAuth.authState.subscribe(authState => {
        console.log(authState);
        authState.delete();
      });
    }, 300);



  }

  recoverPass(email?) {
    let currentEmail;

    if (!email) {
      currentEmail = this.fa.auth().currentUser.email;
    } else {
      currentEmail = email;
    }

    this.fa.auth().sendPasswordResetEmail(currentEmail)
      .then(() => {
        this.toastr.info('Recuperacion de contraseña', 'Email enviado correctamente.');
      })
      .catch(error => {
        if (error.code === 'auth/invalid-email') {
          // alert('Email no válido');
          this.toastr.error('Email no válido', 'Recuperación de contraseña');
        }
      });

  }

  // Comprueba si el usuario tiene un docuemnto creado en la BD
  checkUserDoc(user) {
    this.db.firestore.doc(`/users/${user.id}`).get()
      .then(doc => {
        // Si no existe lo crea
        if (!doc.exists) {
          console.log('No existe documento, creando documento');
          const userData = {
            id: user.id,
            email: user.email,
            bio: '',
            created: new Date(),
            follows: [],
            followers: [],
            icon: this.iconDefault,
            completed: false
          };
          // Lo añade a la BD
          this.db.collection('users').doc(user.id).set(userData);

        }


      });

    // Finalmente
    // this.checkRelationsDoc(user);
  }


  // Comrpueba si el registro ha sido completado
  /*checkCompleted(user) {
    this.db.doc(`/users/${user.id}`).get().subscribe(u => {
      this.completed = u.get('completed');

      if (completed) {
        console.log('R Completado');
        this.router.navigate(['/']);
      } else {
        console.log('R NO Completado');
        this.router.navigate(['/firstregister']);
      }

    });
  }*/

  logout() {
    this.angularFireAuth.auth.signOut();
    this.router.navigate(['/']);
  }

}
