
"use client"
import axios from "axios";
// import { cookies } from "next/headers";
// const cookieStore = cookies()

import Cookies from "js-cookie";

const api = axios.create();

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const setToken = (newtoken: string) => {
    // kept for compatibility
};

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("access_token");
        config.url = `${BASE_URL}${config.url}`;
        config.headers["Authorization"] = token ? `Bearer ${token}` : "";
        if (Cookies.get("device_token")) {
            config.headers["DeviceToken"] = `${Cookies.get("device_token")}`;
        } else {
            if ("crypto" in window) {
                const dt = btoa(crypto.randomUUID() + Date.now());
                Cookies.set("device_token", dt);
            } else {
                const dt = btoa((Math.random() * 10).toString() + Date.now());
                Cookies.set("device_token", dt);
            }
        }
        if (config.headers["Content-Type"] !== "multipart/form-data") {
            config.headers["Content-Type"] = "application/json";
        }
        const dateString = new Date()?.toString();
        const timeZoneMatch = dateString?.match(/([A-Z]+[\+-][0-9]+.*)/);
        config.headers["TimeZone"] = timeZoneMatch ? timeZoneMatch[1] : "";
        return config;
    },
    (error) => {
        console.error("Request Interceptor Error:", error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
