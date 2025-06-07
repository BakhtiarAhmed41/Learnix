import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import IconTest from '../components/IconTest';

export default function Home() {
    const { isAuthenticated } = useAuthStore();

    return (
        <div className="p-8">
            <h1>Home Page</h1>
            {/* IconTest for debugging */}
            <div className="mt-4">
                <IconTest />
            </div>
        </div>
    );
} 