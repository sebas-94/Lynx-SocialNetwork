import {Component, OnInit} from '@angular/core';

// Servicios
import {UserService} from '../../../services/user.service';
import {FirestorageService} from '../../../services/firestorage.service';
// Interfaces
import {User} from '../../../models/User';
// Formularios
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

// Observable
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  currentUser: Observable<User>;
  userData: User;

  editForm: FormGroup;
  formErrors = {userName: '', bio: ''};

  // Mensajes de validación personalizados
  validationMessages = {
    userName: {
      required: 'El userName es obligatorio.',
      maxlength: 'Máximo 15 caracteres.'
    },
    bio: {
      maxlength: 'Máximo 150 caracteres'
    }
  };

  constructor(public userService: UserService,
              private fb: FormBuilder,
              public firestorageService: FirestorageService,
              public router: Router) {
  }

  ngOnInit(): void {
    // Obtiene usuario actual
    this.currentUser = this.userService.getCurrentUser();

    // Establece los valores por defecto de los inputs
    this.currentUser.subscribe(u => {
      this.editForm.get('userName').setValue(u.userName);
      this.editForm.get('bio').setValue(u.bio);
    });

    // Validators
    this.editForm = this.fb.group({
      userName: ['',
        [Validators.required, Validators.maxLength(15)]
      ],
      bio: ['',
        [Validators.maxLength(150)]
      ]
    });

    // Suscribe los cambios en cada cambio de valor
    this.editForm.valueChanges.subscribe(fn =>
      this.onValueChanged()
    );
  }

  onValueChanged() {
    // Mensajes para validaciones generales
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = this.editForm.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        // tslint:disable-next-line:forin
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }


  // Al pulsar en el botón
  onSubmit() {
    this.userData = {
      userName: this.editForm.get('userName').value,
      bio: this.editForm.get('bio').value
    };
    // Modifica los datos del usuario recogidos
    this.userService.updateCurrentUser(this.userData);
  }

  deleteUser() {
    this.userService.deleteUser();
  }

}
