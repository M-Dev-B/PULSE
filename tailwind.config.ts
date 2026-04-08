import type { Config } from "tailwindcss";

const config: Config = {
    // ... your content array
    theme: {
        extend: {
            fontFamily: {
                // Maps to the Source_Sans_3 variable in your layout
                sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
                // Maps to the Montserrat variable in your layout
                heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
                // Maps to the Geist_Mono variable
                mono: ['var(--font-mono)', 'monospace'],
            },
        },
    },
    plugins: [],
};
export default config;