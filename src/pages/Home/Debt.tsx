import { useEffect, useMemo, useState } from 'react';
import { Trans, t } from '@lingui/macro';
import { MaxUint256 } from '@ethersproject/constants';

import { ButtonStatus } from '../../components/Button';
import { message } from '../../components/Message';
import Modal from '../../components/Modal';
import APYSelect from '../../components/ApySelect';

import useHandle from '../../hooks/handle';
import { StatusEnums, useTokenBalances, useAllowance } from '../../hooks/contract/erc20';
import { useBorrow, usePayback } from '../../hooks/contract/handle';

import { useAppDispatch } from '../../state/hooks';
import { updateConfigReload } from '../../state/config';
import { WalletBalancesEnums, useState as useWalletState } from '../../state/wallet';
import { useUserInfo } from "../../state/user";
import { useTokenInfo, useBorrowMap, useBorrowCoins } from '../../state/market';

import { Font, TipsBoxWrapper } from '../../styled';
import { getParseWei, fullNumber, numberToFixed } from '../../utils';
import { TIPS_WARNING_SVG } from '../../utils/images';

import Handle, { HandleContext, HandleAbove, HandleInput, HandleSelect, ValueRender, SelectOptionItem, ApproveButton, HandleButton } from './Handle';

export const Borrow = () => {
    const dispatch = useAppDispatch();

    const { state, setState } = useHandle("Borrow");

    const { status, theme, amount, token, tokenAddress, tokenDecimals, handleButton } = state;
    const { setStatus, setMax, setAmount, setToken } = setState;

    const [open, setOpen] = useState(false);
    const [apy, setApy] = useState<number>();

    const [buttonStatus, setButtonStatus] = useState<ButtonStatus>();
    const [confirmStatus, setConfirmStatus] = useState<ButtonStatus>();

    const { availableBorrowsETH } = useUserInfo() ?? {};
    const { price, stableBorrowRateEnabled } = useTokenInfo(token) ?? {};

    const borrowCoins = useBorrowCoins() ?? [];

    const max = useMemo(() => availableBorrowsETH && price ? fullNumber(availableBorrowsETH / price * 0.99) : undefined, [availableBorrowsETH, price]);

    // console.log(borrowCoins, token, tokenAddress, tokenDecimals, availableBorrowsETH, price);

    const borrow = useBorrow(tokenAddress, getParseWei(numberToFixed(amount, tokenDecimals), tokenDecimals), apy);

    const handleClick = () => {
        setConfirmStatus("loading");

        borrow().then((res: any) => {
            console.log(res);
            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                dispatch(updateConfigReload());
                setOpen(false);
            }).catch((error: any) => {
                console.error(error);
                message.error(error.message);

                setConfirmStatus(undefined);
            });
        }).catch((error: any) => {
            console.error(error);
            message.error(error.message);

            setConfirmStatus(undefined);
        });
    }

    const onClick = () => {
        setOpen(true);
        setButtonStatus("loading");
        setStatus && setStatus("disabled");
    }

    const onCancel = () => {
        setOpen(false);
        setButtonStatus(undefined);
        setStatus && setStatus("default");
    }

    useEffect(() => {
        setMax(max);
        
        return () => { }
    }, [max]);

    return <HandleContext.Provider value={{
        status, theme, max, amount, token, tokenAddress, handleButton,
        setStatus, setAmount, setToken
    }}>
        <Handle
            above={<HandleAbove />}
            body={<>
                <HandleInput
                    labelText={<Trans>借币</Trans>}
                    labelTips={<Trans>从Aave中借贷。在借款前您需要储蓄资产作为抵押物。</Trans>}
                />
                <HandleSelect dataSource={borrowCoins ?? []} />
            </>}
            button={<HandleButton status={buttonStatus} onClick={onClick}>
                <Trans>借币</Trans>
            </HandleButton>}
        />
        <Modal
            open={open}
            width="430px"
            title={t`Select your interest rate`}
            onCancel={onCancel}
            onConfirm={handleClick}
            cancelStatus={confirmStatus === "loading" ? "disabled" : "default"}
            confirmStatus={confirmStatus}
            confirmText={t`借币`}
        >
            <Font size="14px" fontColor="#939DA7" lineHeight="21px" style={{ maxWidth: 380, margin: "0 auto" }}>
                <Trans>
                    <Font fontColor="#939DA7" weight="700" style={{ display: "inline" }}>Stable</Font> would be a good choice if you need to plan around a non-volatile rate over a longer period of time.
                    <br />
                    <br />
                    <Font fontColor="#939DA7" weight="700" style={{ display: "inline" }}>Variable</Font> is based on the supply and demand for the selected asset on Aave and is re-calculated every second, meaning the rate will be lower when there is less demand for the asset.
                    <br />
                    <br />
                    You can also switch between the two rates at any point in the future.
                </Trans>
            </Font>
            {!stableBorrowRateEnabled &&
                <TipsBoxWrapper theme="rgb(145 114 44)">
                    <img src={TIPS_WARNING_SVG} alt="" />
                    <Font size="14px"><Trans>This asset is unsupported for stable rate borrow</Trans></Font>
                </TipsBoxWrapper>}

            <APYSelect stable={!stableBorrowRateEnabled} onChange={setApy} />
        </Modal>
    </HandleContext.Provider>
}

