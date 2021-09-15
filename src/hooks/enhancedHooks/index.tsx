import React from 'react';


export function setRef<T>(
    ref: React.MutableRefObject<T | null> | ((instance: T | null) => void) | null | undefined,
    value: T | null,
): void {
    if (typeof ref === 'function') {
        ref(value);
    } else if (ref) {
        ref.current = value;
    }
}

export function useForkRef<Instance>(
    refA: React.Ref<Instance> | null | undefined,
    refB: React.Ref<Instance> | null | undefined,
): React.Ref<Instance> | null {
    return React.useMemo(() => {
        if (refA == null && refB == null) {
            return null;
        }
        return (refValue) => {
            setRef(refA, refValue);
            setRef(refB, refValue);
        };
    }, [refA, refB]);
}

export const useEnhancedEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
