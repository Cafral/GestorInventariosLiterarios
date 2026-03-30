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
            if (Cors.handlePreflight(ex))
                return;
            Cors.addHeaders(ex);

            String method = ex.getRequestMethod();
            String path = ex.getRequestURI().getPath();

            if (method.equals("GET") && path.equals("/obras")) {
                String query = ex.getRequestURI().getQuery();
                if (query != null && query.startsWith("carreraId=")) {
                    int carreraId = Integer.parseInt(query.split("=")[1]);
                    send(ex, 200, gson.toJson(service.listarPorCarrera(carreraId)));
                } else {
                    send(ex, 200, gson.toJson(service.listarTodas()));
                }
                // ── Verificar si ISBN o título ya existen
            } else if (method.equals("GET") && path.equals("/obras/existe")) {
                String query = ex.getRequestURI().getQuery();
                String isbn13 = "";
                String titulo = "";
                if (query != null) {
                    for (String parte : query.split("&")) {
                        if (parte.startsWith("isbn13="))
                            isbn13 = java.net.URLDecoder.decode(parte.split("=", 2)[1], "UTF-8");
                        if (parte.startsWith("titulo="))
                            titulo = java.net.URLDecoder.decode(parte.split("=", 2)[1], "UTF-8");
                    }
                }
                boolean existe = service.existeObra(isbn13, titulo);
                send(ex, 200, "{\"existe\":" + existe + "}");

                // ── Detalle de obra
            } else if (method.equals("GET") && path.matches("/obras/\\d+")) {
                int id = Integer.parseInt(path.split("/")[2]);
                Map<String, Object> obra = service.buscarPorId(id);
                if (obra != null)
                    send(ex, 200, gson.toJson(obra));
                else
                    send(ex, 404, "{\"error\":\"Obra no encontrada\"}");

            } else if (method.equals("POST") && path.equals("/obras")) {
                // El body puede ser grande (imagen base64 ~1-2MB en texto)
                byte[] bodyBytes = ex.getRequestBody().readAllBytes();
                Map<?, ?> data = gson.fromJson(new String(bodyBytes, "UTF-8"), Map.class);

                String titulo = str(data, "titulo");
                String isbn13 = str(data, "isbn13");
                String editorial = str(data, "editorial");

                if (titulo.isBlank()) {
                    send(ex, 400, "{\"error\":\"El título es obligatorio\"}");
                    return;
                }
                if (isbn13.isBlank()) {
                    send(ex, 400, "{\"error\":\"El ISBN-13 es obligatorio\"}");
                    return;
                }
                if (editorial.isBlank()) {
                    send(ex, 400, "{\"error\":\"La editorial es obligatoria\"}");
                    return;
                }
                if (num(data, "carreraId") <= 0) {
                    send(ex, 400, "{\"error\":\"Debes seleccionar una carrera\"}");
                    return;
                }
                if (num(data, "autorId") <= 0) {
                    send(ex, 400, "{\"error\":\"Debes seleccionar un autor\"}");
                    return;
                }

                // imagen_url formato => "data:image/jpeg;base64,/9j/..."
                // Se guarda tal cual en la columna TEXT de la BD
                String resultado = service.crearObra(
                        titulo, str(data, "genero"), isbn13,
                        str(data, "plataforma"), dbl(data, "precioAdquisicion"),
                        num(data, "carreraId"), num(data, "autorId"),
                        editorial, num(data, "anio"), str(data, "imagen_url"));
                send(ex, resultado.startsWith("ERROR") ? 400 : 201,
                        "{\"resultado\":\"" + resultado + "\"}");

            } else if (method.equals("PUT") && path.matches("/obras/\\d+/estado")) {
                int id = Integer.parseInt(path.split("/")[2]);
                Map<?, ?> data = gson.fromJson(
                        new String(ex.getRequestBody().readAllBytes()), Map.class);
                boolean ok = service.cambiarEstado(id, str(data, "estado"),
                        str(data, "responsable"), str(data, "notas"));
                send(ex, ok ? 200 : 404, "{\"ok\":" + ok + "}");

            } else if (method.equals("POST") && path.matches("/obras/\\d+/valorar")) {
                int id = Integer.parseInt(path.split("/")[2]);
                Map<?, ?> data = gson.fromJson(
                        new String(ex.getRequestBody().readAllBytes()), Map.class);
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
        } catch (IOException ignored) {
        }
    }

    private String str(Map<?, ?> m, String k) {
        Object v = m.get(k);
        return v != null ? v.toString() : "";
    }

    private int num(Map<?, ?> m, String k) {
        Object v = m.get(k);
        return v instanceof Number n ? n.intValue() : 0;
    }

    private double dbl(Map<?, ?> m, String k) {
        Object v = m.get(k);
        return v instanceof Number n ? n.doubleValue() : 0.0;
    }
}