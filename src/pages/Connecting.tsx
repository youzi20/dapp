import { Trans } from '@lingui/macro';

 import { EmptyLoading } from '../components/Empty';

import { Container, Font } from '../styled';

const Connecting = () => {
    return <Container>
        <EmptyLoading
            size="60px"
            text={<Font size="20px" style={{ marginTop: 20 }}><Trans>正在连接您的的账户，请稍等...</Trans></Font>}
        />
    </Container>
}

export default Connecting;