import SpotifyProvider from "next-auth/providers/spotify";
import { AuthOptions } from "next-auth";

const scope = [
    "user-read-recently-played",
    "user-top-read",
    "user-read-playback-state",
    "user-read-currently-playing",
].join(" ");

async function refreshAccessToken(token: any) {
    try {
        const url = "https://accounts.spotify.com/api/token";
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64"),
            },
            method: "POST",
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
        };
    } catch (error) {
        console.log(error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions: AuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID!,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
            authorization: {
                params: { scope },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account, user }: any) {
            if (account && user) {
                return {
                    accessToken: account.access_token,
                    accessTokenExpires: Date.now() + (account.expires_at || 3600) * 1000,
                    refreshToken: account.refresh_token,
                    user,
                };
            }

            if (Date.now() < token.accessTokenExpires) {
                return token;
            }

            return await refreshAccessToken(token);
        },
        async session({ session, token }: any) {
            session.user = token.user;
            session.accessToken = token.accessToken;
            session.error = token.error;
            return session;
        },
    },
};
