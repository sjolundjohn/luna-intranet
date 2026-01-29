# Luna Health Intranet

A modular company intranet built with Next.js, featuring Google OAuth authentication and Luna brand styling.

## Features

- **Google OAuth Authentication** - Secure login with Google accounts
- **Beverage Ordering** - Order kombucha and cold brew from KEGJOY
- **Modular Architecture** - Easy to add new features
- **Luna Branding** - Midnight Navy (#041e42) + Moonlight (#68d2df) color scheme

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js with Google Provider
- **Deployment**: AWS Amplify (from GitHub)

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Add your credentials to .env.local (see Setup Guide below)

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Setup Guide

### Step 1: Create a GitHub Repository

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: Luna Intranet with beverage ordering"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/luna-intranet.git
git branch -M main
git push -u origin main
```

### Step 2: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-amplify-domain.amplifyapp.com/api/auth/callback/google` (production)
7. Copy your **Client ID** and **Client Secret**

### Step 3: Deploy to AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **New app > Host web app**
3. Choose **GitHub** and authorize AWS
4. Select your repository and branch
5. Configure build settings (Amplify should auto-detect Next.js)
6. Add environment variables:
   ```
   NEXTAUTH_URL=https://your-app.amplifyapp.com
   NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
   GOOGLE_CLIENT_ID=<from Google Cloud Console>
   GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
   ```
7. Deploy!

### Step 4: Update Google OAuth Redirect URI

After deployment, add your Amplify URL to Google Cloud Console:
```
https://your-app.amplifyapp.com/api/auth/callback/google
```

---

## Adding New Features

The intranet is designed to be modular. To add a new feature:

### 1. Create a new page

```javascript
// pages/my-feature.js
import { useSession } from 'next-auth/react';

export default function MyFeature() {
  const { data: session } = useSession();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">My Feature</h1>
      {/* Your content */}
    </div>
  );
}
```

### 2. Add to navigation

Edit `components/Layout.js`:

```javascript
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Order Beverages', href: '/beverages', icon: CoffeeIcon },
  { name: 'My Feature', href: '/my-feature', icon: MyIcon }, // Add here
];
```

### 3. Add a quick action (optional)

Edit `pages/index.js` to add a dashboard card.

---

## Restricting Access by Email Domain

To only allow company emails, edit `pages/api/auth/[...nextauth].js`:

```javascript
callbacks: {
  async signIn({ profile }) {
    // Only allow @lunahealth.com emails
    return profile.email.endsWith('@lunahealth.com');
  },
}
```

---

## Project Structure

```
luna-intranet/
├── components/
│   └── Layout.js          # Main layout with sidebar nav
├── lib/
│   └── products.js        # Product catalog (easy to update)
├── pages/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth].js  # Auth configuration
│   ├── _app.js            # App wrapper
│   ├── index.js           # Dashboard
│   └── beverages.js       # Beverage ordering
├── styles/
│   └── globals.css        # Tailwind + Luna brand styles
├── public/                # Static assets
├── .env.example           # Environment template
└── README.md
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | Your app's URL (e.g., https://your-app.amplifyapp.com) |
| `NEXTAUTH_SECRET` | Random string for session encryption |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |

---

## Updating Products

Edit `lib/products.js` to add/remove beverages from KEGJOY's catalog.

---

## Support

- **KEGJOY Orders**: orders@kegjoy.com | 760.683.9208
- **Luna Brand Guidelines**: See uploaded PDF

---

Built with 💙 for Luna Health
