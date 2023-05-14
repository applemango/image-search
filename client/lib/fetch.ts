import axios, { AxiosError, AxiosResponse } from "axios";
import { url } from "./url";

export type optionGet = {
    header: any;
}

export type optionPost = {
    header: any;
    body: any;
    is_json?: boolean
}

export const get = async (link: string, options: optionGet = {
    header: {},
}): Promise<[AxiosResponse, true] | [any, false]> => {
    const u = url(link);
    options.header["Content-Type"] = "application/json";
    try {
        const res = await axios.get(
            u, {
                headers: options.header
            }
        )
        return [res, true];
    } catch (e: any) {
        return [e, false];
    }
}

export const post = async (link: string, options: optionPost = {
    header: {},
    body: {},
}) => {
    const u = url(link);
    if(!options.header["Content-Type"] && options.header?.is_json !== false)
        options.header["Content-Type"] = "application/json";
    try {
        const res = await axios.post(
            u, options.is_json ? JSON.stringify(options.body) : options.body, {
                headers: options.header
            }
        )
        return [res, true];
    } catch (e: any) {
        return [e, false];
    }
}