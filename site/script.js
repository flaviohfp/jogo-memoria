// ==========================================
// 1. CONFIGURAÇÃO DO FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCEnl_d-er570l6vlK_9vYF2tnmsb7b0DI",
  authDomain: "jogodamemoria-e9a84.firebaseapp.com",
  databaseURL: "https://jogodamemoria-e9a84-default-rtdb.firebaseio.com",
  projectId: "jogodamemoria-e9a84",
  storageBucket: "jogodamemoria-e9a84.firebasestorage.app",
  messagingSenderId: "440698503353",
  appId: "1:440698503353:web:bd3fcdb1929a7321e49b68",
  measurementId: "G-BP0WGBLP8H"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ==========================================
// 2. DADOS DO JOGO (História)
// ==========================================
const pares = [
  { p: "Guerra do Paraguai", d: "Revolta militar e participação política" },
  { p: "Fim da escravidão", d: "Revolta da elite agrária" },
  { p: "Desafios na sucessão", d: "Dom Pedro II não teve filhos homens" },
  { p: "Pressão externa", d: "Inglaterra querendo a libertação de escravos" },
  { p: "Deodoro da Fonseca", d: "Líder do golpe militar de 15 de novembro" },
  { p: "Questão Religiosa", d: "Conflito entre a Igreja e Dom Pedro II" }
];

// ==========================================
// 3. VARIÁVEIS E ELEMENTOS DA TELA
// ==========================================
const tabuleiro = document.getElementById("tabuleiro");
const pontosSpan = document.getElementById("pontos");
const tempoSpan = document.getElementById("tempo");
const vitoriaDiv = document.getElementById("vitoria");
const mensagemVitoria = document.getElementById("mensagemVitoria");
const btnIniciar = document.getElementById("btnIniciar");
const btnReiniciar = document.getElementById("btnReiniciar");
const painel = document.getElementById("painel");
const entradaNome = document.getElementById("nomeJogador");
const btnConfirmarNome = document.getElementById("btnConfirmarNome");
const listaPlacar = document.getElementById("listaPlacar");
const placarDiv = document.getElementById("placar");
const orientacaoDiv = document.getElementById("orientacao");

let primeiraCarta = null;
let bloqueio = false;
let pontos = 0;
let tempo = 0;
let timer = null;
let jogoFinalizado = false;
let jogadorAtual = "";
const tempoLimite = 300; // 5 minutos em segundos

// ==========================================
// 4. EVENTOS INICIAIS E FLUXO DO JOGO
// ==========================================
btnConfirmarNome.addEventListener("click", () => {
  const nome = entradaNome.value.trim();
  if (!nome) { alert("Escreva o nome do seu grupo!"); return; }
  jogadorAtual = nome;
  document.querySelector(".entrada-nome").classList.add("hidden");
  painel.classList.remove("hidden");
  carregarPlacarOnline(); // Já mostra o ranking atual assim que o grupo entra
});

btnIniciar.addEventListener("click", iniciarJogo);
btnReiniciar.addEventListener("click", iniciarJogo);

function iniciarJogo() {
  verificarOrientacao();
  
  btnIniciar.disabled = true;
  btnReiniciar.classList.add("hidden");
  vitoriaDiv.classList.remove("show");
  vitoriaDiv.classList.add("hidden");
  placarDiv.classList.remove("show");
  placarDiv.classList.add("hidden");
  
  tabuleiro.innerHTML = "";
  pontos = 0; 
  tempo = 0; 
  jogoFinalizado = false;
  pontosSpan.textContent = "0"; 
  tempoSpan.textContent = "00:00";
  clearInterval(timer);

  // Cria e embaralha as cartas
  let cartas = [];
  pares.forEach(par => {
    cartas.push({ texto: par.p, id: par.p });
    cartas.push({ texto: par.d, id: par.p });
  });
  cartas.sort(() => 0.5 - Math.random()); 

  // Renderiza as cartas na tela
  cartas.forEach(carta => {
    const div = document.createElement("div");
    div.classList.add("carta");
    div.dataset.id = carta.id;

    const frente = document.createElement("span");
    frente.classList.add("frente");
    frente.textContent = carta.texto;

    const verso = document.createElement("span");
    verso.classList.add("verso");

    div.appendChild(frente);
    div.appendChild(verso);

    div.addEventListener("click", () => virarCarta(div));
    tabuleiro.appendChild(div);
  });

  // Mostra as cartas no começo por 3.5 segundos para memorização
  bloqueio = true;
  document.querySelectorAll(".carta").forEach(c => c.classList.add("virada"));
  
  setTimeout(() => {
    document.querySelectorAll(".carta").forEach(c => c.classList.remove("virada"));
    bloqueio = false;

    // Inicia o relógio
    timer = setInterval(() => {
      tempo++; 
      atualizarTempo();
      if (tempo >= tempoLimite) finalizarJogo(false);
    }, 1000);
  }, 3500); 
}

