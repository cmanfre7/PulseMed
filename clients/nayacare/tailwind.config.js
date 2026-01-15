export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  safelist: [
    // Survey star rating colors - prevent purging
    'fill-yellow-300',
    'fill-yellow-400',
    'stroke-yellow-400',
    'stroke-yellow-500',
    'fill-gray-200',
    'stroke-gray-300'
  ],
  theme: { extend: {} },
  plugins: []
}
