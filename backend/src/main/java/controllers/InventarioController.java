package controllers;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import config.Cors;
import services.InventarioService;

import java.io.IOException;
import java.util.Map;

public class InventarioController implements HttpHandler {
    private final InventarioService service = new InventarioService();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange ex) throws IOException {
        try {
            if (Cors.handlePreflight(ex)) return;
            Cors.addHeaders(ex);

            String method = ex.getRequestMethod();
            String path   = ex.getRequestURI().getPath();

            if (method.equals("GET") && path.equals("/inventario/reporte")) {
                String reporte = service.reporteStock().replace("\n", "\\n");
                send(ex, 200, "{\"reporte\":\"" + reporte + "\"}");

            } else if (method.equals("GET") && path.equals("/inventario/transacciones")) {
                send(ex, 200, gson.toJson(service.listarTransacciones()));

            } else if (method.equals("GET") && path.matches("/inventario/transacciones/\\d+")) {
                int obraId = Integer.parseInt(path.split("/")[3]);
                send(ex, 200, gson.toJson(service.transaccionesPorObra(obraId)));

            } else if (method.equals("POST") && path.equals("/inventario/ingreso")) {
                Map<?, ?> data = gson.fromJson(
                        new String(ex.getRequestBody().readAllBytes()), Map.class);

                int obraId     = num(data, "obraId");
                int cantidad   = num(data, "cantidad");
                double costo   = dbl(data, "costoNuevo");
                int usuarioId  = num(data, "usuarioId"); // enviado por frontend desde sesión

                if (obraId <= 0)   { send(ex, 400, "{\"error\":\"Selecciona una obra\"}"); return; }
                if (cantidad <= 0) { send(ex, 400, "{\"error\":\"Cantidad inválida\"}"); return; }
                if (costo <= 0)    { send(ex, 400, "{\"error\":\"Costo inválido\"}"); return; }
                if (usuarioId <= 0){ send(ex, 400, "{\"error\":\"Sesión inválida\"}"); return; }

                String resultado = service.ingresarLote(obraId, cantidad, costo, usuarioId);
                send(ex, resultado.startsWith("ERROR") ? 400 : 200,
                        "{\"resultado\":\"" + resultado + "\"}");

            } else if (method.equals("POST") && path.equals("/inventario/venta")) {
                Map<?, ?> data = gson.fromJson(
                        new String(ex.getRequestBody().readAllBytes()), Map.class);

                int obraId    = num(data, "obraId");
                int cantidad  = num(data, "cantidad");
                int usuarioId = num(data, "usuarioId"); // enviado por frontend desde sesión

                if (obraId <= 0)   { send(ex, 400, "{\"error\":\"Selecciona una obra\"}"); return; }
                if (cantidad <= 0) { send(ex, 400, "{\"error\":\"Cantidad inválida\"}"); return; }
                if (usuarioId <= 0){ send(ex, 400, "{\"error\":\"Sesión inválida\"}"); return; }

                String resultado = service.venderObra(obraId, cantidad, usuarioId);
                send(ex, resultado.startsWith("ERROR") ? 400 : 200,
                        "{\"resultado\":\"" + resultado + "\"}");

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

    private int    num(Map<?, ?> m, String k) { Object v = m.get(k); return v instanceof Number n ? n.intValue() : 0; }
    private double dbl(Map<?, ?> m, String k) { Object v = m.get(k); return v instanceof Number n ? n.doubleValue() : 0.0; }
}