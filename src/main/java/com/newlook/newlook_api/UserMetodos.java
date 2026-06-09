package com.newlook.newlook_api;

// importa função de conexão com o sql
import java.sql.Connection;
// importa o metodo do drivermanager
import java.sql.DriverManager;
// serve para preparar a query para o sql
import java.sql.PreparedStatement;
// pega os erros e mensagens de erro
import java.sql.SQLException;
// serve para ajudar a ler o resultado do sql
import java.sql.ResultSet;

public class UserMetodos {
    // Salvando um STRING com o valor da URL do db
    private final String URL = "jdbc:sqlite:dbNewLook.db";

    public void CadastrarUsuario(String nome, String email, String senha, String genero) {
        // Define a Query que vai usar
        String Query = "INSERT INTO Usuarios (nome, email, senha, genero) VALUES (?, ?, ?, ?);";

        try (Connection conn = DriverManager.getConnection(URL);
                PreparedStatement pstmt = conn.prepareStatement(Query)) {

            // Atribui os parametros com os interrogações
            pstmt.setString(1, nome);
            pstmt.setString(2, email);
            pstmt.setString(3, senha);
            pstmt.setString(4, genero);


            // executa alteração no banco
            pstmt.executeUpdate();

            System.out.println("Usuario " + nome + " cadastrado com sucesso");
        } catch (SQLException e) {
            System.out.println("Erro ao cadastrar usuario, erro: " + e.getMessage());
        }
    }

    public void ExcluirUsuario(int id) {
        // Define a Query que vai usar
        String Query = "DELETE FROM Usuarios WHERE id = ?;";

        try (Connection conn = DriverManager.getConnection(URL);
                PreparedStatement pstmt = conn.prepareStatement(Query)) {

            pstmt.setInt(1, id);

            pstmt.executeUpdate();
            System.out.println("Usuario com id " + id + " deletado com sucesso");
        } catch (SQLException e) {
            System.out.println("Erro ao deletar usuario, erro: " + e.getMessage());
        }

    }

    public int pesquisaUsuario(String email, String senha) {
        String Query = "SELECT id, nome FROM Usuarios WHERE email = ? AND senha = ?;";

        try (Connection conn = DriverManager.getConnection(URL);
                PreparedStatement pstmt = conn.prepareStatement(Query)) {

            pstmt.setString(1, email);
            pstmt.setString(2, senha);

            // resultset para ler a resposta do sql, e o executeQuery para executar a query
            // e receber resposta
            try (ResultSet rs = pstmt.executeQuery()) {

                // rs.next vai checar se teve alguma resposta (boolean) e retornar o id do
                // usuario
                if (rs.next()) {
                    return rs.getInt("id");
                }
            }

        } catch (SQLException e) {
            System.out.println("Erro ao pesquisar usuario, erro: " + e.getMessage());
        }
        return 0;
    }

    // Metodo para editar o Usuario no bd
    public void editarUsuario(int id, String nome, String email, String senha, String genero) {
        String Query = "UPDATE Usuarios SET nome = ?, email = ?, senha = ?, genero = ? WHERE id = ?;";

        try (Connection conn = DriverManager.getConnection(URL);
                PreparedStatement pstmt = conn.prepareStatement(Query)) {

            pstmt.setString(1, nome);
            pstmt.setString(2, email);
            pstmt.setString(3, senha);
            pstmt.setString(4, genero);
            pstmt.setInt(5, id);
            pstmt.executeUpdate();

            System.out.println("Usuario editado com sucesso: nome - " + nome + " email - " + email + " senha - " + senha);

        } catch (Exception e) {
            System.out.println("Erro ao editar usuario, erro: " + e.getMessage());
        }

    }

    // Metodo para buscar um usuario especifico
    public String[] buscarUsuario(int id) {
    String Query = "SELECT nome, email, genero FROM Usuarios WHERE id = ?;";

    try (Connection conn = DriverManager.getConnection(URL);
            PreparedStatement pstmt = conn.prepareStatement(Query)) {

        pstmt.setInt(1, id);

        try (ResultSet rs = pstmt.executeQuery()) {
            if (rs.next()) {
                return new String[]{
                    rs.getString("nome"),
                    rs.getString("email"),
                    rs.getString("genero")
                };
            }
        }

    } catch (SQLException e) {
        System.out.println("Erro ao buscar usuario, erro: " + e.getMessage());
    }
    return null;
}

}