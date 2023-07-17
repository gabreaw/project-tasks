<?php

namespace Ixcsoft\MindupManager\Controllers;

use PDO;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use RuntimeException;
use Slim\Views\Twig;
use Ixcsoft\MindupManager\Services\SubmitService;
use Ixcsoft\MindupManager\Repository\DatabaseManager;

class SubmitController
{
    private $submitService;

    public function __construct(DatabaseManager $databaseManager)
    {
        $this->submitService = new SubmitService($databaseManager);
    }

    public function view(ServerRequestInterface $request, ResponseInterface $response)
    {
        return Twig::fromRequest($request)->render($response, 'view.html');
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response)
    {
        return Twig::fromRequest($request)->render($response, 'index.html');
    }

    public function store(ServerRequestInterface $request, ResponseInterface $response)
    {
        $params = $request->getParsedBody();
        $title = $params['title'];
        $description = $params['description'];

        $this->submitService->createTask($title, $description);

        return $response->withHeader("Location", "/view");
    }

}
