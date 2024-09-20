// frontend/src/components/RegisterForm.js
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';

const RegisterForm = () => {
    const initialValues = {
        username: '',
        email: '',
        password: '',
    };

    const validationSchema = Yup.object({
        username: Yup.string()
            .max(255, 'Debe tener 255 caracteres o menos')
            .required('Requerido'),
        email: Yup.string()
            .email('Correo electrónico inválido')
            .required('Requerido'),
        password: Yup.string()
            .min(6, 'La contraseña debe tener al menos 6 caracteres')
            .required('Requerido'),
    });

    const onSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        try {
            const response = await api.post('/auth/register', values);
            alert(response.data.message);
            resetForm();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors({ general: error.response.data.errors.join(' ') });
            } else {
                alert('Ocurrió un error al registrar el usuario.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h2>Registro</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {({ isSubmitting, errors }) => (
                    <Form>
                        {errors.general && (
                            <div className="alert alert-danger">
                                {errors.general}
                            </div>
                        )}
                        <div>
                            <label htmlFor="username">Nombre de Usuario:</label>
                            <Field name="username" type="text" />
                            <ErrorMessage name="username" component="div" className="error" />
                        </div>

                        <div>
                            <label htmlFor="email">Correo Electrónico:</label>
                            <Field name="email" type="email" />
                            <ErrorMessage name="email" component="div" className="error" />
                        </div>

                        <div>
                            <label htmlFor="password">Contraseña:</label>
                            <Field name="password" type="password" />
                            <ErrorMessage name="password" component="div" className="error" />
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            Registrarse
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default RegisterForm;
