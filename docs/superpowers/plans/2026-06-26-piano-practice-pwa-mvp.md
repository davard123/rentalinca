# 钢琴麦克风陪练 PWA — 第 1 期 MVP 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 做一个网页 PWA，导入 MIDI 抽出单音旋律，用麦克风听音，识谱模式下弹对变绿前进、弹错停住并用小键盘提示正确键。

**Architecture:** 纯前端静态站。麦克风音频经 `AnalyserNode` 取时域样本，用 `pitchy` 做单音音高检测，经一个纯逻辑的稳定器（噪音门+去抖+起音）转成 note onset 事件，喂给纯逻辑状态机 `PracticeEngine` 与曲谱比对，驱动 Canvas 瀑布流与小键盘重绘。所有不碰音频/DOM 的逻辑都做成纯函数模块并单元测试。

**Tech Stack:** Vanilla JS (ES modules)、Vite（开发/构建）、Vitest（测试）、`@tonejs/midi`（解析 MIDI）、`pitchy`（音高检测）、Web Audio API、Canvas、PWA(manifest + service worker)。

> **约定**：本计划所有代码与命令都在仓库子目录 `piano-trainer/` 下进行。命令默认在 `piano-trainer/` 目录执行。

---

## 文件结构

```
piano-trainer/
  package.json
  vite.config.js
  index.html
  src/
    noteUtils.js          # 频率↔MIDI 音号、音名、音符匹配（含八度容错）
    practiceEngine.js     # 识谱模式纯逻辑状态机
    midiImporter.js       # 解析 .mid → Score；单音旋律抽取
    pitchStabilizer.js    # 纯逻辑：噪音门 + 去抖 + 起音 → onset 事件
    pitchEngine.js        # 麦克风 + AnalyserNode + pitchy（音频 I/O，人工测）
    fallingNotes.js       # Canvas 瀑布流渲染（人工测）
    miniKeyboard.js       # Canvas 小键盘渲染（人工测）
    main.js               # 外壳：导入、开始/停止、接线、PWA 注册
  public/
    manifest.webmanifest
    sw.js                 # service worker（缓存外壳）
    icon-192.png          # 占位图标（构建期生成或手放）
    icon-512.png
  test/
    noteUtils.test.js
    practiceEngine.test.js
    midiImporter.test.js
    pitchStabilizer.test.js
```

**职责边界**：`noteUtils` / `practiceEngine` / `midiImporter` / `pitchStabilizer` 全是纯逻辑、零依赖 DOM/音频、全单测。`pitchEngine` / `fallingNotes` / `miniKeyboard` 是 I/O 与渲染、人工测。`main.js` 只做接线。

---

## Task 0: 项目脚手架

**Files:**
- Create: `piano-trainer/package.json`
- Create: `piano-trainer/vite.config.js`
- Create: `piano-trainer/index.html`
- Create: `piano-trainer/.gitignore`

- [ ] **Step 1: 创建 package.json**

`piano-trainer/package.json`:
```json
{
  "name": "piano-trainer",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host",
    "test": "vitest run"
  },
  "dependencies": {
    "@tonejs/midi": "^2.0.28",
    "pitchy": "^4.1.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js**

`piano-trainer/vite.config.js`（`base: './'` 让构建产物能放在任意子路径，方便 GitHub/Cloudflare Pages 托管）:
```js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { host: true },
});
```

- [ ] **Step 3: 创建占位 index.html**

`piano-trainer/index.html`:
```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>钢琴陪练</title>
  <link rel="manifest" href="./manifest.webmanifest" />
</head>
<body>
  <div id="app">脚手架就绪</div>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: 创建占位 main.js 与 .gitignore**

`piano-trainer/src/main.js`:
```js
document.getElementById('app').textContent = '脚手架就绪 ✅';
```

`piano-trainer/.gitignore`:
```
node_modules
dist
```

- [ ] **Step 5: 安装依赖并验证开发服务器**

Run: `npm install`
Expected: 安装成功，生成 `node_modules`。

Run: `npm run dev`
Expected: Vite 启动，打印 `http://localhost:5173`；浏览器打开显示「脚手架就绪 ✅」。确认后 Ctrl+C 停止。

- [ ] **Step 6: 验证测试运行器**

Run: `npx vitest run`
Expected: 「No test files found」一类提示但进程正常退出（尚无测试）。

- [ ] **Step 7: 提交**

```bash
git add piano-trainer/package.json piano-trainer/vite.config.js piano-trainer/index.html piano-trainer/src/main.js piano-trainer/.gitignore
git commit -m "chore: scaffold piano-trainer PWA project"
```

---

## Task 1: noteUtils（频率↔音号、音名、匹配）

