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
////// serve para converter bytes em texto base64
/////import java.util.Base64;
// Chat Client da IA que vai ser usado
import org.springframework.ai.chat.client.ChatClient;
// Mapea onde que vai ser usado as IA, o service gerencia a classe vai ter IA e o autowired vai utilizar
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
// Fala que vai receber arquivo
import org.springframework.web.multipart.MultipartFile;

@Service
public class LookMetodos {
    // Salvando um STRING com o valor da URL do db
    private final String URL = "jdbc:sqlite:dbNewLook.db";

    @Autowired
    private ChatClient chatClient;

    public void ExcluirLook(int id) {
        // Define a Query que vai usar
        String Query = "DELETE FROM Looks WHERE id = ?;";

        try (Connection conn = DriverManager.getConnection(URL);
                PreparedStatement pstmt = conn.prepareStatement(Query)) {

            pstmt.setInt(1, id);

            pstmt.executeUpdate();
            System.out.println("Look com id " + id + " deletado com sucesso");
        } catch (SQLException e) {
            System.out.println("Erro ao deletar Look, erro: " + e.getMessage());
        }
    }

    
    public String analisarFoto(MultipartFile foto) {
        try {
            // converte o arquivo em bytes
            byte[] bytes = foto.getBytes();
            ////////// converte os bytes em base64(representa dados binarios como texto puro) precisa para mandar por http
            ////////// String base64 = Base64.getEncoder().encodeToString(bytes);
            // pega o tipo do arquivo
            String mediaType = foto.getContentType();

            /// o prompt pra IA
            String prompt = """
                    
                    """;

                
            // .prompt() — inicia uma nova conversa
            // .user(...) — define a mensagem do usuário
            // .text(prompt) — o texto do prompt
            // .media(...) — anexa a imagem
            // .call() — faz a chamada para o Gemini
            // .content() — extrai o texto da resposta
            return chatClient.prompt()
                .user(u -> u
                    .text(prompt)
                    .media(org.springframework.util.MimeType.valueOf(mediaType),
                        new org.springframework.core.io.ByteArrayResource(bytes)))
                .call()
                .content();
            
        } catch (Exception e) {
            return "Erro ao analisar foto: " + e.getMessage();
        }
    }

    ///public String gerarLook(String caracteristicasFisicas, String )


}
