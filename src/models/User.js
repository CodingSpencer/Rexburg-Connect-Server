import { Schema, model, Document, Types } from "mongoose";
import bcrypt from 'bcrypt';
const UserSchema = new Schema({
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
    profileName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
}, { timestamps: true });
// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password || '', salt);
    }
    catch (error) {
        throw error; // Mongoose will automatically catch this and pass it forward
    }
});
// Instance to safely compare passwords
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
export const User = model('User', UserSchema);
//# sourceMappingURL=User.js.map