**Files:**
- Create: `piano-trainer/src/noteUtils.js`
- Test: `piano-trainer/test/noteUtils.test.js`

- [ ] **Step 1: 写失败的测试**

`piano-trainer/test/noteUtils.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { frequencyToMidi, midiToNoteName, notesMatch } from '../src/noteUtils.js';

describe('frequencyToMidi', () => {
  it('A4 440Hz → 69', () => expect(frequencyToMidi(440)).toBe(69));
  it('C4 ~261.63Hz → 60', () => expect(frequencyToMidi(261.63)).toBe(60));
});

describe('midiToNoteName', () => {
  it('60 → C4', () => expect(midiToNoteName(60)).toBe('C4'));
  it('69 → A4', () => expect(midiToNoteName(69)).toBe('A4'));
  it('61 → C#4', () => expect(midiToNoteName(61)).toBe('C#4'));
});

describe('notesMatch', () => {
  it('精确匹配相同音', () => expect(notesMatch(60, 60, false)).toBe(true));
  it('八度容错：72 与 60 同音名 → true', () => expect(notesMatch(72, 60, true)).toBe(true));
  it('八度容错关闭：72 与 60 → false', () => expect(notesMatch(72, 60, false)).toBe(false));
  it('不同音名：61 与 60 → false', () => expect(notesMatch(61, 60, true)).toBe(false));
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run test/noteUtils.test.js`
Expected: FAIL，提示无法从 `../src/noteUtils.js` 导入。

- [ ] **Step 3: 写最小实现**

`piano-trainer/src/noteUtils.js`:
```js
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function frequencyToMidi(freq) {
  return Math.round(69 + 12 * Math.log2(freq / 440));
}

export function midiToNoteName(midi) {
  const octave = Math.floor(midi / 12) - 1;
  return NOTE_NAMES[((midi % 12) + 12) % 12] + octave;
}

export function notesMatch(played, target, octaveTolerant = true) {
  if (octaveTolerant) {
    return (((played % 12) + 12) % 12) === (((target % 12) + 12) % 12);
  }
  return played === target;
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run test/noteUtils.test.js`
Expected: PASS（全部用例通过）。

- [ ] **Step 5: 提交**

```bash
git add piano-trainer/src/noteUtils.js piano-trainer/test/noteUtils.test.js
git commit -m "feat: add noteUtils (freq/midi conversion, note match)"
```

---

## Task 2: PracticeEngine（识谱模式状态机）

**Files:**
- Create: `piano-trainer/src/practiceEngine.js`
- Test: `piano-trainer/test/practiceEngine.test.js`

- [ ] **Step 1: 写失败的测试**

`piano-trainer/test/practiceEngine.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { createPracticeEngine } from '../src/practiceEngine.js';

const score = (midis) => ({
  tempo: 120,
  notes: midis.map((m, i) => ({ midiNote: m, startBeat: i, durationBeats: 1 })),
});

describe('PracticeEngine 识谱模式', () => {
  it('初始目标是第一个音', () => {
    const e = createPracticeEngine();
    e.loadScore(score([60, 62, 64]));
    expect(e.currentTargetNote()).toBe(60);
    expect(e.completedCount()).toBe(0);
  });

  it('弹对则前进到下一个音', () => {
    const e = createPracticeEngine();
    e.loadScore(score([60, 62, 64]));
    const r = e.onDetectedNote(60);
    expect(r.matched).toBe(true);
    expect(e.currentTargetNote()).toBe(62);
    expect(e.completedCount()).toBe(1);
  });

  it('弹错则停住并记录 wasLastWrong', () => {
    const e = createPracticeEngine();
    e.loadScore(score([60, 62]));
    const r = e.onDetectedNote(61);
    expect(r.matched).toBe(false);
    expect(e.currentTargetNote()).toBe(60);
    expect(e.wasLastWrong()).toBe(true);
  });

  it('默认八度容错：高八度也算对', () => {
    const e = createPracticeEngine();
    e.loadScore(score([60]));
    expect(e.onDetectedNote(72).matched).toBe(true);
  });

  it('关闭八度容错：高八度不算对', () => {
    const e = createPracticeEngine({ octaveTolerant: false });
    e.loadScore(score([60]));
    expect(e.onDetectedNote(72).matched).toBe(false);
  });

  it('连续相同音：两次起音各前进一个', () => {
    const e = createPracticeEngine();
    e.loadScore(score([60, 60]));
    expect(e.onDetectedNote(60).matched).toBe(true);
    expect(e.isFinished()).toBe(false);
    expect(e.onDetectedNote(60).finished).toBe(true);
    expect(e.isFinished()).toBe(true);
  });

  it('弹完后再来音返回 finished', () => {
    const e = createPracticeEngine();
    e.loadScore(score([60]));
    e.onDetectedNote(60);
    expect(e.onDetectedNote(60)).toEqual({ matched: false, finished: true });
  });

  it('reset 回到起点', () => {
    const e = createPracticeEngine();
    e.loadScore(score([60, 62]));
    e.onDetectedNote(60);
    e.reset();
    expect(e.currentTargetNote()).toBe(60);
    expect(e.completedCount()).toBe(0);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run test/practiceEngine.test.js`
