import { Component, OnInit } from '@angular/core';

// Servicios
import {AuthService} from '../../../services/auth.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../../../models/User';
import {UserService} from '../../../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-firstregister',
  templateUrl: './firstregister.component.html',
  styleUrls: ['./firstregister.component.css']
})
export class FirstregisterComponent implements OnInit {

  registerForm: FormGroup;
  userData: User;

  allUsers: Array<User>;

  // Expresiones regulares y flags
  reguserIdName = '[a-zA-Z0-9_]+';

  formErrors = {userIdName: '', userName: ''};
  errors: boolean;

  // Mensajes de validación personalizados
  validationMessages = {
    userIdName: {
      required: 'Nick obligatorio',
      pattern: 'Solo puede contener letras, números y "_"',
      minlength: 'Mínimo 3 caracteres',
      maxlength: 'Máximo 15 caracteres'
    },
    userName: {
      required: 'Nick obligatorio',
      minlength: 'Mínimo 1 caracteres',
      maxlength: 'Máximo 20 caracteres'
    }
  };


  constructor(public userService: UserService,
              public authService: AuthService,
              private fb: FormBuilder,
              public router: Router) { }


  ngOnInit(): void {

    // Recoge todos los usuarios para realizar posteriormente la validación de userIdName
    this.userService.getAllUsers().subscribe(users => {
      this.allUsers = users;
    });

    // Validators
    this.registerForm = this.fb.group({
      userIdName: ['',
        [Validators.required, Validators.minLength(3), Validators.maxLength(15), Validators.pattern(this.reguserIdName)]
      ],
      userName: ['',
        [Validators.required, Validators.minLength(1), Validators.maxLength(20)]
      ]
    });

    // Suscribe los cambios en cada cambio de valor
    this.registerForm.valueChanges.subscribe(fn =>
      this.onValueChanged()
    );

  }


  onValueChanged() {
    // Mensajes para validaciones generales
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = this.registerForm.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        // tslint:disable-next-line:forin
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }

    console.log(this.formErrors)

    // Mensaje de validación de disponibilidad (ID Usuario)
    const userIdName = this.registerForm.get('userIdName').value;
    const existuserIdName = obj => obj.userIdName === userIdName;
    if (this.allUsers.some(existuserIdName)) {
      this.formErrors.userIdName = 'El userIdName no está disponible.';
    }

    // Devuelve TRUE si hay errores
    this.errors = !Object.values(this.formErrors).every(x => (x === ''));
    console.log(this.errors);

  }


  // Al pulsar en el botón
  registrar() {
    // El ID se autogenera 'userService.addUser'
    // La contraseña no se guarda en la base de datos
    this.userData = {
      userName: this.registerForm.get('userName').value,
      userIdName: this.registerForm.get('userIdName').value,
      completed: true
    };

    // Actualiza al usuario y recarga (f5)
    this.userService.updateCurrentUserSimple(this.userData);

    // this.router.navigate(['/timeline']);
  }


}
