const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { upsertGoogleUser } = require('../services/userService')

if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn('[passport] GOOGLE_CLIENT_ID is missing. Google OAuth will not work until it is configured.')
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : `${profile.id}@google-oauth.local`

        const user = await upsertGoogleUser({
          googleId: profile.id,
          email
        })
        return done(null, user)
      } catch (error) {
        return done(error, null)
      }
    }
  )
)

module.exports = passport
