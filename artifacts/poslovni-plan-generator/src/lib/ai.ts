import type { Path1State, Path2State, Path3State } from "../types";

export interface IPARDAIContent {
  karakteristikeProizvoda: string;
  linijeProizvodnje: string;
  organizacijaPoslova: string;
  tehnoloskaOpremljenost: string;
  prosirenjePrograma: string;
  trzistaNabavke: string;
  trzistaProdaje: string;
  radnaSnagaNarativ: string;
  distribucija: string;
  promocija: string;
  zakljucak1: string;
  zakljucak2: string;
  zakljucak3: string;
}

export const AI_PLACEHOLDER: IPARDAIContent = {
  karakteristikeProizvoda: "[АИ: опис финалних производа газдинства]",
  linijeProizvodnje: "[АИ: фазе производног процеса]",
  organizacijaPoslova: "[АИ: опис организације рада]",
  tehnoloskaOpremljenost: "[АИ: постојећи техничко-технолошки услови]",
  prosirenjePrograma: "[АИ: могућност проширења производног програма]",
  trzistaNabavke: "[АИ: опис тржишта набавке]",
  trzistaProdaje: "[АИ: опис тржишта продаје]",
  radnaSnagaNarativ: "[АИ: опис потреба за радном снагом]",
  distribucija: "[АИ: канали дистрибуције]",
  promocija: "[АИ: начин промоције]",
  zakljucak1: "[АИ: закључна оцена оправданости пројекта]",
  zakljucak2: "[АИ: ефекти реализације инвестиције]",
  zakljucak3: "[АИ: тржишна оцена и потврда улагања]",
};

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  if (start !== -1 && end > start) return text.slice(start, end + 1);
  return text;
}

