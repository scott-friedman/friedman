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

    // Boundaries
    const walls = [
        Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, 200, { isStatic: true, render: { visible: false }, restitution: 1 }),
        Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 200, { isStatic: true, render: { visible: false }, restitution: 1 })
    ];

    // Create paddles and ball (initially hidden)
    const paddleLeft = document.getElementById('paddle-left');
    const paddleRight = document.getElementById('paddle-right');
    const ball = document.getElementById('ball');

    const paddleLeftBody = Bodies.rectangle(50, window.innerHeight / 2, 100, 170, {
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

    const paddleRightBody = Bodies.rectangle(window.innerWidth - 50, window.innerHeight / 2, 100, 170, {
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

    const ballBody = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 65, {
        restitution: 1,
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        mass: 0.5,
        render: { visible: false }
    });
    Matter.Body.setVelocity(ballBody, { x: 5, y: 3 });
    ballBody.linkElement = ball;

    // Add to world but don’t run until "Play" is clicked
    World.add(engine.world, [paddleLeftBody, paddleRightBody, ballBody, ...walls]);

    // Scoreboard
    let playerScore = 0;
    let aiScore = 0;
    const scoreboard = document.getElementById('scoreboard');

    // Pong game container
    const pongGame = document.querySelector('.pong-game');

    // Initially hide Pong elements
    paddleLeft.style.display = 'none';
    paddleRight.style.display = 'none';
    ball.style.display = 'none';
    scoreboard.style.display = 'none';

    // Handle "Play" button click
    document.querySelector('.play-button').addEventListener('click', () => {
        // Hide panels and show Pong game
        document.querySelectorAll('.panel, .panel-content, header, main, footer').forEach(el => el.style.display = 'none');
        pongGame.style.display = 'block';
        paddleLeft.style.display = 'block';
        paddleRight.style.display = 'block';
        ball.style.display = 'block';
        scoreboard.style.display = 'block';

        // Start the engine and render
        Engine.run(engine);
        Render.run(render);
    });

    // Update positions and game logic
    Matter.Events.on(engine, 'afterUpdate', () => {
        if (pongGame.style.display === 'block') {
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
            const aiSpeed = 4;
            if (ballY < paddleRightY - 20) {
                Matter.Body.setVelocity(paddleRightBody, { x: 0, y: -aiSpeed });
            } else if (ballY > paddleRightY + 20) {
                Matter.Body.setVelocity(paddleRightBody, { x: 0, y: aiSpeed });
            } else {
                Matter.Body.setVelocity(paddleRightBody, { x: 0, y: 0 });
            }

            // Keep paddles within vertical bounds (stop at edges, no bounce)
            const paddleHeightHalf = 85; // Half of 170px (physics height)
            const topEdge = paddleHeightHalf;
            const bottomEdge = window.innerHeight - paddleHeightHalf;

            // For left paddle (player-controlled)
            if (paddleLeftBody.position.y < topEdge) {
                Matter.Body.setPosition(paddleLeftBody, { x: 50, y: topEdge });
                Matter.Body.setVelocity(paddleLeftBody, { x: 0, y: 0 }); // Stop movement
            }
            if (paddleLeftBody.position.y > bottomEdge) {
                Matter.Body.setPosition(paddleLeftBody, { x: 50, y: bottomEdge });
                Matter.Body.setVelocity(paddleLeftBody, { x: 0, y: 0 }); // Stop movement
            }

            // For right paddle (AI-controlled)
            if (paddleRightBody.position.y < topEdge) {
                Matter.Body.setPosition(paddleRightBody, { x: window.innerWidth - 50, y: topEdge });
                Matter.Body.setVelocity(paddleRightBody, { x: 0, y: 0 }); // Stop movement
            }
            if (paddleRightBody.position.y > bottomEdge) {
                Matter.Body.setPosition(paddleRightBody, { x: window.innerWidth - 50, y: bottomEdge });
                Matter.Body.setVelocity(paddleRightBody, { x: 0, y: 0 }); // Stop movement
            }

            // Keep ball within top and bottom bounds
            const ballRadius = 65;
            if (ballBody.position.y < ballRadius) {
                Matter.Body.setPosition(ballBody, { x: ballBody.position.x, y: ballRadius });
                Matter.Body.setVelocity(ballBody, { x: ballBody.velocity.x, y: Math.abs(ballBody.velocity.y) });
            } else if (ballBody.position.y > window.innerHeight - ballRadius) {
                Matter.Body.setPosition(ballBody, { x: ballBody.position.x, y: window.innerHeight - ballRadius });
                Matter.Body.setVelocity(ballBody, { x: ballBody.velocity.x, y: -Math.abs(ballBody.velocity.y) });
            }

            // Score and reset ball
            if (ballBody.position.x < -20) {
                aiScore++;
                scoreboard.textContent = `Player: ${playerScore} | AI: ${aiScore}`;
                Matter.Body.setPosition(ballBody, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
                Matter.Body.setVelocity(ballBody, { x: 5, y: (Math.random() - 0.5) * 3 });
            } else if (ballBody.position.x > window.innerWidth + 20) {
                playerScore++;
                scoreboard.textContent = `Player: ${playerScore} | AI: ${aiScore}`;
                Matter.Body.setPosition(ballBody, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
                Matter.Body.setVelocity(ballBody, { x: -5, y: (Math.random() - 0.5) * 3 });
            }

            // Add spin effect on collision
            const collisionLeft = Collision.collides(paddleLeftBody, ballBody);
            const collisionRight = Collision.collides(paddleRightBody, ballBody);
            if (collisionLeft) {
                const paddleVelocityY = paddleLeftBody.velocity.y;
                Matter.Body.setVelocity(ballBody, {
                    x: Math.abs(ballBody.velocity.x) + 1,
                    y: ballBody.velocity.y + (paddleVelocityY * 0.5)
                });
            } else if (collisionRight) {
                const paddleVelocityY = paddleRightBody.velocity.y;
                Matter.Body.setVelocity(ballBody, {
                    x: -Math.abs(ballBody.velocity.x) - 1,
                    y: ballBody.velocity.y + (paddleVelocityY * 0.5)
                });
            }
        }
    });

    // Keyboard controls for left paddle (About)
    document.addEventListener('keydown', (e) => {
        if (pongGame.style.display === 'block') {
            const speed = 6;
            if (e.key === 'ArrowUp') {
                Matter.Body.setVelocity(paddleLeftBody, { x: 0, y: -speed });
            } else if (e.key === 'ArrowDown') {
                Matter.Body.setVelocity(paddleLeftBody, { x: 0, y: speed });
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            Matter.Body.setVelocity(paddleLeftBody, { x: 0, y: 0 });
        }
    });

    // Handle clicks for panels (non-Pong mode)
    document.querySelectorAll('.panel').forEach(panel => {
        panel.addEventListener('click', (e) => {
            e.preventDefault();
            const href = panel.getAttribute('href');
            if (href && !panel.classList.contains('play-button')) {
                if (href.startsWith('#')) {
                    const target = document.querySelector(href);
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.location.href = href;
                }
            }
        });
    });

    // Handle clicks for Pong elements
    [paddleLeft, paddleRight, ball].forEach(link => {
        link.addEventListener('click', (e) => {
            if (pongGame.style.display === 'block') {
                e.preventDefault();
                window.location.href = link.getAttribute('href');
            }
        });
    });
}