interface TokenOutput {
    isValid: boolean;
    tokenValidTill: number;
    token: string;
    userName?: string;
    roleId?: number | string;
    userId: number;
}

interface TokenPayload {
    exp?: number;
    username?: string;
    role_id?: number | string;
    sub?: string;
    assignedApplications?: Array<{ name: string }>;
}

export const decryptAndValidateToken = (token: string, secretKey: string): TokenOutput => {
    try {
        const currentDate: number = new Date().getTime() + 10000;
        const decryptedToken: string = atob(token).replace(secretKey, '');
        const tokenPayload: TokenPayload = decryptedToken.split('.').length > 1
            ? JSON.parse(
                atob(decryptedToken.split('.')[1].replace('-', '+').replace('_', '/'))
            )
            : {};
        const tokenValidTill: number = tokenPayload?.exp ? tokenPayload.exp * 1000 : 0;
        return {
            isValid: tokenValidTill > currentDate,
            tokenValidTill,
            token,
            userName: tokenPayload?.username,
            roleId: tokenPayload?.role_id,
            userId: tokenPayload?.sub ? parseInt(tokenPayload.sub) : 0
        };
    } catch (error) {
        console.error("Failed to decrypt token:", error);
        return null;
    }
};
