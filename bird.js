class Bird {
  constructor() {
    this.radius = 80;
    this.x = w + 600;
    this.y = h - 100;
    birdSprite = createSprite(this.x, this.y, 10, 10);
    birdSprite.addAnimation("normal", birdAnim);
    birdSprite.setCollider("circle", 10, 10, 26);
  }

  update() {
    if (this.x >= 0 - this.radius) {
      this.x -= speed;
    } else {
      this.x = w + this.radius;
    }
    birdSprite.position.x = this.x;
    birdSprite.position.y = this.y;
  }

  restart() {
    this.x = w + 600;
  }

  show() {
    drawSprite(birdSprite);
  }
}