Expected: FAIL，无法导入 `createPracticeEngine`。

- [ ] **Step 3: 写最小实现**

`piano-trainer/src/practiceEngine.js`:
```js
import { notesMatch } from './noteUtils.js';

export function createPracticeEngine({ octaveTolerant = true } = {}) {
  let notes = [];
  let index = 0;
  let lastWrong = false;

  function setStatuses() {
    notes.forEach((n, i) => {
      n.status = i < index ? 'done' : i === index ? 'current' : 'pending';
    });
  }

  return {
    loadScore(score) {
      notes = score.notes.map((n) => ({ ...n, status: 'pending' }));
      index = 0;
      lastWrong = false;
      setStatuses();
    },
    reset() {
      index = 0;
      lastWrong = false;
      setStatuses();
    },
    onDetectedNote(midiNote) {
      if (this.isFinished()) return { matched: false, finished: true };
      if (notesMatch(midiNote, notes[index].midiNote, octaveTolerant)) {
        index++;
        lastWrong = false;
        setStatuses();
        return { matched: true, finished: this.isFinished() };
      }
      lastWrong = true;
      return { matched: false, finished: false };
    },
    currentTargetNote() {
      return this.isFinished() ? null : notes[index].midiNote;
    },
    completedCount() {
      return index;
    },
    wasLastWrong() {
      return lastWrong;
    },
    isFinished() {
      return index >= notes.length;
    },
    getNotes() {
      return notes;
    },
  };
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run test/practiceEngine.test.js`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add piano-trainer/src/practiceEngine.js piano-trainer/test/practiceEngine.test.js
git commit -m "feat: add PracticeEngine wait-mode state machine"
```

---

## Task 3: MidiImporter（解析 .mid + 单音抽取）

**Files:**
- Create: `piano-trainer/src/midiImporter.js`
- Test: `piano-trainer/test/midiImporter.test.js`

- [ ] **Step 1: 写失败的测试**

`piano-trainer/test/midiImporter.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { Midi } from '@tonejs/midi';
import { extractMonophonic, parseMidi } from '../src/midiImporter.js';

describe('extractMonophonic', () => {
  it('同一时间的多个音取最高音', () => {
    const raw = [
      { midi: 60, timeBeats: 0, durationBeats: 1 },
      { midi: 64, timeBeats: 0, durationBeats: 1 },
      { midi: 62, timeBeats: 1, durationBeats: 1 },
    ];
    const out = extractMonophonic(raw);
    expect(out.map((n) => n.midiNote)).toEqual([64, 62]);
  });

  it('按时间排序输出', () => {
    const raw = [
      { midi: 67, timeBeats: 2, durationBeats: 1 },
      { midi: 60, timeBeats: 0, durationBeats: 1 },
    ];
    expect(extractMonophonic(raw).map((n) => n.midiNote)).toEqual([60, 67]);
  });
});

