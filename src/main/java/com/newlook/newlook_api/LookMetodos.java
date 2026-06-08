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
import java.util.Base64;
import java.util.List;
import org.springframework.stereotype.Service;
// Fala que vai receber arquivo
import org.springframework.web.multipart.MultipartFile;

// Importações oficiais do SDK atualizado
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;

@Service
public class LookMetodos {
    // Salvando um STRING com o valor da URL do db
    private final String URL = "jdbc:sqlite:dbNewLook.db";

    public void ExcluirLook(int id) {
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

    public String analisarFoto(MultipartFile foto, String genero, String estilo, String ocasiao, String estacaoAno,
            String faixaPreco, String coresFavoritas) {
        try {
            // define o prompt pro gemini
            String prompt = Prompts.ANALISE_FOTO
                    .replace("[GENERO]", genero)
                    .replace("[ESTILO]", estilo)
                    .replace("[OCASIAO]", ocasiao)
                    .replace("[ESTACAO]", estacaoAno)
                    .replace("[PRECO]", faixaPreco)
                    .replace("[CORES]", coresFavoritas);

            // Configura o que vai enviar pro Gemini
            try (Client client = new Client()) {
                GenerateContentResponse response = client.models.generateContent(
                        "gemini-2.5-flash",
                        Content.fromParts(
                                Part.fromText(prompt),
                                Part.fromBytes(foto.getBytes(), foto.getContentType())),
                        null);
                return response.text();
            }

        } catch (Exception e) {
            return "Erro ao analisar foto: " + e.getMessage();
        }
    }

    public int gerarLook(int idUsuario, String analiseFoto, String genero, String estilo,
            String ocasiao, String estacaoAno, String faixaPreco, String coresFavoritas,
            String preferenciasAdicionais) {
        try {
            String prompt = Prompts.GERAR_LOOK
                    .replace("[GENERO]", genero)
                    .replace("[ESTILO]", estilo)
                    .replace("[OCASIAO]", ocasiao)
                    .replace("[ESTACAO]", estacaoAno != null ? estacaoAno : "Não informada")
                    .replace("[PRECO]", faixaPreco != null ? faixaPreco : "Não informada")
                    .replace("[CORES]", coresFavoritas != null ? coresFavoritas : "Não informadas")
                    .replace("[PREFERENCIAS]", preferenciasAdicionais != null ? preferenciasAdicionais : "Nenhuma")
                    .replace("[ANALISE_COMPLETA_GERADA_PELO_PROMPT_DE_ANALISE]", analiseFoto);

            try (Client client = new Client()) {
                GenerateContentResponse response = client.models.generateContent(
                        "gemini-2.5-flash",
                        Content.fromParts(Part.fromText(prompt)),
                        null);
                String respostaJson = response.text();

                // Chama
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode json = mapper.readTree(respostaJson);

                String nomeLook = json.get("nome").asText();

                String queryLook = """
                        INSERT INTO Looks (id_usuario, nome, estilo, ocasiao, estacao_ano, faixa_preco, cores_favoritas, preferencias_adicionais)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                        """;

                int idLook;

                try (Connection conn = DriverManager.getConnection(URL);
                        PreparedStatement pstmt = conn.prepareStatement(queryLook,
                                java.sql.Statement.RETURN_GENERATED_KEYS)) {

                    pstmt.setInt(1, idUsuario);
                    pstmt.setString(2, nomeLook);
                    pstmt.setString(3, estilo);
                    pstmt.setString(4, ocasiao);
                    pstmt.setString(5, estacaoAno);
                    pstmt.setString(6, faixaPreco);
                    pstmt.setString(7, coresFavoritas);
                    pstmt.setString(8, preferenciasAdicionais);
                    pstmt.executeUpdate();

                    ResultSet rs = pstmt.getGeneratedKeys();
                    idLook = rs.next() ? rs.getInt(1) : -1;
                }

                if (idLook == -1) {
                    System.out.println("Erro ao obter id do look inserido");
                    return -1;
                }

                String queryRoupa = """
                        INSERT INTO Roupas (id_look, peca, cor, modelo, marca, preco, justificativa_tecnica)
                        VALUES (?, ?, ?, ?, ?, ?, ?);
                        """;

                try (Connection conn = DriverManager.getConnection(URL);
                        PreparedStatement pstmt = conn.prepareStatement(queryRoupa)) {

                    for (com.fasterxml.jackson.databind.JsonNode roupa : json.get("roupas")) {
                        pstmt.setInt(1, idLook);
                        pstmt.setString(2, roupa.get("peca").asText());
                        pstmt.setString(3, roupa.get("cor").asText());
                        pstmt.setString(4, roupa.get("modelo").asText());
                        pstmt.setString(5, roupa.get("marca").asText());
                        pstmt.setDouble(6, roupa.get("preco").asDouble());
                        pstmt.setString(7, roupa.get("justificativa_tecnica").asText());
                        pstmt.executeUpdate();
                    }
                }

                System.out.println("Look '" + nomeLook + "' salvo com sucesso!");

                return idLook;
            }

        } catch (Exception e) {
            System.out.println("Erro ao gerar look: " + e.getMessage());
            return -1;
        }
    }

    public void gerarImagemLook(MultipartFile foto, int idLook, String analiseFoto) {
        try {
            // Definindo a query do bd
            String queryRoupas = "SELECT peca, cor, modelo, marca FROM Roupas WHERE id_look = ?;";
            // Definindo objeto para estruturar as roupas do look
            StringBuilder descricaoLook = new StringBuilder();

            // abrindo chamado de conexão com o bd
            try (Connection conn = DriverManager.getConnection(URL);
                    PreparedStatement pstmt = conn.prepareStatement(queryRoupas)) {
                pstmt.setInt(1, idLook);
                ResultSet rs = pstmt.executeQuery();

                // Loop para estruturar as roupas (enquanto (tiver alguma resposta))
                while (rs.next()) {
                    // coloca um traço
                    descricaoLook.append("- ")
                            // chama a query e extrai dela o que deseja e adiciona pontos
                            .append(rs.getString("peca")).append(": ")
                            .append(rs.getString("cor")).append(", ")
                            .append(rs.getString("modelo"));
                    String marca = rs.getString("marca");
                    // Checa se o valor da marca está nulo
                    if (marca != null && !marca.equals("Opcional")) {
                        descricaoLook.append(" (").append(marca).append(")");
                    }
                    descricaoLook.append("\n");
                }
            }

            // Define o prompt e adiciona a estruturação das roupas do look feitos
            // anteriormente ao look
            String prompt = Prompts.GERAR_IMAGEM
                    .replace("[LOOK_GERADO]", descricaoLook);

            byte[] imagemFinalBytes = null;

            // Abre chamado pro gemini
            try (Client client = new Client()) {
                // Configura como que vai ser a interação com o Gemini
                GenerateContentConfig config = GenerateContentConfig.builder()
                        .responseModalities(List.of("TEXT", "IMAGE"))
                        .build();

                // Configura o que vai enviar pro Gemini
                GenerateContentResponse response = client.models.generateContent(
                        "gemini-3.1-flash-image",
                        Content.fromParts(
                                Part.fromText(prompt),
                                Part.fromBytes(foto.getBytes(), foto.getContentType())),
                        config);

                // Faz o chamado (for(quantos resultados forem)) checa (if(se tem dados de
                // arquivos) e da get no resultado)
                for (Part part : response.parts()) {
                    if (part.inlineData().isPresent()) {
                        var blobSaida = part.inlineData().get();
                        if (blobSaida.data().isPresent()) {
                            imagemFinalBytes = blobSaida.data().get();
                            break;
                        }
                    }
                }
            }
            // Tacando exceção pra caso dê errado
            if (imagemFinalBytes == null) {
                throw new RuntimeException("A IA não retornou nenhuma imagem estruturada.");
            }

            String querySalvarImagem = "UPDATE Looks SET imagem = ? WHERE id = ?;";

            try (Connection conn = DriverManager.getConnection(URL);
                    PreparedStatement pstmt = conn.prepareStatement(querySalvarImagem)) {

                // O método setBytes envia o array bruto diretamente para o campo BLOB do banco
                pstmt.setBytes(1, imagemFinalBytes);
                pstmt.setInt(2, idLook);

                pstmt.executeUpdate();
                System.out.println("Imagem conceitual do Look ID " + idLook + " salva com sucesso no banco de dados!");
            }

        } catch (Exception e) {
            System.out.println("Erro ao gerar imagem do look: " + e.getMessage());
        }
    }

    public String buscarLooks(int idUsuario) {
        String query = """
                SELECT id, nome, estilo, ocasiao, estacao_ano, faixa_preco
                FROM Looks WHERE id_usuario = ? ORDER BY id DESC;
                """;

        try (Connection conn = DriverManager.getConnection(URL);
                PreparedStatement pstmt = conn.prepareStatement(query)) {

            pstmt.setInt(1, idUsuario);
            ResultSet rs = pstmt.executeQuery();

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.node.ArrayNode array = mapper.createArrayNode();

            while (rs.next()) {
                com.fasterxml.jackson.databind.node.ObjectNode look = mapper.createObjectNode();
                look.put("id", rs.getInt("id"));
                look.put("nome", rs.getString("nome"));
                look.put("estilo", rs.getString("estilo"));
                look.put("ocasiao", rs.getString("ocasiao"));
                look.put("estacao_ano", rs.getString("estacao_ano"));
                look.put("faixa_preco", rs.getString("faixa_preco"));
                array.add(look);
            }

            return mapper.writeValueAsString(array);

        } catch (Exception e) {
            System.out.println("Erro ao buscar looks: " + e.getMessage());
            return "[]";
        }
    }

    public String buscarDetalhesLook(int idLook) {
        try (Connection conn = DriverManager.getConnection(URL)) {

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.node.ObjectNode resultado = mapper.createObjectNode();

            // Busca o look
            String queryLook = "SELECT * FROM Looks WHERE id = ?;";
            try (PreparedStatement pstmt = conn.prepareStatement(queryLook)) {
                pstmt.setInt(1, idLook);
                ResultSet rs = pstmt.executeQuery();
                if (rs.next()) {
                    resultado.put("id", rs.getInt("id"));
                    resultado.put("nome", rs.getString("nome"));
                    resultado.put("estilo", rs.getString("estilo"));
                    resultado.put("ocasiao", rs.getString("ocasiao"));
                    resultado.put("estacao_ano", rs.getString("estacao_ano"));
                    resultado.put("faixa_preco", rs.getString("faixa_preco"));
                    resultado.put("cores_favoritas", rs.getString("cores_favoritas"));
                    resultado.put("preferencias_adicionais", rs.getString("preferencias_adicionais"));
                }
            }

            // Busca as roupas
            String queryRoupas = "SELECT * FROM Roupas WHERE id_look = ?;";
            com.fasterxml.jackson.databind.node.ArrayNode roupas = mapper.createArrayNode();
            try (PreparedStatement pstmt = conn.prepareStatement(queryRoupas)) {
                pstmt.setInt(1, idLook);
                ResultSet rs = pstmt.executeQuery();
                while (rs.next()) {
                    com.fasterxml.jackson.databind.node.ObjectNode roupa = mapper.createObjectNode();
                    roupa.put("peca", rs.getString("peca"));
                    roupa.put("cor", rs.getString("cor"));
                    roupa.put("modelo", rs.getString("modelo"));
                    roupa.put("marca", rs.getString("marca"));
                    roupa.put("preco", rs.getDouble("preco"));
                    roupa.put("justificativa_tecnica", rs.getString("justificativa_tecnica"));
                    roupas.add(roupa);
                }
            }

            resultado.set("roupas", roupas);
            return mapper.writeValueAsString(resultado);

        } catch (Exception e) {
            System.out.println("Erro ao buscar detalhes do look: " + e.getMessage());
            return "{}";
        }
    }

    
}