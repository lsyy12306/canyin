/** @type {import('tailwindcss').Config} */
// 设计系统令牌严格对应《UI-UX 设计规范》§3 与《开发技术文档》§8.6
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#C8482E',
        'brand-dark': '#A23A24',
        amber: '#E0A23B',
        fresh: '#6E8B5B',
        cream: '#FBF6EE',
        surface: '#FFFFFF',
        ink: '#2E2A26',
        muted: '#8A7E72',
        line: '#ECE3D6',
      },
      fontFamily: {
        sans: [
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '"Hiragino Sans GB"',
          '"Source Han Sans SC"',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '14px',
        btn: '999px',
      },
      boxShadow: {
        card: '0 10px 30px rgba(120, 80, 40, 0.10)',
      },
      maxWidth: {
        container: '1160px',
      },
      spacing: {
        section: '72px',
      },
    },
  },
  plugins: [],
};
