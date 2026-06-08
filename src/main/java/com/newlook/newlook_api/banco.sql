DROP TABLE IF EXISTS Roupas;
DROP TABLE IF EXISTS Looks;
DROP TABLE IF EXISTS Usuarios;

CREATE TABLE
    Usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        senha VARCHAR(32) NOT NULL,
        genero VARCHAR(32) NOT NULL,
        data_cadastro DATE DEFAULT (CURRENT_DATE)
    );

CREATE TABLE
    Looks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL,
        nome VARCHAR(100) NOT NULL,
        estilo VARCHAR(100) NOT NULL,
        ocasiao VARCHAR(100) NOT NULL,
        estacao_ano VARCHAR(100),
        faixa_preco DECIMAL(10, 2),
        cores_favoritas VARCHAR(100),
        preferencias_adicionais VARCHAR(5000),
        imagem BLOB,
        FOREIGN KEY (id_usuario) REFERENCES Usuarios (id)
    );

CREATE TABLE
    Roupas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_look INTEGER NOT NULL,
        peca VARCHAR(100) NOT NULL,
        cor VARCHAR(100) NOT NULL,
        modelo VARCHAR(100) NOT NULL,
        marca VARCHAR(100),
        preco DECIMAL(10, 2),
        justificativa_tecnica VARCHAR(5000),
        FOREIGN KEY (id_look) REFERENCES Looks (id)
    );

