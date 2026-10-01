import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminProtectedRoute({ children })
{
    const { user, loading } = useAuth();

    if (loading)
    {
        return (
            <main className="container">
                <p>Loading...</p>
            </main>
        );
    }

    if (!user)
    {
        return <Navigate to="/" replace />;
    }

    if (!user.isAdmin)
    {
        return <Navigate to="/home" replace />;
    }

    return children;
}

export default AdminProtectedRoute;