/*

A scene where multiple participants are involved in the interaction
todo: add multiple head positions

*/

let w = 1240;
let h = 720;
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
let  Vec2D = toxi.geom.Vec2D;

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

  // sounds.theme = loadSound("data/sound/Outdoor_Ambiance.mp3");
  sounds.theme = loadSound("data/sound/forest.mp3");
  sounds.theme.setVolume(0.2);
}

// model learning 
let collectState = false;
let trainState = false;
state = 'waiting';
let targetLabel;


async function getPoseClass() {
    if (poses && poses.length > 0) {
      pose = poses[0].pose;
      
      let inputs = [];
      for (let index = 0; index < pose.keypoints.length; index++) {
        inputs.push(pose.keypoints[index].position.x);
        inputs.push(pose.keypoints[index].position.y);
      }

      await nn.classify(inputs, controlHero)
    }
}



function getPoses(res) {
  // When in collecting the training data state
  if (collectState) {
    if (res.length > 0) {
      pose = res[0].pose;
      
      if (state == 'collecting') {
        let inputs = [];
        for (let index = 0; index < pose.keypoints.length; index++) {
          inputs.push(pose.keypoints[index].position.x);
          inputs.push(pose.keypoints[index].position.y);
        }
        const target = [targetLabel];
        nn.addData(inputs, target);
      }
    }
  }

  poses = res
}


function trainModel() {
  print("training model");
  nn.normalizeData();
  nn.train({epochs: 10}, saveModel);
}

function saveModel() {
  print("saving model");
  nn.save();
}



function setup() {
  createCanvas(w, h);
  video = createCapture(VIDEO);
  video.hide();
  // video.size(w, h);

  sounds.theme.loop();
  sounds.theme.play();
  loadTextures();

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", getPoses);


  let options = {
    inputs: 34,
    outputs: 2,
    task: 'classification',
    debug: true
  }
  nn = ml5.neuralNetwork(options)

  if (trainState) {
    nn.loadData('squat.json', trainModel);
  }
  if (!trainState && !collectState) {
    const modelInfo = {
      model: 'model.json',
      metadata: 'model_meta.json',
      weights: 'model.weights.bin',
    }
    nn.load(modelInfo, nnLoaded)
  }

  hero = new Chicken();
  rock = new Rock();
  bird = new Bird();

  fill(255);
  stroke(255);

  headPos = new Vec2D(width / 2, height / 2);
  
}

let skipingFrames = 5;
let skippedFrame = 0;

function draw() {

  if (trainState || collectState) {

    image(video, 0, 0, w, h);
    drawSkeleton();
    return;
  }
  // background(255);
  image(backgrounds[0], 0, 0, w, h);
  hero.show();
  rock.show();
  bird.show();
  tint(255, 150);
  // heroAnim.collide(rock);

  // translate(w, 0); // move to far corner
  // scale(-1.0, 1.0);
  // image(video, 0, 0, w, h);
  hero.update();
  rock.update();
  bird.update();
  // drawKeypoints();
  // drawSkeleton();

  // stroke(0, 100);
  // line(0, limitTr, width, limitTr);

  skippedFrame = skippedFrame + 1;
  if (skipingFrames == skippedFrame) {
    skippedFrame = 0;
    getPoseClass();
  } else if (skippedFrame = 10) {
    drawSkeleton();
    drawKeypoints();
  }

  // if (checkJump()) {
    // hero.jump();
  // }

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
      stroke(3);
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
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
        // text(j, keypoint.position.x + 10, keypoint.position.y);
        // if (j == 0) {
        //   headPos.set(keypoint.position.x, keypoint.position.y);
        //   noFill();
        //   stroke(100, 100, 0);
        //   ellipse(keypoint.position.x, keypoint.position.y, 200, 200);
        // }
        //   if (j == 5) {
        //     leftPos.set(keypoint.position.x, keypoint.position.y);
        //     noFill();
        //     stroke(100, 100, 0);
        //     ellipse(keypoint.position.x, keypoint.position.y, 100, 100);
        //   }
        //   if (j == 6) {
        //     rightPos.set(keypoint.position.x, keypoint.position.y);
        //     noFill();
        //     stroke(100, 100, 0);
        //     ellipse(keypoint.position.x, keypoint.position.y, 100, 100);
        //   }

        //   if (j == 9) {
        //     rightHPos.set(keypoint.position.x, keypoint.position.y);
        //     noFill();
        //     stroke(100, 100, 0);
        //     ellipse(keypoint.position.x, keypoint.position.y, 100, 100);
        //   }

        //   if (j == 10) {
        //     leftHPos.set(keypoint.position.x, keypoint.position.y);
        //     noFill();
        //     stroke(100, 100, 0);
        //     ellipse(keypoint.position.x, keypoint.position.y, 100, 100);
        //   }
      }
    }
  }
}

function controlHero(error, res) {
  console.log(res[0].label)
  const playerPose = res[0].label;
  if (playerPose == 'n' && under) {
    under = false;
    hero.jump();
    return true;
  } else if (playerPose == 's' && !under) {
    under = true;
    return false;
  }
}

// function checkJump() {
//   if (headPos.y <= limitTr && under) {
//     under = false;
//     return true;
//   } else if (headPos.y >= limitTr && !under) {
//     under = true;
//     return false;
//   }
// }

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

function keyPressed() {
  //  if (key == " ") {
  //    hero.jump();
  //  }

  // if in collecting state save the data
  // s - squat
  // n - normal state
  if (collectState) {
    if (key == "o") {
      nn.saveData();
    } else if( key == "s" || key == "n") {
      targetLabel = key;
      console.log(targetLabel);
      setTimeout(function() {
        console.log('collecting');
        state = 'collecting';
        setTimeout(function() {
          console.log('stopped collecting');
          state = 'waiting';
        }, 15000);
      }, 3000);
    }
  }
}

function mouseClicked() {
  if (gameOver) {
    restart();
  }
}

function modelLoaded() {
  print("model loaded");
}
function nnLoaded() {
  print("neural network loaded");
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
