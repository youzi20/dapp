import React from 'react';
import ButtonUi from '@material-ui/core/Button';
import styled from 'styled-components';

const ButtonStyle = styled.div`
.MuiButton-containedPrimary {
    background-color: #37B06F !important;

    &:not(:disabled):hover {
        background-color: #239C5B !important;
    }

    &:disabled {
        background-color: #1A4A30 !important;
        color: #89A998 !important;
    }
}

.MuiButton-contained.Mui-disabled {

}
`;



export default function Button(props: any) {

    return <ButtonStyle>
        <ButtonUi {...props} />
    </ButtonStyle>
}