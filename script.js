const pares = [
  { palavra: "eu", tipo: "Pronome pessoal - 1ª pessoa singular" },
  { palavra: "tu", tipo: "Pronome pessoal - 2ª pessoa singular" },
  { palavra: "ele", tipo: "Pronome pessoal - 3ª pessoa singular" },
  { palavra: "nós", tipo: "Pronome pessoal - 1ª pessoa plural" },
  { palavra: "vós", tipo: "Pronome pessoal - 2ª pessoa plural" },
  { palavra: "meu", tipo: "Pronome possessivo - 1ª pessoa singular" },
  { palavra: "teu", tipo: "Pronome possessivo - 2ª pessoa singular" },
  { palavra: "seu", tipo: "Pronome possessivo - 3ª pessoa singular" },
  { palavra: "nosso", tipo: "Pronome possessivo - 1ª pessoa plural" },
  { palavra: "vosso", tipo: "Pronome possessivo - 2ª pessoa plural" },
  { palavra: "este", tipo: "Pronome demonstrativo - proximidade" },
  { palavra: "esse", tipo: "Pronome demonstrativo - distância média" },
  { palavra: "aquele", tipo: "Pronome demonstrativo - longe" },
  { palavra: "que", tipo: "Pronome relativo" },
  { palavra: "qual", tipo: "Pronome relativo/interrogativo" },
  { palavra: "cujo", tipo: "Pronome relativo de posse" },
  { palavra: "alguém", tipo: "Pronome indefinido" },
  { palavra: "ninguém", tipo: "Pronome indefinido" },
  { palavra: "nenhum", tipo: "Pronome indefinido" },
  { palavra: "quem", tipo: "Pronome interrogativo" }
];

let cartas = [];
pares.forEach(par => {
  cartas.push({ texto: par.palavra, id: par.palavra });
  cartas.push({ texto: par.tipo, id: par.palavra });
});

// Embaralhar cartas
cartas.sort(() => 0.5 - Math.random());

const tabuleiro = document.getElementById("tabuleiro");
const pontosSpan = document.getElementById("pontos");
const tempoSpan = document.getElementById("tempo");
const vitoriaDiv = document.getElementById("vitoria");

let primeiraCarta = null;
let bloqueio = false;
let pontos = 0;
let tempo = 0;

// Cronômetro
let timer = setInterval(() => { 
  tempo++; 
  tempoSpan.textContent = tempo; 
}, 1000);

// Criar cartas no tabuleiro
cartas.forEach((c) => {
  const div = document.createElement("div");
  div.classList.add("carta");
  div.dataset.id = c.id;
  div.dataset.texto = c.texto;
  div.innerHTML = `<span>?</span>`;

  div.addEventListener("click", () => {
    if (bloqueio || div.classList.contains("virada") || div.classList.contains("acertou")) return;

    div.classList.add("virada");
    div.querySelector('span').textContent = c.texto;

    if (!primeiraCarta) {
      primeiraCarta = div;
    } else {
      if (primeiraCarta.dataset.id === div.dataset.id && primeiraCarta !== div) {
        primeiraCarta.classList.add("acertou");
        div.classList.add("acertou");
        pontos++;
        pontosSpan.textContent = pontos;

        if (pontos === pares.length) {
          clearInterval(timer);
          setTimeout(() => vitoriaDiv.classList.add("show"), 500);
        }
      } else {
        bloqueio = true;
        setTimeout(() => {
          primeiraCarta.classList.remove("virada");
          primeiraCarta.querySelector('span').textContent = "?";
          div.classList.remove("virada");
          div.querySelector('span').textContent = "?";
          bloqueio = false;
        }, 1000);
      }
      primeiraCarta = null;
    }
  });

  tabuleiro.appendChild(div);
});
