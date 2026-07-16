import { Schema, model, Document, Types } from "mongoose";
import bcrypt from 'bcrypt';

export interface LoginDto {
    profileName: string;
    password?: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: any; // Or Types.ObjectId
        profileName?: string;
        email: string;
        name: string;
    };
}

export interface IUser extends Document {
    _id: Types.ObjectId;
    profileName: string;
    email: string;
    password?: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    profileName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    name: {
        type: String,
        required: true,
    },
},
    { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password || '', salt);
    } catch (error: any) {
        throw error; // Mongoose will automatically catch this and pass it forward
    }
});

// Instance to safely compare passwords
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

export const User = model<IUser>('User', UserSchema);