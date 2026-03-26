package org.example;

import com.sun.net.httpserver.HttpServer;
import controllers.ObraController;
import controllers.UsuarioController;
import controllers.InventarioController;
import java.net.InetSocketAddress;

public class Main {
    public static void main(String[] args) throws Exception {

        // Render asigna el puerto via variable de entorno PORT
        int port = System.getenv("PORT") != null
                ? Integer.parseInt(System.getenv("PORT"))
                : 8080;

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/obras", new ObraController());
        server.createContext("/usuarios", new UsuarioController());
        server.createContext("/inventario", new InventarioController());
        server.setExecutor(null);
        server.start();

        System.out.println("Servidor ITQ corriendo en " + port);
    }
}