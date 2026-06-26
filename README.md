# RunBoom

**Universidade Federal do Ceará - Campus Sobral**  
**Curso: Engenharia da Computação**  
**Professor:** Iális Cavalcante de Paula Junior  
**Disciplina:** Computação Gráfica, 2026.1

---

## Imagens

<img src="./images/Captura de tela de 2026-06-26 16-57-30.png">
<img src="./images/Captura de tela de 2026-06-26 16-58-03.png">
<img src="./images/Captura de tela de 2026-06-26 16-58-33.png">

## Sobre o Projeto

Este projeto foi desenvolvido para o Trabalho Prático 2 da disciplina de Computação Gráfica. É um jogo onde você deve correr para a bomba não explodir

O objetivo central é chegar ao local de desarme e aumentar a pontuação coletando moedas

---

## História

Um criminoso amarrou uma bomba ao corpo do personagem. A bomba possui um sensor de velocidade que monitora constantemente os movimentos do jogador. Se a velocidade ficar abaixo do limite durante 2 segundos, a bomba explode. O jogador deve manter-se sempre em movimento, correndo rapidamente até chegar ao local de desarme para salvar sua vida!

---

## Equipe

* Eros Ryan Simette
* Christian Ximenes Paiva
* Antônio Kíldere Sousa Menezes
* Pedro Levi Moura Ximenes
* Taynara de Araújo Alves
* Emanoel Igor de Paulo Cosmo
* Gustavo Fontenele Barros

---

## Instruções de Execução

1. Clone o repositório oficial:
```bash
   git clone https://github.com/Eros-afk/Trabalho-Computacao-Grafica2/
```

2. Navegue até o diretório do projeto:
```bash
   cd Trabalho-Computacao-Grafica2
```

3. Para a correta visualização do jogo 3D abra o arquivo RunBoom.html no seu navegador


## Organização das Pastas

```text
.
├── README.md               # Documentação do projeto
├── RunBoom.html            # Arquivo principal para abrir no navegador
├── Bomb/
│   └── bomb.js             # Lógica e comportamento da bomba
├── Effects/
│   ├── effects.js          # Efeitos visuais do jogo
│   └── powerups.js         # Mecanismo de power-ups
├── Maps/
│   └── map.js              # Mapas e ambiente do jogo
├── NPC/
│   └── npc.js              # Personagens não jogáveis (NPCs)
├── Obstacles/
│   └── obstacles.js        # Obstáculos e colisões
├── Player/
│   └── player.js           # Controle e lógica do jogador
└── UI/
    └── web/
        ├── game.js         # Lógica principal do jogo
        ├── hud.js          # Interface do usuário (HUD)
        ├── index.html      # Estrutura HTML da aplicação
        ├── scene.js        # Cena e renderização Three.js
        ├── state.js        # Gerenciamento de estado do jogo
        └── styles.css      # Estilos CSS
```

## Licença

Projeto acadêmico sem fins comerciais — UFC, 2026.