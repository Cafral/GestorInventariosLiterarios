package controllers;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import config.Cors;
import services.CarreraService;

import java.io.IOException;

public class CarreraController implements HttpHandler {
    private final CarreraService service = new CarreraService();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange ex) throws IOException {
        try {
            if (Cors.handlePreflight(ex))
                return;
            Cors.addHeaders(ex);

            if (ex.getRequestMethod().equals("GET") &&
                    ex.getRequestURI().getPath().equals("/carreras")) {
                send(ex, 200, gson.toJson(service.listarTodas()));
            } else {
                send(ex, 404, "{\"error\":\"Ruta no encontrada\"}");
            }
        } catch (Exception e) {
            send(ex, 500, "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    private void send(HttpExchange ex, int code, String body) {
        try {
            byte[] bytes = body.getBytes("UTF-8");
            ex.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            ex.sendResponseHeaders(code, bytes.length);
            ex.getResponseBody().write(bytes);
            ex.getResponseBody().close();
        } catch (IOException ignored) {
        }
    }
}