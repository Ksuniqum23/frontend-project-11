import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        environment: 'jsdom',
        exclude: ['**/node_modules/**', '**/dist/**', '**/hexlet_tests/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            reportsDirectory: 'coverage',
            include: ['src/**/*.js'],
            exclude: ['src/main.js', 'src/index.js'],
        },
    },
})
