// Pacita Abad – Wheels of Fortune inspired sketch
// Press 'A' to toggle animation.

let wheels = [];
let animateWheels = true;
let bgParticles = [];
let NUM_PARTICLES = 2580;
let bgDotColors = [
  "#FFFFFF",
  "#C7EBFF",
  "#FFAEC0",
  "#FFCF70",
  "#9EE7C8",
  "#F48BFD",
  "#A7F0FF",
  "#FFC2DD"
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(RGB, 255, 255, 255, 255);
  noStroke();
  for (let i = 0; i < NUM_PARTICLES; i++) {

  // Create background particles
  bgParticles.push({
    x: random(width),
    y: random(height),
    r: random(3, 15),
    speedX: random(-0.4, 0.4),
    speedY: random(-0.4, 0.4),
    c: color(255, 255, 255, random(20, 120))
  });
}


  createWheels();
}

function draw() {
  drawBackgroundTexture();

  for (let w of wheels) {
    if (animateWheels) w.update();
    w.display();
  }
}



// ------------------ SETUP HELPERS ------------------ //

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createWheels();   // regenerate layout for new size
}

function pickStyleDotHeavy() {
  return random() < 0.75 ? "dots" : "rays";
}



// ------------------ WHEEL LAYOUT ------------------ //

function createWheels() {
  wheels = [];

  // Wheel size relative to screen
  let baseR = min(width, height) / 10;      // tweak for density
  let spacingX = baseR * 2;                 // hex packing
  let spacingY = baseR * sqrt(3);

  // Extend area beyond canvas edges to avoid gaps
  let startX = -baseR;
  let startY = -baseR;
  let endX   = width  + baseR;
  let endY   = height + baseR;

  // How many columns/rows do we need to cover this extended area?
  let cols = ceil((endX - startX) / spacingX) + 1;
  let rows = ceil((endY - startY) / spacingY) + 1;

  for (let j = 0; j < rows; j++) {
    // stagger every other row for hex layout
    let rowOffset = (j % 2 === 0) ? 0 : spacingX / 2;

    for (let i = 0; i < cols; i++) {
      let x = startX + i * spacingX + rowOffset;
      let y = startY + j * spacingY;

      // Clamp radius so wheels never exceed edges
      let r = baseR * random(0.75, 0.9);
      r = min(r, baseR);

      // if (x - r > 0 && x + r < width && y - r > 0 && y + r < height) {
        wheels.push(new Wheel(x, y, r, pickPalette()));
      // }
    }
  }
}



function drawBackgroundTexture() {
  background(4, 87, 131); // teal base colour
  noStroke();

  for (let p of bgParticles) {
    // draw
    fill(p.c);
    ellipse(p.x, p.y, p.r, p.r);

    // move
    p.x += p.speedX;
    p.y += p.speedY;

    // slowly change direction (organic feel)
    p.speedX += random(-0.02, 0.02);
    p.speedY += random(-0.02, 0.02);
    p.speedX = constrain(p.speedX, -0.5, 0.5);
    p.speedY = constrain(p.speedY, -0.5, 0.5);

    // wrap around edges
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;
  }
}


// ------------------ WHEEL CLASS ------------------ //

class Wheel {
  constructor(x, y, r, palette) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.palette = palette;

    // Breathing / pulsing effect parameters
    this.pulsePhase = random(TWO_PI);          // start at random phase
    this.pulseSpeed = random(0.1, 1);          // how fast it breathes
    this.pulseAmp = random(0.05, 0.15);        // % (range) size change

    // Pattern layers (random style per layer)
    this.layers = [
      {
        radius: this.r * 0.9,
        dotSize: this.r * random(0.1, 0.14),
        count: 30,
        angle: random(360),
        speed: random(0.4, 0.8),
        style: pickStyleDotHeavy(),   // random style
        dotColor: palette.dots1
      },
      {
        radius: this.r * 0.75,
        dotSize: this.r * 0.12,
        count: 20,
        angle: random(360),
        speed: random(-0.6, -0.3),
        style: pickStyleDotHeavy(),
        dotColor: palette.dots2
      },
      {
        radius: this.r * 0.55,
        dotSize: this.r * 0.10,
        count: 18,
        angle: random(360),
        speed: random(0.2, 0.5),
        style: pickStyleDotHeavy(),
        dotColor: palette.dots3
      }
    ];

