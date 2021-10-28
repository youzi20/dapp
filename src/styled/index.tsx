import styled from "styled-components";

export const Body = styled.div`
background: var(--bg);
min-height: 100vh;
padding-bottom: 25px;
`;

interface ContentInterface {
    width?: string
}


export const Content = styled.div<ContentInterface>`
width:${({ width = "1100px" }) => width};
height: 100%;
margin: 0 auto;
`;

export const Font = styled.div<{
    fontWeight?: "300" | "400" | "500" | "700"
    fontSize?: string
    color?: string
    align?: "left" | "center" | "right"
    lineHeight?: string
    letterSpacing?: string
}>`
${({ fontWeight }) => fontWeight && `font-weight: ${fontWeight};`}
font-size: ${({ fontSize }) => fontSize ?? "inherit"};
color: ${({ color }) => color ?? "#fff"};

${({ align }) => align && `text-align:  ${align};`}
${({ lineHeight }) => lineHeight && `line-height:  ${lineHeight};`}
${({ letterSpacing }) => `letter-spacing: ${letterSpacing};`};
vertical-align: top;
`;


export const Flex = styled.div<{
    flex?: any
    flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'
}>`
display: flex;

${({ flex, flexDirection, alignItems, justifyContent }) =>
        `
${flex ? `flex: ${flex};` : ''}
${flexDirection ? `flex-direction: ${flexDirection};` : ''}
${justifyContent ? `justify-content: ${justifyContent};` : ''}
${alignItems ? `align-items: ${alignItems};` : ''}
`}

`


export const Grid = styled.div<{
    inline?: boolean
    template?: string
    columGap?: string
    rowGap?: string
    alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
}>`
display: ${({ inline }) => inline ? "inline-grid" : "grid"};
${({ template }) => template ? `grid-template-columns: ${template};` : ''}
${({ columGap }) => columGap ? `grid-column-gap: ${columGap};` : ''}
${({ rowGap }) => rowGap ? `grid-row-gap: ${rowGap};` : ''} 
${({ alignItems }) => alignItems ? `align-items: ${alignItems};` : ''}
`;


export const TextOverflowWrapper = styled.div`
flex: 0 1 auto;
white-space: nowrap;
text-overflow: ellipsis;
overflow: hidden;
`;

export const DropWrapper = styled.div`
background-color: var(--wallet-menu);
`;

export const DropOption = styled.div<{ width?: string }>`
display: flex;
align-items: center;
${({ width }) => width ? `width: ${width};` : ""}
font-size: 14px;
color: #fff;
padding: 10px;
cursor: pointer;

&:not(.active):hover {
    background: var(--wallet-option-hover);
}

&.active {
    background: var(--wallet-option-active);
}
`;

export const Wrapper = styled.div`
margin-bottom: 25px;
border-radius: 3px;
background: var(--user-info);
overflow: hidden;
`;

export const WrapperHeader = styled.div`
display: flex;
align-items: center;
height: 52px;
padding: 0 20px;
background: var(--user-info-header);
`;

export const TipsStyle = styled.div<{ theme: string }>`
display: grid;
grid-template-columns: auto 1fr;
grid-column-gap: 10px;
align-items: center;
margin: 25px 0;
padding: 12px;
border-radius: 3px;
background-color: ${({ theme }) => theme};
`;