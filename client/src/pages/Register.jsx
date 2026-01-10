import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(formData.name, formData.email, formData.password);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 glass-panel rounded-2xl relative z-10 mx-4"
            >
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 mb-2">
                        Join Us
                    </h2>
                    <p className="text-gray-400">Start your journey today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Full Name</label>
                        <input
                            type="text"
                            className="w-full p-4 glass-input rounded-xl focus:outline-none"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                        <input
                            type="email"
                            className="w-full p-4 glass-input rounded-xl focus:outline-none"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
                        <input
                            type="password"
                            className="w-full p-4 glass-input rounded-xl focus:outline-none"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-lg shadow-lg shadow-green-500/20"
                    >
                        Sign Up
                    </motion.button>
                </form>

                <div className="mt-8 flex flex-col items-center space-y-4">
                    <p className="text-gray-400 text-sm">
                        Already have an account? <Link to="/login" className="text-green-400 hover:text-green-300 font-semibold transition-colors">Login</Link>
                    </p>

                    <div className="w-full pt-6 border-t border-white/10 flex justify-center">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                const success = await googleLogin(credentialResponse.credential);
                                if (success) navigate('/');
                            }}
                            onError={() => console.log('Login Failed')}
                            theme="filled_black"
                            shape="pill"
                            text="signup_with"
                            width="250"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
