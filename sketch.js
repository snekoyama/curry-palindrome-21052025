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

// ひらがなサブタイトル用 (元英語サブタイトルから変更)
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
let hiraganaSubBoxWidth; // 元のenglishBoxWidthの役割

// textSizeValues はこのバージョンでは使用しない
// let textSizeValues = [];

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
  hiraganaSub = createGraphics(hiraganaSubBoxWidth, 100); // englishSubから変更

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
    let animInterval = 10;

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
        typewriterSound.play();
      }
    }
    animatedMainEnglish = mainDisplayEnglishText.substring(0, textAnimIndex);
  } else {
    textAnimIndex = 0;
    animatedMainEnglish = "";
  }
  
  let mainTextForSizing = mainDisplayEnglishText || " ";
  if (mainTextForSizing.trim().length > 0) {
    // ★ fitTextToBox に英語用の区切り文字 " " を渡す
    currentTextSize = fitTextToBox(mainTextForSizing, boxWidth, mainBoxHeight / 2, g, " "); 
  } else {
    currentTextSize = fontSize;
  }

  // メイン表示 (英語) をgバッファに描画
  g.clear();
  g.background("black");
  g.textFont(font); 
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
  let titleText = `Curry Palindrome (EN) - ${index + 1}`; // メインが英語であることを示す
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
  let kanjiLinesFull = breakTextIntoLines(currentKanjiForSubtitle, "", boxWidth, kanjiSub);
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
  let hiraganaSubActualHeight = hiraganaSub ? hiraganaSub.height : 100;
  image(kanjiSub, width / 2, height - kanjiSub.height - hiraganaSubActualHeight - 40); // Y位置微調整


  // 4. ひらがなサブタイトル描画
  let currentHiraganaForSubtitle = currentPalindrome.hiragana || "";
  
  hiraganaSub.textFont(font); 
  hiraganaSub.textSize(fontSize * 0.8); 
  hiraganaSub.textLeading(hiraganaSub.textSize() * 1.2); 
  
  let hiraganaSubLinesFull = breakTextIntoLines(currentHiraganaForSubtitle, "", hiraganaSubBoxWidth, hiraganaSub);
  let hiraganaSubChunks = chunkTextLines(hiraganaSubLinesFull, 3);

  if (frameCount % 300 == 0) { 
    if (hiraganaSubChunks.length > 0) {
        hiraganaSubChunkIndex = (hiraganaSubChunkIndex + 1) % hiraganaSubChunks.length;
    } else {
        hiraganaSubChunkIndex = 0;
    }
    hiraganaSubTextAnimCount = 0;
  }
  
  let currentHiraganaSubChunk = (hiraganaSubChunks.length > 0 && hiraganaSubChunks[hiraganaSubChunkIndex]) ? hiraganaSubChunks[hiraganaSubChunkIndex] : [];

  let requiredHiraganaSubHeight = (hiraganaSub.textLeading() * currentHiraganaSubChunk.length) + 20;
  requiredHiraganaSubHeight = max(requiredHiraganaSubHeight, 50); 

  if (hiraganaSub.height !== requiredHiraganaSubHeight || hiraganaSub.width !== hiraganaSubBoxWidth) { 
    hiraganaSub = createGraphics(hiraganaSubBoxWidth, requiredHiraganaSubHeight);
    hiraganaSub.background('black'); 
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
  image(hiraganaSub, width / 2, height - hiraganaSub.height / 2 - 20); // Y位置微調整
}

