import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { connectMongoDB } from "/lib/mongodb";
import User from "/models/User";
import bcrypt from 'bcryptjs';

const options = {
    providers: [
        Providers.Credentials({
            // The name to display on the sign-in form (e.g. 'Sign in with...')
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: {  label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                const { email, password } = credentials;
                try {
                    await connectMongoDB();
                    const user = await User.findOne({ email });

                    if (!user) return null;
                    
                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (!passwordsMatch) return null;
                    
                    console.log('User with ID: ', user._id, ' and Email of: ', user.email, ' has logged in successfully!')

                    return user;
                } catch (error) {
                    console.error('Login Error: ', error);
                    return null;
                }
            }
        })
    ],
    session: {
        jwt: true,
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn(user, account, profile) {
            // Return false to deny access or true to allow access
            return true
        },
        async redirect(url, baseUrl) {
            return url.startsWith(baseUrl) ? url : baseUrl
        }
    },
    debug: process.env.NODE_ENV === "development",
}

export default (req, res) => NextAuth(req, res, options)
