// Only run physics on index page
if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    const { Engine, Render, World, Bodies, Mouse, MouseConstraint } = Matter;

    // Create engine and disable gravity
    const engine = Engine.create();
    engine.world.gravity = { x: 0, y: 0 }; // Fully disable gravity

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

    // Create boundaries
    const walls = [
        Bodies.rectangle(window.innerWidth / 2, -50, window.innerWidth, 100, { isStatic: true, render: { visible: false } }), // Top
        Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true, render: { visible: false } }), // Bottom
        Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true, render: { visible: false } }), // Left
        Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true, render: { visible: false } }) // Right
    ];

    // Create floating links
    const navLinks = document.querySelectorAll('.nav-link');
    const linkBodies = [];

    navLinks.forEach((link, index) => {
        const rect = link.getBoundingClientRect();
        const startX = window.innerWidth * 0.2 + index * (window.innerWidth * 0.25); // Spaced horizontally
        const startY = window.innerHeight * 0.4 + Math.random() * 200; // Random vertical start
        const body = Bodies.rectangle(
            startX,
            startY,
            rect.width + 20,
            rect.height + 20,
            {
                restitution: 1,    // Perfectly elastic collisions
                friction: 0,       // No friction
                frictionAir: 0,    // No air resistance
                inertia: Infinity, // Prevent rotation
                render: { visible: false }
            }
        );
        Matter.Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 6,
            y: (Math.random() - 0.5) * 6
        });
        linkBodies.push(body);
        World.add(engine.world, body);
        body.linkElement = link;
    });

    // Mouse interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2 }
    });
    World.add(engine.world, mouseConstraint);

    // Add objects and run
    World.add(engine.world, [...walls, ...linkBodies]);
    Engine.run(engine);
    Render.run(render);

    // Update link positions
    Matter.Events.on(engine, 'afterUpdate', () => {
        linkBodies.forEach((body) => {
            const link = body.linkElement;
            link.style.position = 'absolute';
            link.style.left = `${body.position.x - link.offsetWidth / 2}px`;
            link.style.top = `${body.position.y - link.offsetHeight / 2}px`;
        });
    });

    // Ensure continuous motion
    Matter.Events.on(engine, 'beforeUpdate', () => {
        linkBodies.forEach((body) => {
            const speed = Matter.Vector.magnitude(body.velocity);
            if (speed < 2) {
                Matter.Body.setVelocity(body, {
                    x: (Math.random() - 0.5) * 6,
                    y: (Math.random() - 0.5) * 6
                });
            }
        });
    });

    // Handle clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = link.getAttribute('href');
        });
    });
}
