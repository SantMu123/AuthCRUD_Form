import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PostForm from './components/PostForm';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import TwoFASetup from './components/TwoFASetup';
import { AuthContext } from './contexts/AuthContext';

function App() {
    const { auth, logout } = useContext(AuthContext);

    const PrivateRoute = ({ children }) => {
        return auth.token ? children : <Navigate to="/login" />;
    };

    return (
        <Router>
            <div className="App">
                <nav>
                    <ul>
                        {!auth.token ? (
                            <>
                                <li><a href="/register">Registrar</a></li>
                                <li><a href="/login">Login</a></li>
                            </>
                        ) : (
                            <>
                                <li><a href="/posts">Crear Post</a></li>
                                <li><a href="/2fa">Configurar 2FA</a></li>
                                <li><button onClick={logout}>Logout</button></li>
                            </>
                        )}
                    </ul>
                </nav>
                <Routes>
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/posts" element={
                        <PrivateRoute>
                            <PostForm />
                        </PrivateRoute>
                    } />
                    <Route path="/2fa" element={
                        <PrivateRoute>
                            <TwoFASetup />
                        </PrivateRoute>
                    } />
                    <Route path="/" element={<Navigate to="/posts" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;



