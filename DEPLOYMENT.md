# Deployment Guide

This guide will help you deploy the Coin Flip On-Chain application to production.

## Prerequisites

Before deploying, make sure you have:

1. **Thirdweb Client ID**: Get it from [https://thirdweb.com/dashboard](https://thirdweb.com/dashboard)
2. **Smart Contract Deployed**: Deploy the `CoinFlip.sol` contract to Base network
3. **Vercel Account**: For hosting (recommended) or any other hosting provider

## Step 1: Deploy Smart Contract

### Option A: Using Thirdweb (Recommended)

1. Install Thirdweb CLI:
```bash
npm install -g @thirdweb-dev/cli
```

2. Navigate to the project directory:
```bash
cd Coinfliponchain
```

3. Deploy the contract:
```bash
npx thirdweb deploy contracts/CoinFlip.sol
```

4. Follow the browser prompts to:
   - Select Base network (Chain ID: 8453) or Base Sepolia for testing (Chain ID: 84532)
   - Configure contract parameters
   - Complete the deployment

5. Copy the deployed contract address

### Option B: Using Remix IDE

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file and paste the content of `contracts/CoinFlip.sol`
3. Compile the contract
4. Connect to MetaMask and select Base network
5. Deploy the contract
6. Copy the deployed contract address

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory (or use your deployment platform's environment variable settings):

```bash
# Thirdweb Client ID (Get from https://thirdweb.com/dashboard)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_actual_client_id

# Base Chain ID (8453 for Base Mainnet, 84532 for Base Sepolia)
NEXT_PUBLIC_CHAIN_ID=8453

# Your deployed CoinFlip contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourActualContractAddress
```

## Step 3: Deploy to Vercel

### Automatic Deployment (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
   - `NEXT_PUBLIC_CHAIN_ID`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
6. Click "Deploy"

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts to deploy

## Step 4: Deploy to Other Platforms

### Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables
7. Deploy

### Railway

1. Go to [Railway](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Add environment variables
5. Deploy

### Docker

1. Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

2. Build and run:
```bash
docker build -t coin-flip-onchain .
docker run -p 3000:3000 coin-flip-onchain
```

## Step 5: Configure Domain

### Vercel

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Custom Domain Setup

1. Add a CNAME record pointing to your deployment platform
2. Wait for DNS propagation (can take up to 48 hours)
3. Configure SSL/TLS certificate (usually automatic)

## Step 6: Test Your Deployment

After deployment, test the following:

1. ✅ Application loads correctly
2. ✅ Wallet connection works
3. ✅ Local mode coin flips work
4. ✅ On-chain mode requires wallet connection
5. ✅ Smart contract interactions work (if deployed)
6. ✅ Responsive design on mobile devices
7. ✅ Dark mode toggle works
8. ✅ Statistics update correctly

## Monitoring and Analytics

### Add Analytics

1. **Vercel Analytics** (if using Vercel):
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

2. **Google Analytics**:
- Create a GA4 property
- Add the tracking ID to your environment variables
- Use next/script to load GA

### Error Tracking

Consider adding error tracking with:
- [Sentry](https://sentry.io)
- [LogRocket](https://logrocket.com)
- [Bugsnag](https://bugsnag.com)

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to git
2. **API Keys**: Keep all sensitive keys in environment variables
3. **Smart Contract**: Audit your smart contract before mainnet deployment
4. **HTTPS**: Always use HTTPS in production
5. **CSP Headers**: Configure Content Security Policy headers

## Performance Optimization

1. **Image Optimization**: Use Next.js Image component
2. **Caching**: Configure appropriate cache headers
3. **CDN**: Use a CDN for static assets
4. **Code Splitting**: Leverage Next.js automatic code splitting
5. **Bundle Analysis**: Use `@next/bundle-analyzer` to optimize bundle size

## Troubleshooting

### Build Fails

- Check that all dependencies are installed
- Verify environment variables are set
- Review build logs for specific errors

### Wallet Connection Issues

- Ensure Thirdweb Client ID is correct
- Verify the chain ID matches your deployment
- Check browser console for errors

### Contract Interaction Fails

- Verify contract address is correct
- Ensure you're on the right network
- Check that the contract is deployed and verified

## Continuous Deployment

Set up CI/CD with GitHub Actions:

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Support

For deployment issues:
- Check the [Next.js deployment documentation](https://nextjs.org/docs/deployment)
- Review [Vercel documentation](https://vercel.com/docs)
- Open an issue on GitHub

## Next Steps

After successful deployment:

1. Share your dApp with the community
2. Monitor user interactions and feedback
3. Iterate on features based on user needs
4. Consider adding more gameplay features
5. Implement additional security measures
6. Scale infrastructure as needed

---

Happy deploying! 🚀