export const Payback = () => {
    const dispatch = useAppDispatch();

    const { state, setState } = useHandle("Payback");

    const { status, theme, amount, token, tokenLoanType, tokenAddress, tokenDecimals, handleButton } = state;
    const { setStatus, setMax, setAmount, setToken, setTokenLoanType } = setState;

    const [buttonStatus, setButtonStatus] = useState<ButtonStatus>();

    const borrowMap = useBorrowMap();
    const boorowCoins = useMemo(() => borrowMap ? Object.values(borrowMap).map((item) => ({ value: item.symbol, name: item.symbol, loanType: item.loanType })) : [], [borrowMap]);

    const tokenInfo = useMemo(() => token && borrowMap ? borrowMap[`${token}_${tokenLoanType}`] : undefined, [token, borrowMap]);


    const { status: tokenStatus, balances: tokenBalances } = useTokenBalances(token !== "ETH" ? tokenAddress : undefined, tokenDecimals);
    const { balancesStatus: ethStatus, balances: ethBalances } = useWalletState();

    const { allowance } = useAllowance(token !== "ETH" ? tokenAddress : undefined);

    const max = useMemo(() => {
        let balances: string | undefined;

        if (token === "ETH" && WalletBalancesEnums.FINISH === ethStatus) {
            balances = ethBalances;
        } else if (StatusEnums.FINISH === tokenStatus) {
            balances = tokenBalances;
        }

        if (tokenInfo && balances) {
            const { amount } = tokenInfo;

            // console.log("Payback", balances, amount);

            if (Number(balances) - Number(amount) > 0) return amount;
            else return balances
        }

        return;
    }, [token, tokenInfo, status, ethStatus, tokenStatus, ethBalances]);

    const approve = useMemo(() => {
        if (allowance && token !== "ETH" && Number(allowance) < Number(amount)) return true;
        else return false
    }, [allowance, amount, token]);

    // console.log(borrowMap, token, tokenAddress, tokenDecimals, allowance, approve);

    const payback = usePayback(tokenAddress, amount === max ? MaxUint256 : getParseWei(amount, tokenDecimals), tokenLoanType ? tokenLoanType - 1 : undefined);

    const handleClick = () => {
        setButtonStatus("loading");
        setStatus && setStatus("disabled");

        payback()
            .then((res: any) => {
                console.log(res);
                res.wait()
                    .then((res: any) => {
                        console.log(res);
                        message.success(t`操作成功`);

                        dispatch(updateConfigReload());
                        setButtonStatus(undefined);
                        setStatus && setStatus("default");
                    })
                    .catch((error: any) => {
                        console.error(error);
                        message.error(error.message);

                        setButtonStatus(undefined);
                        setStatus && setStatus("default");
                    });
            })
            .catch((error: any) => {
                console.error(error);
                message.error(error.message);

                setButtonStatus(undefined);
                setStatus && setStatus("default");
            });
    }

    useEffect(() => {
        setMax(max);

        return () => { }
    }, [max]);

    return <HandleContext.Provider value={{
        status, theme, approve, max, amount, token, tokenLoanType, tokenAddress, handleButton,
        setStatus, setAmount, setToken, setTokenLoanType
    }}>
        <Handle
            above={<HandleAbove />}
            body={<>
                <HandleInput
                    labelText={<Trans>还币</Trans>}
                    labelTips={<Trans>还贷资产。</Trans>}
                />
                <HandleSelect
                    dataSource={boorowCoins ?? []}
                    valueRender={<ValueRender />}
                    optionItemRender={<SelectOptionItem />}
                />
            </>}
            button={<>
                {approve && <ApproveButton />}
                <HandleButton status={buttonStatus} onClick={handleClick}>
                    <Trans>还币</Trans>
                </HandleButton>
            </>}
            buttonColumn={approve ? 2 : 1}
        />
    </HandleContext.Provider>
}