function buildPrompt(s: Path1State): string {
  const kulture   = s.kulture.length
    ? s.kulture.map(k => `${k.naziv} (${k.povrsina_ha} ha)`).join(", ")
    : "—";
  const proizvodi = s.proizvodi.length
    ? s.proizvodi.map(p => `${p.naziv} (${p.jedinicaMere}, цена ${p.prodajnaCena} РСД)`).join(", ")
    : "—";
  const oprema    = s.osnSredstva.length
    ? s.osnSredstva.map(o => `${o.naziv} x${o.kolicina}`).join(", ")
    : "—";

  return `Ти си искусни консултант за израду IPARD пословних планова у Републици Србији са вишегодишњим искуством у успешном аплицирању за IPARD мере подршке.

ЗАДАТАК: Напиши нарративне делове пословног плана за IPARD Меру 1 — Инвестиције у физичка средства пољопривредних газдинстава.

⚠ КРИТИЧНО — ПРЕД СВИМ ДРУГИМ ПРАВИЛИМА:
Све вредности JSON поља МОРАЈУ бити написане ИСКЉУЧИВО СРПСКИМ ЋИРИЛИЧНИМ ПИСМОМ.
Ниједна реч латиницом није дозвољена осим скраћеница: IPARD, PDV, APR.
Ако напишеш "gazdinstvo", "nosилac", "investicija" или bilo koju reč латиницом — одговор је неважећи.
Тачни примери: "газдинство" (НЕ "gazdinstvo"), "носилац" (НЕ "носилac"), "инвестиција" (НЕ "investicija").

ОБАВЕЗНА ПРАВИЛА СТИЛА (кршење правила је неприхватљиво):
1. Искључиво ТРЕЋЕ ЛИЦЕ — никада "наши", "наша", "наше", "ми". Користи: "газдинство", "носилац пројекта", "корисник IPARD подршке", "привредни субјект".
2. Формалан, стручан, бирократски регистар — језик службених докумената Министарства пољопривреде РС.
3. Свако поље: 5–7 граматички беспрекорних реченица, богато стручном терминологијом. Свако поље мора директно референцирати конкретне податке газдинства (назив носиоца, опрему, биљне културе, производе) — без генеричких реченица које могу бити копиране из другог пословног плана.
4. IPARD терминологија: "предмет инвестиције", "инвестициони пројекат", "IPARD подршка", "унапређење конкурентности", "одрживост производње", "диверзификација прихода", "техничко-технолошко унапређење", "тржишна позиција", "пословни резултати".
5. Текст мора бити специфичан за дате податке — не генерички.
6. ПАДЕЖИ — обавезна правила:
   - "газдинство" у nominativu: "Газдинство обавља..." / "Газдинство планира..."
   - "газдинства" у genitivu: "производи газдинства", "циљ газдинства", "оцена газдинства"
   - "газдинству" у dativu: "омогућиће газдинству да...", "доприноси газдинству"
   - Назив носиоца пројекта НИКАД не мењати у падежима — остаје у номинативу
   - Провери сваку реченицу — да ли именица "газдинство" стоји у правом падежу
7. Без граматичких грешака — провери сваку реченицу.
8. Ћирилично писмо у свим вредностима JSON поља без изузетка.

ПОДАЦИ О ГАЗДИНСТВУ:
- Носилац пројекта / фирма: ${s.tabela21.imeNaziv || s.tabela11.investitor || "—"}
- Делатност: ${s.opisAktivnosti || "пољопривредна производња"}
- Предмет инвестиције: ${s.namenaInvesticije || "—"}
- Опрема (предмет набавке): ${oprema}
- Биљне културе у производњи: ${kulture}
- Производи / услуге: ${proizvodi}
- Број стално запослених радника: ${s.radnaSnaga_broj}
- Економски век пројекта: ${s.ekonomskiVek} година

ПРИМЕР ДОБРОГ СТИЛА (угледај се на ово):
"Газдинство ${s.tabela21.imeNaziv || s.tabela11.investitor || "носилац пројекта"} обавља регистровану пољопривредну делатност са дугогодишњим искуством у примарној производњи. Реализацијом предметне инвестиције створићe се услови за значајно унапређење техничко-технолошке основе производног процеса, чиме ће се повећати конкурентност и тржишна позиција газдинства. Набавка ${oprema !== "—" ? oprema : "предмета инвестиције"} директно доприноси остваривању циљева IPARD програма у погледу модернизације пољопривредне производње."

Врати САМО валидни JSON објекат са тачно овим кључевима (без markdown, без икаквог текста изван JSON-а):
{
  "karakteristikeProizvoda": "Формалан опис производа или услуга газдинства — квалитет, стандарди, потенцијал за тржиште, усклађеност са захтевима купаца.",
  "linijeProizvodnje": "Стручан опис технолошких фаза производног процеса — од припреме до финалног производа, уз навођење кључних операција.",
  "organizacijaPoslova": "Опис организације рада у трећем лицу — структура управљања, подела одговорности, ангажман радне снаге у производном процесу.",
  "tehnoloskaOpremljenost": "Оцена постојећег стања техничко-технолошке опремљености и образложење потребе за инвестицијом ради отклањања идентификованих недостатака.",
  "prosirenjePrograma": "Анализа могућности проширења производног програма кроз реализацију предметне инвестиције — нови капацитети, нови производи, диверзификација.",
  "trzistaNabavke": "Стручна анализа тржишта набавке — извори сировина и репроматеријала, добављачи, услови набавке, процена ризика снабдевања.",
  "trzistaProdaje": "Детаљна анализа тржишта продаје — идентификовани купци и сегменти, канали пласмана, тржишна тражња, конкурентска позиција и ценовна политика.",
  "radnaSnagaNarativ": "Формална анализа потреба за радном снагом у контексту реализације инвестиције — постојећи кадрови, план запошљавања, квалификациона структура.",
  "distribucija": "Стручан опис канала дистрибуције производа — директна продаја, посредници, извоз, уговорни односи са купцима, логистика.",
  "promocija": "Стратегија промоције и тржишног позиционирања — брендирање, огласне активности, сајмови, дигитална промоција, изградња пословних партнерстава.",
  "zakljucak1": "Свеобухватна закључна оцена оправданости инвестиционог пројекта са становишта техничко-технолошких, тржишних и економских критеријума.",
  "zakljucak2": "Оцена очекиваних ефеката реализације инвестиције на унапређење производног процеса, квалитета производа и укупне конкурентности газдинства.",
  "zakljucak3": "Потврда тржишне оправданости улагања и оцена одрживости пројекта у средњорочном и дугорочном периоду."
}`;
}

