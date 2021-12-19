import { useEffect, useState } from 'react';
import { t, Trans } from '@lingui/macro';


import { ThemeSelect } from '../../components/Select';


import { useAppDispatch } from '../../state/hooks';
import { updateState } from '../../state/after';

import { Font, Flex, Line, Wrapper } from '../../styled';
import { HandleType } from '../../utils';

import { Boost, Repay } from './Advanced';
import { Supply, Withdraw } from './Collateral';
import { Borrow, Payback } from './Debt';


const Contorl = () => {
    const dispatch = useAppDispatch();

    const [handle, setHandle] = useState<any>();
    const [dataSource] = useState([
        { name: t`加杠杆`, value: "Boost" },
        { name: t`减杠杆`, value: "Repay" },
        { name: t`质押`, value: "Supply" },
        { name: t`减少质押`, value: "Withdraw" },
        { name: t`借币`, value: "Borrow" },
        { name: t`还币`, value: "Payback" },
    ]);

    const handleChange = (value: any) => {
        setHandle(value);
        dispatch(updateState());
    }

    useEffect(() => {
        setHandle(dataSource[0]);
    }, []);

    return <Wrapper>
        <Flex alignItems="center" justifyContent="space-between" style={{ padding: 15 }}>
            <Font><Trans>操作：</Trans></Font>

            <ThemeSelect
                dataSource={dataSource}
                value={handle}
                onChange={handleChange}
            />
        </Flex>

        <Line />

        {handle?.value === "Boost" && <Boost />}
        {handle?.value === "Repay" && <Repay />}
        {handle?.value === "Supply" && <Supply />}
        {handle?.value === "Withdraw" && <Withdraw />}
        {handle?.value === "Borrow" && <Borrow />}
        {handle?.value === "Payback" && <Payback />}
    </Wrapper>
}

export default Contorl;