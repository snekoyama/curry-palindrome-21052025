// グローバル変数
let typewriterSound;
let palindromes;

let index = 0;

// メイン表示用 (英語用)
let textAnimIndex = 0;
let currentTextSize = 36; // 初期値、draw内で再計算

// 漢字サブタイトル用
let kanjiChunkIndex = 0;
let kanjiSubTextAnimCount = 0;

// ひらがなサブタイトル用 (元英語サブタイトル)
let hiraganaSubChunkIndex = 0;
let hiraganaSubTextAnimCount = 0;

const SUB_TEXT_ANIM_SPEED = 2;

let fontSize = 36; // 基本フォントサイズ
let boxX, boxY, boxWidth, mainBoxHeight;
let padX, padY;
let font; // NotoSansJP (英語表示にもこれを使用)

// Graphics Buffers
let g, titleg, kanjiSub, hiraganaSub; // englishSub を hiraganaSub に変更

let data;
let currentPalindrome;
let hiraganaSubBoxWidth; // 元のenglishBoxWidthを再利用

function preload() {
  font = loadFont('NotoSansJP-Custom-Subset.ttf');
  data = loadJSON('data.json');
  typewriterSound = loadSound('typewriter-key.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  if (data && data.jp) {
    palindromes = data.jp;
  } else {
    palindromes = [];
    console.error("Error: data.json or data.jp not loaded correctly!");
  }

  padX = windowWidth / 10;
  padY = windowHeight / 10;
  boxX = padX;
  boxY = padY;
  boxWidth = width - padX * 2;
  hiraganaSubBoxWidth = min(boxWidth, 800); 
  mainBoxHeight = max(100, height - height / 3);

  g = createGraphics(boxWidth, mainBoxHeight);
  titleg = createGraphics(width, 48);
  kanjiSub = createGraphics(width, 100);
  hiraganaSub = createGraphics(hiraganaSubBoxWidth, 100);

  if (palindromes && palindromes.length > 0) {
    console.log("total " + palindromes.length + " palindromes");
  } else {
    console.log("No palindromes loaded or data error.");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  padX = windowWidth / 10;
  padY = windowHeight / 10;
  boxWidth = width - padX * 2;
  mainBoxHeight = max(100, height - height / 3);
  hiraganaSubBoxWidth = min(boxWidth, 800);

  if (g) g.resize(boxWidth, mainBoxHeight); else g = createGraphics(boxWidth, mainBoxHeight);
  if (titleg) titleg.resize(width, 48); else titleg = createGraphics(width, 48);
  if (kanjiSub) kanjiSub.resize(width, kanjiSub.height); else kanjiSub = createGraphics(width, 100);
  if (hiraganaSub) hiraganaSub.resize(hiraganaSubBoxWidth, hiraganaSub.height); else hiraganaSub = createGraphics(hiraganaSubBoxWidth, 100);
}

function draw() {
  background("black");

  if (!palindromes || palindromes.length === 0) {
    textSize(32); fill(255); textAlign(CENTER, CENTER);
    text("データをロード中またはデータがありません...", width / 2, height / 2);
    return;
  }
  if (index < 0 || index >= palindromes.length) {
    index = 0;
    if (palindromes.length === 0) return;
  }
  currentPalindrome = palindromes[index];

  if (!currentPalindrome) {
    textSize(32); fill(255); textAlign(CENTER, CENTER);
    text("回文データが取得できません...", width / 2, height / 2);
    return;
  }

  // 1. メイン表示 (英語) の準備
  let mainDisplayEnglishText = currentPalindrome.english || "";
  let animatedMainEnglish = "";

  if (mainDisplayEnglishText && typeof mainDisplayEnglishText === 'string' && mainDisplayEnglishText.length > 0) {
    const mainTextLength = mainDisplayEnglishText.length;
    let charsToAdd = 1;
    let animInterval = 10; // デフォルトのアニメーション間隔

    // 文字数に応じてアニメーション速度を調整
    if (mainTextLength > 500) { charsToAdd = 15; animInterval = 1; }
    else if (mainTextLength > 200) { charsToAdd = 8; animInterval = 2; }
    else if (mainTextLength > 100) { charsToAdd = 4; animInterval = 3; }
    else if (mainTextLength > 50) { charsToAdd = 2; animInterval = 5; }

    if (frameCount % animInterval == 0 && textAnimIndex < mainTextLength) {
      textAnimIndex += charsToAdd;
      if (textAnimIndex > mainTextLength) {
        textAnimIndex = mainTextLength;
      }
      if (typewriterSound && typewriterSound.isLoaded() && textAnimIndex > 0) {
        typewriterSound.play(); // メインテキスト（英語）表示で音を鳴らす
      }
    }
    animatedMainEnglish = mainDisplayEnglishText.substring(0, textAnimIndex);
  } else {
    textAnimIndex = 0; // アニメートするテキストがない場合はリセット
    animatedMainEnglish = ""; // 表示も空に
  }
  
  // メイン表示のフォントサイズ計算 (英語用)
  let mainTextForSizing = mainDisplayEnglishText || " "; // fitTextToBoxが空文字を嫌うため
  if (mainTextForSizing.trim().length > 0) {
    currentTextSize = fitTextToBox(mainTextForSizing, boxWidth, mainBoxHeight / 2, g, " "); // 第5引数にデリミタ " " を指定
  } else {
    currentTextSize = fontSize; // デフォルトサイズ
  }

  // メイン表示 (英語) をgバッファに描画
  g.clear();
  g.background("black");
  g.textFont(font); // NotoSansJP で英語を表示（必要なら英語用フォントを用意して切り替え）
  g.textSize(currentTextSize);
  g.fill("white");
  g.textAlign(CENTER, TOP);
  let mainContentLines = breakTextIntoLines(animatedMainEnglish, " ", g.width, g); // 英語なのでスペース区切り
  drawTextInBox(mainContentLines, 0, 0, g.width, mainBoxHeight / 2, g);
  imageMode(CORNER);
  image(g, padX, (height - mainBoxHeight) / 2);

  // 2. タイトル描画
  titleg.clear();
  titleg.background('black');
  let titleFontSize = fontSize * 0.9;
  let titleText = `Curry Palindrome No - ${index + 1}`; // メインが英語であることを示す
  titleg.textFont("default");
  titleg.textSize(titleFontSize);
  while (titleg.textWidth(titleText) > titleg.width - 40 && titleFontSize > 10) {
    titleFontSize--;
    titleg.textSize(titleFontSize);
  }
  titleg.fill("white");
  titleg.textAlign(CENTER, CENTER);
  titleg.text(titleText, titleg.width / 2, titleg.height / 2);
  imageMode(CENTER);
  image(titleg, width / 2, titleg.height / 2 + 20);

  // 3. 漢字サブタイトル描画
  let currentKanjiForSubtitle = currentPalindrome.kanji || "";
  kanjiSub.clear();
  kanjiSub.background('black');
  kanjiSub.textFont(font);
  kanjiSub.textSize(fontSize * 0.8);
  kanjiSub.fill("white");
  kanjiSub.textAlign(CENTER, TOP);
  let kanjiLinesFull = breakTextIntoLines(currentKanjiForSubtitle, "", boxWidth, kanjiSub); //漢字は区切り文字なし
  let kanjiChunks = chunkTextLines(kanjiLinesFull, 2);

  if (frameCount % 300 == 0) {
    if (kanjiChunks.length > 0) {
        kanjiChunkIndex = (kanjiChunkIndex + 1) % kanjiChunks.length;
    } else {
        kanjiChunkIndex = 0;
    }
    kanjiSubTextAnimCount = 0;
  }
  let currentKanjiChunk = (kanjiChunks.length > 0 && kanjiChunks[kanjiChunkIndex]) ? kanjiChunks[kanjiChunkIndex] : [];
  let { displayedLines: displayedKanjiLines, totalCharsInChunk: totalKanjiCharsInChunk } =
    getAnimatedLines(currentKanjiChunk, kanjiSubTextAnimCount);

  if (frameCount % SUB_TEXT_ANIM_SPEED === 0 && kanjiSubTextAnimCount < totalKanjiCharsInChunk) {
    kanjiSubTextAnimCount++;
  }
  drawTextInBox(displayedKanjiLines, 0, 0, kanjiSub.width, kanjiSub.height, kanjiSub);
  imageMode(CENTER);
  let hiraganaSubActualHeight = hiraganaSub ? hiraganaSub.height : 100; // 下のひらがなサブの高さを考慮
  image(kanjiSub, width / 2, height - kanjiSub.height - hiraganaSubActualHeight - 30);


  // 4. ひらがなサブタイトル描画 (元英語サブタイトルの場所とロジックを流用)
  let currentHiraganaForSubtitle = currentPalindrome.hiragana || "";
  
  hiraganaSub.textFont(font); // フォント設定
  hiraganaSub.textSize(fontSize * 0.8); // サイズ設定
  hiraganaSub.textLeading(hiraganaSub.textSize() * 1.2); // 行間設定
  
  let hiraganaSubLinesFull = breakTextIntoLines(currentHiraganaForSubtitle, "", hiraganaSubBoxWidth, hiraganaSub); // ひらがなは区切り文字なし
  let hiraganaSubChunks = chunkTextLines(hiraganaSubLinesFull, 3);

  if (frameCount % 300 == 0) { // 漢字サブと同期してチャンク切り替え
    if (hiraganaSubChunks.length > 0) {
        hiraganaSubChunkIndex = (hiraganaSubChunkIndex + 1) % hiraganaSubChunks.length;
    } else {
        hiraganaSubChunkIndex = 0;
    }
    hiraganaSubTextAnimCount = 0;
  }
  
  let currentHiraganaSubChunk = (hiraganaSubChunks.length > 0 && hiraganaSubChunks[hiraganaSubChunkIndex]) ? hiraganaSubChunks[hiraganaSubChunkIndex] : [];

  // ひらがなサブの高さ計算と再生成
  let requiredHiraganaSubHeight = (hiraganaSub.textLeading() * currentHiraganaSubChunk.length) + 20; // +20 はパディング
  requiredHiraganaSubHeight = max(requiredHiraganaSubHeight, 50); // 最小高さ50px

  if (hiraganaSub.height !== requiredHiraganaSubHeight || hiraganaSub.width !== hiraganaSubBoxWidth) { //幅もチェック
    hiraganaSub = createGraphics(hiraganaSubBoxWidth, requiredHiraganaSubHeight);
    hiraganaSub.background('black'); // 再生成時にもプロパティ設定
    hiraganaSub.textFont(font);
    hiraganaSub.textSize(fontSize * 0.8);
    hiraganaSub.fill("white");
    hiraganaSub.textAlign(CENTER, TOP);
  }
  
  hiraganaSub.clear();
  hiraganaSub.background('black');
  hiraganaSub.textFont(font);
  hiraganaSub.textSize(fontSize * 0.8);
  hiraganaSub.fill("white");
  hiraganaSub.textAlign(CENTER, TOP);

  let { displayedLines: displayedHiraganaSubLines, totalCharsInChunk: totalHiraganaSubCharsInChunk } =
    getAnimatedLines(currentHiraganaSubChunk, hiraganaSubTextAnimCount);

  if (frameCount % SUB_TEXT_ANIM_SPEED === 0 && hiraganaSubTextAnimCount < totalHiraganaSubCharsInChunk) {
    hiraganaSubTextAnimCount++;
  }
  
  drawTextInBox(displayedHiraganaSubLines, 0, 0, hiraganaSub.width, hiraganaSub.height, hiraganaSub);
  imageMode(CENTER);
  image(hiraganaSub, width / 2, height - hiraganaSub.height / 2 - 10); // 画面最下部付近に配置
}

function getAnimatedLines(linesInChunk, animCount) {
  let displayedLines = [];
  let totalCharsInChunk = 0;
  if (linesInChunk) { // linesInChunk が undefined でないか確認
    for (let line of linesInChunk) {
      if (line) totalCharsInChunk += line.length; // line が undefined でないか確認
    }
    let charBudget = animCount;
    for (let i = 0; i < linesInChunk.length; i++) {
      const line = linesInChunk[i];
      if (line) { // line が undefined でないか確認
        if (charBudget <= 0) {
          displayedLines.push("");
        } else {
          let linePortionLength = Math.min(charBudget, line.length);
          displayedLines.push(line.substring(0, linePortionLength));
          charBudget -= linePortionLength;
        }
      } else {
        displayedLines.push(""); // line が undefined なら空文字
      }
    }
  }
  return { displayedLines, totalCharsInChunk };
}

function mousePressed() {
  handleButtonPressActions();
}

function touchStarted() {
  handleButtonPressActions();
  return false;
}

function handleButtonPressActions() {
  textAnimIndex = 0; // メイン英語アニメーションリセット
  kanjiChunkIndex = 0;
  kanjiSubTextAnimCount = 0;
  hiraganaSubChunkIndex = 0; 
  hiraganaSubTextAnimCount = 0;
  
  if (palindromes && palindromes.length > 0) {
    index = (index + 1) % palindromes.length;
  } else {
    index = 0;
  }
  // console.log(`クリック/タップ/Enterキー操作！現在のインデックス: ${index}`);
}

function keyPressed() {
  if (keyCode === ENTER) {
    handleButtonPressActions();
  }
  // Sキーでのモード切り替えはこのバージョンではなし
  if (key === 'G' || key === 'g') {
    if (!palindromes || palindromes.length === 0) return;
    let targetIndexInput = prompt('表示したいパリンドロームの番号を入力してください（例：1）：');
    if (targetIndexInput !== null) {
        let targetIndexNum = parseInt(targetIndexInput);
        if (!isNaN(targetIndexNum) && targetIndexNum >= 1 && targetIndexNum <= palindromes.length) {
            index = targetIndexNum - 1;
            textAnimIndex = 0;
            kanjiChunkIndex = 0;
            kanjiSubTextAnimCount = 0;
            hiraganaSubChunkIndex = 0;
            hiraganaSubTextAnimCount = 0;
        } else {
            alert("無効な番号です。1から" + palindromes.length + "の間で入力してください。");
        }
    }
  }
}

function breakTextIntoLines(text, delimiter, bWidth, graphicsContext) {
  if (!text && typeof text !== 'string') return []; // textがnull, undefined, または文字列でない場合
  if (text === "") return []; // 空文字列の場合は空の行配列を返す

  let lines = [];
  let currentLine = "";
  const gCtx = graphicsContext;

  if (!gCtx) {
    console.error("breakTextIntoLines: graphicsContext is undefined");
    return ["Error: Graphics context missing"];
  }
  try {
    if (delimiter === "") { // 日本語など文字ごと
      for (let i = 0; i < text.length; i++) {
        let testChar = text[i];
        // textWidth が null や undefined の文字でエラーにならないように
        if (typeof testChar !== 'string') continue; 
        let testLine = currentLine + testChar;
        if (gCtx.textWidth(testLine) > bWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = testChar;
        } else {
          currentLine = testLine;
        }
      }
    } else { // 英語など単語ごと
      let words = String(text).split(delimiter); // textをStringにキャスト
      for (let i = 0; i < words.length; i++) {
        let testWord = words[i];
        if (gCtx.textWidth(testWord) > bWidth && currentLine.length === 0) {
           let tempWordLine = "";
            for(let char of testWord) {
                if (typeof char !== 'string') continue;
                if(gCtx.textWidth(tempWordLine + char) > bWidth && tempWordLine.length > 0) {
                    lines.push(tempWordLine);
                    tempWordLine = char;
                } else {
                    tempWordLine += char;
                }
            }
            if(tempWordLine.length > 0) lines.push(tempWordLine);
            currentLine = ""; 
            continue;
        }
        let testLine = currentLine + (currentLine.length > 0 ? delimiter : "") + testWord;
        if (gCtx.textWidth(testLine) > bWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = testWord;
        } else {
          currentLine = testLine;
        }
      }
    }
  } catch (e) {
    console.error("Error in breakTextIntoLines:", e, "Text:", String(text).substring(0,100), "Delimiter:", delimiter, "Width:", bWidth);
    return ["Error breaking text"];
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  return lines;
}

function drawTextInBox(lines, x, y, bWidth, bHeight, graphicsContext) {
  if (!lines || lines.length === 0) return;
  const gCtx = graphicsContext;
   if (!gCtx) {
    console.error("drawTextInBox: graphicsContext is undefined");
    return;
  }
  try {
    gCtx.textAlign(CENTER, TOP);
    // textSize は呼び出し元で gCtx に設定されているはず
    gCtx.textLeading(gCtx.textSize() * 1.2); 
    let lineHeight = gCtx.textLeading();
    let totalTextHeight = lines.length * lineHeight;
    if (lines.length > 0) {
        totalTextHeight -= (lineHeight - gCtx.textSize()); // より正確な高さに
    }
    let startY = y + (bHeight - totalTextHeight) / 2;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] !== undefined && typeof lines[i] === 'string') { // 文字列であることも確認
          gCtx.text(lines[i], x + bWidth / 2, startY + i * lineHeight);
      }
    }
  } catch (e) {
    console.error("Error in drawTextInBox:", e);
  }
}

