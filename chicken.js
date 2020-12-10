class Chicken {
  constructor() {
    this.radius = 80;
    this.x = 100;
    this.y = h - this.radius;
    this.velocityY = 0;
    this.blockJump = false;
    heroSprite = createSprite(this.x, this.y, 80, 80);
    heroSprite.addAnimation("normal", heroAnim);
    heroSprite.setCollider("circle", 10, 10, 60);
  }

  update() {
    this.y += this.velocityY;
    if (this.y <= h - this.radius) {
      this.velocityY += gravity;
    } else {
      this.blockJump = false;
      this.velocityY = 0;
      this.y = h - this.radius;
    }
    if (rockSprite.overlap(heroSprite) || birdSprite.overlap(heroSprite)) {
      this.jump();
      if (!gameOver) {
        sounds.die.play();
      }

      die();
    }
    heroSprite.position.x = this.x;
    heroSprite.position.y = this.y;
  }

  jump() {
    if (!this.blockJump) {
      this.velocityY -= 15;
      if (!gameOver) {
        sounds.jump.play();
        score += 1;
      }
    }
    speed += 0.01;
    this.blockJump = true;
  }

  show() {
    // image(this.img, this.x, this.y, this.w);
    // drawSprites();
    // animation(heroSprite, this.x, this.y);
    drawSprite(heroSprite);
  }
}
