// script.js - RPG визитка лидогенератора с готическими звуками
(function() {
  // Ждем полной загрузки DOM
  document.addEventListener('DOMContentLoaded', function() {

    // === 1. КАНВАС С РУНАМИ (без изменений) ===
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) {
      console.error('Canvas not found!');
      return;
    }

    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    const runes = [];
    const RUNE_COUNT = Math.max(12, Math.floor((W * H) / 120000));

    class Rune {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.3) * 0.4;
        this.size = 6 + Math.random() * 18;
        this.alpha = 0.06 + Math.random() * 0.18;
        this.rot = Math.random() * Math.PI * 2;
      }

      step() {
        this.x += this.vx;
        this.y += this.vy;
        this.rot += 0.002;
        if (this.x < -50 || this.x > W + 50 || this.y < -50 || this.y > H + 50) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = 'rgba(255, 140, 60, 0.14)';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          ctx.lineTo(
            Math.cos(i / 6 * Math.PI * 2) * this.size,
            Math.sin(i / 6 * Math.PI * 2) * this.size
          );
        }
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < RUNE_COUNT; i++) {
      runes.push(new Rune());
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      for (const r of runes) {
        r.step();
        r.draw();
      }
      requestAnimationFrame(animate);
    }
    animate();

    // === 2. ГОТИЧЕСКАЯ АУДИО СИСТЕМА ===
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    // Более сложные звуки в готическом стиле
    function playGothicSound(type, baseFreq, duration = 0.8, volume = 0.15, vibrato = true) {
      try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        // Настройки фильтра для "мрачного" звука
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        filter.Q.value = 2;

        // Вибрато для атмосферности
        if (vibrato) {
          const vibratoOsc = audioCtx.createOscillator();
          const vibratoGain = audioCtx.createGain();
          vibratoOsc.frequency.value = 5;
          vibratoGain.gain.value = 12;
          vibratoOsc.connect(vibratoGain);
          vibratoGain.connect(oscillator.frequency);
          vibratoOsc.start();
          vibratoOsc.stop(audioCtx.currentTime + duration);
        }

        oscillator.type = type;
        oscillator.frequency.value = baseFreq;
        gainNode.gain.value = volume;

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Динамическое изменение частоты фильтра
        filter.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + duration * 0.7);

        // Огибающая для volume
        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        oscillator.start();
        oscillator.stop(now + duration);

      } catch (e) {
        console.warn('Audio error:', e);
      }
    }

    // Готический колокол/звон
    function playBellSound(freq = 180, duration = 1.2) {
      try {
        const oscillator1 = audioCtx.createOscillator();
        const oscillator2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        oscillator1.frequency.value = freq;
        oscillator2.frequency.value = freq * 2.5; // Квинта

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        gainNode.gain.value = 0.18;

        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Огибающая
        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.18, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Плавное изменение фильтра
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + duration);

        oscillator1.start();
        oscillator2.start();
        oscillator1.stop(now + duration);
        oscillator2.stop(now + duration);

      } catch (e) {
        console.warn('Bell sound error:', e);
      }
    }

    // Мрачный ambient звук
    function playAmbientPad() {
      try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 110; // Ля второй октавы

        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter.Q.value = 1.5;

        gainNode.gain.value = 0.08;

        // LFO для волны
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = 0.3;
        lfoGain.gain.value = 8;
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        lfo.start();

        // Плавное затухание
        const now = audioCtx.currentTime;
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        setTimeout(() => {
          oscillator.stop();
          lfo.stop();
        }, 2500);

      } catch (e) {
        console.warn('Ambient sound error:', e);
      }
    }

    // Звук свитка/пергамента
    function playScrollSound() {
      try {
        const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.4, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Генерация розового шума (более натуральный звук)
        for (let i = 0; i < output.length; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.7;
        }

        const brownNoise = [];
        let lastOut = 0;
        for (let i = 0; i < output.length; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + white) * 0.98;
          brownNoise[i] = lastOut * 0.4;
        }

        const bufferSource = audioCtx.createBufferSource();
        const gainNode = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        bufferSource.buffer = noiseBuffer;
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 0.8;

        // Огибающая
        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        // Движение фильтра
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.4);

        bufferSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        bufferSource.start();
        bufferSource.stop(now + 0.4);

      } catch (e) {
        console.warn('Scroll sound error:', e);
      }
    }

    // Обновленные звуки для действий
    function playLeadSound() {
      playGothicSound('sawtooth', 110, 0.6, 0.12);
      setTimeout(() => playBellSound(220, 0.8), 150);
      setTimeout(() => playAmbientPad(), 300);
    }

    function playRollSound() {
      playGothicSound('square', 140, 0.5, 0.1);
      setTimeout(() => playGothicSound('triangle', 210, 0.4, 0.08, false), 100);
      setTimeout(() => playScrollSound(), 200);
    }

    function playLevelSound() {
      playBellSound(260, 1.2);
      setTimeout(() => playBellSound(390, 1.0), 120);
      setTimeout(() => playGothicSound('sine', 520, 1.5, 0.18), 240);
      playAmbientPad();
    }

    function playCopySound() {
      playGothicSound('sine', 660, 0.3, 0.06, false);
    }

    function playIntroSound() {
      playBellSound(180, 1.5);
      setTimeout(() => playBellSound(270, 1.2), 200);
      setTimeout(() => playAmbientPad(), 400);
    }

    // === 3. СИСТЕМА XP ===
    const xpInner = document.getElementById('xpInner');
    const xpText = document.getElementById('xpText');
    const levelLabel = document.getElementById('level');

    let XP = Number(localStorage.getItem('rpg_xp') || 0);
    let LEVEL = Number(localStorage.getItem('rpg_lvl') || 1);
    const XP_PER_LEVEL = 100;

    function renderXP() {
      if (!xpInner || !xpText || !levelLabel) return;

      const currentXP = XP % XP_PER_LEVEL;
      const percentage = Math.min(100, Math.round((currentXP / XP_PER_LEVEL) * 100));

      xpInner.style.width = percentage + '%';
      xpText.textContent = currentXP + ' / ' + XP_PER_LEVEL;
      levelLabel.textContent = LEVEL;
    }

    function addXP(amount) {
      XP += amount;
      const newLevel = Math.floor(XP / XP_PER_LEVEL) + 1;

      if (newLevel > LEVEL) {
        LEVEL = newLevel;
        playLevelSound();
        showToast('Уровень повышен до ' + LEVEL + '! 🎉');
      }

      localStorage.setItem('rpg_xp', XP);
      localStorage.setItem('rpg_lvl', LEVEL);
      renderXP();
    }

    // === 4. ГЕНЕРАТОР ЛИДОВ ===
    const leadBtn = document.getElementById('getLeadBtn');
    const lastLead = document.getElementById('lastLead');

    const sampleCompanies = [
      'Магазин «Ракушка»',
      'ООО "ТехМаркет"',
      'ИП "Петров"',
      'LLC "QuickSell"',
      'ИП "Кузнецов"'
    ];

    const sampleNames = [
      'Иван Иванов',
      'Елена Смирнова',
      'Мария Васильева',
      'Сергей Орлов',
      'Алексей Смирнов'
    ];

    function generateFakeLead() {
      const company = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
      const person = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const phone = '+7 9' + Math.floor(100000000 + Math.random() * 899999999);
      const email = (person.split(' ')[0] + '.' + person.split(' ')[1])
        .toLowerCase()
        .replace(/[^a-zа-яё0-9.]/gi, '') + '@example.com';

      return { company, person, phone, email };
    }

    if (leadBtn && lastLead) {
      leadBtn.addEventListener('click', () => {
        const lead = generateFakeLead();
        lastLead.innerHTML = `
          <div class="lead-card">
            <div class="meta">
              <div class="name">${lead.company}</div>
              <div class="info">
                Контакт: ${lead.person} · ${lead.phone} · ${lead.email}
              </div>
            </div>
            <div>
              <button class="btn btn-ghost copyBtn">Копировать</button>
            </div>
          </div>
        `;

        addXP(18);
        playLeadSound();
        showToast('Найден лид: ' + lead.company, 3000);

        // Обработчик копирования
        const copyBtn = lastLead.querySelector('.copyBtn');
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            const text = `${lead.company} - ${lead.person} - ${lead.phone} - ${lead.email}`;
            navigator.clipboard.writeText(text)
              .then(() => {
                playCopySound();
                showToast('Скопировано в буфер');
              })
              .catch(err => console.error('Ошибка копирования:', err));
          });
        }
      });
    }

    // === 5. КНОПКА БРОСКА КУБИКА ===
    const rollBtn = document.getElementById('rollBtn');
    if (rollBtn) {
      rollBtn.addEventListener('click', () => {
        const roll = Math.floor(Math.random() * 100) + 1;
        playRollSound();

        if (roll > 80) {
          addXP(12);
          showToast('Критический успех! +' + 12 + ' XP', 3000);
        } else if (roll > 40) {
          addXP(6);
          showToast('Успех! +' + 6 + ' XP', 3000);
        } else {
          showToast('Промах...', 2000);
        }
      });
    }

    // === 6. СИСТЕМА TOAST-УВЕДОМЛЕНИЙ ===
    function showToast(text, timeout = 2200) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = text;

      Object.assign(toast.style, {
        position: 'fixed',
        right: '22px',
        bottom: '22px',
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'rgba(5, 18, 22, 0.9)',
        border: '1px solid rgba(126, 231, 135, 0.2)',
        color: '#7ee787',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.8)',
        zIndex: 9999,
        animation: 'fadeIn 0.3s ease',
        backdropFilter: 'blur(4px)',
        fontFamily: '"Cinzel", serif',
        fontSize: '14px',
        letterSpacing: '0.5px'
      });

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 500);
      }, timeout);
    }

    // === 7. ИНТРО СИСТЕМА ===
    const introOverlay = document.getElementById('introOverlay');
    const introVideo = document.getElementById('introVideo');
    const playIntroBtn = document.getElementById('playIntroBtn');
    const skipIntroBtn = document.getElementById('skipIntroBtn');
    const mainWrap = document.querySelector('main.wrap');

    function openMain() {
      if (introOverlay) {
        introOverlay.style.display = 'none';
        introOverlay.setAttribute('aria-hidden', 'true');
      }

      if (mainWrap) {
        mainWrap.style.display = 'grid';
        mainWrap.setAttribute('aria-hidden', 'false');
      }

      showToast('Добро пожаловать, Lead Hunter!', 3000);
    }

    // Кнопка воспроизведения интро
    if (playIntroBtn) {
      playIntroBtn.addEventListener('click', async () => {
        try {
          await audioCtx.resume();
        } catch (e) {
          console.warn('Audio resume error:', e);
        }

        if (introVideo) {
          introVideo.currentTime = 0;
          introVideo.play().catch(err => {
            console.error('Video play error:', err);
            openMain();
          });
        }

        if (introOverlay) {
          introOverlay.classList.add('playing');
        }

        playIntroSound();
      });
    }

    // Кнопка пропуска интро
    if (skipIntroBtn) {
      skipIntroBtn.addEventListener('click', () => {
        if (introVideo) {
          introVideo.pause();
        }
        playScrollSound();
        setTimeout(openMain, 300);
      });
    }

    // Завершение видео
    if (introVideo) {
      introVideo.addEventListener('ended', () => {
        playBellSound(320, 1.0);
        setTimeout(openMain, 800);
      });

      introVideo.addEventListener('error', () => {
        console.warn('Video error, skipping to main');
        if (playIntroBtn) {
          playIntroBtn.textContent = 'Воспроизвести';
        }
        openMain();
      });
    }

    // Проверка наличия видео файла
    fetch('assets/video/intro.mp4', { method: 'HEAD' })
      .then(response => {
        if (!response.ok && playIntroBtn) {
          playIntroBtn.textContent = 'Воспроизвести';
        }
      })
      .catch(() => {
        if (playIntroBtn) {
          playIntroBtn.textContent = 'Воспроизвести';
        }
      });

    // === 8. ГОРЯЧИЕ КЛАВИШИ ===
    document.addEventListener('keydown', (e) => {
      // L - получить лид
      if (e.key === 'l' || e.key === 'L') {
        const leadBtn = document.getElementById('getLeadBtn');
        if (leadBtn) leadBtn.click();
      }

      // R - бросить кубик
      if (e.key === 'r' || e.key === 'R') {
        const rollBtn = document.getElementById('rollBtn');
        if (rollBtn) rollBtn.click();
      }

      // ESC - пропустить интро
      if (e.key === 'Escape') {
        if (introOverlay && introOverlay.style.display !== 'none') {
          if (introVideo) introVideo.pause();
          playScrollSound();
          setTimeout(openMain, 300);
        }
      }

      // Space - воспроизвести интро (если видно)
      if (e.key === ' ' && introOverlay && introOverlay.style.display !== 'none') {
        e.preventDefault();
        if (playIntroBtn) playIntroBtn.click();
      }
    });

    // === 9. ПЕРВИЧНАЯ ИНИЦИАЛИЗАЦИЯ ===
    // Начальное заполнение XP
    setTimeout(() => {
      if (xpInner && xpText) {
        const initialFill = Math.min(60, Math.max(12, Math.floor(Math.random() * 48) + 12));
        xpInner.style.transition = 'width 900ms cubic-bezier(.2,.9,.2,1)';
        xpInner.style.width = initialFill + '%';
        xpText.textContent = Math.round((initialFill / 100) * 100) + ' / 100';
      }
    }, 400);

    // Первое подсказка с атмосферным звуком
    setTimeout(() => {
      showToast('Нажми «Воспроизвести интро» или «Пропустить» — затем пробуй L (lead) и R (roll)', 5000);
      // Тихий ambient звук при загрузке
      setTimeout(() => {
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().then(() => {
            playAmbientPad();
          });
        }
      }, 1000);
    }, 900);

    // === 10. ДОБАВЛЯЕМ CSS ДЛЯ АНИМАЦИЙ ===
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.95);
          filter: blur(2px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @keyframes pulseGlow {
        0%, 100% {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.8),
                     0 0 0 0 rgba(126, 231, 135, 0.1);
        }
        50% {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.8),
                     0 0 20px 5px rgba(126, 231, 135, 0.2);
        }
      }

      .toast {
        animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .toast:first-of-type {
        animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                  pulseGlow 3s ease-in-out infinite;
      }

      /* Готическая анимация для кнопок */
      .btn-primary:hover {
        animation: pulseGlow 2s infinite;
      }
    `;
    document.head.appendChild(style);

    // === 11. СЛУЧАЙНЫЕ АТМОСФЕРНЫЕ ЗВУКИ НА ФОНЕ ===
    function playRandomAmbient() {
      if (audioCtx.state !== 'running') return;

      const sounds = [
        () => playBellSound(180 + Math.random() * 60, 0.8 + Math.random()),
        () => playGothicSound('sine', 80 + Math.random() * 40, 1.5, 0.04),
        () => playScrollSound()
      ];

      // Случайный звук каждые 20-40 секунд
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          sounds[Math.floor(Math.random() * sounds.length)]();
        }
        playRandomAmbient();
      }, 20000 + Math.random() * 20000);
    }

    // Запускаем ambient звуки через 10 секунд после загрузки
    setTimeout(() => {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(playRandomAmbient);
      } else {
        playRandomAmbient();
      }
    }, 10000);

    // === 12. ПРОВЕРКА ВСЕХ ЭЛЕМЕНТОВ ===
    console.log('🦇 Готическая RPG визитка загружена');
    console.log('🔊 Аудиосистема:', audioCtx.state);
    console.log('🎮 Элементы управления:', {
      playIntroBtn: !!playIntroBtn,
      skipIntroBtn: !!skipIntroBtn,
      leadBtn: !!leadBtn,
      rollBtn: !!rollBtn
    });

  }); // Конец DOMContentLoaded

})(); // Конец IIFE