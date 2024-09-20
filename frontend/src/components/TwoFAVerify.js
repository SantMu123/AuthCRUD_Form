// frontend/src/components/TwoFAVerify.js
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';

const TwoFAVerify = ({ userId, onVerify }) => {
    const initialValues = {
        token: '',
    };

    const validationSchema = Yup.object({
        token: Yup.string()
            .required('Se requiere el código 2FA'),
    });

    const onSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            const response = await api.post('/auth/verify-2fa', { userId, token: values.token });
            onVerify(response.data.token, response.data.user);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setErrors({ token: error.response.data.error });
            } else {
                alert('Ocurrió un error al verificar 2FA.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h2>Verificar Autenticación de Dos Factores (2FA)</h2>
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
                            <label htmlFor="token">Código 2FA:</label>
                            <Field name="token" type="text" />
                            <ErrorMessage name="token" component="div" className="error" />
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            Verificar 2FA
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default TwoFAVerify;
