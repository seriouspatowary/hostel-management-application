import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:"dazzling-plate-471319-s7",
      clientEmail:  "firebase-adminsdk-fbsvc@dazzling-plate-471319-s7.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCGxXqW4oxgH6IB\n1KVGDoTGs9LQs/u1lCDg8uNEBzz5ZmB3ME1344ztP2Tvmpzp+MFXVcFBNpJ1GTAT\nBPt7oqjOrg3bhdFieg4MeXq2xnzSJxV/u6uPZpM4CLE/f10xPx+h+HlaWlYDOf7b\nQTdiEuu4obCc6ILO+5F6vduqkoOYobzTaWq4iKOS8lz0luDj2YSuAOxxF8LUvFvX\nu6lDhf/QaOu8YazpCoZhUoYrKOOs1SYCe3VSq35kY3C9J/VA0JjXYwJYOhHyab98\nKyIAS5Ke6Y1T2JDhKv63c47kF6h5xTdJb0jLwSuDMKf53cfaglv+mP+HSw36szYs\nvAZI55mXAgMBAAECggEANIVZFNwM4JjzRctc7URTMix6B6NcgJLNjVyafLRlarwe\n89P7HLGtBfgimc2jQPsUPbjJq2RdBw1d0suqRbBKIOFrvRUVWE9AklP1Iq2Pj0Zz\n9mdooGXVEY0xphE4fCyhYzm18SQrSO6dB00PDEVbX4SDk2J5N7iKJU8//+VBK4Wr\nhZ28ZE09MUXbBFqNZMYgn7hAES5W7RiZjcCnMLDSo8/QJX1CQIepfrijX13ir+Xj\n+7H1lIZsNad3+Mm09oPf7IJKKZqUaw2jkFfu8yQ5eSNb8tRzCzo83SSfi98IIgrP\nmwaUmGBzwrvo0LgKeiZgdKIXSOvlnR8qCC4V1ciGoQKBgQC94CUKK/ZLw0otyurp\nscGhSzf+SFgM+2MJCw5yXu/pGXBOfWBF6lNqesujDWvnt37FnlMwyRH9Tg2PYFNq\nJ9rPgDvBMc9DSADo3nBeFCSvEr1JuEWyu+WA3j0OaFU2zLUB8lRaVGK5Mjf0eWzX\nUSqCNzK1nWQES64ilR61cLvVqwKBgQC1tKr1He+gb6554DQv+bnaljd4taexZ3ye\nojwuGU9KG9zzJ4lSz04VJAy9bYM6cmzACiB6Cb1ry+yeCtI9jbSRuew1mqRm7Rrz\nGmMBt2/GBlS1QI5wSpYKGniR4Rdc78pO3JihQXjd+g0SzH2oTifpi7bWnQKtYIxS\nbRLZ4w2HxQKBgF0tft/D/STm3CMmvisamTvu7rZxiAwu3UXV0CweHLuWST+rVTBa\nMr9BLWeBsZ9Ps/2EmayKL7LPt+XRTn38uuszMZ+4Ms8AqbmdVyVD21Cy8IMZ09JH\nVPPtm6bTWmX/BSDEa9K8MIpTc5QcdmYfpa2rKs5nQ2q8POMprJ07imHrAoGASuSA\nYi9IiRP/EfS7DdscI2Au1O3qhFBnKOstasK7z4vUcdQl4Z/YSxZkud7da8Wl1TFX\nWXWSQU/34twK85vohPfgx+dJQ7MOnIyPqjF1PGV3nI1TKC1V0iw+7cGc441iEUcT\nEcPukW9y3AC0+h3cjYIshiCI7fURYRfb4TqYZRECgYBxXDRWRhe5/EARWa7eG7se\nVeFhDEjJcoEy3iBjzAMzxquWRv/MhAw27nT+IUGs8bw4qaY3DVIfgThVU0UbEiJh\nedZDxhEPJqaxiIm0WnjlbQKkmdbr7jUG00t/ol2rXicd/diCNqlkqsF64cquQWzG\nFD3HthJc5+aoHy8e2rFutA==\n-----END PRIVATE KEY-----\n"?.replace(/\\n/g, '\n'),

    }),
     storageBucket: "dazzling-plate-471319-s7.firebasestorage.app",

  });
}

export const bucket = admin.storage().bucket();
