import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // Optional: Restrict to specific email domains
      // if (profile.email.endsWith('@lunahealth.com')) {
      //   return true;
      // }
      // return false;
      return true;
    },
    async session({ session, token }) {
      return session;
    },
  },
  pages: {
    signIn: '/', // Use our custom login page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
