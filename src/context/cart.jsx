import { createContext, useContext, useEffect, useState } from "react";
import React from "react";
import { useAuthContext } from "./auth";
import request from "../service/request";

const ENDPOINT = "api/cart";

const add = async (data) => {
    const url = `${ENDPOINT}`;
    return request
        .post(url, data)
        .then((res) => {
            return res;
        })
        .catch((e) => {
            return Promise.reject(e.response);
        });
};

const getList = async (id) => {
    const url = `${ENDPOINT}?userId=${id}`;
    return request.get(url).then((res) => {
        return res;
    });
};

const updateItem = async (data) => {
    const url = `${ENDPOINT}`;
    return request
        .put(url, data)
        .then((res) => {
            return res;
        })
        .catch((e) => {
            return Promise.reject(e);
        });
};

const removeItem = async (id) => {
    const url = `${ENDPOINT}?id=${id}`;
    return request
        .delete(url)
        .then((res) => {
            return res;
        })
        .catch((e) => {
            return e;
        });
};

const cartService = { add, getList, updateItem, removeItem };

const initialState = {
    cartData: [],
    updateCart: () => { },
    emptyCart: () => { },
};

export const CartContext = createContext(initialState);

export const CartWrapper = ({ children }) => {
    const authContext = useAuthContext();

    const [cartData, setCartData] = useState([]);
    useEffect(() => {
        updateCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authContext.user.id]);

    const updateCart = () => {
        if (authContext.user.id) {
            cartService.getList(authContext.user.id).then((res) => setCartData(res));
        }
    };
    const emptyCart = () => {
        setCartData([]);
    };
    let value = {
        cartData,
        updateCart,
        emptyCart,
    };
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
    return useContext(CartContext);
};