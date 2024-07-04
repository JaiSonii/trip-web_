// utils/withAuth.tsx
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Adjust path as per your actual setup

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
    const WrapperComponent = (props: any) => {
        const router = useRouter();
        const { authenticated } = useAuth(); // Get authentication state from context

        useEffect(() => {
            if (!authenticated) {
                router.push('/login'); // Redirect to login page if not authenticated
            }
        }, [authenticated]);

        if (!authenticated) {
            return null; // or loading spinner while checking authentication state
        }

        return <WrappedComponent {...props} />;
    };

    return WrapperComponent;
};

export default withAuth;
