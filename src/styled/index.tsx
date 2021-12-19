import styled from 'styled-components';

export const Font = styled.div<{
    fontColor?: string
    size?: string
    weight?: "300" | "400" | "500" | "700"
    align?: "left" | "center" | "right"
    lineHeight?: string
    letterSpacing?: string
}>`
${({ weight }) => weight && `font-weight: ${weight};`}
${({ size }) => size && `font-size: ${size};`};
${({ fontColor }) => fontColor && `color: ${fontColor};`};
${({ align }) => align && `text-align:  ${align};`}
${({ lineHeight }) => lineHeight && `line-height:  ${lineHeight};`}
${({ letterSpacing }) => letterSpacing && `letter-spacing: ${letterSpacing};`};
vertical-align: top;
`;

export const Flex = styled.div<{
    inline?: boolean
    flex?: any
    flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
}>`
display: ${({ inline }) => inline ? "inline-flex" : "flex"}; ;

${({ flex }) => flex && `flex: ${flex};`}
${({ flexDirection }) => flexDirection && `flex-direction: ${flexDirection};`}
${({ alignItems }) => alignItems && `align-items: ${alignItems};`}
${({ justifyContent }) => justifyContent && `justify-content: ${justifyContent};`}
`;

export const Grid = styled.div<{
    inline?: boolean
    column?: number
    template?: string
    columnGap?: string
    rowGap?: string
    alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
}>`
display: ${({ inline }) => inline ? "inline-grid" : "grid"};
${({ column, template }) => (column || template) && `grid-template-columns: ${column ? `repeat(${column}, max-content)` : template};`}
${({ columnGap }) => columnGap && `grid-column-gap: ${columnGap};`}
${({ rowGap }) => rowGap && `grid-row-gap: ${rowGap};`} 
${({ alignItems }) => alignItems && `align-items: ${alignItems};`}
${({ justifyContent }) => justifyContent && `justify-content: ${justifyContent};`}
`;

export const Line = styled.div`
width: 100%;
height: 1px;
background: var(--theme);
`;

export const Body = styled.div`
background: var(--bg);
min-height: 100vh;
padding-bottom: 25px;
`;

export const Container = styled.div<{ width?: string }>`
width:${({ width = "1100px" }) => width};
/* height: 100%; */
margin: 0 auto;

@media screen and (max-width: 768px) {
    width: 100%;
}
`;

export const Wrapper = styled.div`
margin-bottom: 25px;
border-radius: 3px;
background: var(--user-info);
overflow: hidden;
`;

export const WrappeContainer = styled(Wrapper)`
padding: 45px;

@media screen and (max-width: 768px) {
    padding: 25px 15px;
    border-radius: 0;
}
`; 

export const TableAbove = styled.div`
padding: 25px 0;

@media screen and (max-width: 768px) {
    padding: 25px 15px;
}
`;

interface ImgProps {
    src: string
    width?: string | number
    height?: string | number
}

const Img = styled.img`
display: block;
width: 100%;
height: auto;
`;

export const Image = ({ width, height, src }: ImgProps) => {
    return <div style={{ width, height }}>
        <Img src={src} alt="" />
    </div>
};

export const TextOverflowWrapper = styled.span`
flex: 0 1 auto;
white-space: nowrap;
text-overflow: ellipsis;
overflow: hidden;
`;

export const DropWrapper = styled.div`
padding: 5px 0;
background-color: var(--drop-wrapper);
`;

export const OptionWrapper = styled.div<{ contentWidth?: string, contentHeight?: string, contentMaxHeight?: string }>`
${({ contentWidth }) => contentWidth ? `width: ${contentWidth};` : ""}
${({ contentHeight }) => contentHeight ? `height: ${contentHeight};` : ""}
max-height: ${({ contentMaxHeight }) => contentMaxHeight ?? "240px"};
background-color: var(--option-wrapper);
overflow-x: hidden;
overflow-y: auto;
`;

export const OptionItemWrapper = styled.div`
cursor: pointer;

&:not(.active):hover {
    background: var(--option-hover);
}

&.active {
    background: var(--option-active);
}
`;

export const TipsBoxWrapper = styled.div<{ theme: string }>`
display: grid;
grid-template-columns: auto 1fr;
grid-column-gap: 10px;
align-items: center;
margin: 25px 0;
padding: 12px;
border-radius: 3px;
background-color: ${({ theme }) => theme};
`;

export const ButtonGroupGrid = styled.div<{ column?: number, columnGap?: string }>`
display: grid;
grid-template-columns: repeat(${({ column }) => column ?? "1"}, max-content);
justify-content: end;
column-gap: ${({ columnGap }) => columnGap ?? "10px"};
`;

export const TabPanelGrid = ({ children }: {
    children: React.ReactNode
}) => {
    return <Grid template="repeat(2, 1fr)" columnGap="60px">
        {children}
    </Grid>
};
