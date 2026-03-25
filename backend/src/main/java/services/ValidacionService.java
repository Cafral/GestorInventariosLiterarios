package services;

public class ValidacionService {
    public boolean validarISBN13(String isbn) {
        if (isbn == null) return false;
        String limpio = isbn.replaceAll("[^0-9]","");
        if (limpio.length() != 13) return false;
        int suma = 0;
        for (int i = 0; i < 12; i++) {
            int digito = Character.getNumericValue(limpio.charAt(i));
            suma += (i % 2 == 0) ? digito : digito * 3;
        }
        int control = (10 - (suma % 10)) % 10;
        return control == Character.getNumericValue(limpio.charAt(12));
    }

    public boolean validarAPA(String titulo, String autorId, String editorial, int anio) {
        if (titulo == null || titulo.isBlank()) return false;
        if (autorId == null || autorId.isBlank()) return false;
        if (editorial == null || editorial.isBlank()) return false;
        if (anio < 1900  || anio > 2027) return false;
        return true;
    }
}
