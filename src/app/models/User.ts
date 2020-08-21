export interface User {
  // Datos fijos
  id?: string;
  email?: string;
  created?: any;
  // Datos modificables
  userName?: string;
  userIdName?: string;
  bio?: string;
  icon?: string;
  follows?: [];
  followers?: [];
  // Registro completado
  completed?: boolean;
}
