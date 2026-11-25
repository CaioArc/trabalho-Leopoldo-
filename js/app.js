(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  initNav();
  initMenu();
  initPresentation();
  initPresentationTimer();
  initReadAloud();
  initToTop();
  initHero();
  initFrames();
  initPipeline();
  initFpsLab();
  initResolution();
  initCompression();
  initPlayer();
  initQuiz();

  function initNav() {
    const links = $$(".nav-link");
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    function setActive(id) {
      links.forEach((link) => {
        const on = link.dataset.section === id;
        link.classList.toggle("is-active", on);
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.15, 0.35, 0.6] }
    );

    sections.forEach((section) => observer.observe(section));

    links.forEach((link) => {
      link.addEventListener("click", () => {
        $("#sidebar").classList.remove("is-open");
      });
    });
  }

  function initMenu() {
    const btn = $("#btnMenu");
    const sidebar = $("#sidebar");
    if (!btn || !sidebar) return;
    btn.addEventListener("click", () => {
      const open = sidebar.classList.toggle("is-open");
      btn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
  }

  function initPresentation() {
    const btn = $("#btnApresentacao");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const on = document.body.classList.toggle("present-mode");
      btn.setAttribute("aria-pressed", String(on));
      btn.textContent = on ? "Sair do modo apresentacao" : "Modo apresentacao";
    });
  }

  function initPresentationTimer() {
    const label = $("#presentationTime");
    const btn = $("#btnPresentationTimer");
    if (!label || !btn) return;
    let remaining = 15 * 60;
    let interval = null;

    function format(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
    }

    btn.addEventListener("click", () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
        btn.textContent = "Continuar";
        return;
      }
      btn.textContent = "Pausar";
      interval = setInterval(() => {
        remaining = Math.max(0, remaining - 1);
        label.textContent = format(remaining);
        if (remaining === 0) {
          clearInterval(interval);
          interval = null;
          btn.textContent = "Reiniciar";
          remaining = 15 * 60;
        }
      }, 1000);
    });
  }

  function initReadAloud() {
    const btn = $("#btnReadAloud");
    if (!btn) return;
    const voiceSelect = $("#voiceSelect");
    const voiceHint = $("#voiceHint");
    const synth = window.speechSynthesis;
    if (!synth) {
      btn.textContent = "Audio nao suportado";
      btn.disabled = true;
      return;
    }

    let portugueseVoices = [];

    function loadVoices() {
      portugueseVoices = synth.getVoices().filter((voice) => /^pt[-_]/i.test(voice.lang));
      portugueseVoices.sort((a, b) => {
        const score = (voice) => {
          const name = voice.name.toLowerCase();
          const lang = voice.lang.toLowerCase().replace("_", "-");
          if (lang === "pt-br" && /google/.test(name)) return 4;
          if (lang === "pt-br" && /natural|neural|online/.test(name)) return 3;
          if (lang === "pt-br") return 2;
          return 1;
        };
        return score(b) - score(a);
      });

      if (voiceSelect) {
        const previousVoice = voiceSelect.value;
        voiceSelect.innerHTML = "";
        const automatic = document.createElement("option");
        automatic.value = "";
        automatic.textContent = "Automatica (melhor voz disponivel)";
        voiceSelect.appendChild(automatic);
        portugueseVoices.forEach((voice) => {
          const option = document.createElement("option");
          option.value = voice.voiceURI;
          option.textContent = voice.name + " (" + voice.lang + ")";
          voiceSelect.appendChild(option);
        });
        voiceSelect.value = portugueseVoices.some((voice) => voice.voiceURI === previousVoice)
          ? previousVoice
          : "";
      }

      if (voiceHint && portugueseVoices.length === 0) {
        voiceHint.textContent = "Nenhuma voz em portugues foi listada. A voz padrao do navegador sera usada.";
      }
    }

    loadVoices();
    if (typeof synth.addEventListener === "function") {
      synth.addEventListener("voiceschanged", loadVoices);
    }

    btn.addEventListener("click", () => {
      synth.cancel();
      const text = "Vídeo digital é uma sequência de quadros exibida em ritmo suficiente para criar a sensação de movimento. FPS indica a quantidade de quadros por segundo. Resolucao indica a quantidade de pixels. Compressao reduz o tamanho do arquivo. Codecs realizam a compressao e o conteiner organiza os fluxos de vídeo e audio.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 0.92;
      const selectedVoice = voiceSelect && voiceSelect.value
        ? portugueseVoices.find((voice) => voice.voiceURI === voiceSelect.value)
        : portugueseVoices[0];
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.onstart = () => {
        btn.textContent = selectedVoice ? "Ouvindo: " + selectedVoice.name : "Ouvindo resumo...";
      };
      utterance.onerror = () => { btn.textContent = "Ouvir resumo em audio"; };
      utterance.onend = () => { btn.textContent = "Ouvir resumo em audio"; };
      synth.speak(utterance);
      btn.textContent = "Ouvindo resumo...";
    });
  }

  function initToTop() {
    const btn = $("#toTop");
    if (!btn) return;
    window.addEventListener("scroll", () => {
      btn.classList.toggle("is-visible", window.scrollY > 500);
    });
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function drawBall(ctx, x, y, r, glow) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, "#dff6ff");
    g.addColorStop(0.35, glow || "#00c8ff");
    g.addColorStop(1, "#123056");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function initHero() {
    const canvas = $("#heroCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    let t = 0;

    function frame() {
      ctx.fillStyle = "#07101c";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(0,200,255,0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (h / 8) * i);
        ctx.lineTo(w, (h / 8) * i);
        ctx.stroke();
      }
      const x = 80 + (w - 160) * (0.5 + 0.5 * Math.sin(t));
      const y = h * 0.55 + Math.sin(t * 2) * 18;
      drawBall(ctx, x, y, 28, "#247bff");
      ctx.fillStyle = "rgba(0,200,255,0.12)";
      ctx.fillRect(x - 4, 40, 8, h - 80);
      t += 0.03;
      requestAnimationFrame(frame);
    }
    frame();
  }

  function initFrames() {
    const strip = $("#filmstrip");
    const play = $("#framePlay");
    const readout = $("#frameReadout");
    const btn = $("#btnToggleFrames");
    if (!strip || !play) return;

    const frames = 12;
    const sctx = strip.getContext("2d");
    const pctx = play.getContext("2d");
    let current = 0;
    let running = true;
    let last = 0;

    function pos(i) {
      const t = i / (frames - 1);
      return {
        x: 40 + t * (strip.width - 80),
        y: strip.height / 2 + Math.sin(t * Math.PI) * -18
      };
    }

    function drawStrip(active) {
      sctx.fillStyle = "#07101c";
      sctx.fillRect(0, 0, strip.width, strip.height);
      const cell = strip.width / frames;
      for (let i = 0; i < frames; i++) {
        const x = i * cell;
        sctx.fillStyle = i === active ? "rgba(0,200,255,0.16)" : "rgba(255,255,255,0.03)";
        sctx.fillRect(x + 2, 6, cell - 4, strip.height - 12);
        sctx.strokeStyle = "rgba(0,200,255,0.25)";
        sctx.strokeRect(x + 2, 6, cell - 4, strip.height - 12);
        const p = pos(i);
        drawBall(sctx, x + cell / 2, p.y, 14);
        sctx.fillStyle = "#aab6c8";
        sctx.font = "10px sans-serif";
        sctx.fillText(String(i + 1).padStart(2, "0"), x + 8, strip.height - 10);
      }
    }

    function drawPlay(i) {
      pctx.fillStyle = "#07101c";
      pctx.fillRect(0, 0, play.width, play.height);
      const t = i / (frames - 1);
      const x = 40 + t * (play.width - 80);
      const y = play.height * 0.58 + Math.sin(t * Math.PI) * -22;
      pctx.fillStyle = "rgba(0,200,255,0.08)";
      pctx.fillRect(20, play.height - 36, play.width - 40, 8);
      drawBall(pctx, x, y, 22);
    }

    function tick(ts) {
      if (running && ts - last > 140) {
        current = (current + 1) % frames;
        last = ts;
        drawStrip(current);
        drawPlay(current);
        if (readout) readout.textContent = "quadro " + (current + 1) + " / " + frames;
      }
      requestAnimationFrame(tick);
    }

    drawStrip(0);
    drawPlay(0);
    requestAnimationFrame(tick);

    if (btn) {
      btn.addEventListener("click", () => {
        running = !running;
        btn.textContent = running ? "Pausar sequencia" : "Reproduzir sequencia";
      });
    }
  }

  function initPipeline() {
    const steps = $$(".pipe-step");
    const title = $("#pipeTitle");
    const text = $("#pipeText");
    const art = $("#pipelineArt");
    const data = [
      {
        title: "Captura da imagem",
        text: "A lente projeta a cena no sensor. Fotodiodos acumulam carga proporcional a luz em cada fotosite. Obturador e ganho definem exposicao antes de qualquer arquivo existir.",
        hue: "210deg"
      },
      {
        title: "Digitalizacao",
        text: "O conversor analogico-digital transforma tensao em numeros. O processador da camera aplica matriz de Bayer, balanceamento de branco e gera um quadro em YCbCr ou RAW.",
        hue: "190deg"
      },
      {
        title: "Processamento e compressao",
        text: "Blocos de pixels sao analisados. Redundancia espacial e temporal e removida. O codec decide o que preservar com base no bitrate disponivel.",
        hue: "270deg"
      },
      {
        title: "Armazenamento em arquivo",
        text: "Video, audio e metadados entram em um contêiner (MP4, MOV, MKV). Timestamps alinham os fluxos. O arquivo pode ir para cartao, SSD ou nuvem.",
        hue: "300deg"
      },
      {
        title: "Reproducao no dispositivo",
        text: "O player le o contêiner, decodifica o codec, envia quadros a GPU e amostras ao DAC de audio. A tela reconstrói o movimento na taxa original.",
        hue: "200deg"
      }
    ];

    function show(i) {
      steps.forEach((btn, idx) => {
        const on = idx === i;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", String(on));
      });
      title.textContent = data[i].title;
      text.textContent = data[i].text;
      if (art) art.style.filter = "hue-rotate(" + data[i].hue + ")";
    }

    steps.forEach((btn) => {
      btn.addEventListener("click", () => show(Number(btn.dataset.step)));
      btn.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const i = Number(btn.dataset.step);
        const next = e.key === "ArrowRight" ? (i + 1) % steps.length : (i + steps.length - 1) % steps.length;
        steps[next].focus();
        show(next);
      });
    });
    show(0);
  }

  function initFpsLab() {
    const canvas = $("#fpsCanvas");
    const slider = $("#fpsSlider");
    const value = $("#fpsValue");
    const hint = $("#fpsHint");
    if (!canvas || !slider) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    let fps = Number(slider.value);
    let lastDraw = 0;
    let angle = 0;
    const trail = [];

    function hintText(n) {
      if (n <= 18) return "Poucos quadros: o movimento parece saltado, como stop-motion.";
      if (n <= 26) return "24 FPS: cadencia de cinema. O olho aceita o movimento com blur natural.";
      if (n <= 36) return "30 FPS: padrao de video e TV. Mais amostras, transicao um pouco mais lisa.";
      return "60 FPS: deslocamento minimo entre quadros. Ideal para acao rapida e jogos.";
    }

    function apply(n) {
      fps = n;
      slider.value = String(n);
      if (value) value.textContent = String(n);
      if (hint) hint.textContent = hintText(n);
      $$(".chip[data-fps]").forEach((c) => c.classList.toggle("is-active", Number(c.dataset.fps) === n));
    }

    function render(ts) {
      const interval = 1000 / fps;
      if (ts - lastDraw >= interval) {
        lastDraw = ts;
        angle += (Math.PI * 2 * interval) / 1800;
        const x = w * 0.18 + (w * 0.64) * (0.5 + 0.5 * Math.sin(angle));
        const y = h * 0.55 + Math.sin(angle * 2) * 36;
        trail.push({ x, y });
        if (trail.length > 18) trail.shift();

        ctx.fillStyle = "#07101c";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(0,200,255,0.15)";
        ctx.beginPath();
        ctx.moveTo(40, h * 0.55);
        ctx.bezierCurveTo(w * 0.3, h * 0.2, w * 0.7, h * 0.9, w - 40, h * 0.55);
        ctx.stroke();
        trail.forEach((p, i) => {
          ctx.globalAlpha = (i + 1) / trail.length * 0.35;
          drawBall(ctx, p.x, p.y, 10 + i * 0.4, "#9257ff");
        });
        ctx.globalAlpha = 1;
        drawBall(ctx, x, y, 26);
        ctx.fillStyle = "#aab6c8";
        ctx.font = "14px sans-serif";
        ctx.fillText(fps + " quadros por segundo", 24, 28);
      }
      requestAnimationFrame(render);
    }

    slider.addEventListener("input", () => apply(Number(slider.value)));
    $$(".chip[data-fps]").forEach((chip) => {
      chip.addEventListener("click", () => apply(Number(chip.dataset.fps)));
    });
    apply(fps);
    requestAnimationFrame(render);
  }

  function initResolution() {
    const canvas = $("#resCanvas");
    const readout = $("#resReadout");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const source = document.createElement("canvas");
    source.width = 960;
    source.height = 420;
    const sctx = source.getContext("2d");
    paintScene(sctx, source.width, source.height);

    const map = {
      480: { w: 854, h: 480, label: "854 x 480 — SD" },
      720: { w: 1280, h: 720, label: "1280 x 720 — HD" },
      1080: { w: 1920, h: 1080, label: "1920 x 1080 — Full HD" },
      1440: { w: 2560, h: 1440, label: "2560 x 1440 — QHD" },
      2160: { w: 3840, h: 2160, label: "3840 x 2160 — 4K UHD" }
    };

    function apply(key) {
      const spec = map[key];
      const tmp = document.createElement("canvas");
      const scale = key === "2160" ? 1 : Math.max(0.12, spec.w / 3840);
      tmp.width = Math.max(8, Math.round(source.width * scale));
      tmp.height = Math.max(8, Math.round(source.height * scale));
      const tctx = tmp.getContext("2d");
      tctx.imageSmoothingEnabled = true;
      tctx.drawImage(source, 0, 0, tmp.width, tmp.height);
      ctx.imageSmoothingEnabled = key === "2160" || key === "1440";
      if (key === "480") ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#050910";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
      if (readout) readout.textContent = spec.label + "  |  a imagem foi reamostrada para simular esta grade de pixels";
      $$(".chip[data-res]").forEach((c) => c.classList.toggle("is-active", c.dataset.res === key));
    }

    $$(".chip[data-res]").forEach((chip) => {
      chip.addEventListener("click", () => apply(chip.dataset.res));
    });
    apply("1080");
  }

  function paintScene(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#123056");
    sky.addColorStop(1, "#071018");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1a2b44";
    ctx.fillRect(0, h * 0.62, w, h * 0.38);
    for (let i = 0; i < 18; i++) {
      const x = 30 + i * 52;
      const bh = 40 + (i * 37) % 160;
      ctx.fillStyle = i % 3 === 0 ? "#247bff" : i % 3 === 1 ? "#9257ff" : "#1e3a5f";
      ctx.fillRect(x, h * 0.62 - bh, 36, bh);
      ctx.fillStyle = "#00c8ff";
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 3; c++) {
          if ((r + c + i) % 2 === 0) ctx.fillRect(x + 6 + c * 8, h * 0.62 - bh + 8 + r * 10, 5, 5);
        }
      }
    }
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.18, 36, 0, Math.PI * 2);
    ctx.fillStyle = "#f5f7fa";
    ctx.fill();
    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "#f5f7fa";
    ctx.fillText("DETALHE FINO  1920", 40, 48);
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#aab6c8";
    ctx.fillText("Texto pequeno para evidenciar aliasing em baixas resolucoes", 40, 76);
    ctx.strokeStyle = "#00c8ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, h * 0.78);
    for (let x = 40; x < w - 40; x += 6) {
      ctx.lineTo(x, h * 0.78 + Math.sin(x / 18) * 18);
    }
    ctx.stroke();
  }

  function initCompression() {
    const slider = $("#bitrateSlider");
    const rawEl = $("#rawSize");
    const compEl = $("#compSize");
    const bar = $("#barComp");
    const hint = $("#compHint");
    const rateLabel = $("#bitrateLabel");
    if (!slider) return;

    const seconds = 10;
    const rawBits = 1920 * 1080 * 24 * 30 * seconds;
    const rawMB = rawBits / 8 / 1e6;

    function fmt(mb) {
      return mb >= 100 ? mb.toFixed(0) + " MB" : mb.toFixed(1) + " MB";
    }

    function apply() {
      const mbps = Number(slider.value);
      const compMB = (mbps * 1e6 * seconds) / 8 / 1e6;
      const ratio = 100 * (1 - compMB / rawMB);
      if (rawEl) rawEl.textContent = fmt(rawMB);
      if (compEl) compEl.textContent = fmt(compMB);
      if (rateLabel) rateLabel.textContent = mbps.toFixed(1) + " Mbps";
      if (bar) bar.style.width = Math.max(2, Math.min(100, (compMB / rawMB) * 400)) + "%";
      if (hint) {
        let q = "Qualidade tipica de streaming HD.";
        if (mbps < 3) q = "Bitrate baixo: artefatos de bloco e perda de textura.";
        else if (mbps > 12) q = "Bitrate alto: detalhe preservado, arquivo maior.";
        hint.textContent = "Reducao de cerca de " + ratio.toFixed(1) + "%. " + q;
      }
    }

    slider.addEventListener("input", apply);
    apply();
  }

  function initQuiz() {
    const form = $("#quiz");
    const result = $("#quizResult");
    const questionsEl = $("#quizQuestions");
    const newQuizBtn = $("#btnNewQuiz");
    if (!form || !result || !questionsEl || !newQuizBtn) return;

    const questionBank = [
      { question: "O que forma a ilusão de movimento em um vídeo digital?", options: ["Quadros exibidos em sequência", "Pixels fixos na tela", "Legendas sincronizadas"], answer: 0 },
      { question: "O que significa a sigla FPS?", options: ["Formato de pixels sincronizados", "Quadros por segundo", "Frequência de processamento do som"], answer: 1 },
      { question: "O que a resolução de um vídeo descreve?", options: ["A quantidade de pixels na largura e na altura", "A duração total do vídeo", "A quantidade de canais de áudio"], answer: 0 },
      { question: "Qual é a função principal de um codec de vídeo?", options: ["Organizar os arquivos em pastas", "Codificar e decodificar o vídeo, geralmente comprimindo-o", "Aumentar o tamanho da tela"], answer: 1 },
      { question: "O que é um contêiner, como MP4 ou MKV?", options: ["Um dispositivo de captura", "Um tipo de resolução", "Um formato que reúne vídeo, áudio e metadados"], answer: 2 },
      { question: "O que caracteriza a compressão com perdas (lossy)?", options: ["Reduz o tamanho descartando parte da informação", "Mantém todos os dados originais", "Aumenta a resolução sem alterar o arquivo"], answer: 0 },
      { question: "O que é bitrate?", options: ["A velocidade de exibição dos quadros", "A quantidade de dados processada ou transmitida por unidade de tempo", "O número de pixels de uma imagem"], answer: 1 },
      { question: "Qual destes é um codec de vídeo?", options: ["H.264", "MP4", "HDMI"], answer: 0 },
      { question: "Como o áudio e o vídeo podem permanecer sincronizados no arquivo?", options: ["Usando timestamps para alinhar os fluxos", "Usando a mesma resolução", "Repetindo o primeiro quadro"], answer: 0 },
      { question: "O que é um pixel?", options: ["Uma unidade de armazenamento de áudio", "O menor elemento de uma imagem digital", "Um quadro completo de vídeo"], answer: 1 },
      { question: "O que geralmente acontece quando se aumenta a taxa de quadros?", options: ["O movimento pode ficar mais fluido, com mais quadros por segundo", "A resolução sempre diminui", "O áudio deixa de ser necessário"], answer: 0 },
      { question: "Qual é a função do sensor durante a captura de vídeo?", options: ["Converter a luz da cena em sinais que serão digitalizados", "Comprimir o arquivo MP4", "Reproduzir o vídeo na tela"], answer: 0 },
      { question: "Como funciona o bitrate adaptativo em streaming?", options: ["Ajusta a qualidade do vídeo conforme as condições da rede", "Desliga o áudio quando a rede fica rápida", "Converte todos os vídeos para a mesma resolução"], answer: 0 },
      { question: "Qual alternativa é um exemplo de mídia de armazenamento removível?", options: ["Cartão SD", "Codec AV1", "Resolução Full HD"], answer: 0 },
      { question: "Qual é uma característica da compressão sem perdas (lossless)?", options: ["Descarta detalhes permanentemente", "Permite reconstruir os dados originais bit a bit", "Só funciona para áudio"], answer: 1 }
    ];

    function shuffle(items) {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = items[i];
        items[i] = items[j];
        items[j] = temp;
      }
      return items;
    }

    function drawQuestions() {
      const selected = shuffle(questionBank.slice()).slice(0, 5);
      questionsEl.innerHTML = selected.map((item, index) => {
        const options = item.options.map((option, optionIndex) =>
          '<label><input type="radio" name="q' + (index + 1) + '" value="' +
          (optionIndex === item.answer ? "1" : "0") + '"> ' + option + '</label>'
        ).join("");
        return '<fieldset class="quiz-question"><legend>' + (index + 1) + ". " +
          item.question + "</legend>" + options + "</fieldset>";
      }).join("");
      result.textContent = "";
      result.className = "quiz-result";
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let correct = 0;
      let answered = 0;
      for (let i = 1; i <= 5; i++) {
        const selected = form.querySelector('input[name="q' + i + '"]:checked');
        if (selected) {
          answered++;
          correct += Number(selected.value);
        }
      }
      if (answered < 5) {
        result.textContent = "Responda as cinco questões antes de ver o resultado.";
        result.className = "quiz-result is-warning";
        return;
      }
      const percent = correct * 20;
      result.textContent = "Resultado: " + correct + " de 5 acertos — " + percent + "%.";
      result.className = "quiz-result " + (percent >= 70 ? "is-success" : "is-review");
    });

    newQuizBtn.addEventListener("click", drawQuestions);
    drawQuestions();
  }

  function initPlayer() {
    const root = $("#player");
    const video = $("#media");
    if (!root || !video) return;

    const btnPlay = $("#btnPlay");
    const btnBig = $("#btnBigPlay");
    const btnBack = $("#btnBack");
    const btnFwd = $("#btnFwd");
    const btnMute = $("#btnMute");
    const btnFs = $("#btnFs");
    const seek = $("#seek");
    const volume = $("#volume");
    const timeLabel = $("#timeLabel");
    const stateEl = $("#playerState");
    const errEl = $("#playerError");
    const iconPlay = btnPlay.querySelector(".icon-play");
    const iconPause = btnPlay.querySelector(".icon-pause");
    let seeking = false;

    function fmt(t) {
      if (!isFinite(t)) return "00:00";
      const s = Math.max(0, Math.floor(t));
      const m = Math.floor(s / 60);
      const r = s % 60;
      return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
    }

    function setPlaying(on) {
      root.classList.toggle("is-playing", on);
      stateEl.textContent = on ? "Reproduzindo" : "Pausado";
      btnPlay.setAttribute("aria-label", on ? "Pausar" : "Reproduzir");
      iconPlay.hidden = on;
      iconPause.hidden = !on;
    }

    function togglePlay() {
      if (video.paused || video.ended) {
        const p = video.play();
        if (p && p.catch) p.catch(() => showError(true));
      } else {
        video.pause();
      }
    }

    function showError(on) {
      if (errEl) errEl.hidden = !on;
    }

    function syncTime() {
      if (seeking) return;
      const d = video.duration || 0;
      const t = video.currentTime || 0;
      seek.max = "1000";
      seek.value = d ? String(Math.round((t / d) * 1000)) : "0";
      timeLabel.textContent = fmt(t) + " / " + fmt(d);
    }

    function seekToRatio(ratio) {
      if (!isFinite(video.duration)) return;
      video.currentTime = Math.min(video.duration, Math.max(0, ratio * video.duration));
    }

    btnPlay.addEventListener("click", togglePlay);
    btnBig.addEventListener("click", togglePlay);
    root.querySelector(".player-stage").addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      togglePlay();
    });

    btnBack.addEventListener("click", () => {
      video.currentTime = Math.max(0, video.currentTime - 10);
    });
    btnFwd.addEventListener("click", () => {
      const d = video.duration || 0;
      video.currentTime = Math.min(d, video.currentTime + 10);
    });

    seek.addEventListener("pointerdown", () => { seeking = true; });
    seek.addEventListener("input", () => {
      const ratio = Number(seek.value) / Number(seek.max);
      seekToRatio(ratio);
      timeLabel.textContent = fmt(video.currentTime) + " / " + fmt(video.duration || 0);
    });
    seek.addEventListener("change", () => {
      seeking = false;
      syncTime();
    });
    window.addEventListener("pointerup", () => { seeking = false; });

    volume.addEventListener("input", () => {
      video.volume = Number(volume.value);
      video.muted = video.volume === 0;
      btnMute.setAttribute("aria-label", video.muted ? "Ativar audio" : "Silenciar");
    });
    btnMute.addEventListener("click", () => {
      video.muted = !video.muted;
      if (!video.muted && video.volume === 0) {
        video.volume = 0.85;
        volume.value = "0.85";
      }
      btnMute.setAttribute("aria-label", video.muted ? "Ativar audio" : "Silenciar");
    });

    function isFs() {
      return document.fullscreenElement === root || document.webkitFullscreenElement === root;
    }
    function enterFs() {
      const el = root;
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) req.call(el);
    }
    function exitFs() {
      const ex = document.exitFullscreen || document.webkitExitFullscreen;
      if (ex) ex.call(document);
    }
    btnFs.addEventListener("click", () => { isFs() ? exitFs() : enterFs(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isFs()) exitFs();
      if (e.key === " " && document.activeElement === document.body) {
        if (root.matches(":hover") || isFs()) {
          e.preventDefault();
          togglePlay();
        }
      }
    });
    document.addEventListener("fullscreenchange", () => {
      btnFs.setAttribute("aria-label", isFs() ? "Sair da tela cheia" : "Tela cheia");
    });

    video.addEventListener("play", () => setPlaying(true));
    video.addEventListener("pause", () => setPlaying(false));
    video.addEventListener("ended", () => {
      setPlaying(false);
      stateEl.textContent = "Encerrado — reproduzir novamente";
    });
    video.addEventListener("timeupdate", syncTime);
    video.addEventListener("loadedmetadata", () => {
      showError(false);
      syncTime();
      video.volume = Number(volume.value);
    });
    video.addEventListener("seeking", syncTime);
    video.addEventListener("error", () => showError(true));

    setPlaying(false);
    syncTime();
  }
})();
