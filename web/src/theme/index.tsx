import styled from 'styled-components';


export const BodyStyle = styled.div`
background: #0B1216 linear-gradient(to bottom, #20292F 0, #0B1216 500px);
background-attachment: fixed;
min-height: 100vh;
`

export const ContentStyle = styled.div<{ width?: string }>`
width:${({ width = 1100 }) => width + "px"};
margin: 0 auto;

`;