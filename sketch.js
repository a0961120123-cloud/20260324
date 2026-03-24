let seaweeds = [];
let bubbles = [];
let seaweedColors = ["#9b5de5", "#f15bb5", "#fee440", "#00bbf9", "#00f5d4"];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('pointer-events', 'none'); // 讓滑鼠事件穿透 Canvas，以便操作 iframe

  // 建立全螢幕 iframe
  let iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('position', 'absolute');
  iframe.style('top', '0');
  iframe.style('left', '0');
  iframe.style('width', '100%');
  iframe.style('height', '100%');
  iframe.style('border', 'none');
  iframe.style('z-index', '-1'); // 放在 Canvas 後面

  initSeaweeds();
}

function initSeaweeds() {
  seaweeds = [];
  // 產生 80 條水草
  for (let i = 0; i < 80; i++) {
    let h = height * random(0.20, 0.45);   // 高度
    let c = random(seaweedColors);         // 顏色
    let x = random(width);                 // 位置
    let th = random(40, 50);               // 粗細
    let f = random(0.005, 0.02);           // 搖晃頻率
    
    seaweeds.push(new Seaweed(x, h, c, th, f));
  }
}

function draw() {
  clear(); // 清除畫布，避免透明背景疊加變混濁
  background(189, 224, 254, 76); // 背景色 #bde0fe，透明度 0.3 (約 76)
  blendMode(BLEND); // 設定混合模式，讓透明度正常疊加

  for (let s of seaweeds) {
    s.display();
  }

  // 產生氣泡邏輯：每幀有 6% 機率產生新氣泡 (讓氣泡變多)
  if (random(1) < 0.06) {
    bubbles.push(new Bubble());
  }

  // 更新並繪製氣泡 (倒序迴圈以便移除物件)
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.update();
    b.display();
    if (b.isDead()) {
      bubbles.splice(i, 1);
    }
  }
}

class Seaweed {
  constructor(x, h, c, th, f) {
    this.rootX = x;
    this.plantHeight = h;
    this.color = color(c);
    this.color.setAlpha(150); // 設定透明度 (0-255)，150 為半透明
    this.thickness = th;
    this.segments = 60;
    this.noiseOffset = random(1000); // 每個水草有獨立的 noise 起始點
    this.swayFreq = f;
  }

  display() {
    fill(this.color);
    noStroke();
    beginShape();
    for (let i = 0; i <= this.segments; i++) {
      this.drawNode(i, -1);
    }
    for (let i = this.segments; i >= 0; i--) {
      this.drawNode(i, 1);
    }
    endShape(CLOSE);
  }

  drawNode(index, side) {
    let t = index / this.segments;
    let y = height - (t * this.plantHeight);
    
    // 使用獨立的 swayFreq (搖晃頻率) 和 noiseOffset
    let noiseVal = noise(frameCount * this.swayFreq + this.noiseOffset, index * 0.05);
    let xOffset = map(noiseVal, 0, 1, -50, 50);
    
    // 計算寬度 (半徑 = 粗細 / 2)
    let currentRadius = map(t, 0, 1, this.thickness / 2, 0);
    
    let x = this.rootX + (xOffset * t) + (currentRadius * side);
    curveVertex(x, y);
  }
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + random(20, 50); // 從視窗底部下方生成
    this.size = random(20, 50); // 讓氣泡變大 (原本是 10-25)
    this.speed = random(1, 3);
    this.popHeight = random(height * 0.1, height * 0.8); // 隨機決定的破掉高度
    this.popped = false;
    this.popTimer = 10; // 破掉動畫的時間長度
  }

  update() {
    if (!this.popped) {
      this.y -= this.speed;
      // 讓氣泡稍微左右搖晃
      this.x += sin(frameCount * 0.05 + this.y * 0.02) * 0.5;
      
      // 到達特定高度就破掉
      if (this.y < this.popHeight) {
        this.popped = true;
      }
    } else {
      this.popTimer--;
    }
  }

  display() {
    if (!this.popped) {
      noStroke();
      // 水泡本體：白色，透明度 0.5 (約 127)
      fill(255, 127);
      circle(this.x, this.y, this.size);
      
      // 左上角亮點：白色，透明度 0.8 (約 204)
      fill(255, 204);
      circle(this.x - this.size * 0.25, this.y - this.size * 0.25, this.size * 0.25);
    } else {
      // 破掉的效果：畫一個快速放大並消失的圓框
      noFill();
      stroke(255, map(this.popTimer, 10, 0, 200, 0)); // 透明度隨時間遞減
      strokeWeight(2);
      circle(this.x, this.y, this.size + (10 - this.popTimer) * 3); // 半徑隨時間變大
    }
  }

  isDead() {
    return this.popped && this.popTimer <= 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initSeaweeds();
}