describe('parseMidi', () => {
  it('解析一段简单旋律', () => {
    const midi = new Midi();
    const track = midi.addTrack();
    track.addNote({ midi: 60, time: 0, duration: 0.5 });
    track.addNote({ midi: 62, time: 0.5, duration: 0.5 });
    track.addNote({ midi: 64, time: 1.0, duration: 0.5 });
    const bytes = midi.toArray();

    const score = parseMidi(bytes.buffer);
    expect(score.notes.map((n) => n.midiNote)).toEqual([60, 62, 64]);
    expect(score.notes.length).toBe(3);
  });

  it('空 MIDI 抛错', () => {
    const empty = new Midi();
    empty.addTrack();
    expect(() => parseMidi(empty.toArray().buffer)).toThrow();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run test/midiImporter.test.js`
Expected: FAIL，无法导入 `extractMonophonic` / `parseMidi`。

- [ ] **Step 3: 写最小实现**

`piano-trainer/src/midiImporter.js`:
```js
import { Midi } from '@tonejs/midi';

// rawNotes: [{ midi, timeBeats, durationBeats }]
// 同一（量化后的）起始时间只保留最高音，再按时间排序。
export function extractMonophonic(rawNotes, quantizeBeats = 0.0625) {
  const groups = new Map();
  for (const n of rawNotes) {
    const key = Math.round(n.timeBeats / quantizeBeats);
    const existing = groups.get(key);
    if (!existing || n.midi > existing.midi) groups.set(key, n);
  }
  return [...groups.values()]
    .sort((a, b) => a.timeBeats - b.timeBeats)
    .map((n) => ({ midiNote: n.midi, startBeat: n.timeBeats, durationBeats: n.durationBeats }));
}

export function parseMidi(arrayBuffer) {
  const midi = new Midi(arrayBuffer);
  const track = midi.tracks.reduce(
    (best, t) => (t.notes.length > (best ? best.notes.length : 0) ? t : best),
    null
  );
  if (!track || track.notes.length === 0) {
    throw new Error('MIDI 文件中找不到音符');
  }
  const ppq = midi.header.ppq;
  const raw = track.notes.map((n) => ({
    midi: n.midi,
    timeBeats: n.ticks / ppq,
    durationBeats: n.durationTicks / ppq,
  }));
  const tempo = midi.header.tempos[0] ? midi.header.tempos[0].bpm : 120;
  return { tempo, notes: extractMonophonic(raw) };
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run test/midiImporter.test.js`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add piano-trainer/src/midiImporter.js piano-trainer/test/midiImporter.test.js
git commit -m "feat: add MIDI importer with monophonic melody extraction"
```

---

## Task 4: PitchStabilizer（噪音门 + 去抖 + 起音）

**Files:**
- Create: `piano-trainer/src/pitchStabilizer.js`
- Test: `piano-trainer/test/pitchStabilizer.test.js`

把"原始音高帧流 → 干净的 note onset 事件"这段纯逻辑独立出来，单测。帧形如 `{ midi, clarity, time }`（time 为毫秒）。`midi` 为 `null` 或 `clarity` 低于阈值视为静音。

- [ ] **Step 1: 写失败的测试**

`piano-trainer/test/pitchStabilizer.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { createPitchStabilizer } from '../src/pitchStabilizer.js';

// 辅助：把一串帧依次 push，收集所有 onset 的 midiNote
function feed(stab, frames) {
  const onsets = [];
  for (const f of frames) {
    const o = stab.push(f);
    if (o) onsets.push(o.midiNote);
  }
  return onsets;
}

describe('createPitchStabilizer', () => {
  it('稳定超过去抖窗口后发出一次 onset，之后不重复', () => {
    const stab = createPitchStabilizer({ clarityThreshold: 0.9, debounceMs: 50 });
    const onsets = feed(stab, [
      { midi: 60, clarity: 0.95, time: 0 },
      { midi: 60, clarity: 0.95, time: 30 },
      { midi: 60, clarity: 0.95, time: 60 }, // 跨过 50ms → onset
      { midi: 60, clarity: 0.95, time: 90 }, // 不重复
    ]);
    expect(onsets).toEqual([60]);
  });

  it('低于置信度阈值不发出', () => {
    const stab = createPitchStabilizer({ clarityThreshold: 0.9, debounceMs: 50 });
    const onsets = feed(stab, [
      { midi: 60, clarity: 0.5, time: 0 },
      { midi: 60, clarity: 0.5, time: 60 },
    ]);
    expect(onsets).toEqual([]);
  });

  it('换音后发出新 onset', () => {
    const stab = createPitchStabilizer({ clarityThreshold: 0.9, debounceMs: 50 });
    const onsets = feed(stab, [
      { midi: 60, clarity: 0.95, time: 0 },
      { midi: 60, clarity: 0.95, time: 60 }, // → 60
      { midi: 62, clarity: 0.95, time: 70 },
      { midi: 62, clarity: 0.95, time: 130 }, // → 62
    ]);
    expect(onsets).toEqual([60, 62]);
  });

  it('静音间隔后相同音可再次触发', () => {
    const stab = createPitchStabilizer({ clarityThreshold: 0.9, debounceMs: 50, silenceGapMs: 60 });
    const onsets = feed(stab, [
      { midi: 60, clarity: 0.95, time: 0 },
      { midi: 60, clarity: 0.95, time: 60 },   // → 60
      { midi: null, clarity: 0, time: 70 },    // 静音开始
      { midi: null, clarity: 0, time: 140 },   // 静音 ≥60ms → 解锁
      { midi: 60, clarity: 0.95, time: 150 },
      { midi: 60, clarity: 0.95, time: 210 },  // → 60 再次
    ]);
    expect(onsets).toEqual([60, 60]);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run test/pitchStabilizer.test.js`
Expected: FAIL，无法导入 `createPitchStabilizer`。

- [ ] **Step 3: 写最小实现**

`piano-trainer/src/pitchStabilizer.js`:
```js
export function createPitchStabilizer({
  clarityThreshold = 0.9,
  debounceMs = 50,
  silenceGapMs = 60,
} = {}) {
  let candidate = null;
  let candidateSince = 0;
  let lastEmitted = null;
  let silentSince = null;

  return {
    push(frame) {
      const isSilent = frame.midi == null || frame.clarity < clarityThreshold;
      if (isSilent) {
        if (silentSince == null) silentSince = frame.time;
        if (frame.time - silentSince >= silenceGapMs) lastEmitted = null;
        candidate = null;
        candidateSince = 0;
        return null;
      }
      silentSince = null;
      if (frame.midi !== candidate) {
        candidate = frame.midi;
        candidateSince = frame.time;
        return null;
      }
      if (frame.time - candidateSince >= debounceMs && frame.midi !== lastEmitted) {
        lastEmitted = frame.midi;
        return { midiNote: frame.midi, time: frame.time };
      }
      return null;
    },
    reset() {
      candidate = null;
      candidateSince = 0;
      lastEmitted = null;
      silentSince = null;
    },
  };
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run test/pitchStabilizer.test.js`
Expected: PASS。

- [ ] **Step 5: 跑全部测试确保无回归**

Run: `npx vitest run`
Expected: 四个测试文件全部 PASS。

- [ ] **Step 6: 提交**

```bash
git add piano-trainer/src/pitchStabilizer.js piano-trainer/test/pitchStabilizer.test.js
git commit -m "feat: add pitch stabilizer (noise gate, debounce, onset)"
```

---

## Task 5: PitchEngine（麦克风 + pitchy，音频 I/O）

**Files:**
- Create: `piano-trainer/src/pitchEngine.js`

此模块碰麦克风与浏览器音频，无法单测，用人工验证。把 `AnalyserNode` 取到的时域样本交给 `pitchy` 检测，加 RMS 噪音门，再经 `pitchStabilizer` 转成 onset，回调 `onOnset(midiNote)`。

> 实现说明：MVP 选用 `AnalyserNode` + `pitchy`（主线程 rAF 轮询），不用 AudioWorklet —— 在 iOS Safari 上更稳、实现更简单；延迟（~46ms 窗口）对识谱模式无影响。`pitchEngine` 内部封装该选择，未来可替换为 worklet 而不影响其它模块。

- [ ] **Step 1: 写实现**

`piano-trainer/src/pitchEngine.js`:
```js
import { PitchDetector } from 'pitchy';
import { frequencyToMidi } from './noteUtils.js';
import { createPitchStabilizer } from './pitchStabilizer.js';

const RMS_GATE = 0.01;

export async function createPitchEngine({ onOnset, onPitch } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const detector = PitchDetector.forFloat32Array(analyser.fftSize);
  const buf = new Float32Array(detector.inputLength);
  const stab = createPitchStabilizer();
  let rafId = null;

  function rms(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) sum += arr[i] * arr[i];
    return Math.sqrt(sum / arr.length);
  }

  function tick() {
    analyser.getFloatTimeDomainData(buf);
    const level = rms(buf);
    let midi = null;
    let clarity = 0;
    if (level > RMS_GATE) {
      const [freq, clr] = detector.findPitch(buf, ctx.sampleRate);
      if (freq > 0 && isFinite(freq)) {
        midi = frequencyToMidi(freq);
        clarity = clr;
      }
    }
    if (onPitch) onPitch(midi);
    const onset = stab.push({ midi, clarity, time: performance.now() });
    if (onset && onOnset) onOnset(onset.midiNote);
    rafId = requestAnimationFrame(tick);
  }

  return {
    async start() {
      if (ctx.state === 'suspended') await ctx.resume();
      if (rafId == null) tick();
    },
    stop() {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
      stream.getTracks().forEach((t) => t.stop());
      ctx.close();
    },
  };
}
```

- [ ] **Step 2: 临时接线做人工验证**

把 `piano-trainer/src/main.js` 临时替换为：
```js
import { createPitchEngine } from './pitchEngine.js';
import { midiToNoteName } from './noteUtils.js';

const app = document.getElementById('app');
app.innerHTML = '<button id="go">开麦克风测试</button><div id="out">—</div>';
document.getElementById('go').addEventListener('click', async () => {
  const out = document.getElementById('out');
  try {
    const engine = await createPitchEngine({
      onOnset: (m) => { out.textContent = '听到起音: ' + midiToNoteName(m); },
    });
    await engine.start();
    out.textContent = '已开麦，弹琴试试…';
  } catch (e) {
    out.textContent = '错误: ' + e.message;
  }
});
```

- [ ] **Step 3: 人工验证**

Run: `npm run dev`
在电脑浏览器打开 `http://localhost:5173`（localhost 豁免 HTTPS），点「开麦克风测试」，允许麦克风。对着电钢单音弹 C4、D4、E4…
Expected: 每弹一个清晰单音，页面显示对应音名（如「听到起音: C4」）。八度可能偶有偏差（已知，后续靠状态机八度容错兜底）。确认能基本跟上后停止。

- [ ] **Step 4: 提交**

```bash
git add piano-trainer/src/pitchEngine.js piano-trainer/src/main.js
git commit -m "feat: add mic pitch engine (AnalyserNode + pitchy)"
```

---

## Task 6: FallingNotesRenderer（瀑布流 Canvas）

**Files:**
- Create: `piano-trainer/src/fallingNotes.js`

识谱模式自定节奏，渲染策略：以 `currentIndex` 为中心横向铺开音符块，当前目标对齐到固定判定线 X；已完成=绿、当前=高亮、待弹=灰。音高决定纵向位置。

- [ ] **Step 1: 写实现**

`piano-trainer/src/fallingNotes.js`:
```js
const COLORS = { done: '#34c759', current: '#ffd60a', pending: '#3a3a3c' };

export function createFallingNotes(canvas) {
  const ctx = canvas.getContext('2d');

  function draw(notes, currentIndex) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!notes.length) return;

    const judgeX = w * 0.3;       // 判定线
    const noteW = 56;
    const gap = 12;
    const step = noteW + gap;

    // 音高 → 纵向位置（取曲谱音域映射到画布）
    const midis = notes.map((n) => n.midiNote);
    const lo = Math.min(...midis);
    const hi = Math.max(...midis);
    const span = Math.max(1, hi - lo);
    const yOf = (m) => h - 40 - ((m - lo) / span) * (h - 90);

    // 判定线
    ctx.strokeStyle = '#ff453a';
    ctx.beginPath();
    ctx.moveTo(judgeX, 0);
    ctx.lineTo(judgeX, h);
    ctx.stroke();

    for (let i = 0; i < notes.length; i++) {
      const x = judgeX + (i - currentIndex) * step;
      if (x < -noteW || x > w) continue;
      const y = yOf(notes[i].midiNote);
      ctx.fillStyle = COLORS[notes[i].status] || COLORS.pending;
      ctx.fillRect(x, y - 12, noteW, 24);
    }
  }

  return { draw };
}
```

- [ ] **Step 2: 人工验证（临时挂到页面）**

在 Task 8 接线后统一验证；此处先确认无语法错误：
Run: `npx vitest run`
Expected: 现有测试仍全 PASS（本文件不被测试导入，确保未破坏构建）。

- [ ] **Step 3: 提交**

```bash
git add piano-trainer/src/fallingNotes.js
git commit -m "feat: add falling-notes canvas renderer"
```

---

## Task 7: MiniKeyboard（小键盘提示 Canvas）

**Files:**
- Create: `piano-trainer/src/miniKeyboard.js`

画两个八度的钢琴键，高亮当前目标音对应的键（按音名，即 `midi % 12`）；当 `wasLastWrong` 为真时高亮色更醒目（红橙）。

- [ ] **Step 1: 写实现**

`piano-trainer/src/miniKeyboard.js`:
```js
// 一个八度内白键与黑键的半音序号
const WHITE = [0, 2, 4, 5, 7, 9, 11];
const BLACK = [1, 3, 6, 8, 10];

export function createMiniKeyboard(canvas) {
  const ctx = canvas.getContext('2d');
  const OCTAVES = 2;

  function draw(targetMidi, wrong) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (targetMidi == null) return;

    const targetClass = ((targetMidi % 12) + 12) % 12;
    const highlight = wrong ? '#ff453a' : '#ffd60a';
    const whiteCount = WHITE.length * OCTAVES;
    const ww = w / whiteCount;

    // 白键
    let wi = 0;
    for (let oct = 0; oct < OCTAVES; oct++) {
      for (const semi of WHITE) {
        const x = wi * ww;
        ctx.fillStyle = semi === targetClass ? highlight : '#ffffff';
        ctx.fillRect(x, 0, ww - 1, h);
        ctx.strokeStyle = '#888';
        ctx.strokeRect(x, 0, ww - 1, h);
        wi++;
      }
    }
    // 黑键
    wi = 0;
    const whiteIndexInOct = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
    for (let oct = 0; oct < OCTAVES; oct++) {
      for (const semi of BLACK) {
        // 黑键位于其左侧白键与右侧白键之间
        const leftWhiteSemi = semi - 1;
        const idxInOct = whiteIndexInOct[leftWhiteSemi];
        const globalWhite = oct * WHITE.length + idxInOct;
        const x = (globalWhite + 1) * ww - ww * 0.3;
        ctx.fillStyle = semi === targetClass ? highlight : '#000000';
        ctx.fillRect(x, 0, ww * 0.6, h * 0.6);
      }
    }
  }

  return { draw };
}
```

- [ ] **Step 2: 确认未破坏构建**

Run: `npx vitest run`
Expected: 现有测试全 PASS。

- [ ] **Step 3: 提交**

```bash
git add piano-trainer/src/miniKeyboard.js
git commit -m "feat: add mini-keyboard hint renderer"
```

---

## Task 8: 外壳接线（导入 + 开始/停止 + 端到端）

**Files:**
- Modify: `piano-trainer/index.html`
- Modify: `piano-trainer/src/main.js`

- [ ] **Step 1: 更新 index.html 结构**

`piano-trainer/index.html` 的 `<body>` 替换为：
```html
<body>
  <div id="app">
    <h1>钢琴麦克风陪练（识谱模式）</h1>
    <p>
      <input type="file" id="file" accept=".mid,.midi" />
      <button id="mic">开启麦克风</button>
      <button id="reset">重来</button>
    </p>
    <p id="status">请先导入一个 .mid 文件</p>
    <canvas id="falling" width="800" height="260" style="background:#1c1c1e;width:100%;max-width:800px"></canvas>
    <canvas id="keyboard" width="800" height="120" style="background:#444;width:100%;max-width:800px"></canvas>
  </div>
  <script type="module" src="./src/main.js"></script>
</body>
```

- [ ] **Step 2: 写完整接线 main.js**

`piano-trainer/src/main.js`:
```js
import { parseMidi } from './midiImporter.js';
import { createPracticeEngine } from './practiceEngine.js';
import { createPitchEngine } from './pitchEngine.js';
import { createFallingNotes } from './fallingNotes.js';
import { createMiniKeyboard } from './miniKeyboard.js';
import { midiToNoteName } from './noteUtils.js';

const practice = createPracticeEngine({ octaveTolerant: true });
const falling = createFallingNotes(document.getElementById('falling'));
const keyboard = createMiniKeyboard(document.getElementById('keyboard'));
const statusEl = document.getElementById('status');

let pitchEngine = null;
let loaded = false;

function render() {
  const notes = practice.getNotes();
  falling.draw(notes, practice.completedCount());
  keyboard.draw(practice.currentTargetNote(), practice.wasLastWrong());
  if (practice.isFinished()) {
    statusEl.textContent = '🎉 全曲完成！';
  } else {
    statusEl.textContent =
      `进度 ${practice.completedCount()}/${notes.length} · 目标音 ` +
      midiToNoteName(practice.currentTargetNote()) +
      (practice.wasLastWrong() ? ' · 刚才弹错了，看小键盘提示' : '');
  }
}

document.getElementById('file').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const buf = await f.arrayBuffer();
    const score = parseMidi(buf);
    practice.loadScore(score);
    loaded = true;
    render();
  } catch (err) {
    statusEl.textContent = '导入失败: ' + err.message;
  }
});

document.getElementById('mic').addEventListener('click', async () => {
  if (!loaded) {
    statusEl.textContent = '请先导入 .mid 文件';
    return;
  }
  if (pitchEngine) return;
  try {
    pitchEngine = await createPitchEngine({
      onOnset: (m) => {
        practice.onDetectedNote(m);
        render();
      },
    });
    await pitchEngine.start();
    statusEl.textContent = '已开麦，开始弹吧…';
  } catch (err) {
    statusEl.textContent = '麦克风错误: ' + err.message + '（iOS 需 HTTPS/localhost）';
  }
});

document.getElementById('reset').addEventListener('click', () => {
  practice.reset();
  render();
});
```

- [ ] **Step 3: 端到端人工验证（电脑）**

Run: `npm run dev`
打开 `http://localhost:5173`：① 导入一个简单单音旋律 `.mid`（如自备的 C 大调音阶；没有可用任意单音 MIDI）。② 点「开启麦克风」允许权限。③ 对着电钢按谱弹。
Expected:
- 弹对当前目标音 → 瀑布流该音变绿、整条前进、状态显示新目标音。
- 弹错音 → 不前进，小键盘高亮正确键并显示「刚才弹错了」。
- 弹完 → 显示「全曲完成」。
- 点「重来」回到开头。

- [ ] **Step 4: 确认单测无回归**

Run: `npx vitest run`
Expected: 全部 PASS。

- [ ] **Step 5: 提交**

```bash
git add piano-trainer/index.html piano-trainer/src/main.js
git commit -m "feat: wire up import, mic, practice engine, and renderers"
```

---

## Task 9: PWA（manifest + service worker）

**Files:**
- Create: `piano-trainer/public/manifest.webmanifest`
- Create: `piano-trainer/public/sw.js`
- Create: `piano-trainer/public/icon-192.png`（占位图标）
- Create: `piano-trainer/public/icon-512.png`（占位图标）
- Modify: `piano-trainer/src/main.js`（注册 service worker）

- [ ] **Step 1: 创建 manifest**

`piano-trainer/public/manifest.webmanifest`:
```json
{
  "name": "钢琴麦克风陪练",
  "short_name": "钢琴陪练",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#1c1c1e",
  "theme_color": "#1c1c1e",
  "icons": [
    { "src": "./icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "./icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: 创建 service worker**

`piano-trainer/public/sw.js`:
```js
const CACHE = 'piano-trainer-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
```

- [ ] **Step 3: 生成占位图标**

Run（在 `piano-trainer/` 下，用 Node 生成纯色 PNG 占位）:
```bash
node -e "const fs=require('fs');const png=Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63646060f80f00010101001b1f7e7e0000000049454e44ae426082','hex');fs.writeFileSync('public/icon-192.png',png);fs.writeFileSync('public/icon-512.png',png);"
```
Expected: 生成两个 1x1 PNG 占位文件（仅为让 manifest 合法；后续可替换为真图标）。

- [ ] **Step 4: 在 main.js 末尾注册 service worker**

在 `piano-trainer/src/main.js` 文件**末尾追加**：
```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
```

- [ ] **Step 5: 构建并本地预览验证**

Run: `npm run build`
Expected: 构建成功，生成 `dist/`，其中包含 `manifest.webmanifest`、`sw.js`、图标。

Run: `npm run preview`
打开预览地址，DevTools → Application：确认 manifest 被识别、service worker 已注册。
Expected: 无报错；可见「Add to Home Screen」可用。

- [ ] **Step 6: 提交**

```bash
git add piano-trainer/public piano-trainer/src/main.js
git commit -m "feat: add PWA manifest, service worker, and icons"
```

---

## Task 10: 部署到 HTTPS 并在 iPhone/iPad 上验收

**Files:** 无新增（部署与人工验收）。

- [ ] **Step 1: 部署**

把 `piano-trainer/dist/`（或整个 `piano-trainer/` 配合构建）部署到任一免费 HTTPS 静态站（Cloudflare Pages / GitHub Pages / Netlify）。
Expected: 拿到一个 `https://…` 地址。

- [ ] **Step 2: iOS 安装**

iPhone/iPad Safari 打开该 HTTPS 地址 → 分享 → 添加到主屏幕 → 从主屏幕图标启动。
Expected: 全屏 standalone 启动；点开启麦克风时弹出权限请求并能授予。

- [ ] **Step 3: 验收标准（来自 spec 第 8 节）**

对着电钢慢速弹 C 大调音阶（C4→C5）：
Expected:
- App 正确跟随，≥95% 不误停、不漏判。
- 故意弹错音 → 停住并在小键盘高亮正确目标键。
- 弹对错音后再弹对 → 正常继续前进。

- [ ] **Step 4: 记录结果**

把验收观察（识别率、误停场景、需调参的阈值）记到 `piano-trainer/NOTES.md`，作为第 2 期调参输入。
```bash
git add piano-trainer/NOTES.md
git commit -m "docs: record MVP acceptance test results"
```

---

## 自检（计划 vs spec）

- **范围覆盖**：麦克风单音识别(Task 4/5)、导入 MIDI 抽单音(Task 3)、瀑布流(Task 6)、识谱状态机弹对变绿/弹错停住(Task 2/8)、小键盘提示(Task 7)、八度容错默认开(Task 1/2)、PWA(Task 9)、HTTPS 部署须知(Task 10) —— 均有对应任务。
- **占位扫描**：无 TBD/TODO；图标用真实生成命令（非占位描述）；所有代码步骤含完整代码。
- **类型/命名一致性**：`Score = { tempo, notes:[{midiNote,startBeat,durationBeats}] }` 在 Task 3 产出、Task 2/8 消费一致；`createPitchEngine({onOnset})`、`createPracticeEngine().onDetectedNote/currentTargetNote/completedCount/wasLastWrong/getNotes/isFinished` 在 Task 2 定义、Task 5/8 调用一致；`createFallingNotes(canvas).draw(notes,index)`、`createMiniKeyboard(canvas).draw(targetMidi,wrong)` 定义与调用一致。
