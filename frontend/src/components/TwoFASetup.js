// frontend/src/components/TwoFASetup.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const TwoFASetup = () => {
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        const generate2FA = async () => {
            try {
                const response = await api.post('/auth/2fa/generate', {}, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setQrCode(response.data.qrCode);
                setSecret(response.data.secret);
            } catch (error) {
                console.error(error);
                alert('Ocurrió un error al generar 2FA.');
            }
        };

        generate2FA();
    }, []);

    const initialValues = {
        token: '',
    };

    const validationSchema = Yup.object({
        token: Yup.string()
            .required('Se requiere el código 2FA'),
    });

    const onSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            // Verificar el token 2FA
            const response = await api.post('/auth/verify-2fa', {
                userId: response.data.user.id, // Asegúrate de tener el userId disponible
                token: values.token,
            });

            if (response.data.token) {
                // Habilitar 2FA
                await api.post('/auth/2fa/enable', {}, {
                    headers: {
                        'Authorization': `Bearer ${response.data.token}`,
                    },
                });
                setIsEnabled(true);
                alert('2FA habilitado exitosamente.');
            }
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
            <h2>Configurar Autenticación de Dos Factores (2FA)</h2>
            {qrCode && (
                <div>
                    <p>Escanea el siguiente código QR con Google Authenticator:</p>
                    <img src={qrCode} alt="QR Code para 2FA" />
                </div>
            )}
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
                            Verificar y Habilitar 2FA
                        </button>
                    </Form>
                )}
            </Formik>
            {isEnabled && <p>2FA está habilitado en tu cuenta.</p>}
        </div>
    );
};

export default TwoFASetup;
