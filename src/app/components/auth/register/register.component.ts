import { Component, OnInit } from '@angular/core';

// Formulario
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../services/user.service';
// Modelos
import {User} from '../../../models/User';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  userData: User;
  data: any;

  allUsers: Array<User>;

  // Expresiones regulares y flags
  regEmail = '^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$';
  reguserIdName = '[a-zA-Z0-9_]+';

  formErrors = {email: '', userIdName: '', userName: '', pass: '', passCheck: ''};
  errors: boolean;

  // Mensajes de validación personalizados
  validationMessages = {
    email: {
      required: 'Email obligatorio',
      pattern: 'Introduzca una dirección email correcta'
    },
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
    },
    pass: {
      required: 'Contraseña obligatoria',
      minlength: 'Mínimo 6 caracteres',
      maxlength: 'Máximo 20 caracteres'
    }
    ,
    passCheck: {
      required: 'Contraseña obligatoria',
      minlength: 'Mínimo 6 caracteres',
      maxlength: 'Máximo 20 caracteres'
    }
  };


  constructor(public userService: UserService,
              public authService: AuthService,
              private fb: FormBuilder) { }


  ngOnInit(): void {

    // Recoge todos los usuarios para realizar posteriormente la validación de userIdName
    this.userService.getAllUsers().subscribe(users => {
      this.allUsers = users;
    });

    // Validators
    this.registerForm = this.fb.group({
      email: ['',
        [Validators.required, Validators.pattern(this.regEmail)]
      ],
      userIdName: ['',
        [Validators.required, Validators.minLength(3), Validators.maxLength(15), Validators.pattern(this.reguserIdName)]
      ],
      userName: ['',
        [Validators.required, Validators.minLength(1), Validators.maxLength(20)]
      ],
      pass: ['',
        [Validators.required, Validators.minLength(6), Validators.maxLength(20)]
      ],
      passCheck: ['',
        [Validators.required, Validators.minLength(6), Validators.maxLength(20)]
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

    // Mensaje de validación de disponibilidad (ID Usuario)
    const userIdName = this.registerForm.get('userIdName').value;
    const existuserIdName = obj => obj.userIdName === userIdName;
    if (this.allUsers.some(existuserIdName)) {
      this.formErrors.userIdName = 'El userIdName no está disponible.';
    }

    // Mensaje de validación (Passwords)
    const pass1 = this.registerForm.get('pass').value;
    const pass2 = this.registerForm.get('passCheck').value;

    if (pass1 !== pass2 && pass2.length !== 0) {
      this.formErrors.passCheck = 'Las contraseñas no coinciden';
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
      email: this.registerForm.get('email').value,
      userName: this.registerForm.get('userName').value,
      userIdName: this.registerForm.get('userIdName').value,
      follows: [],
      followers: [],
      bio: '',
      created: new Date(),
      completed: true,
      // Icono por defecto
      icon: this.userService.iconDefault
    };

    // El password no se guarda en el documento del usuario
    const password = this.registerForm.get('pass').value;

    // Registra al usuario
    this.authService.emailRegister(this.userData, password);
  }


}
