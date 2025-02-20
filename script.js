if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    const { Engine, Render, World, Bodies, Collision } = Matter;

    // Create engine and disable gravity
    const engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 0;
    engine.gravity.scale = 0;

    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent'
        }
    });

    // Boundaries (thicker top and bottom walls)
    const walls = [
        Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, 200, { isStatic: true, render: { visible: false }, restitution: 1 }), // Top, thicker and at edge
        Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 200, { isStatic: true, render: { visible: false }, restitution: 1 }) // Bottom, thicker and at edge
    ];

    // Create paddles and ball
    const paddleLeft = document.getElementById('paddle-left');
    const paddleRight = document.getElementById('paddle-right');
    const ball = document.getElementById('ball');

    const paddleLeftBody = Bodies.rectangle(50, window.innerHeight / 2, 40, 120, {
        isStatic: false,
        restitution: 1.1,
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        inertia: Infinity,
        mass: 1000,
        render: { visible: false }
    });
    paddleLeftBody.linkElement = paddleLeft;

    const paddleRightBody = Bodies.rectangle(window.innerWidth - 50, window.innerHeight / 2, 40, 120, {
        isStatic: false,
        restitution: 1.1,
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        inertia: Infinity,
        mass: 1000,
        render: { visible: false }
    });
    paddleRightBody.linkElement = paddleRight;

    const ballBody = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 20, {
        restitution: 1,
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        mass: 0.5,
        render: { visible: false }
    });
    Matter.Body.setVelocity(ballBody, { x: 6, y: 4 });
    ballBody.linkElement = ball;

    // Add to world
    World.add(engine.world, [paddleLeftBody, paddleRightBody, ballBody, ...walls]);
    Engine.run(engine);
    Render.run(render);

    // Scoreboard
    let playerScore = 0;
    let aiScore = 0;
    const scoreboard = document.getElementById('scoreboard');

    // Update positions and game logic
    Matter.Events.on(engine, 'afterUpdate', () => {
        [paddleLeftBody, paddleRightBody, ballBody].forEach((body) => {
            const link = body.linkElement;
            link.style.left = `${body.position.x - link.offsetWidth / 2}px`;
            link.style.top = `${body.position.y - link.offsetHeight / 2}px`;
        });

        // Lock paddle x-positions
        Matter.Body.setPosition(paddleLeftBody, { x: 50, y: paddleLeftBody.position.y });
        Matter.Body.setPosition(paddleRightBody, { x: window.innerWidth - 50, y: paddleRightBody.position.y });

        // AI for right paddle (Contact)
        const ballY = ballBody.position.y;
        const paddleRightY = paddleRightBody.position.y;
        const aiSpeed = 5;
        if (ballY < paddleRightY - 20) {
            Matter.Body.setVelocity(paddleRightBody, { x: 0, y: -aiSpeed });
        } else if (ballY > paddleRightY + 20) {
            Matter.Body.setVelocity(paddleRightBody, { x: 0, y: aiSpeed });
        } else {
            Matter.Body.setVelocity(paddleRightBody, { x: 0, y: 0 });
        }

        // Keep paddles within vertical bounds
        const paddleHeightHalf = 60;
        if (paddleLeftBody.position.y < paddleHeightHalf) Matter.Body.setPosition(paddleLeftBody, { x: 50, y: paddleHeightHalf });
        if (paddleLeftBody.position.y > window.innerHeight - paddleHeightHalf) Matter.Body.setPosition(paddleLeftBody, { x: 50, y: window.innerHeight - paddleHeightHalf });
        if (paddleRightBody.position.y < paddleHeightHalf) Matter.Body.setPosition(paddleRightBody, { x: window.innerWidth - 50, y: paddleHeightHalf });
        if (paddleRightBody.position.y > window.innerHeight - paddleHeightHalf) Matter.Body.setPosition(paddleRightBody, { x: window.innerWidth - 50, y: window.innerHeight - paddleHeightHalf });

        // Keep ball within top and bottom bounds (fallback)
        const ballRadius = 20;
        if (ballBody.position.y < ballRadius) {
            Matter.Body.setPosition(ballBody, { x: ballBody.position.x, y: ballRadius });
            Matter.Body.setVelocity(ballBody, { x: ballBody.velocity.x, y: Math.abs(ballBody.velocity.y) }); // Bounce down
        } else if (ballBody.position.y > window.innerHeight - ballRadius) {
            Matter.Body.setPosition(ballBody, { x: ballBody.position.x, y: window.innerHeight - ballRadius });
            Matter.Body.setVelocity(ballBody, { x: ballBody.velocity.x, y: -Math.abs(ballBody.velocity.y) }); // Bounce up
        }

        // Score and reset ball (left/right bounds)
        if (ballBody.position.x < -20) {
            aiScore++;
            scoreboard.textContent = `Player: ${playerScore} | AI: ${aiScore}`;
            Matter.Body.setPosition(ballBody, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
            Matter.Body.setVelocity(ballBody, { x: 6, y: (Math.random() - 0.5) * 4 });
        } else if (ballBody.position.x > window.innerWidth + 20) {
            playerScore++;
            scoreboard.textContent = `Player: ${playerScore} | AI: ${aiScore}`;
            Matter.Body.setPosition(ballBody, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
            Matter.Body.setVelocity(ballBody, { x: -6, y: (Math.random() - 0.5) * 4 });
        }

        // Prevent ball from getting stuck
        const collisionLeft = Collision.collides(paddleLeftBody, ballBody);
        const collisionRight = Collision.collides(paddleRightBody, ballBody);
        if (collisionLeft && collisionLeft.depth > 5) {
            Matter.Body.setVelocity(ballBody, { x: Math.abs(ballBody.velocity.x) + 1, y: ballBody.velocity.y });
        } else if (collisionRight && collisionRight.depth > 5) {
            Matter.Body.setVelocity(ballBody, { x: -Math.abs(ballBody.velocity.x) - 1, y: ballBody.velocity.y });
        }
    });

    // Keyboard controls for left paddle (About)
    document.addEventListener('keydown', (e) => {
        const speed = 6;
        if (e.key === 'ArrowUp') {
            Matter.Body.setVelocity(paddleLeftBody, { x: 0, y: -speed });
        } else if (e.key === 'ArrowDown') {
            Matter.Body.setVelocity(paddleLeftBody, { x: 0, y: speed });
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            Matter.Body.setVelocity(paddleLeftBody, { x: 0, y: 0 });
        }
    });

    // Handle clicks
    [paddleLeft, paddleRight, ball].forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = link.getAttribute('href');
        });
    });
}
