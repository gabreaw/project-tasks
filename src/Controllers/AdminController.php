<?php

namespace Ixcsoft\MindupManager\Controllers;

use Exception;
use PDO;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use RuntimeException;
use Slim\Views\Twig;


class AdminController
{

    public function view(ServerRequestInterface $request, ResponseInterface $response)
    {

        $view = Twig::fromRequest($request);
        return $view->render($response, 'admin.html');
    }

    public function store(ServerRequestInterface $request, ResponseInterface $response)
    {
        $params = $request->getParsedBody();
        if (!isset($params['name'])) {
            throw new RuntimeException('Parâmetro name faltando.');
        }

        $name = $params['name'];
        $dir = dirname(__DIR__, 2) . '/database/phpsqlite.db';
        $pdo = new PDO('sqlite:' . $dir);
        $sql = "INSERT INTO columns(name)VALUES (?)";
        $stmt = $pdo->prepare($sql);


        $result = $stmt->execute([$name]);
        if (!$result) {
            throw new RuntimeException('Erro ao inserir a ideia no banco de dados');
        }

        header("Location: /admin");
        exit();
    }

    public function getTasks(ServerRequestInterface $request, ResponseInterface $response)
    {
        $dir = dirname(__DIR__, 2) . '/database/phpsqlite.db';
        $pdo = new PDO('sqlite:' . $dir);
        $sql = "SELECT * FROM tasks";
        $stmt = $pdo->query($sql);
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response->withHeader('Content-Type', 'application/json');
        $response->getBody()->write(json_encode($tasks));
        return $response;
    }

    public function getColumn(ServerRequestInterface $request, ResponseInterface $response)
    {
        $dir = dirname(__DIR__, 2) . '/database/phpsqlite.db';
        $pdo = new PDO('sqlite:' . $dir);
        $sql = "SELECT * FROM columns";
        $stmt = $pdo->query($sql);
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $response = $response->withHeader('Content-Type', 'application/json');

        if (!empty($columns)) {
            $response->getBody()->write(json_encode($columns, JSON_UNESCAPED_UNICODE));
        } else {
            $response->getBody()->write(json_encode([]));
        }

        return $response;
    }

    public function updateTask(ServerRequestInterface $request, ResponseInterface $response)
    {
        $params = $request->getParsedBody();
        $taskId = substr($params['taskId'], 5);
        if (!isset($params['taskOrder'])) {
            $params['taskOrder'] = [0 => $taskId];
        }
        if (!isset($params['taskId'], $params['columnId'], $params['taskOrder'])) {
            throw new RuntimeException('Parâmetros taskId, columnId e taskOrder são obrigatórios.');
        }
        $columnId = substr($params['columnId'], 7);
        $dir = dirname(__DIR__, 2) . '/database/phpsqlite.db';
        $pdo = new PDO('sqlite:' . $dir);

        $pdo->beginTransaction();

        try {
            $taskOrder = $params['taskOrder'];
            foreach ($taskOrder as $index => $taskId) {
                $sql = "UPDATE tasks SET column_task_id = :columnId, taskOrder = :taskOrder WHERE id = :taskId";
                $stmt = $pdo->prepare($sql);
                $stmt->bindValue(':columnId', $columnId, PDO::PARAM_INT);
                $stmt->bindValue(':taskOrder', $index + 1, PDO::PARAM_INT);
                $stmt->bindValue(':taskId', $taskId, PDO::PARAM_INT);
                $result = $stmt->execute();

                if ($result === false) {
                    $errorInfo = $stmt->errorInfo();
                    throw new RuntimeException('Erro ao atualizar a ordem da tarefa no banco de dados: ' . $errorInfo[2]);
                }
            }

            $pdo->commit();

            $sql = "SELECT * FROM tasks WHERE column_task_id = :columnId ORDER BY taskOrder";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':columnId', $columnId, PDO::PARAM_INT);
            $stmt->execute();
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $response = $response->withHeader('Content-Type', 'application/json');
            $response->getBody()->write(json_encode($tasks));

            return $response;
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }


    public function getTasksByColumn(ServerRequestInterface $request, ResponseInterface $response, $data)
    {
        $dir = dirname(__DIR__, 2) . '/database/phpsqlite.db';
        $pdo = new PDO('sqlite:' . $dir);
        $sql = "SELECT * FROM tasks WHERE column_task_id=:id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $data['columnId']]);
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($tasks)) {
            $tasks = [];
        }

        $response = $response->withHeader('Content-Type', 'application/json');
        $response->getBody()->write(json_encode($tasks));

        return $response;
    }
}
