module.exports = {
  presets: [require('@espressotutorialsgmbh/espresso-tailwind-config')],
  prefix: 'et-',
  corePlugins: { preflight: false },
  content: ['./projects/support-chat/src/**/*.{html,ts}'],
  theme: { extend: {} },
  plugins: []
};
