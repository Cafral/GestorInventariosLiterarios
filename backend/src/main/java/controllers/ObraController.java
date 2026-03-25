package controllers;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import config.Cors;
import services.ObraService;

import java.io.IOException;
import java.util.Map;

public class ObraController implements HttpHandler {
    private final ObraService service = new ObraService();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange ex) throws IOException {
        try {
            if (Cors.handlePreflight(ex)) return;
            Cors.addHeaders(ex);

            String method = ex.getRequestMethod();
            String path   = ex.getRequestURI().getPath();

            if (method.equals("GET") && path.equals("/obras")) {
                String query = ex.getRequestURI().getQuery();
                if (query != null && query.startsWith("carreraId=")) {
                    int carreraId = Integer.parseInt(query.split("=")[1]);
                    send(ex, 200, gson.toJson(service.listarPorCarrera(carreraId)));
                } else {
                    send(ex, 200, gson.toJson(service.listarTodas()));
                }

            } else if (method.equals("GET") && path.matches("/obras/\\d+")) {
                int id = Integer.parseInt(path.split("/")[2]);
                Map<String, Object> obra = service.buscarPorId(id);
                if (obra != null) send(ex, 200, gson.toJson(obra));
                else              send(ex, 404, "{\"error\":\"Obra no encontrada\"}");

            } else if (method.equals("POST") && path.equals("/obras")) {
                Map<?, ?> data = gson.fromJson(new String(ex.getRequestBody().readAllBytes()), Map.class);
                String resultado = service.crearObra(
                        str(data, "titulo"),    str(data, "genero"),
                        str(data, "isbn13"),    str(data, "plataforma"),
                        dbl(data, "precioAdquisicion"),
                        num(data, "carreraId"), num(data, "autorId"),
                        str(data, "editorial"), num(data, "anio")
                );
                send(ex, resultado.startsWith("ERROR") ? 400 : 201,
                        "{\"resultado\":\"" + resultado + "\"}");

            } else if (method.equals("PUT") && path.matches("/obras/\\d+/estado")) {
                int id = Integer.parseInt(path.split("/")[2]);
                Map<?, ?> data = gson.fromJson(new String(ex.getRequestBody().readAllBytes()), Map.class);
                boolean ok = service.cambiarEstado(id, str(data, "estado"),
                        str(data, "responsable"), str(data, "notas"));
                send(ex, ok ? 200 : 404, "{\"ok\":" + ok + "}");

            } else if (method.equals("POST") && path.matches("/obras/\\d+/valorar")) {
                int id = Integer.parseInt(path.split("/")[2]);
                Map<?, ?> data = gson.fromJson(new String(ex.getRequestBody().readAllBytes()), Map.class);
                boolean ok = service.valorar(id, num(data, "puntuacion"));
                send(ex, ok ? 200 : 400, "{\"ok\":" + ok + "}");

            } else if (method.equals("DELETE") && path.matches("/obras/\\d+")) {
                int id = Integer.parseInt(path.split("/")[2]);
                boolean ok = service.eliminar(id);
                send(ex, ok ? 200 : 404, "{\"ok\":" + ok + "}");

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
    private double dbl(Map<?, ?> m, String k) {
        Object v = m.get(k); return v instanceof Number n ? n.doubleValue() : 0.0;
    }
}