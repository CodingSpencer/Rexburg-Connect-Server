import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.mjs";
import type { LoginDto, AuthResponse } from "../models/User.js";

export class AuthService {
    public static async login(credentials: LoginDto): Promise<AuthResponse> {
        const { email, password } = credentials;

        // Select the password field since hidden and execute the query
        const user = await User.findOne({ email }).select('+password').exec();
        if (!user) {
            throw new UnauthorizedError('Invalid credentials.');
        }

        // Add a fallback string so 'undefined' is never passed into comparePassword
        const isMatch = await user.comparePassword(password || '');
        if (!isMatch) {
            throw new UnauthorizedError('Invalid credentials.');
        }

        const jwtSecret = process.env.JWT_SECRET;
        const jwtExpires = process.env.JWT_EXPIRES;

        if (!jwtSecret) {
            throw new UnauthorizedError('JWT secret missing.');
        }

        if (!jwtExpires) {
            throw new UnauthorizedError('JWT expiration missing.');
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            jwtSecret,
            // FIX 2: Cast as 'any' to bypass jsonwebtoken's strict union string check
            { expiresIn: jwtExpires as any }
        );

        return {
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            }
        };
    }
}