async function callGemini(prompt: string, apiKey: string, model: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  console.log("[Gemini] Позивам модел:", model);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 4000 },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${body}`);
  }
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// Via Vite proxy to avoid CORS.
async function callGroq(prompt: string, apiKey: string, model: string): Promise<string> {
  console.log("[Groq] Позивам модел:", model);
  const res = await fetch("/groq-proxy/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 4000,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${body}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

export async function generateIPARDContent(s: Path1State): Promise<IPARDAIContent> {
  const geminiKey  = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? "";
  const geminiModel = (import.meta.env.VITE_GEMINI_MODEL  as string | undefined) ?? "gemini-2.0-flash";
  const groqKey    = (import.meta.env.VITE_GROQ_API_KEY   as string | undefined) ?? "";
  const groqModel  = (import.meta.env.VITE_GROQ_MODEL     as string | undefined) ?? "llama-3.3-70b-versatile";

  const prompt = buildPrompt(s);
  let raw = "";

  if (geminiKey) {
    try {
      raw = await callGemini(prompt, geminiKey, geminiModel);
    } catch (geminiErr) {
      console.warn("[AI] Gemini није успео, покушавам Groq:", geminiErr);
      if (groqKey) {
        raw = await callGroq(prompt, groqKey, groqModel);
      } else {
        throw geminiErr;
      }
    }
  } else if (groqKey) {
    raw = await callGroq(prompt, groqKey, groqModel);
  } else {
    console.warn("[AI] Нема постављеног API кључа. Додај VITE_GEMINI_API_KEY или VITE_GROQ_API_KEY у .env");
    return AI_PLACEHOLDER;
  }

  if (!raw) {
    console.error("[AI] Празан одговор");
    return AI_PLACEHOLDER;
  }

  try {
    const parsed = JSON.parse(extractJSON(raw));
    console.log("[AI] Генерисање успешно");
    return { ...AI_PLACEHOLDER, ...parsed } as IPARDAIContent;
  } catch {
    console.error("[AI] JSON парсирање неуспешно. Одговор:\n", raw);
    return AI_PLACEHOLDER;
  }
}

// Path2: Mladi Preduzetnik
export interface Path2AIContent {
  opisDelatnosti: string;
  opisProizvodnog: string;
  opisProsirenjaPrograma: string;
  opisTrzisteNabavke: string;
  opisTrzisteProadaje: string;
  opisRadneSnage: string;
  opisDistribucije: string;
}

export const PATH2_AI_PLACEHOLDER: Path2AIContent = {
  opisDelatnosti: "[АИ: опис делатности и организације послова газдинства]",
  opisProizvodnog: "[АИ: опис постојећих производа и култура на газдинству]",
  opisProsirenjaPrograma: "[АИ: могућности проширења производног програма]",
  opisTrzisteNabavke: "[АИ: опис тржишта набавке и добављача]",
  opisTrzisteProadaje: "[АИ: опис тржишта продаје и купаца]",
  opisRadneSnage: "[АИ: опис потреба за радном снагом]",
  opisDistribucije: "[АИ: канали дистрибуције и начин рекламирања]",
};

function buildPath2Prompt(s: Path2State): string {
  const investitor  = s.investitor  || "—";
  const lokacija    = s.mestoNosioca || s.lokacija || "—";
  const namena      = s.namenaInvesticije || "—";
  const oprema      = s.osnSredstvaP2.length
    ? s.osnSredstvaP2.map(o => `${o.naziv} x${o.kolicina}`).join(", ")
    : "—";
  const proizvodi   = s.proizvodi.length
    ? s.proizvodi.map(p => `${p.naziv} (${p.jedinicaMere}, цена ${p.prodajnaCena} РСД)`).join(", ")
    : "—";

  const zemlja: string[] = [];
  if (s.zem_oranice > 0) zemlja.push(`оранице ${s.zem_oranice} ha`);
  if (s.zem_livade > 0) zemlja.push(`ливаде ${s.zem_livade} ha`);
  if (s.zem_pasnjaci > 0) zemlja.push(`пашњаци ${s.zem_pasnjaci} ha`);
  if (s.zem_vocnjaci > 0) zemlja.push(`воћњаци ${s.zem_vocnjaci} ha`);
  if (s.zem_vinogradi > 0) zemlja.push(`виногради ${s.zem_vinogradi} ha`);
  if (s.zem_sume > 0) zemlja.push(`шуме ${s.zem_sume} ha`);

  const stocni: string[] = [];
  if (s.stoc_krave > 0) stocni.push(`краве ${s.stoc_krave} ком.`);
  if (s.stoc_svinje > 0) stocni.push(`свиње ${s.stoc_svinje} ком.`);
  if (s.stoc_ovce > 0) stocni.push(`овце ${s.stoc_ovce} ком.`);
  if (s.stoc_koze > 0) stocni.push(`козе ${s.stoc_koze} ком.`);
  if (s.stoc_zivina > 0) stocni.push(`живина ${s.stoc_zivina} ком.`);
  if (s.stoc_konji > 0) stocni.push(`коњи ${s.stoc_konji} ком.`);
  if (s.stoc_kunici > 0) stocni.push(`кунићи ${s.stoc_kunici} ком.`);
  if (s.stoc_kosnice > 0) stocni.push(`кошнице пчела ${s.stoc_kosnice} ком.`);

  const meh: string[] = [];
  if (s.meh_traktor > 0) meh.push(`трактор x${s.meh_traktor}`);
  if (s.meh_kombajn > 0) meh.push(`комбајн x${s.meh_kombajn}`);
  if (s.meh_plug > 0) meh.push(`плуг x${s.meh_plug}`);
  if (s.meh_sejalica > 0) meh.push(`сејалица x${s.meh_sejalica}`);
  if (s.meh_prikolica > 0) meh.push(`приколица x${s.meh_prikolica}`);
  if (s.meh_prskAlica > 0) meh.push(`прскалица x${s.meh_prskAlica}`);

  return `Ти си стручни консултант за израду пословних планова за младе пољопривредне произвођаче у Републици Србији.