function getAnimatedLines(linesInChunk, animCount) {
  let displayedLines = [];
  let totalCharsInChunk = 0;
  if (linesInChunk) { 
    for (let line of linesInChunk) {
      if (line && typeof line === 'string') totalCharsInChunk += line.length; 
    }
    let charBudget = animCount;
    for (let i = 0; i < linesInChunk.length; i++) {
      const line = linesInChunk[i];
      if (line && typeof line === 'string') { 
        if (charBudget <= 0) {
          displayedLines.push("");
        } else {
          let linePortionLength = Math.min(charBudget, line.length);
          displayedLines.push(line.substring(0, linePortionLength));
          charBudget -= linePortionLength;
        }
      } else {
        displayedLines.push(""); 
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
  textAnimIndex = 0; 
  kanjiChunkIndex = 0;
  kanjiSubTextAnimCount = 0;
  hiraganaSubChunkIndex = 0; 
  hiraganaSubTextAnimCount = 0;
  
  if (palindromes && palindromes.length > 0) {
    index = (index + 1) % palindromes.length;
  } else {
    index = 0;
  }
  // console.log(`Next Palindrome: ${index}`);
}

function keyPressed() {
  if (keyCode === ENTER) {
    handleButtonPressActions();
  }
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
  if (!text && typeof text !== 'string') return []; 
  if (text === "") return [""]; 

  const gCtx = graphicsContext;
  if (!gCtx) {
    console.error("breakTextIntoLines: graphicsContext is undefined");
    return ["Error: Graphics context missing"];
  }

  let finalLines = [];
  const paragraphs = String(text).split('\n');

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "" && String(text).includes('\n')) {
      finalLines.push(""); 
      continue;
    }
    
    let currentLine = "";
    let linesInParagraph = [];

    try {
      if (delimiter === "" || paragraph.length === 0) { 
        for (let i = 0; i < paragraph.length; i++) {
          let testChar = paragraph[i];
          if (typeof testChar !== 'string') continue; 
          let testLine = currentLine + testChar;
          if (gCtx.textWidth(testLine) > bWidth && currentLine.length > 0) {
            linesInParagraph.push(currentLine);
            currentLine = testChar;
          } else {
            currentLine = testLine;
          }
        }
      } else { 
        let words = paragraph.split(delimiter);
        for (let i = 0; i < words.length; i++) {
          let testWord = words[i];
          if (testWord === "") continue; 

          if (gCtx.textWidth(testWord) > bWidth && currentLine.length === 0) {
            let tempWordLine = "";
            for (let char of testWord) {
              if (typeof char !== 'string') continue;
              if (gCtx.textWidth(tempWordLine + char) > bWidth && tempWordLine.length > 0) {
                linesInParagraph.push(tempWordLine);
                tempWordLine = char;
              } else {
                tempWordLine += char;
              }
            }
            if (tempWordLine.length > 0) linesInParagraph.push(tempWordLine);
            currentLine = ""; 
            continue;
          }

          let testLine = currentLine + (currentLine.length > 0 ? delimiter : "") + testWord;
          if (gCtx.textWidth(testLine) > bWidth && currentLine.length > 0) {
            linesInParagraph.push(currentLine);
            currentLine = testWord;
          } else {
            currentLine = testLine;
          }
        }
      }
      if (currentLine.length > 0) {
        linesInParagraph.push(currentLine);
      }
      finalLines.push(...linesInParagraph);

    } catch (e) {
      console.error("Error in breakTextIntoLines (inner loop):", e, "Paragraph:", String(paragraph).substring(0,100));
      finalLines.push("Error breaking paragraph");
    }
  }
  if (text === "" && finalLines.length === 0) return [""];
  return finalLines;
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
    // ★ 英語メイン表示用の行間調整を削除 (fitTextToBox での計算に依存)
    //    または、ここで displayMode を参照しない形にする。今回は削除。
    gCtx.textLeading(gCtx.textSize() * 1.2); // 基本の行間
    
    let lineHeight = gCtx.textLeading();
    let totalTextHeight = lines.length * lineHeight;
    if (lines.length > 0) {
        totalTextHeight -= (lineHeight - gCtx.textSize());
    }
    let startY = y + (bHeight - totalTextHeight) / 2;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i] !== undefined && typeof lines[i] === 'string') {
          gCtx.text(lines[i], x + bWidth / 2, startY + i * lineHeight);
      }
    }
  } catch (e) {
    console.error("Error in drawTextInBox:", e);
  }
}

// fitTextToBox: 第5引数として delimiterForFit を受け取る
function fitTextToBox(textContent, bWidth, bHeight, graphicsContextForCalc, delimiterForFit) {
  if (!textContent || typeof textContent !== 'string' || textContent.trim().length === 0) {
    return fontSize;
  }

  const tempG = graphicsContextForCalc;
  if (!tempG) {
    console.error("fitTextToBox: graphicsContextForCalc is undefined");
    return fontSize;
  }

  try {
    tempG.textFont(font); // NotoSansJPを使用

    let minSize = 6;
    let maxSize = 120; 
    let bestSize = minSize;

    while (minSize <= maxSize) {
      let midSize = Math.floor((minSize + maxSize) / 2);
      if (midSize <= 0) { bestSize = 1; break; }
      
      tempG.textSize(midSize);
      let effectiveTextSizeForCalc = midSize;
      
      // ★ 英語メイン表示用の行間調整を削除 (呼び出し側でデリミタ指定に依存)
      //    または、ここで displayMode を参照しない形にする。今回は削除。
      let lineHeightMultiplier = 1.2; // 基本の行間係数

      if (windowWidth < 600) {
        effectiveTextSizeForCalc = midSize * 0.8;
        tempG.textSize(effectiveTextSizeForCalc);
      }
      tempG.textLeading(effectiveTextSizeForCalc * lineHeightMultiplier);
      
      // 関数に渡された delimiterForFit を使用
      let lines = breakTextIntoLines(textContent, delimiterForFit, bWidth, tempG);
      
      let lineHeight = tempG.textLeading();
      let totalHeight = lines.length * lineHeight;
      if (lines.length > 0) {
           totalHeight -= (lineHeight - effectiveTextSizeForCalc);
      }

      let fitsWidth = true;
      for(let line of lines) {
          if (typeof line !== 'string' || tempG.textWidth(line) > bWidth) {
              fitsWidth = false;
              break;
          }
      }

      if (totalHeight <= bHeight && fitsWidth) {
        bestSize = midSize;
        minSize = midSize + 1;
      } else {
        maxSize = midSize - 1;
      }
    }
    return bestSize > 0 ? bestSize : 1;
  } catch (e) {
    console.error("Error in fitTextToBox:", e, "Text:", String(textContent).substring(0,100));
    return fontSize;
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
