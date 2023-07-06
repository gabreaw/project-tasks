    <?php

    ini_set("display_errors", 1);
    ini_set("display_startup_erros", 1);
    error_reporting(E_ALL);

    use Ixcsoft\MindupManager\Controllers\AdminController;
    use Ixcsoft\MindupManager\Controllers\SubmitController;
    use Slim\Factory\AppFactory;
    use Slim\Views\Twig;
    use Slim\Views\TwigMiddleware;

    require dirname(__DIR__) . '/vendor/autoload.php';

    // Create App
    $app = AppFactory::create();

    // Create Twig
    $twig = Twig::create(__DIR__ . '/views', ['cache' => false]);

    // Add Twig-View Middleware
    $app->add(TwigMiddleware::create($app, $twig));

    $app->get('/', [SubmitController::class, 'create']);
    $app->get('/view', [SubmitController::class, 'view']);
    $app->get('/admin', [AdminController::class, 'view']);
    $app->get('/admin/get-tasks', [AdminController::class, 'getTasks']);
    $app->get('/admin/get-column', [AdminController::class, 'getColumn']);
    $app->get('/admin/get-tasks-by-column/{columnId}', [AdminController::class, 'getTasksByColumn']);

    $app->post('/admin/store', [AdminController::class, 'store']);
    $app->post('/admin/update-task', [AdminController::class, 'updateTask']);
    $app->post('/store', [SubmitController::class, 'store']);

    // Run app
    $app->run();