ЗАДАТАК: Напиши нарративне делове пословног плана за младог предузетника у пољопривреди.

⚠ КРИТИЧНО — ОБАВЕЗНА ПРАВИЛА:
1. Сва поља МОРАЈУ бити написана ИСКЉУЧИВО СРПСКИМ ЋИРИЛИЧНИМ ПИСМОМ. Ниједна реч латиницом није дозвољена осим скраћеница: IPARD, PDV.
2. Треће лице — "газдинство", "носилац пројекта", "подносилац". Никада "наш", "наша", "ми".
3. Формалан, стручан, конкретан регистар — без клишеа и генеричких реченица.
4. Свако поље: 3–5 граматички беспрекорних реченица које директно референцирају дате податке.
5. Провери граматику — падежи именица морају бити тачни.

ПОДАЦИ О ГАЗДИНСТВУ:
- Носилац пројекта: ${investitor}
- Место: ${lokacija}
- Предмет инвестиције: ${namena}
- Опрема за набавку: ${oprema}
- Производи / услуге: ${proizvodi}
- Земљиште: ${zemlja.length ? zemlja.join(", ") : "—"}
- Сточни фонд: ${stocni.length ? stocni.join(", ") : "—"}
- Механизација: ${meh.length ? meh.join(", ") : "—"}
- Власништво (ha): ${s.vlasnistvo_ha > 0 ? s.vlasnistvo_ha : "—"}, Закуп (ha): ${s.zakup_ha > 0 ? s.zakup_ha : "—"}
- Тржиште продаје: ${s.trzisteProdaje || "—"}

