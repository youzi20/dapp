import { useWeb3React } from '@web3-react/core';

export function useWeb3ReactCore() {
    const context = useWeb3React()
    return context;
}

export default useWeb3ReactCore