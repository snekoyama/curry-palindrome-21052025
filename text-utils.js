
// Function to calculate appropriate text size to fit within the box
function fitTextToBox1(textContent, boxWidth, mainBoxHeight) {
    let size = 1; // Start with the smallest possible size
    g.textSize(size);
    let bounds = textBounds(textContent, boxX, boxY, size);
  
    while (bounds.w < boxWidth && bounds.h < mainBoxHeight) {
      size++; // Incrementally increase the size
      g.textSize(size);
      bounds = textBounds(textContent, boxX, boxY, size);
    }
  
    return size - 1; // Return one size smaller to ensure it fits
  }
  
  // Function to measure text bounds (using p5's textWidth and approximation for height)
  function textBounds(textContent, x, y, size) {
    g.textSize(size);
    let w = g.textWidth(textContent);
    let h = g.textAscent() + g.textDescent(); // Approximate height
    return { w: w, h: h };
  }
  
  // Function to draw the lines of text inside the box
  function drawTextInBox(lines, x, y, boxWidth, mainBoxHeight, tg) {
    let lineHeight = tg.textAscent() + tg.textDescent();
    let totalTextHeight = lines.length * lineHeight;
  
    let startY = y + (mainBoxHeight - totalTextHeight) / 2; // Center the text vertically
  
    for (let i = 0; i < lines.length; i++) {
      let offx = boxWidth / 2;
      let offy = startY + i * lineHeight + lineHeight / lines.length / 2;
      // fill('red')
      // circle(x + offx, offy, 10)
      // fill("black");
      tg.push()
      tg.textAlign(LEFT, CENTER)
      tg.translate(x, offy)
      //     rotate(random(-Math.PI/12, Math.PI/12))
      tg.text(lines[i], 0, 0);
      // drawTextWithPoints(lines[i]);
      tg.pop()
    }
  }
  
  // Function to calculate appropriate text size to fit within the box using binary search
  function fitTextToBox(textContent, boxWidth, mainBoxHeight) {
    // g.textFont(font); // Make sure the font is set
    g.textFont(fontName);
  
    let minSize = 1;
    let maxSize = 400; // Set an upper limit for the text size
    let bestSize = minSize;
  
    while (minSize <= maxSize) {
      let midSize = Math.floor((minSize + maxSize) / 2); // Find the midpoint size
      g.textSize(midSize);
  
      let lines = breakTextIntoLines(textContent, "", boxWidth, g);
  
      // g.textSize(midSize);
      // textFont(font);
      // textSize(midSize);
      // let v = textAscent() + textDescent();
      let gv = g.textAscent() + g.textDescent();
  
      let totalHeight = lines.length * gv;
  
      // Debugging: Print current text size, total height, and box height
      // console.log(
      //   `Testing size: ${midSize}, Ascent + Descent: ${gv}, Total Height: ${totalHeight}, Box Height: ${mainBoxHeight}`
      // );
  
      if (totalHeight <= mainBoxHeight) {
        // If the text fits within the box, try a larger size
        bestSize = midSize;
        minSize = midSize + 1;
      } else {
        // If the text exceeds the box height, try a smaller size
        maxSize = midSize - 1;
      }
    }
  
    return bestSize; // Return the largest size that fits
  }
  
  
  function layoutText(text1, x, y, w, h) {
    g.textAlign(LEFT, TOP);
    g.textSize(currentTextSize);
    // textFont(font)
    g.push();
    g.translate(x, y);
    // fill("yellow");
    // circle(0, 0, 20);
    let currw = 0;
    let currh = -currentTextSize;
    for (let i = 0; i < text1.length; i++) {
      let letter = text1[i];
  
      let metrics = g.textWidth(letter);
      let nexth = g.textAscent() + g.textDescent();
  
      if (currw + metrics >= w) {
        currw = 0;
  
        currh += nexth;
      }
  
      g.push();
      g.translate(currw, currh);
      // fill("red");
      // circle(0, 0, 20);
      drawText(letter);
      g.pop();
  
      currw += metrics;
      // currh += nexth
    }
    g.pop();
  }
  
  // Function to break text into multiple lines based on the width of the bounding box
  function breakTextIntoLines(textContent, splitter, boxWidth, tg) {
    let words = textContent.split(splitter);
    let lines = [];
    let currentLine = "";
  
    // g.textFont(font)
    // g.test
    for (let i = 0; i < words.length; i++) {
      let testLine = currentLine + words[i] + " ";
      if (tg.textWidth(testLine) < boxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = words[i] + " ";
      }
    }
    lines.push(currentLine.trim()); // Push the last line
    return lines;
  }
  
  function drawText(text1) {
    g.textSize(currentTextSize);
  
    let w = g.textWidth(text1);
    let h = g.textAscent() + g.textDescent();
    // if(debug) rect(0, 0, w, h);
    g.fill("white");
    g.text(text1, 0, currentTextSize);
  }
  
  
  function keyPressed() {
    if (keyCode === ENTER || keyCode == RIgHT_ARROW) {
      index = (index + 1) % palindromes.length;
      textAnimIndex = 0;
      translationIndex = 0
    }
    if (keyCode === LEFT_ARROW) {
      index = (index - 1) % palindromes.length
      textAnimIndex = palindromes[index].length
      translationIndex = 0
  
    }
  }
  