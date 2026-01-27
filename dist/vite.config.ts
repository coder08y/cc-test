import strip from '@rollup/plugin-strip'
import react from '@vitejs/plugin-react-swc'
// import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, loadEnv } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tsconfigPaths from 'vite-tsconfig-paths'

function formatDate(date: any) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()

  return `${year}${month < 10 ? '0' + month : month}${day < 10 ? '0' + day : day}${hours < 10 ? '0' + hours : hours}${minutes < 10 ? '0' + minutes : minutes}`
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isPro = (env.VITE_APP_NETWOEK === 'mainnet' && env.VITE_APP_ENV === 'pro') || !!env.VITE_INVITE_CODES
  // const isPro = true

  return {
    server: {
      host: '0.0.0.0',
      port: 5173
    },
    plugins: [
      react(),
      // visualizer({
      //   open: true
      //   // filename: 'bundle-analysis.html',
      //   // gzipSize: true,
      //   // brotliSize: true
      // }),
      tsconfigPaths(),
      nodePolyfills(),
      {
        name: 'html-transform',
        transformIndexHtml(html: any) {
          const now = new Date()
          let transformedHtml = html.replace(/<link\s+rel="icon"\s+type="image\/png"\s+href="([^"]+)"/g, (match: any, href: any) => {
            return `<link rel="icon" type="image/png" href="${href}?t=${formatDate(now)}"`
          })

          // 如果设置了 Google Analytics 环境变量，则添加 GA 脚本
          if (env.VITE_GTAG_CONFIG) {
            const gaScript = `
            <script async src="https://www.googletagmanager.com/gtag/js?id=${env.VITE_GTAG_CONFIG}"></script>
            <script>
              window.dataLayer = window.dataLayer || []
              function gtag() {
                dataLayer.push(arguments)
              }
              gtag('js', new Date())
              gtag('config', '${env.VITE_GTAG_CONFIG}')
            </script>`

            // 在 </head> 标签前插入 GA 脚本
            transformedHtml = transformedHtml.replace(
              '</head>',
              `${gaScript}
              </head>`
            )
          }

          return transformedHtml
        }
      } as any,
      isPro &&
        strip({
          include: ['**/*.(js|jsx|ts|tsx|mjs|cjs)'],
          exclude: [],
          functions: ['console.log', 'console.debug']
        })
    ].filter(Boolean),
    define: {
      'import.meta.vitest': 'undefined'
    },
    build: {
      minify: 'esbuild',
      sourcemap: isPro ? false : false, // 生成 source maps
      // terserOptions: {
      //   sourceMap: true // 确保 terser 不破坏 Source Map
      // },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', '@chakra-ui/react', 'framer-motion', 'canvas-confetti'],
            cross: [
              '@bigmi/client',
              '@bigmi/core',
              '@lifi/sdk',
              '@bigmi/react',
              '@solana/wallet-adapter-base',
              '@solana/wallet-adapter-coinbase',
              '@solana/web3.js',
              'viem',
              'wagmi',
              '@rainbow-me/rainbowkit'
            ]
          }
        }
      }
    },
    // build: {
    //   sourcemap: !isPro, // 生成 source maps
    //   terserOptions: {
    //     compress: {
    //       drop_console: false // 保留 console 语句
    //     },
    //     mangle: isPro // 关闭混淆
    //   },
    //   rollupOptions: {
    //     output: {
    //       manualChunks(id) {
    //         if (id.includes('node_modules')) {
    //           return id.toString().split('node_modules/')[1].split('/')[0].toString()
    //         }
    //       }
    //     }
    //   }
    // },
    optimizeDeps: {
      include: ['react', 'react-dom']
    }
    // server: {
    //   host: '0.0.0.0', // 监听所有网络接口
    //   port: 3000 // 可以根据需要修改端口
    // }
  }
})
