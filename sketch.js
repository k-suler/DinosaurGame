/*

A scene where multiple participants are involved in the interaction
todo: add multiple head positions

*/

let w = 1240;
let h = 620;
let gravity = 0.5;
let limitTr = h / 2;
let speed = 7;
let video;
let poseNet;
let poses = [];
let skeletons = [];
let textures = [];
let backgrounds = [];
let heroSheet;
let heroAnim;
let heroSprite;

let hero;
let rockImg;
let rockAnim;
let rockSprite;
let rock;
let bushImg;
let bush;

let birdImg;
let birdSheet;
let birdAnim;
let birdSprite;
let bird;
let pPositions = [];
let cPositions = [];
let xs = [];
let easing = 0.1;

let gameOver = false;
let score = 0;

let under = false;

// physics for playful interaction
let VerletPhysics2D = toxi.physics2d.VerletPhysics2D,
  VerletParticle2D = toxi.physics2d.VerletParticle2D,
  AttractionBehavior = toxi.physics2d.behaviors.AttractionBehavior,
  GravityBehavior = toxi.physics2d.behaviors.GravityBehavior,
  Vec2D = toxi.geom.Vec2D,
  Rect = toxi.geom.Rect;

let NUM_PARTICLES = 10;

let physics;
let mouseAttractor;
let mousePos;

let headAttractor;
let headPos;

let leftSAttractor;
let leftPos;

let rightSAttractor;
let rightPos;

let leftHAttractor;
let leftHPos;

let rightHAttractor;
let rightHPos;

let sounds = {
  jump: null,
  theme: null,
  die: null,
};

function preload() {
  heroSheet = loadSpriteSheet("data/hero/chicken.png", 96, 90, 8);
  heroAnim = loadAnimation(heroSheet);

  birdSheet = loadSpriteSheet("data/obstacles/bird.png", 125, 100, 2);
  birdAnim = loadAnimation(birdSheet);

  rockImg = loadImage("data/obstacles/rock.png");
  rockImg.resize(60, 60);
  rockSprite = createSprite(800, w, 60, 60);
  rockSprite.addImage(rockImg);
  // bushImg = loadImage("data/obstacles/bush.png");
  // birdImg = loadImage("data/obstacles/bird.png");
  sounds.jump = loadSound("data/sound/jump_01.wav");
  sounds.jump.setVolume(0.4);

  sounds.die = loadSound("data/sound/stop.wav");
  sounds.die.setVolume(0.4);

  sounds.theme = loadSound("data/sound/Outdoor_Ambiance.mp3");
  sounds.theme.setVolume(0.2);
}

function setup() {
  createCanvas(w, h);
  video = createCapture(VIDEO);
  video.size(w, h);

  sounds.theme.loop();
  sounds.theme.play();
  loadTextures();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", function (results) {
    poses = results;
  });

  hero = new Chicken();
  rock = new Rock();
  bird = new Bird();

  video.hide();
  fill(255);
  stroke(255);

  physics = new VerletPhysics2D();
  // physics.setDrag(0.05);
  // physics.setWorldBounds(new Rect(50, 0, width - 100, height - height / 3));
  // physics.addBehavior(new GravityBehavior(new Vec2D(0, 0.15)));

  headPos = new Vec2D(width / 2, height / 2);
  // headAttractor = new AttractionBehavior(headPos, 200, -2.9);
  // physics.addBehavior(headAttractor);

  // leftPos = new Vec2D(width / 2, height / 2);
  // leftSAttractor = new AttractionBehavior(leftPos, 100, -2.9);
  // physics.addBehavior(leftSAttractor);

  // rightPos = new Vec2D(width / 2, height / 2);
  // rightSAttractor = new AttractionBehavior(rightPos, 100, -2.9);
  // physics.addBehavior(rightSAttractor);

  // leftHPos = new Vec2D(width / 2, height / 2);
  // leftHAttractor = new AttractionBehavior(leftHPos, 100, -2.9);
  // physics.addBehavior(leftHAttractor);

  // rightHPos = new Vec2D(width / 2, height / 2);
  // rightHAttractor = new AttractionBehavior(rightHPos, 100, -2.9);
  // physics.addBehavior(rightHAttractor);
}

