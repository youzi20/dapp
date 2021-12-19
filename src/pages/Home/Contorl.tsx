import { t } from '@lingui/macro';


import Tab from '../../components/Tab';

import { useAppDispatch } from '../../state/hooks';
import { updateState } from '../../state/after';

import { TabPanelGrid } from '../../styled';

import { Boost, Repay } from './Advanced';
import { Supply, Withdraw } from './Collateral';
import { Borrow, Payback } from './Debt';

const Contorl = () => {
    const dispatch = useAppDispatch();

    const handleChange = () => {
        dispatch(updateState());
    }

    return <Tab
        onChange={handleChange}
        active={0}
        values={[
            {
                title: t`做多`,
                content: <TabPanelGrid>
                    <Boost />
                    <Repay />
                </TabPanelGrid>
            },
            {
                title: t`质押`,
                content: <TabPanelGrid>
                    <Supply />
                    <Withdraw />
                </TabPanelGrid>
            },
            {
                title: t`债务`,
                content: <TabPanelGrid>
                    <Borrow />
                    <Payback />
                </TabPanelGrid>
            },
        ]}
    />
}

export default Contorl;