if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    const { Engine, Render, World, Bodies } = Matter;

    // Create engine and disable gravity
    const engine = Engine.create();
    engine.world.gravity = { x: 0, y: 0 };

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

    // Boundaries (top and bottom walls only)
    const walls = [
        Bodies.rectangle(window.innerWidth / 2, -50, window.innerWidth, 100, { isStatic: true, render: { visible: false } }), // Top
        Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true, render: { visible: false } }) // Bottom
    ];

    // Create paddles and ball
    const paddleLeft = document.getElementById('paddle-left');
    const paddleRight = document.getElementById('paddle-right');
    const ball = document.getElementById('ball');

    const paddleLeftBody = Bodies.rectangle(50, window.innerHeight / 2, 40, 120, {
        isStatic: false,
        restitution: 1,
        friction: 0,
        frictionAir: 0,
        inertia: Infinity,
        render: { visible: false }
    });
    paddleLeftBody.linkElement = paddleLeft;

    const paddleRightBody = Bodies.rectangle(window.innerWidth - 50, window.innerHeight / 2, 40, 120, {
        isStatic: false,
        restitution: 1,
        friction: 0,
        frictionAir: 0,
        inertia: Infinity,
        render: { visible: false }
    });
    paddleRightBody.linkElement = paddleRight;

    const ballBody = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 20, {
        restitution: 1,
        friction: 0,
        frictionAir: 0,
        render: { visible: false }
    });
    Matter.Body.setVelocity(ballBody, { x: 5, y: 3 }); // Initial ball speed
    ballBody.linkElement = ball;

    // Add to world
    World.add(engine.world, [paddleLeftBody, paddleRightBody, ballBody, ...walls]);
    Engine.run(engine);
    Render.run(render);

    // Update positions
    Matter.Events.on(engine, 'afterUpdate', () => {
        [paddleLeftBody, paddleRightBody, ballBody].forEach((body) => {
            const link = body.linkElement;
            link.style.left = `${body.position.x - link.offsetWidth / 2}px`;
            link.style.top = `${body.position.y - link.offsetHeight / 2}px`;
        });

        // AI for right paddle (Contact)
        const ballY = ballBody.position.y;
        const paddleRightY = paddleRightBody.position.y;
        const speed = 4;
        if (ballY < paddleRightY - 20) {
            Matter.Body.setVelocity(paddleRightBody, { x: 0, y: -speed });
        } else if (ballY > paddleRightY + 20) {
            Matter.Body.setVelocity(paddleRightBody, { x: 0, y: speed });
        } else {
            Matter.Body.setVelocity(paddleRightBody, { x: 0, y: 0 });
        }

        // Keep paddles within bounds
        if (paddleLeftBody.position.y < 60) Matter.Body.setPosition(paddleLeftBody, { x: 50, y: 60 });
        if (paddleLeftBody.position.y > window.innerHeight - 60) Matter.Body.setPosition(paddleLeftBody, { x: 50, y: window.innerHeight - 60 });
        if (paddleRightBody.position.y < 60) Matter.Body.setPosition(paddleRightBody, { x: window.innerWidth - 50, y: 60 });
        if (paddleRightBody.position.y > window.innerHeight - 60) Matter.Body.setPosition(paddleRightBody, { x: window.innerWidth - 50, y: window.innerHeight - 60 });

        // Reset ball if it goes off-screen (left or right)
        if (ballBody.position.x < -20 || ballBody.position.x > window.innerWidth + 20) {
            Matter.Body.setPosition(ballBody, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
            Matter.Body.setVelocity(ballBody, { x: (Math.random() > 0.5 ? 5 : -5), y: (Math.random() - 0.5) * 4 });
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
