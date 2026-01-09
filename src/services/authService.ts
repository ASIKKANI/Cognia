interface UserProfile {
    name: string;
    email: string;
    picture: string;
}

class AuthService {
    private token: string | null = localStorage.getItem('google_access_token');
    private user: UserProfile | null = JSON.parse(localStorage.getItem('user_profile') || 'null');

    // These should ideally be in .env
    public CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // User needs to replace this
    public API_KEY = 'AIzaSyCCao27wkoqp1maYF760d2pJAMxytzflzQ';
    public SCOPES = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    isAuthenticated() {
        return !!this.token;
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('google_access_token', token);
    }

    setUser(user: UserProfile) {
        this.user = user;
        localStorage.setItem('user_profile', JSON.stringify(user));
        // Async sync to Firebase
        import('./firebaseService').then(({ firebaseService }) => {
            firebaseService.saveUserProfile(user);
        });
    }

    logout() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('user_profile');
        localStorage.removeItem('google_access_token');
    }

    async fetchUserProfile(accessToken: string): Promise<UserProfile | null> {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!response.ok) return null;
        return await response.json();
    }

    // GSI Integration
    initTokenClient(callback: (response: any) => void) {
        if (!(window as any).google) return null;
        return (window as any).google.accounts.oauth2.initTokenClient({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            callback: (response: any) => {
                if (response.access_token) {
                    this.setToken(response.access_token);
                }
                callback(response);
            },
        });
    }
}

export const authService = new AuthService();