// ==========================================
// 5. LÓGICA DE VIRAR AS CARTAS
// ==========================================
function virarCarta(div) {
  if (bloqueio) return;

  // 💡 REGRA DE ESPIAR: Se a carta já foi acertada e o jogador quer ler novamente
  if (div.classList.contains("par-encontrado")) {
    if (!div.classList.contains("virada")) {
      div.classList.add("virada"); 
      // Esconde de novo após 3 segundos
      setTimeout(() => div.classList.remove("virada"), 3000);
    }
    return;
  }

  // Se já está virada (durante uma jogada normal), ignora
  if (div.classList.contains("virada")) return;

  // Vira a carta
  div.classList.add("virada");

  if (!primeiraCarta) {
    primeiraCarta = div;
  } else {
    const segundaCarta = div;
    
    // ACERTOU O PAR
    if (primeiraCarta.dataset.id === segundaCarta.dataset.id && primeiraCarta !== segundaCarta) {
      bloqueio = true;
      
      primeiraCarta.classList.add("par-encontrado");
      segundaCarta.classList.add("par-encontrado");
      
      pontos++;
      pontosSpan.textContent = pontos;

      // Se for a última carta, trava o relógio IMEDIATAMENTE para não prejudicar o ranking
      if (pontos === pares.length) {
        clearInterval(timer);
      }

      // Tempo de leitura após o acerto (3.5s)
      setTimeout(() => {
        // Vira as cartas de volta para baixo
        primeiraCarta.classList.remove("virada");
        segundaCarta.classList.remove("virada");
        
        bloqueio = false;
        primeiraCarta = null;
        
        // Só chama a tela final depois que o jogador terminou de ler
        if (pontos === pares.length) finalizarJogo(true);
      }, 3500); 

    } else {
      // ERROU O PAR
      bloqueio = true;
      setTimeout(() => {
        primeiraCarta.classList.remove("virada");
        segundaCarta.classList.remove("virada");
        primeiraCarta = null;
        bloqueio = false;
      }, 2000); // 2 segundos para memorizar o erro
    }
  }
}

function atualizarTempo() {
  let min = Math.floor(tempo / 60);
  let seg = tempo % 60;
  tempoSpan.textContent = (min < 10 ? "0" : "") + min + ":" + (seg < 10 ? "0" : "") + seg;
}

// ==========================================
// 6. FIM DE JOGO E PLACAR FIREBASE
// ==========================================
function finalizarJogo(venceu) {
  clearInterval(timer);
  jogoFinalizado = true;
  btnIniciar.disabled = false;
  btnReiniciar.classList.remove("hidden");
  
  vitoriaDiv.classList.remove("hidden");
  vitoriaDiv.classList.add("show");

  if (venceu) {
    mensagemVitoria.textContent = `🎉 Missão Cumprida! Tempo: ${tempoSpan.textContent}`;
    salvarPlacarOnline(jogadorAtual, tempo);
  } else {
    mensagemVitoria.textContent = `⏰ O tempo acabou! A história não espera.`;
  }
  
  placarDiv.classList.remove("hidden");
  placarDiv.classList.add("show");
}

function salvarPlacarOnline(nome, tempoTotal) {
  db.ref("placar").push({ 
    nome: nome, 
    tempo: tempoTotal 
  });
}

function carregarPlacarOnline() {
  // O .on("value") faz o placar atualizar em tempo real!
  db.ref("placar").on("value", snapshot => {
    const placar = snapshot.val();
    listaPlacar.innerHTML = "";
    
    if (!placar) {
      listaPlacar.innerHTML = "<li>Nenhum grupo registrou tempo. Seja o primeiro!</li>";
      return;
    }

    // Pega do menor tempo para o maior tempo (Ranking de Velocidade)
    const arrayPlacar = Object.values(placar).sort((a, b) => a.tempo - b.tempo);
    
    // Mostra o TOP 5
    arrayPlacar.slice(0, 5).forEach((p, i) => { 
      let li = document.createElement("li");
      let min = Math.floor(p.tempo / 60); 
      let seg = p.tempo % 60;
      let tempoFormatado = (min < 10 ? "0" : "") + min + ":" + (seg < 10 ? "0" : "") + seg;
      
      li.innerHTML = `<span>${i + 1}º ${p.nome}</span> <span>⏱️ ${tempoFormatado}</span>`;
      
      // Classes do CSS para Ouro, Prata e Bronze
      if (i === 0) li.classList.add("top1");
      else if (i === 1) li.classList.add("top2");
      else if (i === 2) li.classList.add("top3");
      
      listaPlacar.appendChild(li);
    });
  });
}

// ==========================================
// 7. UTILITÁRIOS
// ==========================================
function verificarOrientacao() {
  if (window.innerHeight > window.innerWidth && window.innerWidth <= 768) {
    orientacaoDiv.classList.add("show");
  } else { 
    orientacaoDiv.classList.remove("show"); 
  }
}
window.addEventListener("resize", verificarOrientacao);