function draw() {
  physics.update();
  // background(255);
  image(backgrounds[0], 0, 0, w, h);
  hero.show();
  rock.show();
  bird.show();
  tint(255, 30);
  // heroAnim.collide(rock);

  // translate(w, 0); // move to far corner
  // scale(-1.0, 1.0);
  // image(video, 0, 0, w, h);
  hero.update();
  rock.update();
  bird.update();
  drawKeypoints();
  // drawSkeleton();

  stroke(0, 100);
  line(0, limitTr, width, limitTr);

  if (checkJump()) {
    hero.jump();
  }

  if (gameOver) {
    let c = color(255, 204, 0);
    fill(c);
    // noStroke();
    strokeWeight(4);
    stroke(50);
    rect(w / 6, h / 6, 800, 400, 20);
    // scale(-1.0, 1.0);
    fill(0);
    textSize(60);

    noStroke();
    text("Game over", w / 3 + 40, h / 2 - 50);
    textSize(40);
    text("Score: " + score, w / 3 + 40, h / 2 + 50);

    textSize(20);
    text("Click anywhere to restart", w / 3 + 40, h / 2 + 150);
  }

  textSize(40);

  stroke(8);
  fill(255);
  text("" + score, w - 200, 50);

  noStroke();
  //text(int(frameRate()), 30, 30);
}

function drawSkeleton() {
  for (let i = 0; i < poses.length; i++) {
    for (let j = 0; j < poses[i].skeleton.length; j++) {
      let partA = poses[i].skeleton[j][0];
      let partB = poses[i].skeleton[j][1];
      stroke(0);
      line(
        partA.position.x,
        partA.position.y,
        partB.position.x,
        partB.position.y
      );
    }
  }
}

function drawKeypoints() {
  for (let i = 0; i < poses.length; i++) {
    for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
      let keypoint = poses[i].pose.keypoints[j];
      if (keypoint.score > 0.2) {
        fill(255, 0, 100);
        noStroke();
        // ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
        // text(j, keypoint.position.x + 10, keypoint.position.y);
        if (j == 0) {
          headPos.set(keypoint.position.x, keypoint.position.y);
          noFill();
          stroke(100, 100, 0);
          ellipse(keypoint.position.x, keypoint.position.y, 200, 200);
        }
        // if (j == 5) {
        //   leftPos.set(keypoint.position.x, keypoint.position.y);
        //   noFill();
        //   stroke(100, 100, 0);
        //   ellipse(keypoint.position.x, keypoint.position.y, 100, 100);
        // }
        // if (j == 6) {
        //   rightPos.set(keypoint.position.x, keypoint.position.y);
        //   noFill();
        //   stroke(100, 100, 0);
        //   ellipse(keypoint.position.x, keypoint.position.y, 100, 100);
        // }

        // if (j == 9) {
        //   rightHPos.set(keypoint.position.x, keypoint.position.y);
        //   noFill();
        //   stroke(100, 100, 0);
        //   ellipse(keypoint.position.x, keypoint.position.y, 100, 100);
        // }

        // if (j == 10) {
        //   leftHPos.set(keypoint.position.x, keypoint.position.y);
        //   noFill();
        //   stroke(100, 100, 0);
        //   ellipse(keypoint.position.x, keypoint.position.y, 100, 100);
        // }
      }
    }
  }
}

function checkJump() {
  if (headPos.y <= limitTr && under) {
    under = false;
    return true;
  } else if (headPos.y >= limitTr && !under) {
    under = true;
    return false;
  }
}

function loadTextures() {
  // for (let i = 0; i < 10; i++) {
  //   let myTexture = loadImage("data/obstacles/00" + i + ".png");
  //   textures.push(myTexture);
  // }
  for (let i = 0; i < 1; i++) {
    let myTexture = loadImage("data/background/00" + i + ".jpg");
    backgrounds.push(myTexture);
  }
}

// function keyPressed() {
//   if (key == " ") {
//     hero.jump();
//   }
// }

function mouseClicked() {
  if (gameOver) {
    restart();
  }
}

function modelLoaded() {
  print("model loaded");
}

function die() {
  speed = 0;
  gameOver = true;
}

function restart() {
  score = 0;
  speed = 7;
  rock.restart();
  bird.restart();
  gameOver = false;
}
