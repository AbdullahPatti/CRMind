import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Provide a valid email"],
        },
        password: {
            type: String,
            required: [true, "password is required"],
            minLength: [6, "Password must be atleast 6 characters long"],
            select: false,
        },
        role: {
            type: String,
            enum: ["owner", "user"],
            default: "owner",
        },
        company: {type: String, trim: true, default: ""},
        avatar: {type: String, default: ""},
    },
    {timestamps: true}
);

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = function (entered) {
    return bcrypt.compare(entered, this.password);
};

export const User = mongoose.model("User", userSchema);