    // Inner core pattern (can be solid / dots / rays)
    this.innerPattern = {
      radius: this.r * 0.35,
      dotSize: this.r * 0.08,
      count: 30,
      angle: random(360),
      speed: random(-0.7, 0.7),
      style: random(["solid", "dots", "rays"])
    };
  }

  update() {
    // rotate all pattern layers
    for (let layer of this.layers) {
      layer.angle += layer.speed;
    }

    // rotate inner pattern if it's not just a solid disc
    if (this.innerPattern.style !== "solid") {
      this.innerPattern.angle += this.innerPattern.speed;
    }

    // --- update breathing phase (NEW) ---
    this.pulsePhase += this.pulseSpeed;

  }

  display() {
    push();
    translate(this.x, this.y);

        // --- apply breathing scale (NEW) ---
    let s = 1 + sin(this.pulsePhase) * this.pulseAmp;
    scale(s);

    // --- Outer disc (static) ---
    fill(this.palette.outer);
    ellipse(0, 0, this.r * 2);

    // --- Big ring just under patterns ---
    fill(this.palette.ring1);
    ellipse(0, 0, this.r * 1.9);

    // --- Pattern layers (random dots/rays) ---
    // Ring 1 sits over ring1
    this.drawPatternLayer(this.layers[0]);

    // Coloured ring between layer 1 and 2
    fill(this.palette.ring2);
    ellipse(0, 0, this.r * 1.55);

    // Ring 2 pattern
    this.drawPatternLayer(this.layers[1]);

    // Ring 3 pattern
    this.drawPatternLayer(this.layers[2]);

    // Inner coloured disc under core pattern
    fill(this.palette.ring3);
    ellipse(0, 0, this.r * 0.95);

    // --- Inner core (random style: solid/dots/rays) ---
    push();
    rotate(this.innerPattern.angle);

    if (this.innerPattern.style === "solid") {
      // just a rotating coloured disc
      fill(this.palette.inner);
      ellipse(0, 0, this.r * 0.6);
    } else if (this.innerPattern.style === "dots") {
      fill(this.palette.dots3);
      this.drawDotRing(
        this.innerPattern.radius,
        this.innerPattern.dotSize,
        this.palette.dots3,
        this.innerPattern.count
      );
      // soft disc behind dots
      fill(this.palette.inner);
      ellipse(0, 0, this.r * 0.5);
    } else if (this.innerPattern.style === "rays") {
      this.drawRays(this.innerPattern.radius, this.palette.rays, this.innerPattern.count);
      fill(this.palette.inner);
      ellipse(0, 0, this.r * 0.5);
    }

    // centre disc + tiny dot
    fill(this.palette.center);
    ellipse(0, 0, this.r * 0.32);
    fill(0);
    ellipse(0, 0, this.r * 0.12);

    pop(); // end innerPattern rotation

    // --- Tail / string ---
    this.drawTail();

    pop();
  }

  drawPatternLayer(layer) {
    push();
    rotate(layer.angle);

    if (layer.style === "dots") {
      this.drawDotRing(layer.radius, layer.dotSize, layer.dotColor, layer.count);
    } else if (layer.style === "rays") {
      this.drawRays(layer.radius, this.palette.rays, layer.count);
    }

    pop();
  }

  drawDotRing(radius, dotSize, col, count) {
    fill(col);
    noStroke();
    for (let i = 0; i < count; i++) {
      let a = (360 / count) * i;
      let x = cos(a) * radius;
      let y = sin(a) * radius;
      ellipse(x, y, dotSize, dotSize);
    }
  }

  drawRays(radius, col, count) {
    stroke(col);
    strokeWeight(this.r * 0.05);
    noFill();
    for (let i = 0; i < count; i++) {
      let a = (360 / count) * i;
      let x1 = cos(a) * (radius * 0.4);
      let y1 = sin(a) * (radius * 0.4);
      let x2 = cos(a) * radius;
      let y2 = sin(a) * radius;
      line(x1, y1, x2, y2);
    }
    noStroke();
  }

  drawTail() {
    push();
    stroke(this.palette.tail);
    strokeWeight(this.r * 0.08);
    noFill();

    let start = createVector(0, 0);
    let ctrl = createVector(this.r * 0.7, -this.r * 0.5);
    let end = createVector(this.r * 1.2, -this.r * 0.1);

    beginShape();
    vertex(start.x, start.y);
    quadraticVertex(ctrl.x, ctrl.y, end.x, end.y);
    endShape();

    noStroke();
    pop();
  }
}


