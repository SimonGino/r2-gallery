/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CLOUDFLARE_ACCOUNT_ID: string
    readonly VITE_CLOUDFLARE_ACCESS_KEY_ID: string
    readonly VITE_CLOUDFLARE_SECRET_ACCESS_KEY: string
    readonly VITE_BUCKET_NAME: string
    readonly VITE_BUCKET_ENDPOINT: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
} 