import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  async function loadMessages(l: string) {
    try {
      const mod = await import(`../messages/${l}.json`);
      return mod.default;
    } catch {
      const mod = await import(`../messages/en.json`);
      return mod.default;
    }
  }

  return {
    locale: locale ?? 'en',
    messages: await loadMessages(locale ?? 'en')
  };
});
