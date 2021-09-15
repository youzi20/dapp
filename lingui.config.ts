export default {
   catalogs: [
      {
         path: '<rootDir>/src/locales/{locale}',
         include: ['<rootDir>/src'],
      },
   ],
   compileNamespace: 'cjs',
   fallbackLocales: {
      default: 'zh-CN',
   },
   format: 'po',
   formatOptions: {
      lineNumbers: false,
   },
   locales: [
      'zh-CN',
      'en-US'
   ],
   orderBy: 'messageId',
   rootDir: '.',
   runtimeConfigModule: ['@lingui/core', 'i18n'],
   sourceLocale: 'zh-CN',
}