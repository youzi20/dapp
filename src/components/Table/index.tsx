import React, { createContext, useContext, isValidElement } from 'react';
import styled from 'styled-components';

import { EmptyLoading, EmptyNoData } from '../Empty';
import { Font } from '../../styled';

interface TableProps {
    dataSource: { [k: string]: any }[]
    loading?: boolean
}


type TextAlign = "left" | "center" | "right";

interface TableColumnProps {
    title?: string
    dataKey?: string
    width?: string
    align?: TextAlign
    render?: (value: any, index: number, data: any) => React.ReactNode
}

interface TableContextProps {
    header?: boolean
    index?: number
    item?: { [k: string]: any }
}

// @ts-ignore
const TableContext = createContext<TableContextProps>({});

const TableStyle = styled.div`
    border-radius: 4px;
    background: var(--table);
    overflow: hidden;
`;

const TableRowStyle = styled.div`
display: flex;
justify-content: space-between;
align-items: center;
padding: 10px 20px;
transition: all 0.3s ease;
`;

const TableHeadStyle = styled.div`
font-size: 13px;
color: rgba(255,255,255,0.4);
line-height: 28px;
background-color: var(--table-header);
`;

const TableBodyStyle = styled.div`
font-size: 14px;
font-weight: 500;
color: #fff;
line-height: 36px;
background-color: var(--table-body);

> div:not(:last-child) {
    border-bottom: 1px solid var(--table-line);
}
`;

const TableColumnStyle = styled.div<{ width?: string, align?: TextAlign }>`
/* display: flex; */
${({ width }) => width && `width: ${width};`}
${({ align }) => align && `text-align: ${align};`}
`;

const Table: React.FC<TableProps> = (props) => {
    const { dataSource, loading = false, children } = props;

    return <TableStyle>
        <TableHeadStyle>
            <TableContext.Provider value={{ header: true }}>
                <TableRowStyle>{children}</TableRowStyle>
            </TableContext.Provider>
        </TableHeadStyle>
        <TableBodyStyle>
            {loading ? <EmptyLoading /> :
                !dataSource?.length ? <EmptyNoData /> :
                    dataSource.map((item, index) =>
                        <TableContext.Provider value={{ item, index }} key={index}>
                            <TableRowStyle>{children}</TableRowStyle>
                        </TableContext.Provider>)}
        </TableBodyStyle>
    </TableStyle>
}

export const TableColumn: React.FC<TableColumnProps> = (props) => {
    const { title, dataKey, width, align, render } = props;
    const { header, item, index } = useContext<TableContextProps>(TableContext);

    if (header) return <TableColumnStyle {...{ width, align }}>
        <Font color="rgba(255,255,255,0.8)" fontSize="14px" fontWeight="500">{title}</Font>
    </TableColumnStyle>;

    const value = item && dataKey && item[dataKey];
    // @ts-ignore
    if (render) return <TableColumnStyle {...{ width, align }}>{render && render(value, index, item)}</TableColumnStyle>;

    return <TableColumnStyle {...{ width, align }}>{value}</TableColumnStyle>;
}

export default Table;

export {
    TableContext
}