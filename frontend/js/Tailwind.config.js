/*
    Configuração do Tailwind CSS.
    Este arquivo é carregado VIA CDN (<script> após o Tailwind).
    Define cores, fontes, espaçamentos e bordas do design system.

    Objeto "tailwind.config": o Tailwind CDN procura essa variável global.
    darkMode: "class" — ativa tema escuro quando a classe "dark" está no <html>.
*/
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            /*
                colors: paleta completa do Material Design 3 (tons neutros e primary).
                Cada chave vira uma classe utilitária (ex: bg-primary, text-on-primary).

                Convenção de nomenclatura:
                - "primary": cor principal (preto)
                - "on-primary": cor do texto EM CIMA da primary (branco)
                - "primary-container": variação suave da primary
                - "surface": cor da superfície (fundo da página)
                - "on-surface": texto sobre a superfície
                - "outline": bordas
                - "outline-variant": bordas mais suaves
                - "error": vermelho para estados de erro
            */
            colors: {
                "primary":                   "#000000",
                "on-primary":                "#ffffff",
                "primary-container":         "#1c1b1b",
                "on-primary-container":      "#858383",
                "primary-fixed":             "#e5e2e1",
                "primary-fixed-dim":         "#c8c6c5",
                "on-primary-fixed":          "#1c1b1b",
                "on-primary-fixed-variant":  "#474746",
                "secondary":                 "#5d5f5f",
                "on-secondary":              "#ffffff",
                "secondary-container":       "#dddddd",
                "on-secondary-container":    "#606161",
                "secondary-fixed":           "#e2e2e2",
                "secondary-fixed-dim":       "#c6c6c6",
                "on-secondary-fixed":        "#1a1c1c",
                "on-secondary-fixed-variant":"#454747",
                "tertiary":                  "#000000",
                "on-tertiary":               "#ffffff",
                "tertiary-container":        "#1a1c1c",
                "on-tertiary-container":     "#838484",
                "tertiary-fixed":            "#e2e2e2",
                "tertiary-fixed-dim":        "#c6c7c6",
                "on-tertiary-fixed":         "#1a1c1c",
                "on-tertiary-fixed-variant": "#454747",
                "error":                     "#ba1a1a",
                "on-error":                  "#ffffff",
                "error-container":           "#ffdad6",
                "on-error-container":        "#93000a",
                "surface":                   "#fbf9f9",
                "surface-dim":               "#dbdad9",
                "surface-bright":            "#fbf9f9",
                "surface-variant":           "#e3e2e2",
                "surface-container-lowest":  "#ffffff",
                "surface-container-low":     "#f5f3f3",
                "surface-container":         "#efeded",
                "surface-container-high":    "#e9e8e7",
                "surface-container-highest": "#e3e2e2",
                "surface-tint":              "#5f5e5e",
                "on-surface":                "#1b1c1c",
                "on-surface-variant":        "#444748",
                "outline":                   "#747878",
                "outline-variant":           "#c4c7c7",
                "inverse-surface":           "#303031",
                "inverse-on-surface":        "#f2f0f0",
                "inverse-primary":           "#c8c6c5",
                "background":                "#fbf9f9",
                "on-background":             "#1b1c1c",
            },
            /*
                borderRadius: valores de bordas arredondadas.
                DEFAULT: valor padrão (usado quando só "rounded" sem tamanho).
            */
            borderRadius: {
                "DEFAULT": "0.125rem",   /* 2px */
                "lg":      "0.25rem",    /* 4px */
                "xl":      "0.5rem",     /* 8px */
                "full":    "0.75rem",    /* 12px */
            },
            /*
                spacing: valores personalizados de margin/padding/gap.
                Ex: px-margin-desktop vira padding: 40px.
            */
            spacing: {
                "gutter":              "24px",
                "container-max-width": "1440px",
                "unit":                "4px",
                "margin-mobile":       "16px",
                "margin-desktop":      "40px",
            },
            /*
                fontFamily: define as famílias de fontes usadas nas classes font-*.
                Ex: font-display-lg usa Montserrat.
            */
            fontFamily: {
                "display-lg":         ["Montserrat"],
                "headline-xl":        ["Montserrat"],
                "headline-xl-mobile": ["Montserrat"],
                "headline-lg":        ["Montserrat"],
                "body-lg":            ["Inter"],
                "body-md":            ["Inter"],
                "body-sm":            ["Inter"],
                "label-md":           ["Inter"],
            },
            /*
                fontSize: define tamanho + configurações de cada nível tipográfico.
                Cada entrada tem: [tamanho, { lineHeight, letterSpacing, fontWeight }]
                - lineHeight: altura da linha (1.1 = 110% do tamanho da fonte)
                - letterSpacing: espaçamento entre letras (negativo = mais apertado)
                - fontWeight: peso da fonte (400 = normal, 600 = semi-negrito, 700 = negrito)
            */
            fontSize: {
                "display-lg":         ["48px", { lineHeight: "1.1",  letterSpacing: "-0.02em", fontWeight: "700" }],
                "headline-xl":        ["32px", { lineHeight: "1.2",  fontWeight: "600" }],
                "headline-xl-mobile": ["28px", { lineHeight: "1.2",  fontWeight: "600" }],
                "headline-lg":        ["24px", { lineHeight: "1.3",  fontWeight: "600" }],
                "body-lg":            ["18px", { lineHeight: "1.6",  fontWeight: "400" }],
                "body-md":            ["16px", { lineHeight: "1.5",  fontWeight: "400" }],
                "body-sm":            ["14px", { lineHeight: "1.4",  fontWeight: "400" }],
                "label-md":           ["12px", { lineHeight: "1",    letterSpacing: "0.05em", fontWeight: "600" }],
            },
        },
    },
};
