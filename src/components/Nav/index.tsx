import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { t, Trans } from "@lingui/macro";

import styled from "styled-components";

import { Grid } from "../../styled";


const NavWrapper = styled(Grid)`
font-size: 13px;
color: #939DA7;
height: 66px;
line-height: 18px;
padding: 24px 0;

a:hover {
    opacity: 0.7;
}

a.active {
    color: #fff;
    text-decoration: underline;
}
`

const Nav = () => {
    const [data] = useState([
        { path: "/", text: t`管理` },
        { path: "/saver", text: t`自动处理` },
    ]);

    const location = useLocation();

    return <NavWrapper template={`repeat(${data.length}, max-content)`} columGap="20px">
        {data.map(item =>
            <Link to={item.path} className={item.path === location.pathname ? "active" : ""} key={item.path}>{item.text}</Link>
        )}
    </NavWrapper>
}

export default Nav;