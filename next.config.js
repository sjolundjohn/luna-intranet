/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    DROPBOX_SIGN_API_KEY: process.env.DROPBOX_SIGN_API_KEY,
    NDA_TEMPLATE_ID: process.env.NDA_TEMPLATE_ID,
  },
}

module.exports = nextConfig
