<?php

namespace Ixcsoft\MindupManager\Controllers;

use PDO;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use RuntimeException;
use Slim\Views\Twig;


class SubmitController
{
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
        $title = $params['title'] ?? '';
        $description = $params['description'] ?? '';
        $dir = dirname(__DIR__, 2) . '/database/phpsqlite.db';
        $pdo = new PDO('sqlite:' . $dir);
        $sql = "INSERT INTO tasks (title, description, created_at, column_task_id) VALUES (?, ?,  DATETIME('now'), 1)";
        $stmt = $pdo->prepare($sql);

        $result = $stmt->execute([$title, $description]);
        if (!$result) {
            throw new RuntimeException('Erro ao inserir a ideia no banco de dados');
        }
        header("Location: /view");
        exit();
    }
}