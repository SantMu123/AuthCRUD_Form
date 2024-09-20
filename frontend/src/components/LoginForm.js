import React, { useState, useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import TwoFAVerify from './TwoFAVerify';

const LoginForm = () => {
    const { login } = useContext(AuthContext);
    const [require2FA, setRequire2FA] = useState(false);
    const [userId, setUserId] = useState(null);

    const initialValues = {
        email: '',
        password: '',
    };

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Correo electrónico inválido')
            .required('Requerido'),
        password: Yup.string()
            .required('Requerido'),
    });

    const onSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            const response = await api.post('/auth/login', values);
            if (response.data.require2FA) {
                setRequire2FA(true);
                setUserId(response.data.userId);
            } else {
                login(response.data.token, response.data.user);
            }
        } catch (error) {
            console.log('Error de Login:', error.response ? error.response.data : error.message);
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors({ general: error.response.data.errors.join(' ') });
            } else {
                alert('Ocurrió un error al iniciar sesión.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handle2FAVerify = (token, user) => {
        login(token, user);
    };

    return (
        <div>
            <h2>Login</h2>
            {!require2FA ? (
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
                                Iniciar Sesión
                            </button>
                        </Form>
                    )}
                </Formik>
            ) : (
                <TwoFAVerify userId={userId} onVerify={handle2FAVerify} />
            )}
        </div>
    );
};

export default LoginForm;