// ------------------ COLOUR PALETTES ------------------ //

function pickPalette() {
  let options = [
    {
  outer:  "#FFFFFF",
  ring1:  "#FF7EB6",
  ring2:  "#FF96BF",
  ring3:  "#FFB7D4",
  dots1:  "#E83432",
  dots2:  "#FFFFFF",
  dots3:  "#FF7AAE",
  rays:   "#FF4C8B",
  inner:  "#E92D72",
  center: "#000000",
  tail:   "#FF4F9D"
},
{
  outer:  "#FF9A00",
  ring1:  "#FFAF37",
  ring2:  "#FFC260",
  ring3:  "#FFDD9E",
  dots1:  "#E83432",
  dots2:  "#FF81B9",
  dots3:  "#FF507C",
  rays:   "#E83432",
  inner:  "#FF4D84",
  center: "#000000",
  tail:   "#FF4F9D"
},
{
  outer:  "#FEC850",
  ring1:  "#F7A6D8",
  ring2:  "#E86AB8",
  ring3:  "#B857B0",
  dots1:  "#B52A8B", 
  dots2:  "#F5B3D9",
  dots3:  "#F43EA1",
  rays:   "#B52A8B",
  inner:  "#FF66C4",
  center: "#000000",
  tail:   "#FF3D72"
},
{
  outer:  "#FFFFFF",
  ring1:  "#C77ADD",
  ring2:  "#A75BC7",
  ring3:  "#7E4AA8",
  dots1:  "#E83432",
  dots2:  "#FFFFFF",
  dots3:  "#D47BE0",
  rays:   "#E83432",
  inner:  "#6AEB76",
  center: "#000000",
  tail:   "#FF4FA7"
},
{
  outer:  "#FFFFFF",
  ring1:  "#91EA7C",
  ring2:  "#C2FAB8",
  ring3:  "#F47FC2",
  dots1:  "#2E9F37", 
  dots2:  "#C3F9C4",
  dots3:  "#F85AA4",
  rays:   "#2E9F37",
  inner:  "#FF5AAD",
  center: "#000000",
  tail:   "#FF4FA0"
},
{
  outer:  "#FDBA3B",
  ring1:  "#FFDD85",
  ring2:  "#FFEEC0",
  ring3:  "#F79F2D",
  dots1:  "#1B3C88",   // dark navy dots
  dots2:  "#FFFFFF",
  dots3:  "#C682CA",
  rays:   "#1B3C88",
  inner:  "#E93D67",
  center: "#000000",
  tail:   "#FF4F9C"
},
{
  outer:  "#FDC54C",
  ring1:  "#F275BD",
  ring2:  "#C964C5",
  ring3:  "#66A4C0",
  dots1:  "#C76A00",  
  dots2:  "#FDC54C",
  dots3:  "#EF75D1",
  rays:   "#C76A00",
  inner:  "#9ECCE0",
  center: "#000000",
  tail:   "#FF4F9D"
},
{
  outer:  "#FFFFFF",
  ring1:  "#F38DBF",
  ring2:  "#F05C8E",
  ring3:  "#D64A72",
  dots1:  "#E83432",
  dots2:  "#FFFFFF",
  dots3:  "#ED5393",
  rays:   "#E83432",
  inner:  "#6EB66A",
  center: "#000000",
  tail:   "#FF4FA0"
},
{
  outer:  "#234BA0",
  ring1:  "#7ACD8A",
  ring2:  "#ED5AAA",
  ring3:  "#D96A98",
  dots1:  "#0D2C75",
  dots2:  "#1F46A3",
  dots3:  "#B05CCD",
  rays:   "#0D2C75",
  inner:  "#E63C45",
  center: "#000000",
  tail:   "#FF4FA0"
},
{
  outer:  "#EFB23A",
  ring1:  "#F47FBB",
  ring2:  "#6B75A0",
  ring3:  "#363939",
  dots1:  "#26488F",
  dots2:  "#FCEDC6",
  dots3:  "#ED5B5E",
  rays:   "#26488F",
  inner:  "#F4343D",
  center: "#000000",
  tail:   "#FF4FA7"
}

  ];

  return random(options);
}


// ------------------ INPUT ------------------ //

function keyPressed() {
  if (key === 'a' || key === 'A') {
    animateWheels = !animateWheels;
  }
}
