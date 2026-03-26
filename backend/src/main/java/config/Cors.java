package config;

import com.sun.net.httpserver.HttpExchange;

public class Cors {

    private static final String FRONTEND_URL = System.getenv("FRONTEND_URL") != null
            ? System.getenv("FRONTEND_URL")
            : "*";

    public static void addHeaders(HttpExchange ex) {
        ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        ex.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    public static boolean handlePreflight(HttpExchange ex) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(ex.getRequestMethod())) {
            addHeaders(ex);
            ex.sendResponseHeaders(204, -1);
            return true;
        }
        return false;
    }
}