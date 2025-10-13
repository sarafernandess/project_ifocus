import * as yup from 'yup';

// Expressão regular para validar e-mails .edu.br
const INSTITUTIONAL_EMAIL_REGEX = /.+@.+\.edu\.br$/;

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, 'O nome deve ter no mínimo 3 caracteres')
    .required('O nome é obrigatório'),
  
  email: yup
    .string()
    .email('Digite um e-mail válido')
    .matches(INSTITUTIONAL_EMAIL_REGEX, 'O e-mail deve ser institucional (final .edu.br)')
    .required('O e-mail é obrigatório'),

  password: yup
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .required('A senha é obrigatória'),
});

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Digite um e-mail válido')
    .required('O e-mail é obrigatório'),
  
  password: yup
    .string()
    .required('A senha é obrigatória'),
});