import * as path from 'path';
import externalLinks from 'remark-external-links';

const Public = path.resolve(__dirname, 'public');
const Src = path.resolve(__dirname, 'src');

export default {
  src: './src',
  base: '/live-stream-radio/',
  title: 'live-stream-radio',
  description: '24/7 live stream video radio station CLI / API 📹 📻',
  ordering: 'ascending',
  propsParser: false,
  indexHtml: 'docz/index.html',
  htmlContext: {
    favicon: '/docz/favicon.ico'
  },
  mdPlugins: [externalLinks.default],
  plugins: [],
  modifyBundlerConfig: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@fonts': `${Public}/fonts`,
      '@images': `${Public}/images`,
      '@components': `${Src}/theme/components`,
      '@styles': `${Src}/theme/styles`
    };
    return config;
  }
};
