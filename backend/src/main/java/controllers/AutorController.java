package controllers;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import config.Cors;
import services.AutorService;

import java.io.IOException;
import java.util.Map;

public class AutorController implements HttpHandler {
    private final AutorService service = new AutorService();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange ex) throws IOException {
        try {
            if (Cors.handlePreflight(ex)) return;
            Cors.addHeaders(ex);

            String method = ex.getRequestMethod();
            String path   = ex.getRequestURI().getPath();

            if (method.equals("GET") && path.equals("/autores")) {
                send(ex, 200, gson.toJson(service.listarTodos()));

            } else if (method.equals("POST") && path.equals("/autores")) {
                Map<?, ?> data = gson.fromJson(
                        new String(ex.getRequestBody().readAllBytes()), Map.class);

                String nombre = str(data, "nombre");
                if (nombre.isBlank()) {
                    send(ex, 400, "{\"error\":\"El nombre del autor es obligatorio\"}");
                    return;
                }
                String resultado = service.crear(nombre, str(data, "email"), str(data, "biografia"));
                send(ex, resultado.startsWith("ERROR") ? 400 : 201,
                        "{\"resultado\":\"" + resultado + "\"}");

            } else if (method.equals("DELETE") && path.matches("/autores/\\d+")) {
                int id = Integer.parseInt(path.split("/")[2]);
                String resultado = service.eliminar(id);
                if (resultado.startsWith("ERROR")) {
                    send(ex, 400, "{\"error\":\"" + resultado + "\"}");
                } else {
                    send(ex, 200, "{\"ok\":true}");
                }

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
        } catch (IOException ignored) {}
    }

    private String str(Map<?, ?> m, String k) {
        Object v = m.get(k);
        return v != null ? v.toString() : "";
    }
}