Врати САМО валидни JSON објекат са тачно овим кључевима (без markdown, без икаквог текста изван JSON-а):
{
  "opisDelatnosti": "Опис производног асортимана, карактеристика производа, линија производње, упослености и организације послова на газдинству.",
  "opisProizvodnog": "Навести постојеће производе и укратко описати сваки — укључујући биљне културе и сточни фонд.",
  "opisProsirenjaPrograma": "Описати могућности проширења производног програма — нови производи, потребна опрема, расположиви ресурси.",
  "opisTrzisteNabavke": "Описати репроматеријале и сировине које газдинство набавља, са конкретним добављачима или изворима набавке.",
  "opisTrzisteProadaje": "Описати постојеће и потенцијалне купце — директна продаја, откупни центри, задруге, тржишта.",
  "opisRadneSnage": "Описати потребе за радном снагом — да ли се запошљавају нови радници, за које послове, на колики период.",
  "opisDistribucije": "Описати канале дистрибуције и начин рекламирања — директна продаја, малопродаја, велепродаја, интернет."
}`;
}

export async function generatePath2Content(s: Path2State): Promise<Path2AIContent> {
  const geminiKey   = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? "";
  const geminiModel = (import.meta.env.VITE_GEMINI_MODEL   as string | undefined) ?? "gemini-2.0-flash";
  const groqKey     = (import.meta.env.VITE_GROQ_API_KEY   as string | undefined) ?? "";
  const groqModel   = (import.meta.env.VITE_GROQ_MODEL     as string | undefined) ?? "llama-3.3-70b-versatile";

  const prompt = buildPath2Prompt(s);
  let raw = "";

  if (geminiKey) {
    try {
      raw = await callGemini(prompt, geminiKey, geminiModel);
    } catch (geminiErr) {
      console.warn("[AI] Gemini није успео, покушавам Groq:", geminiErr);
      if (groqKey) {
        raw = await callGroq(prompt, groqKey, groqModel);
      } else {
        throw geminiErr;
      }
    }
  } else if (groqKey) {
    raw = await callGroq(prompt, groqKey, groqModel);
  } else {
    console.warn("[AI] Нема постављеног API кључа. Текст ће бити placeholder.");
    return PATH2_AI_PLACEHOLDER;
  }

  if (!raw) {
    console.error("[AI] Празан одговор");
    return PATH2_AI_PLACEHOLDER;
  }

  try {
    const parsed = JSON.parse(extractJSON(raw));
    console.log("[AI] Path2 генерисање успешно");
    return { ...PATH2_AI_PLACEHOLDER, ...parsed } as Path2AIContent;
  } catch {
    console.error("[AI] JSON парсирање неуспешно. Одговор:\n", raw);
    return PATH2_AI_PLACEHOLDER;
  }
}

// Path3: Navodnjavanje
export interface Path3AIContent {
  opisDelatnosti: string;
  trzisteProdajeTekst: string;
  trzisteSnabdevanjaTekst: string;
  opisPoslovneIdeje: string;
  zakljucak: string;
}

export const PATH3_AI_PLACEHOLDER: Path3AIContent = {
  opisDelatnosti: "[Опис делатности газдинства и организације послова]",
  trzisteProdajeTekst: "[Опис тржишта продаје — потенцијални и уговорни купци]",
  trzisteSnabdevanjaTekst: "[Опис тржишта снабдевања — добављачи и услуге]",
  opisPoslovneIdeje: "[Краток опис пословне идеје и циља инвестирања]",
  zakljucak: "[Закључна оцена о пројекту]",
};

function buildPath3Prompt(s: Path3State): string {
  const investitor = s.investitor || "—";
  const lokacija   = s.lokacija   || s.mesto || "—";
  const namena     = s.namenaInvesticije || "—";
  const oprema     = s.osnSredstvaP3.length
    ? s.osnSredstvaP3.map(o => `${o.naziv} x${o.kolicina}`).join(", ")
    : "—";
  const proizvodi  = s.proizvodi.length
    ? s.proizvodi.map(p => `${p.naziv} (${p.jm})`).join(", ")
    : "—";

  const zemlja: string[] = [];
  if (s.zem_oranice > 0)  zemlja.push(`оранице ${s.zem_oranice} ha`);
  if (s.zem_livade > 0)   zemlja.push(`ливаде ${s.zem_livade} ha`);
  if (s.zem_pasnjaci > 0) zemlja.push(`пашњаци ${s.zem_pasnjaci} ha`);
  if (s.zem_vocnjaci > 0) zemlja.push(`воћњаци ${s.zem_vocnjaci} ha`);
  if (s.zem_vinogradi > 0) zemlja.push(`виногради ${s.zem_vinogradi} ha`);

  const stocni: string[] = [];
  if (s.stoc_krave > 0)   stocni.push(`краве ${s.stoc_krave}`);
  if (s.stoc_svinje > 0)  stocni.push(`свиње ${s.stoc_svinje}`);
  if (s.stoc_ovce > 0)    stocni.push(`овце ${s.stoc_ovce}`);
  if (s.stoc_zivina > 0)  stocni.push(`живина ${s.stoc_zivina}`);
  if (s.stoc_kosnice > 0) stocni.push(`кошнице ${s.stoc_kosnice}`);

  return `Ти си стручни консултант за израду пословних планова за системе наводњавања у АП Војводини, Република Србија.

ЗАДАТАК: Напиши детаљне нарративне делове пословног плана за систем наводњавања, у складу са Моделом обрасца пословног плана 7.1.

⚠ КРИТИЧНО — ОБАВЕЗНА ПРАВИЛА:
1. Сва поља МОРАЈУ бити написана ИСКЉУЧИВО СРПСКИМ ЋИРИЛИЧНИМ ПИСМОМ. Ниједна реч латиницом није дозвољена осим скраћеница: PDV, BPG, ha, m².
2. Треће лице — "газдинство", "носилац пројекта", "подносилац захтева". Никада "наш", "наша", "ми".
3. Формалан, стручан, конкретан регистар — без клишеа и генеричких реченица.
4. Поља opisDelatnosti: тачно 3–4 реченице (кратко, концизно). Сва остала поља: минимум 7–10 реченица, детаљних и конкретних.
5. Провери граматику — падежи именица морају бити тачни.
6. Специфична терминологија: "систем за наводњавање", "кап-кап систем", "наводњавање усева", "водни режим биљака", "ефикасност употребе воде", "суфинансирање набавке", "унапређење пољопривредне производње", "АП Војводина".

