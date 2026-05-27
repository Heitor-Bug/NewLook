package com.newlook.newlook_api;

// importa função de conexão com o sql
import java.sql.Connection;
// importa o metodo do drivermanager
import java.sql.DriverManager;
//
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class UserMetodos {
    // Salvando um STRING com o valor da URL do db
    private final String URL = "jdbc:sqlite:dbNewLook.db";

    public void CadastrarUsuario(String nome, String email, String senha){
        // Define a Query que vai usar
        String QueryInsert = "INSERT INTO Usuarios (nome, email, senha) VALUES (?, ?, ?);";

        try (Connection conn = DriverManager.getConnection(URL);
            PreparedStatement pstmt = conn.prepareStatement(QueryInsert)) {

                // Atribui os parametros com os interrogações
                pstmt.setString(1, nome);
                pstmt.setString(2, email);
                pstmt.setString(3, senha);

                pstmt.executeUpdate();
                System.out.println("Usuario "+ nome + " cadastrado com sucesso");
            } catch (SQLException e) {
                System.out.println("Erro ao cadastrar usuario, erro: " + e.getMessage());
            }
    }




}