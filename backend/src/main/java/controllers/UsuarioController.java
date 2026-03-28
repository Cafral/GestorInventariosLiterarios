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

            // ── Listar usuarios (solo admin, el rol se valida en frontend) ──
            if (method.equals("GET") && path.equals("/usuarios")) {
                send(ex, 200, gson.toJson(service.listarTodos()));

                // ── Registro público — rol ESTUDIANTE forzado ──
            } else if (method.equals("POST") && path.equals("/usuarios/registro")) {
                Map<?, ?> data = gson.fromJson(
                        new String(ex.getRequestBody().readAllBytes()), Map.class);

                String nombre   = str(data, "nombre");
                String email    = str(data, "email");
                String password = str(data, "password");
                int carreraId   = num(data, "carrera_id");

                if (nombre.isBlank())
                { send(ex, 400, "{\"error\":\"El nombre es obligatorio\"}"); return; }
                if (!email.contains("@"))
                { send(ex, 400, "{\"error\":\"Email inválido\"}"); return; }
                if (password.length() < 6)
                { send(ex, 400, "{\"error\":\"La contraseña debe tener al menos 6 caracteres\"}"); return; }
                if (carreraId <= 0)
                { send(ex, 400, "{\"error\":\"Debes seleccionar una carrera\"}"); return; }

                // Rol forzado a ESTUDIANTE
                String resultado = service.registrar(nombre, email, password, "ESTUDIANTE", carreraId);
                send(ex, resultado.startsWith("ERROR") ? 400 : 201,
                        "{\"resultado\":\"" + resultado + "\"}");

                // ── Crear usuario por ADMIN (cualquier rol) ──
            } else if (method.equals("POST") && path.equals("/usuarios/admin/crear")) {
                Map<?, ?> data = gson.fromJson(
                        new String(ex.getRequestBody().readAllBytes()), Map.class);

                String nombre   = str(data, "nombre");
                String email    = str(data, "email");
                String password = str(data, "password");
                String rol      = str(data, "rol");
                int carreraId   = num(data, "carrera_id");

                if (nombre.isBlank())
                { send(ex, 400, "{\"error\":\"El nombre es obligatorio\"}"); return; }
                if (!email.contains("@"))
                { send(ex, 400, "{\"error\":\"Email inválido\"}"); return; }
                if (password.length() < 6)
                { send(ex, 400, "{\"error\":\"La contraseña debe tener al menos 6 caracteres\"}"); return; }
                if (rol.isBlank())
                { send(ex, 400, "{\"error\":\"Debes seleccionar un rol\"}"); return; }

                String resultado = service.registrar(nombre, email, password, rol, carreraId);
                send(ex, resultado.startsWith("ERROR") ? 400 : 201,
                        "{\"resultado\":\"" + resultado + "\"}");

                // ── Login ──
            } else if (method.equals("POST") && path.equals("/usuarios/login")) {
                Map<?, ?> data = gson.fromJson(
                        new String(ex.getRequestBody().readAllBytes()), Map.class);

                String email    = str(data, "email");
                String password = str(data, "password");

                if (email.isBlank() || password.isBlank())
                { send(ex, 400, "{\"error\":\"Email y contraseña son obligatorios\"}"); return; }

                Map<String, Object> usuario = service.login(email, password);
                if (usuario != null) send(ex, 200, gson.toJson(usuario));
                else send(ex, 401, "{\"error\":\"Credenciales inválidas\"}");

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