ПОДАЦИ О ГАЗДИНСТВУ:
- Носилац пројекта: ${investitor}
- Место реализације: ${lokacija}
- Предмет инвестиције: ${namena}
- Опрема за набавку: ${oprema}
- Производи / усеви: ${proizvodi}
- Земљиште: ${zemlja.length ? zemlja.join(", ") : "—"}
- Сточни фонд: ${stocni.length ? stocni.join(", ") : "—"}
- Власништво (ha): ${s.vlasnistvo_ha > 0 ? s.vlasnistvo_ha : "—"}, Закуп (ha): ${s.zakup_ha > 0 ? s.zakup_ha : "—"}
- Примарна делатност: ${s.primarnaDelatnost || "—"}
- Тржиште продаје: ${s.trzisteProdaje || "—"}

Врати САМО валидни JSON објекат са тачно овим кључевима (без markdown, без икаквог текста изван JSON-а):
{
  "opisDelatnosti": "Кратак опис производне делатности и организације послова на газдинству — производна структура, технологија гајења, организација рада. Тачно 3–4 реченице, без понављања.",
  "trzisteProdajeTekst": "Детаљна анализа тржишта продаје — идентификовани постојећи и потенцијални купци по уговору, сегменти тржишта, начин пласмана производа, ценовна политика, конкурентска позиција, географско тржиште, могућности извоза. Минимум 8 реченица.",
  "trzisteSnabdevanjaTekst": "Детаљан опис тржишта снабдевања — репроматеријали, резервни делови, сервисне услуге за систем наводњавања, добављачи опреме и материјала, услови набавке, доступност резервних делова, процена ризика снабдевања. Минимум 8 реченица.",
  "opisPoslovneIdeje": "Свеобухватан опис пословне идеје и пројекта — предмет уlagања, конкретни циљеви инвестирања, очекивани ефекти на производне резултате, повећање приноса, уштеда воде, смањење трошкова рада, место и услови пласмана произведених производа. Минимум 8 реченица.",
  "zakljucak": "Исцрпна закључна оцена о оправданости пројекта — техничко-технолошка оправданост, економска исплативост, тржишна оправданост, доприност одрживом развоју пољопривреде, очекивани ефекти реализације инвестиције на приходе и пословне резултате, препорука за одобравање суфинансирања. Минимум 8 реченица."
}`;
}

export async function generatePath3Content(s: Path3State): Promise<Path3AIContent> {
  const geminiKey   = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? "";
  const geminiModel = (import.meta.env.VITE_GEMINI_MODEL   as string | undefined) ?? "gemini-2.0-flash";
  const groqKey     = (import.meta.env.VITE_GROQ_API_KEY   as string | undefined) ?? "";
  const groqModel   = (import.meta.env.VITE_GROQ_MODEL     as string | undefined) ?? "llama-3.3-70b-versatile";

  const prompt = buildPath3Prompt(s);
  let raw = "";

  if (geminiKey) {
    try {
      raw = await callGemini(prompt, geminiKey, geminiModel);
    } catch (geminiErr) {
      console.warn("[AI] Gemini није успео, покушавам Groq:", geminiErr);
      if (groqKey) {
        raw = await callGroq(prompt, groqKey, groqModel);
      } else {
        throw geminiErr;
      }
    }
  } else if (groqKey) {
    raw = await callGroq(prompt, groqKey, groqModel);
  } else {
    console.warn("[AI] Нема постављеног API кључа.");
    return PATH3_AI_PLACEHOLDER;
  }

  if (!raw) {
    console.error("[AI] Празан одговор");
    return PATH3_AI_PLACEHOLDER;
  }

  try {
    const parsed = JSON.parse(extractJSON(raw));
    console.log("[AI] Path3 генерисање успешно");
    return { ...PATH3_AI_PLACEHOLDER, ...parsed } as Path3AIContent;
  } catch {
    console.error("[AI] JSON парсирање неуспешно. Одговор:\n", raw);
    return PATH3_AI_PLACEHOLDER;
  }
}
