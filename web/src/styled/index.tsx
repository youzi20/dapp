import React from 'react';
import styled from "styled-components";

type FlexProps = {

}

enum FontTypeEnums {
    MEDIUM = "medium",
    BOLD = "bold",
}

interface FontInterface {
    fontSize?: string
    fontFamily?: FontTypeEnums
    color?: string
}


const getFontFamily = (type: FontTypeEnums) => {
    switch (type) {
        case FontTypeEnums.MEDIUM:
            return "PingFangSC-Medium";
        case FontTypeEnums.BOLD:
            return "PingFangSC-Semibold";
        default:
            return "PingFangSC-SC";
    }
}




const Text: React.FC<any> = ({ className, children }) => <span className={className}>{children}</span>;

export const Font = styled(Text)`
font-size: ${({ fontSize }) => fontSize ?? "20px"};
font-family: ${({ fontFamily }) => getFontFamily(fontFamily)};
color: ${({ color }) => color ?? "#fff"};
`;