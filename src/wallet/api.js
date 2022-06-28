const filterParams = (value) => {
    const params = {};

    Object.entries(value).forEach(([key, value]) => {
        if (value || value === 0) {
            params[key] = value;
        }
    });

    return params;
}

const trimParams = (value) => {
    return Object.entries(filterParams(value)).map(([value, key]) => `${value}=${key}`).join("&");
}

const request = (url, options) => {
    return fetch("http://47.100.205.74:8181" + url, options)
        .then((response) => response.json())
        .then((res) => {
            const { code, data } = res;

            if (code === 200) {
                return data;
            } else {
                console.log(res);
            }
        })
        .catch((error) => {
            console.log(error);
        });
}


export const contractAddress = (key) => {
    const types = {
        1: 3,
        56: 1,
    }

    return request("/wallet/address/contract?" + trimParams({ type: types[key] }));
}


export const contractApprove = (key, params) => {
    const types = {
        1: 3,
        56: 1,
    }

    // address 用户地址
    // amount 授权额度
    // token 授权的合约地址
    // contract 授权给的合约地址

    return request("/wallet/approve/contract" + trimParams({ type: types[key], ...params }));
}