// fitTextToBox: 第5引数として delimiter を受け取るように変更
function fitTextToBox(textContent, bWidth, bHeight, graphicsContextForCalc, delimiterForFit) {
  if (!textContent || typeof textContent !== 'string' || textContent.trim().length === 0) {
    // console.warn("fitTextToBox: Invalid textContent provided, returning default fontSize.", textContent);
    return fontSize;
  }

  const tempG = graphicsContextForCalc;
  if (!tempG) {
    console.error("fitTextToBox: graphicsContextForCalc is undefined");
    return fontSize;
  }

  try {
    tempG.textFont(font); // メイン表示用フォント (このスケッチでは英語もNotoSansJPで表示)

    let minSize = 6;
    let maxSize = 120; // 英語は文字が大きめに見えることがあるので、最大値を調整しても良い
    let bestSize = minSize;

    while (minSize <= maxSize) {
      let midSize = Math.floor((minSize + maxSize) / 2);
      if (midSize <= 0) { bestSize = 1; break; }
      tempG.textSize(midSize);

      let effectiveTextSizeForCalc = midSize;
      let lineHeightMultiplier = 1.2;

      if (windowWidth < 600) { // スマホサイズ補正
        effectiveTextSizeForCalc = midSize * 0.8;
        tempG.textSize(effectiveTextSizeForCalc);
      }
      tempG.textLeading(effectiveTextSizeForCalc * lineHeightMultiplier);
      
      // 関数に渡された delimiterForFit を使用する
      let lines = breakTextIntoLines(textContent, delimiterForFit, bWidth, tempG);
      
      let lineHeight = tempG.textLeading(); // textSize変更後のleading
      let totalHeight = lines.length * lineHeight;
      if (lines.length > 0) {
           totalHeight -= (lineHeight - effectiveTextSizeForCalc); // 精密な高さ
      }

      let fitsWidth = true;
      for(let line of lines) {
          if (typeof line !== 'string' || tempG.textWidth(line) > bWidth) { // lineが文字列であるかもチェック
              fitsWidth = false;
              break;
          }
      }

      if (totalHeight <= bHeight && fitsWidth) {
        bestSize = midSize; // スケール前のmidSizeを保存
        minSize = midSize + 1;
      } else {
        maxSize = midSize - 1;
      }
    }
    return bestSize > 0 ? bestSize : 1;
  } catch (e) {
    console.error("Error in fitTextToBox:", e, "Text:", textContent.substring(0,100));
    return fontSize; // エラー時はデフォルトfontSize
  }
}

function chunkTextLines(lines, linesPerChunk) {
  let chunks = [];
  if (!lines || lines.length === 0) return [[]];
  for (let i = 0; i < lines.length; i += linesPerChunk) {
    chunks.push(lines.slice(i, i + linesPerChunk));
  }
  return chunks.length > 0 ? chunks : [[]];
}