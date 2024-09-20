// frontend/src/components/PostForm.js
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';

const PostForm = () => {
    const initialValues = {
        title: '',
        content: '',
        image: null,
    };

    const validationSchema = Yup.object({
        title: Yup.string()
            .max(255, 'Debe tener 255 caracteres o menos')
            .required('Requerido'),
        content: Yup.string()
            .required('Requerido'),
        image: Yup.mixed()
            .required('Se requiere una imagen')
            .test(
                'fileFormat',
                'Formato de archivo no soportado',
                value => value && ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type)
            )
            .test(
                'fileSize',
                'El archivo es demasiado grande',
                value => value && value.size <= 2048 * 1024 // 2MB
            ),
    });

    const onSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('content', values.content);
        formData.append('image', values.image);

        try {
            const response = await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Post creado exitosamente!');
            resetForm();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                // Mapea los errores al formato de Formik
                const formikErrors = {};
                error.response.data.errors.forEach(err => {
                    if (err.toLowerCase().includes('título')) {
                        formikErrors.title = err;
                    } else if (err.toLowerCase().includes('contenido')) {
                        formikErrors.content = err;
                    } else if (err.toLowerCase().includes('imagen')) {
                        formikErrors.image = err;
                    }
                });
                setErrors(formikErrors);
            } else {
                alert('Ocurrió un error al crear el post.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {({ setFieldValue, isSubmitting, errors }) => (
                <Form>
                    {errors.general && (
                        <div className="alert alert-danger">
                            {errors.general}
                        </div>
                    )}
                    <div>
                        <label htmlFor="title">Título:</label>
                        <Field name="title" type="text" />
                        <ErrorMessage name="title" component="div" className="error" />
                    </div>

                    <div>
                        <label htmlFor="content">Contenido:</label>
                        <Field name="content" as="textarea" />
                        <ErrorMessage name="content" component="div" className="error" />
                    </div>

                    <div>
                        <label htmlFor="image">Subir Imagen:</label>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            onChange={(event) => {
                                setFieldValue("image", event.currentTarget.files[0]);
                            }}
                        />
                        <ErrorMessage name="image" component="div" className="error" />
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        Enviar
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default PostForm;
