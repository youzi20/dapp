import React, { createContext, useContext } from 'react';
import styled from 'styled-components';
import { Trans } from '@lingui/macro';

import { EmptyLoading, EmptyNoData } from '../Empty';
import { Font } from '../../styled';

interface TableProps {
    dataSource: { [k: string]: any }[]
    loading?: boolean
    afterBg?: string
    afterColor?: string
    afterSource?: any
}

type TextAlign = "left" | "center" | "right";

interface TableColumnProps {
    first?: boolean
    hidden?: boolean
    title?: string
    dataKey?: string
    width?: string
    align?: TextAlign
    render?: (value: any, index: number, data: any) => React.ReactNode
}

export interface TableContextProps {
    header?: boolean
    index?: number
    after?: boolean
    item?: { [k: string]: any }
}

// @ts-ignore
const TableContext = createContext<TableContextProps>({});

const TableWrapper = styled.div`
    border-radius: 4px;
    background: var(--table);
    overflow: hidden;
`;

const TableRow = styled.div<{ border?: string }>`
display: flex;
justify-content: space-between;
align-items: center;
padding: 10px 20px;
transition: all 0.3s ease;

&:not(:last-child) {
    border-bottom: 1px solid ${({ border }) => border ?? "var(--table-line)"};
}
`;

const TableHeader = styled.div`
font-size: 13px;
color: rgba(255,255,255,0.4);
line-height: 28px;
background-color: var(--table-header);
`;

const TableBody = styled.div`
font-size: 14px;
font-weight: 500;
color: #fff;
line-height: 36px;
background-color: var(--table-body);


`;

const TableColumnWrapper = styled.div<{ width?: string, align?: TextAlign }>`
/* display: flex; */
${({ width }) => width && `width: ${width};`}
${({ align }) => align && `text-align: ${align};`}
`;

const Table: React.FC<TableProps> = (props) => {
    const { dataSource, afterBg, afterColor, afterSource, loading = false, children } = props;

    const { after, ...other } = afterSource ?? {};

    return <TableWrapper>
        <TableHeader>
            <TableContext.Provider value={{ header: true }}>
                <TableRow>{children}</TableRow>
            </TableContext.Provider>
        </TableHeader>
        <TableBody>
            {loading ? <EmptyLoading /> :
                afterSource ? <TableAfter bg={afterBg} border={afterColor}>
                    <TableContext.Provider value={{ item: other, index: 0 }}>
                        <TableRow border={afterColor}>{children}</TableRow>
                    </TableContext.Provider>
                    <TableContext.Provider value={{ item: after, index: 1, after: true }}>
                        <TableRow border={afterColor}>{children}</TableRow>
                    </TableContext.Provider>
                </TableAfter> :

                    !dataSource?.length ? <EmptyNoData /> :
                        dataSource.map((item, index) =>
                            <TableContext.Provider value={{ item, index }} key={index}>
                                <TableRow>{children}</TableRow>
                            </TableContext.Provider>)}
        </TableBody>
    </TableWrapper>
}

export const TableAfter = styled.div<{ bg?: string, border?: string }>`
    ${({ bg }) => bg && `background: ${bg};`}
    ${({ border }) => border && `border-bottom: 4px solid ${border};`}
`;

export const TableColumn: React.FC<TableColumnProps> = (props) => {
    const { first, hidden, title, dataKey, width, align, render } = props;
    const { header, item, index, after } = useContext<TableContextProps>(TableContext);

    if (header) {
        return <TableColumnWrapper {...{ width, align }}>
            <Font color="rgba(255,255,255,0.8)" fontSize="14px" fontWeight="500">{title}</Font>
        </TableColumnWrapper>
    };

    if (hidden && after) return <TableColumnWrapper {...{ width, align }}></TableColumnWrapper>;

    if (first && after) return <TableColumnWrapper {...{ width, align }}><Trans>之后</Trans>：</TableColumnWrapper>;

    const value = item && dataKey && item[dataKey];
    // @ts-ignore
    if (render) return <TableColumnWrapper {...{ width, align }}>{render && render(value, index, item)}</TableColumnWrapper>;

    return <TableColumnWrapper {...{ width, align }}>{value}</TableColumnWrapper>;
}

export default Table;

export {
    TableContext,
    TableRow
}