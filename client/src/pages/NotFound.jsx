import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/10 backdrop-blur-sm max-w-md w-full shadow-2xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={40} className="text-red-500" />
                </div>

                <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">404</h1>
                <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
                <p className="text-gray-400 mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-1"
                >
                    <Home size={20} />
                    <span>Go Back Home</span>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
