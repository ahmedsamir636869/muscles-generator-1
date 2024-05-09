import { connectMongoDB } from "/lib/mongodb";
import User from "/models/User";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs'

export default async (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            await connectMongoDB();
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
            
            const passwordsMatch = await bcrypt.compare(password, user.password);

            if (!passwordsMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
            
            console.log('User with ID: ', user._id, ' and Email of: ', user.email, ' has logged in successfully!')

            return res.status(200).json({ user });
        } catch (error) {
            console.log('Login Error: ', error)
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
};
