import { useState } from "react";
import {
  BookOpen, Brain, Check, X, ChevronDown, Play, RotateCcw, Award, Sparkles,
} from "lucide-react";
import { CONCEPTS, CURRICULUM, QUIZ, FLUENCY_LEVELS } from "../../config/learn.js";
import { tint } from "../../config/palette.js";
import { usePersistedState } from "../../lib/usePersistedState.js";
import Insight from "../ui/Insight.jsx";

const ALL_IDS = CURRICULUM.flatMap((t) => t.concepts);

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const tierOf = (id) => CURRICULUM.find((t) => t.concepts.includes(id));

export default function Fluency() {
  // Persisted: your fluency survives refresh — the dashboard remembers what you know.
  const [mastered, setMastered] = usePersistedState("ge.fluency.mastered", {});
  const [best, setBest] = usePersistedState("ge.fluency.best", 0);

  const [quiz, setQuiz] = useState(null);   // { order, i, score, picked }
  const [openId, setOpenId] = useState(null);

  const masteredCount = ALL_IDS.filter((id) => mastered[id]).length;
  const level = [...FLUENCY_LEVELS].reverse().find((l) => masteredCount >= l.min);

  const startQuiz = () => {
    // Unmastered concepts first, then reinforce known ones.
    const fresh = shuffle(ALL_IDS.filter((id) => !mastered[id]));
    const known = shuffle(ALL_IDS.filter((id) => mastered[id]));
    setQuiz({ order: [...fresh, ...known].slice(0, 6), i: 0, score: 0, picked: null });
  };

  const pick = (idx) => {
    if (quiz.picked != null) return;
    const id = quiz.order[quiz.i];
    const correct = idx === QUIZ[id].answer;
    if (correct) setMastered((p) => ({ ...p, [id]: true }));
    setQuiz((q) => ({ ...q, picked: idx, score: q.score + (correct ? 1 : 0) }));
  };

  const next = () => {
    if (quiz.i + 1 >= quiz.order.length) {
      if (quiz.score > best) setBest(quiz.score);
      setQuiz({ ...quiz, i: quiz.i + 1 });          // done screen
    } else {
      setQuiz((q) => ({ ...q, i: q.i + 1, picked: null }));
    }
  };

  const resetProgress = () => { setMastered({}); setBest(0); setQuiz(null); };

  const running = quiz && quiz.i < quiz.order.length;
  const done = quiz && quiz.i >= quiz.order.length;
  const cur = running ? quiz.order[quiz.i] : null;
  const curTier = cur ? tierOf(cur) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 animate-fade-up">
      {/* Header */}
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-violet">
          <BookOpen className="h-3.5 w-3.5" /> Fluency · Your training ground
        </div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">Speak the dashboard's language</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
          Every term here is one the engine actually runs on. Master all {ALL_IDS.length} and nothing on this dashboard —
          or in a budget speech, an MPC statement, or a GDP release — will read as noise again.
        </p>
      </div>

      {/* Fluency meter */}
      <div className="rounded-xl border border-line p-5" style={{ background: "linear-gradient(145deg, #131614 0%, #101311 100%)" }}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-2">Your fluency</div>
            <div className="mt-1 flex items-baseline gap-2.5">
              <span className="font-mono text-4xl font-bold" style={{ color: level.color, textShadow: `0 0 24px ${tint(level.color, 0.4)}` }}>
                {level.label}
              </span>
              <span className="font-mono text-sm text-muted-2">{masteredCount}/{ALL_IDS.length} concepts</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-2">Best quiz run</div>
            <div className="mt-0.5 flex items-center justify-end gap-1.5 font-mono text-sm text-signal">
              <Award className="h-3.5 w-3.5" /> {best}/6
            </div>
          </div>
        </div>

        {/* tier-segmented progress */}
        <div className="mt-4 flex gap-1.5">
          {CURRICULUM.map((t) => {
            const got = t.concepts.filter((id) => mastered[id]).length;
            return (
              <div key={t.id} className="flex-1">
                <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" style={{ background: "rgba(35,40,35,0.8)" }}>
                  {t.concepts.map((id) => (
                    <div key={id} className="h-full flex-1 transition-colors duration-300"
                      style={{ background: mastered[id] ? t.color : "transparent", boxShadow: mastered[id] ? `0 0 6px ${tint(t.color, 0.5)}` : "none" }} />
                  ))}
                </div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-wider" style={{ color: got === t.concepts.length ? t.color : "#6B7068" }}>
                  {t.label} {got}/{t.concepts.length}
                </div>
              </div>
            );
          })}
        </div>

        {/* level ladder */}
        <div className="mt-3 flex justify-between border-t border-line/60 pt-2.5 font-mono text-[9px] uppercase tracking-wider">
          {FLUENCY_LEVELS.map((l) => (
            <span key={l.label} style={{ color: masteredCount >= l.min ? l.color : "#2A2F2A" }}>
              {l.label} {l.min > 0 && <span className="opacity-60">{l.min}+</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Quiz */}
      <div className="mt-5 rounded-xl border p-5"
        style={{ borderColor: tint("#C77DFF", 0.35), background: `linear-gradient(135deg, ${tint("#C77DFF", 0.07)}, #101311 65%)` }}>
        {!quiz && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2" style={{ background: tint("#C77DFF", 0.15) }}>
                <Brain className="h-5 w-5 text-purple" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-ink">Test yourself — 6 questions</div>
                <div className="text-[12px] text-muted">Unmastered concepts come first. A right answer marks the concept as known.</div>
              </div>
            </div>
            <button onClick={startQuiz}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold text-base transition-all"
              style={{ background: "linear-gradient(135deg, #C77DFF, #9d5fd3)", boxShadow: "0 0 16px rgba(199,125,255,0.3)" }}>
              <Play className="h-3.5 w-3.5" /> Start quiz
            </button>
          </div>
        )}

        {running && (
          <div>
            <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-muted-2">
              <span>Question {quiz.i + 1} / {quiz.order.length}</span>
              <span className="flex items-center gap-2">
                <span className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider" style={{ background: tint(curTier.color, 0.14), color: curTier.color }}>
                  {curTier.label}
                </span>
                score {quiz.score}
              </span>
            </div>
            <div className="text-[15px] font-semibold leading-snug text-ink">{QUIZ[cur].q}</div>
            <div className="mt-3 space-y-2">
              {QUIZ[cur].options.map((opt, idx) => {
                const isAnswer = idx === QUIZ[cur].answer;
                const isPicked = quiz.picked === idx;
                const revealed = quiz.picked != null;
                return (
                  <button key={idx} onClick={() => pick(idx)} disabled={revealed}
                    className="flex w-full items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-[13px] transition-all disabled:cursor-default"
                    style={
                      revealed && isAnswer
                        ? { borderColor: "rgba(127,181,138,0.6)", background: "rgba(127,181,138,0.08)", color: "#7FB58A" }
                        : revealed && isPicked
                        ? { borderColor: "rgba(216,115,94,0.6)", background: "rgba(216,115,94,0.08)", color: "#D8735E" }
                        : { borderColor: "rgba(35,40,35,1)", background: "rgba(19,22,20,0.6)", color: "#ECEAE3" }
                    }>
                    {revealed && isAnswer ? <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      : revealed && isPicked ? <X className="mt-0.5 h-4 w-4 shrink-0" />
                      : <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-muted-2 font-mono text-[9px] text-muted-2">{String.fromCharCode(65 + idx)}</span>}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {quiz.picked != null && (
              <div className="mt-3 rounded-lg border border-line bg-base/40 px-3.5 py-2.5 text-[12px] leading-relaxed text-muted">
                <span className="font-semibold" style={{ color: curTier.color }}>Why: </span>{QUIZ[cur].why}
              </div>
            )}
            {quiz.picked != null && (
              <button onClick={next}
                className="mt-3 rounded-lg px-4 py-2 text-[13px] font-semibold text-base"
                style={{ background: "linear-gradient(135deg, #C77DFF, #9d5fd3)" }}>
                {quiz.i + 1 >= quiz.order.length ? "Finish" : "Next question"}
              </button>
            )}
          </div>
        )}

        {done && (
          <div className="text-center">
            <Sparkles className="mx-auto h-6 w-6 text-purple" />
            <div className="mt-2 font-display text-xl font-semibold text-ink">{quiz.score}/{quiz.order.length}</div>
            <p className="mt-1 text-[13px] text-muted">
              {quiz.score === quiz.order.length ? "Perfect run. The model has no secrets from you."
                : quiz.score >= 4 ? "Solid — the misses are marked below, worth one more look."
                : "Good start. Read the tiers below and run it again — fluency is repetition."}
            </p>
            <button onClick={startQuiz}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold text-base"
              style={{ background: "linear-gradient(135deg, #C77DFF, #9d5fd3)" }}>
              <Play className="h-3.5 w-3.5" /> Run it again
            </button>
          </div>
        )}
      </div>

      <div className="mt-5">
        <Insight color="#A99BF5" label="Why this works">
          Fluency isn't memorising definitions — it's seeing the machine behind the words. Every term below is a moving part
          of the model you can go poke in the Solver, Sectors and Diagnosis tabs. Learn it here, then watch it move there.
        </Insight>
      </div>

      {/* Curriculum */}
      <div className="mt-6 space-y-6">
        {CURRICULUM.map((t) => (
          <div key={t.id}>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider" style={{ color: t.color }}>
                <span className="h-2 w-2 rounded-full" style={{ background: t.color }} /> {t.label}
              </h2>
              <span className="font-mono text-[11px] text-muted-2">{t.concepts.filter((id) => mastered[id]).length}/{t.concepts.length} known</span>
            </div>
            <p className="mb-2.5 text-[12px] text-muted-2">{t.blurb}</p>
            <div className="space-y-2">
              {t.concepts.map((id) => {
                const c = CONCEPTS[id];
                const open = openId === id;
                const known = mastered[id];
                return (
                  <div key={id} className="overflow-hidden rounded-xl border transition-colors"
                    style={{ borderColor: known ? tint(t.color, 0.4) : "rgba(35,40,35,1)", background: "linear-gradient(145deg, #131614 0%, #101311 100%)" }}>
                    <button onClick={() => setOpenId(open ? null : id)} className="flex w-full items-center gap-2.5 px-4 py-3 text-left">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border"
                        style={known ? { background: t.color, borderColor: t.color, color: "#0C0E0D" } : { borderColor: "#6B7068" }}>
                        {known && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                      <span className="flex-1 text-[14px] font-medium text-ink">{c.title}</span>
                      <ChevronDown className={`h-4 w-4 text-muted-2 transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && (
                      <div className="border-t border-line/60 px-4 py-3">
                        <p className="text-[12.5px] leading-relaxed text-muted">{c.body}</p>
                        <button
                          onClick={() => setMastered((p) => ({ ...p, [id]: !p[id] }))}
                          className="mt-2.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors"
                          style={known
                            ? { borderColor: "rgba(35,40,35,1)", color: "#8A8F88" }
                            : { borderColor: tint(t.color, 0.5), color: t.color }}>
                          {known ? "Mark as unknown" : "I know this — mark it"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-line px-4 py-3" style={{ background: "rgba(12,14,13,0.5)" }}>
        <span className="font-mono text-[11px] text-muted-2">Progress is saved on this device.</span>
        <button onClick={resetProgress} className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-alert/40 hover:text-alert">
          <RotateCcw className="h-3.5 w-3.5" /> Reset progress
        </button>
      </div>
    </div>
  );
}
