import { Injectable } from '@angular/core';

// AngularFire
import {AngularFireStorage, AngularFireUploadTask} from '@angular/fire/storage';
// Servicios
import {AuthService} from './auth.service';
// Rxjs
import {Observable, of} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class FirestorageService {

  path = `icons/`;
  task: AngularFireUploadTask = null;
  uploadProgress = new Observable();
  downloadURL = of('');

  constructor(public firestorage: AngularFireStorage,
              public authService: AuthService,
              public userService: UserService) {

  }

  upload(event) {
    const file = event.target.files[0]; // Nombre del fichero sin extensión
    const ext = '.' + file.type.split('/')[1]; // Extensión del fichero

    // Ruta completa del fichero carpeta/fichero.extensión
    const path = this.path + this.authService.authUser.uid + ext;
    // Referencia al fichero
    const ref = this.firestorage.ref(path);

    // La subida del fichero devuelve una tarea
    this.task = this.firestorage.upload(path, file);
    // Dicha tarea se evalúa en porcentaje
    this.uploadProgress = this.task.percentageChanges();

    // Una vez finalizada la subida
    this.task.snapshotChanges().pipe(finalize(() => {
        // Referencia URL de la imagen
        this.downloadURL = ref.getDownloadURL();
        // Actualiza datos
        this.downloadURL.subscribe(url =>
          this.userService.updateCurrentUser({icon: url})
        );

      }
    )).subscribe();

  }

  /*deleteIcon() {
    this.firestorage.ref(this.path).delete();

  }*/

  defaultImage() {
    this.userService.updateCurrentUser({icon: this.userService.iconDefault});
  }

}
