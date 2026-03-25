package controllers;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import config.Cors;
import services.UsuarioService;

import java.io.IOException;
import java.util.Map;

public class UsuarioController implements HttpHandler {
    private final UsuarioService service = new UsuarioService();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange ex) throws IOException {
        try {
            if (Cors.handlePreflight(ex)) return;
            Cors.addHeaders(ex);

            String method = ex.getRequestMethod();
            String path   = ex.getRequestURI().getPath();

            if (method.equals("GET") && path.equals("/usuarios")) {
                send(ex, 200, gson.toJson(service.listarTodos()));

            } else if (method.equals("POST") && path.equals("/usuarios/registro")) {
                Map<?, ?> data = gson.fromJson(new String(ex.getRequestBody().readAllBytes()), Map.class);
                String resultado = service.registrar(
                        str(data, "nombre"), str(data, "email"),
                        str(data, "password"), str(data, "rol"),
                        (int) num(data, "carrera_id")
                );
                send(ex, resultado.startsWith("ERROR") ? 400 : 201,
                        "{\"resultado\":\"" + resultado + "\"}");

            } else if (method.equals("POST") && path.equals("/usuarios/login")) {
                Map<?, ?> data = gson.fromJson(new String(ex.getRequestBody().readAllBytes()), Map.class);
                Map<String, Object> usuario = service.login(str(data, "email"), str(data, "password"));
                if (usuario != null) send(ex, 200, gson.toJson(usuario));
                else                 send(ex, 401, "{\"error\":\"Credenciales inválidas\"}");

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
        Object v = m.get(k); return v != null ? v.toString() : "";
    }
    private int num(Map<?, ?> m, String k) {
        Object v = m.get(k); return v instanceof Number n ? n.intValue() : 0;
    }
}
