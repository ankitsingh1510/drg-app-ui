import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginResponse {
    token: string;
}

interface UserCredentials {
    username: string;
    password: string;
}

class UserAuthService {
    private token: string | null = null;

    constructor() {
        this.initToken();
    }

    private async initToken() {
        this.token = await AsyncStorage.getItem('token');
    }

    /**
     * Authenticates a user with the login API
     * @param credentials - Object containing username and password
     * @returns Promise with login response containing token
     */
    async validateUser(credentials: UserCredentials): Promise<LoginResponse> {
        try {
            const response = await axios.post<LoginResponse>(
                'https://dev.indx.ai/platform/api/token',
                credentials,
            );
            this.token = response.data.token;
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Logs out the current user by clearing authentication state
     */
    async revoke(): Promise<void> {
        try {
            await this.initToken();
            await axios.post(
                `https://dev.indx.ai/platform/api/token/revoke`,
                { token: this.token },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                }
            );
            await AsyncStorage.removeItem('token');
            this.token = null;
        } catch (error) {
            console.error("Failed to revoke token:", error);
            throw error;
        }
    }
}

const userAuthService = new UserAuthService();
export default userAuthService;
