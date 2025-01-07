interface LoginRequestBody {
    username: string;
    password: string;
}
type jwt_payload = {
    user_id: string;
    iat: number;
    exp: number;
};

export type { LoginRequestBody, jwt_payload };
