import { useMemo, useRef } from 'react';
import { useUserLocale } from '../../state/lang';



export const SUPPORTED_LOCALES = [
    'en-US',
    'zh-CN',
] as const

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN';

export function navigatorLocale(): SupportedLocale | undefined {
    if (!navigator.language) return undefined

    // @ts-ignore
    return navigator.language;
}

export function useActiveLocale(closeUpdate?: boolean): SupportedLocale {
    const userLocale = useUserLocale()

    const localeRef = useRef<SupportedLocale>();

    localeRef.current = useMemo(() => {
        if (closeUpdate && localeRef.current) return localeRef.current;

        return userLocale ?? navigatorLocale() ?? DEFAULT_LOCALE;
    }, [userLocale])

    return localeRef.current;
}