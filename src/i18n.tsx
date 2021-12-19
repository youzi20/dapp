import React, { useState, useEffect } from 'react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { en, zh, PluralCategory } from 'make-plural/plurals'


import { SupportedLocale, useActiveLocale } from './hooks/lang';

type LocalePlural = {
    [key in SupportedLocale]: (n: number | string, ord?: boolean) => PluralCategory
}

const plurals: LocalePlural = {
    'en-US': en,
    'zh-CN': zh,
}

async function dynamicActivate(locale: SupportedLocale) {
    const { messages } = await import(`@lingui/loader!./locales/${locale}.po`)
    i18n.loadLocaleData(locale, { plurals: () => plurals[locale] })
    i18n.load(locale, messages);
    i18n.activate(locale);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const locale = useActiveLocale(true);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        dynamicActivate(locale)
            .then(() => {
                setLoaded(true)
            })
            .catch((error) => {
                console.error('Failed to activate locale', locale, error)
            })
    }, [locale])

    if (!loaded) return null;

    return (
        <I18nProvider forceRenderOnLocaleChange={false} i18n={i18n}>
            {children}
        </I18nProvider>
    )
}